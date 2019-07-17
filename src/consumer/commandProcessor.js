const { encryptMessage, signMessage } = require('../encrypt')
const { buildMessage, sendMessage } = require('./consumerPeer')
const { buildAgreement } = require('./agreement')
const { adjudicateSchema, proposalSchema, negotiationSchema, proposalResolvedSchema, fulfillmentSchema, settlementInitiatedSchema, signatureRequiredSchema } = require('../models/schemas')
const { initiateSettlement, createBuyerDisburseTransaction, submitDisburseTransaction } = require('./chain')
const hostConfiguration = require('../config/config')

const getKeyFromPreviousHash = (previousHash, proposal) => {
    let recipientKey = undefined
    if (previousHash === proposal.hash) {
        recipientKey = proposal.publicKey
    } else {
        for (i = 0; i < proposal.counterOffers.length; i++) {
            if (previousHash === proposal.counterOffers[i].hash) {
                recipientKey = proposal.counterOffers[i].publicKey
                break
            }
        }
    }
    return recipientKey
}

const processProposal = async (param, proposals, adjudications, keys) => {
    let proposalBody = JSON.parse(param)
    if (proposals.size) {
        proposals.forEach((proposal) => {
            if(proposalBody.requestId === proposal.body.requestId) {
                throw new Error('A proposal with that requestId already exists.')
            }
        })
    }
    let proposal = buildMessage(proposalBody, keys, proposalSchema)
    proposal = await signMessage(proposal, keys)
    sendMessage('proposal', proposal)

    proposal.counterOffers = []
    proposal.acceptances = []
    proposal.fulfillments = []
    proposals.set(proposal.body.requestId, proposal)
    adjudications.set(proposal.body.requestId, [])
}

const processProposalResolved = async (param, proposals, keys) => {
    let resolveBody = JSON.parse(param)
    let proposal = proposals.get(resolveBody.requestId)
    if (!proposal) {
        throw new Error("Unable to find proposal")
    }
    let resolution = buildMessage(resolveBody, keys, proposalResolvedSchema)
    resolution = await signMessage(resolution, keys)
    proposal.resolution = resolution
    sendMessage('resolved', resolution)
}

const processNegotiationMessage = async (messageBody, proposal, keys, messageType) => {
    let recipientKey = getKeyFromPreviousHash(messageBody.previousHash, proposal)
    if (!recipientKey) {
        throw new Error('Unable to match up hashes')
    }
    try {
        let message = buildMessage(messageBody, keys, negotiationSchema, recipientKey)
        let copyMessage = buildMessage(messageBody, keys, negotiationSchema, recipientKey)
        copyMessage = await signMessage(copyMessage, keys)
        message = await signMessage(message, keys)
        message = await encryptMessage(message, recipientKey)
        sendMessage(messageType, message)
        return copyMessage
    } catch (e) {
        throw new Error('unable to sign and encrypt: ' + e)
    }
}

const processAdjudication = async (param, proposals, adjudications, keys) => {
    let { proposal, acceptance } = getResolvedAcceptance(param, proposals)
    if (!proposal.settlementInitiated) {
        throw new Error('The settlement has not yet been initiated')
    }
    let proposalAdjudications = adjudications.get(proposal.body.requestId)
    try {
        let adjudicateBody = {}
        adjudicateBody.makerId = proposal.body.makerId
        adjudicateBody.takerId = proposal.body.takerId
        adjudicateBody.requestId = proposal.body.requestId
        adjudicateBody.message = 'adjudicate'
        adjudicateBody.agreement = buildAgreement(proposal)
        adjudicateBody.previousHash = acceptance.hash

        let recipientKey
        let myKey = keys.publicKey.toString('hex')
        if (myKey !== acceptance.publicKey) {
            recipientKey = acceptance.publicKey
        } else {
            recipientKey = getKeyFromPreviousHash(acceptance.body.previousHash, proposal)
        }
        if (!recipientKey) {
            throw new Error('Unable to match up hashes')
        }

        let message = buildMessage(adjudicateBody, keys, adjudicateSchema, recipientKey)
        message = await signMessage(message, keys)

        message = await encryptMessage(message, recipientKey)
        sendMessage('adjudicate', message)

        let juryMessage = buildMessage(adjudicateBody, keys, adjudicateSchema, hostConfiguration.juryMeshPublicKey)
        let copyMessage = buildMessage(adjudicateBody, keys, adjudicateSchema, hostConfiguration.juryMeshPublicKey)
        copyMessage = await signMessage(copyMessage, keys)
        juryMessage = await signMessage(juryMessage, keys)

        juryMessage = await encryptMessage(juryMessage, Buffer.from(hostConfiguration.juryMeshPublicKey, 'hex'))
        sendMessage('adjudicate', juryMessage)

        proposalAdjudications.push(copyMessage)
    } catch (e) {
        throw new Error('unable to sign and encrypt: ' + e)
    }
}

