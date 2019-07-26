const { encryptMessage, signMessage } = require('../encrypt')
const { buildMessage, sendMessage } = require('./consumerPeer')
const { buildAgreement, pullValuesFromAgreement, validateAgreement } = require('./agreement')
const { adjudicateSchema, proposalSchema, negotiationSchema, proposalResolvedSchema, fulfillmentSchema, settlementInitiatedSchema, signatureRequiredSchema, rulingSchema, disbursedSchema } = require('../models/schemas')
const { initiateSettlement, createBuyerDisburseTransaction, submitDisburseTransaction, createFavorBuyerTransaction, createFavorSellerTransaction } = require('./chain')
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

const processProposal = async (param, proposals, keys) => {
    let proposalBody = JSON.parse(param)
    if (proposals.get(proposalBody.requestId)) {
        throw new Error('A proposal with that requestId already exists.')
    }
    let proposal = buildMessage(proposalBody, keys, proposalSchema)
    proposal = await signMessage(proposal, keys)
    sendMessage('proposal', proposal)

    proposal.counterOffers = []
    proposal.acceptances = []
    proposal.fulfillments = []
    proposals.set(proposal.body.requestId, proposal)
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
        message = await signMessage(message, keys)

        let copyMessage = JSON.parse(JSON.stringify(message))

        message = await encryptMessage(message, recipientKey)
        sendMessage(messageType, message)
        return copyMessage
    } catch (e) {
        throw new Error('unable to sign and encrypt: ' + e)
    }
}