const getResolvedAcceptance = (requestId, proposals) => {
    let proposal = proposals.get(requestId)
    if (!proposal) {
        throw new Error('Unable to locate proposal')
    }
    if (!proposal.resolution) {
        throw new Error('Proposal is not resolved')
    }
    let acceptance = undefined
    for (i = 0; i < proposal.acceptances.length; i++) {
        if (proposal.acceptances[i].takerId === proposal.resolution.takerId) {
            acceptance = proposal.acceptances[i]
        }
    }
    if (!acceptance) {
        throw new Error('Proposal did not resolve an acceptance')
    }
    return { proposal, acceptance }
}

const processBuyerInitiatedDisburse = async (secret, sellerKey, recipientKey, amount, acceptance, proposal, keys) => {
    transaction = await createBuyerDisburseTransaction(secret,
        sellerKey,
        acceptance.body.challengeStake,
        amount,
        proposal.settlementInitiated.body.escrow)

    let signatureRequiredBody = {}
    signatureRequiredBody.makerId = acceptance.body.makerId
    signatureRequiredBody.takerId = acceptance.body.takerId
    signatureRequiredBody.requestId = proposal.body.requestId
    signatureRequiredBody.message = 'signatureRequired'
    signatureRequiredBody.transaction = transaction
    signatureRequiredBody.previousHash = acceptance.hash

    let message = buildMessage(signatureRequiredBody, keys, signatureRequiredSchema, recipientKey)
    let copyMessage = buildMessage(signatureRequiredBody, keys, signatureRequiredSchema, recipientKey)
    copyMessage = await signMessage(copyMessage, keys)

    message = await signMessage(message, keys)
    message = await encryptMessage(message, recipientKey)
    sendMessage('signatureRequired', message)
    proposal.signatureRequired = copyMessage
}

const processDisburse = async (param, proposals, adjudications, keys) => {

    let disbursementBody = JSON.parse(param)
    let { proposal, acceptance } = getResolvedAcceptance(disbursementBody.requestId, proposals)
    proposalAdjudications = adjudications.get(disbursementBody.requestId)
    let recipientKey
    let myKey = keys.publicKey.toString('hex')
    if (myKey !== acceptance.publicKey) {
        recipientKey = acceptance.publicKey
    } else {
        recipientKey = getKeyFromPreviousHash(acceptance.body.previousHash, proposal)
    }
    if (!recipientKey) {
        throw new Error('Unable to match up hashes')
    }
    if (!proposal.settlementInitiated) {
        throw new Error('The escrow account is not established.  Initiate settlement.')
    }
    if (proposalAdjudications.length > 0) {
        if (proposal.ruling && proposal.ruling.transaction) {
            //If there is a transaction on your copy of the ruling it means the jury ruled in your favor
            submitDisburseTransaction(disbursementBody.secret, proposal.ruling.transaction)
        } else {
            throw new Error('transaction is in dispute')
        }
    } else if ((acceptance.body.offerAsset === 'native') && (hostConfiguration.consumerId === acceptance.body.makerId)) {
        //Buyer initiating disburse (maker is buyer)
        processBuyerInitiatedDisburse(disbursementBody.secret, acceptance.body.takerId, recipientKey, acceptance.body.offerAmount, acceptance, proposal, keys)
    } else if ((acceptance.body.requestAsset === 'native') && (hostConfiguration.consumerId === acceptance.body.takerId)) {
        //Buyer initiating disburse (taker is buyer)
        processBuyerInitiatedDisburse(disbursementBody.secret, acceptance.body.makerId, recipientKey, acceptance.body.requestAmount, acceptance, proposal, keys)
    } else {
        //Seller is signing and collecting
        if (proposal.signatureRequired) {
            submitDisburseTransaction(disbursementBody.secret, proposal.signatureRequired.body.transaction)
        } else {
            throw new Error('The party purchasing with lumens must initiate disbursement')
        }
    }
}

const processFulfillment = async (param, proposals, keys) => {
    //previous hash is of acceptance
    let fulfillmentBody = JSON.parse(param)
    let { proposal, acceptance } = getResolvedAcceptance(fulfillmentBody.requestId, proposals)
    let recipientKey
    let myKey = keys.publicKey.toString('hex')
    if (myKey !== acceptance.publicKey) {
        recipientKey = acceptance.publicKey
    } else {
        recipientKey = getKeyFromPreviousHash(acceptance.body.previousHash, proposal)
    }
    if (!recipientKey) {
        throw new Error('Unable to match up hashes')
    }
    try {
        let message = buildMessage(fulfillmentBody, keys, fulfillmentSchema, recipientKey)
        let copyMessage = buildMessage(fulfillmentBody, keys, fulfillmentSchema, recipientKey)
        copyMessage = await signMessage(copyMessage, keys)

        message = await signMessage(message, keys)
        message = await encryptMessage(message, recipientKey)
        sendMessage('fulfillment', message)
        proposal.fulfillments.push(copyMessage)
    } catch (e) {
        throw new Error('unable to sign and encrypt: ' + e)
    }
}

const processAcceptProposal = async (param, proposals, keys) => {
    let acceptBody = JSON.parse(param)
    let proposal = proposals.get(acceptBody.requestId)
    if (proposal) {
        let acceptanceMessage = await processNegotiationMessage(acceptBody, proposal, keys, 'accept')
        proposal.acceptances.push(acceptanceMessage)
    } else {
        throw new Error('Unable to match acceptance to original proposal')
    }
}

const processSettleProposal = async (param, proposals, keys) => {
    let settlement = JSON.parse(param)
    let settlementInitiatedBody = {}
    let { proposal, acceptance } = getResolvedAcceptance(settlement.requestId, proposals)
    let escrowPair
    if (proposal.body.offerAsset === 'native') {
        if (hostConfiguration.consumerId !== proposal.body.makerId) {
            throw new Error('only party buying with lumens can initiate settlement')
        }
        escrowPair = await initiateSettlement(settlement.secret, acceptance.body.takerId, hostConfiguration.juryKey, acceptance.body.challengeStake, acceptance.body.offerAmount)
    } else {
        if (hostConfiguration.consumerId !== acceptance.body.takerId) {
            throw new Error('only party buying with lumens can initiate settlement')
        }
        escrowPair = await initiateSettlement(settlement.secret, acceptance.body.makerId, hostConfiguration.juryKey, acceptance.body.challengeStake, acceptance.body.requestAmount)
    }
    let recipientKey
    let myKey = keys.publicKey.toString('hex')
    if (myKey !== acceptance.publicKey) {
        recipientKey = acceptance.publicKey
    } else {
        recipientKey = getKeyFromPreviousHash(acceptance.body.previousHash, proposal)
    }
    if (!recipientKey) {
        throw new Error('Unable to match up hashes')
    }
    try {
        settlementInitiatedBody.makerId = proposal.body.makerId
        settlementInitiatedBody.takerId = acceptance.body.takerId
        settlementInitiatedBody.requestId = proposal.body.requestId
        settlementInitiatedBody.message = 'settlementInitiated'
        settlementInitiatedBody.escrow = escrowPair.publicKey()
        settlementInitiatedBody.previousHash = acceptance.hash

        let message = buildMessage(settlementInitiatedBody, keys, settlementInitiatedSchema, recipientKey)
        let copyMessage = buildMessage(settlementInitiatedBody, keys, settlementInitiatedSchema, recipientKey)
        copyMessage = await signMessage(copyMessage, keys)

        message = await signMessage(message, keys)
        message = await encryptMessage(message, recipientKey)
        sendMessage('settlementInitiated', message)
        proposal.settlementInitiated = copyMessage
    } catch (e) {
        throw new Error('unable to sign and encrypt: ' + e)
    }

}

const processCounterOffer = async (param, proposals, keys) => {
    let counterOfferBody = JSON.parse(param)
    let proposal = proposals.get(counterOfferBody.requestId)
    if (!proposal) {
        throw new Error('Unable to match counter offer to a proposal')
    }
    let counterOfferMessage = await processNegotiationMessage(counterOfferBody, proposal, keys, 'counterOffer')
    proposal.counterOffers.push(counterOfferMessage)
}

module.exports = { processCounterOffer,  processProposal,  processAcceptProposal, processAdjudication,  processProposalResolved, processSettleProposal, processFulfillment, processDisburse }