const processAdjudication = async (param, proposals, adjudications, keys) => {
    let adjudicate = JSON.parse(param)
    let { proposal, acceptance } = getResolvedAcceptance(adjudicate.requestId, proposals)
    if (!proposal.settlementInitiated) {
        throw new Error('The settlement has not yet been initiated')
    }
    try {
        let adjudicateBody = {}
        adjudicateBody.makerId = proposal.body.makerId
        adjudicateBody.takerId = proposal.body.takerId
        adjudicateBody.requestId = proposal.body.requestId
        adjudicateBody.message = 'adjudicate'
        adjudicateBody.agreement = buildAgreement(proposal)
        adjudicateBody.previousHash = acceptance.hash
        adjudicateBody.timeStamp = adjudicate.timeStamp

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
        juryMessage = await signMessage(juryMessage, keys)

        let copyMessage = JSON.parse(JSON.stringify(juryMessage))

        juryMessage = await encryptMessage(juryMessage, Buffer.from(hostConfiguration.juryMeshPublicKey, 'hex'))
        sendMessage('adjudicate', juryMessage)

        if (!adjudications.get(proposal.body.requestId)) {
            adjudications.set(proposal.body.requestId, [])
        }
        adjudications.get(proposal.body.requestId).push(copyMessage)
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
    message = await signMessage(message, keys)

    let copyMessage = JSON.parse(JSON.stringify(message))

    message = await encryptMessage(message, recipientKey)
    sendMessage('signatureRequired', message)

    proposal.signatureRequired = copyMessage
}

const sendFinalDisburseMessage = async (proposal, acceptance, keys, recipientKey) => {
    let disbursedBody = {}
    try {
        disbursedBody.makerId = proposal.body.makerId
        disbursedBody.takerId = acceptance.body.takerId
        disbursedBody.requestId = proposal.body.requestId
        disbursedBody.message = 'disbursed'
        disbursedBody.previousHash = acceptance.hash

        let message = buildMessage(disbursedBody, keys, disbursedSchema, recipientKey)
        message = await signMessage(message, keys)

        let copyMessage = JSON.parse(JSON.stringify(message))

        message = await encryptMessage(message, recipientKey)
        sendMessage('disbursed', message)
        proposal.disbursed = copyMessage
    } catch (e) {
        throw new Error('unable to sign and encrypt: ' + e)
    }
}

const processDisburse = async (param, proposals, adjudications, rulings, keys) => {

    let disbursementBody = JSON.parse(param)
    let { proposal, acceptance } = getResolvedAcceptance(disbursementBody.requestId, proposals)
    if (!proposal.settlementInitiated) {
        throw new Error('The escrow account is not established.  Initiate settlement.')
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

    proposalAdjudications = adjudications.get(proposal.body.requestId)
    if (proposalAdjudications && proposalAdjudications.length > 0) {
        let ruling = rulings.get(proposal.body.requestId)
        if (ruling) {
            if (ruling.body.transaction) {
                //If there is a transaction on your copy of the ruling it means the jury ruled in your favor
                submitDisburseTransaction(disbursementBody.secret, ruling.body.transaction)
                sendFinalDisburseMessage(proposal, acceptance, keys, recipientKey)
            } else {
                throw new Error('jury did not rule in your favor')
            }
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
            sendFinalDisburseMessage(proposal, acceptance, keys, recipientKey)
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
        message = await signMessage(message, keys)

        let copyMessage = JSON.parse(JSON.stringify(message))

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
        message = await signMessage(message, keys)

        let copyMessage = JSON.parse(JSON.stringify(message))

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

const processValidateAgreement = async (param, adjudications) => {
    const agreementParams = JSON.parse(param)
    const adjudicationsForProposal = adjudications.get(agreementParams.requestId)
    if (!(adjudicationsForProposal && ((adjudicationsForProposal.length - 1) >= agreementParams.agreementIndex))) {
        throw new Error('No agreement associated with that index')
    }
    const report = await validateAgreement(adjudicationsForProposal[agreementParams.agreementIndex].agreement)
    return report
}

const processViewAgreement = async (param, adjudications) => {
    const agreementParams = JSON.parse(param)
    const adjudication = adjudications.get(agreementParams.requestId)
    if(!adjudication) {
        throw new Error("There is no adjudication with that requestId and agreementIndex")
    }
    const agreement = adjudication[agreementParams.agreementIndex].body.agreement
    return agreement
}

const processRuling = async (param, adjudications, rulings, keys) => {
    let ruling = JSON.parse(param)
    let proposalAdjudications = adjudications.get(ruling.requestId)
    if (proposalAdjudications.length === 0) {
        throw new Error('This request id is not in dispute')
    }

    let adjudication = proposalAdjudications[ruling.adjudicationIndex]
    let agreement = adjudication.body.agreement

    const { buyerMeshKey,
        sellerMeshKey,
        buyerStellarKey,
        sellerStellarKey,
        escrowStellarKey,
        nativeAmount,
        challengeStake,
        makerId,
        takerId,
        requestId,
        acceptanceHash } = pullValuesFromAgreement(agreement)

    let rulingBody = {}
    rulingBody.makerId = makerId
    rulingBody.takerId = takerId
    rulingBody.requestId = requestId
    rulingBody.message = 'ruling'
    rulingBody.favor = ruling.favor
    rulingBody.justification = ruling.justification
    rulingBody.previousHash = acceptanceHash

    let sellerRulingBody = JSON.parse(JSON.stringify(rulingBody))

    let buyerMessage = buildMessage(rulingBody, keys, rulingSchema, buyerMeshKey)
    let sellerMessage = buildMessage(sellerRulingBody, keys, rulingSchema, sellerMeshKey)

    if (ruling.favor === 'buyer') {
        buyerMessage.body.transaction = await createFavorBuyerTransaction(ruling.secret, escrowStellarKey, buyerStellarKey, challengeStake)
    } else {
        sellerMessage.body.transaction = await createFavorSellerTransaction(ruling.secret, escrowStellarKey, buyerStellarKey, sellerStellarKey, challengeStake, nativeAmount)
    }
    buyerMessage = await signMessage(buyerMessage, keys)
    sellerMessage = await signMessage(sellerMessage, keys)

    let copyMessage
    if (ruling.favor === 'buyer') {
        copyMessage = JSON.parse(JSON.stringify(buyerMessage))
    } else {
        copyMessage = JSON.parse(JSON.stringify(sellerMessage))
    }

    buyerMessage = await encryptMessage(buyerMessage, buyerMeshKey)
    sellerMessage = await encryptMessage(sellerMessage, sellerMeshKey)

    sendMessage('ruling', buyerMessage)
    sendMessage('ruling', sellerMessage)

    rulings.set(requestId, copyMessage)
}

module.exports = { processCounterOffer, processProposal, processAcceptProposal, processAdjudication, processProposalResolved, processSettleProposal, processFulfillment, processDisburse, processRuling, processValidateAgreement, processViewAgreement }
