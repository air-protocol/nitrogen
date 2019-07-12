const { encryptMessage, signMessage } = require('../encrypt')
const { buildMessage, sendMessage } = require('./consumerPeer')
const { proposalSchema, negotiationSchema, proposalResolvedSchema, fulfillmentSchema, settlementInitiatedSchema, signatureRequiredSchema } = require('../models/schemas')
const { initiateSettlement, transactionHistory, viewEscrow, createBuyerDisburseTransaction, submitDisburseTransaction } = require('./chain')
const hostConfiguration = require('../config/config')
const logger = require('./clientLogging')

const getKeyFromPreviousHash = (previousHash, proposal) => {
    let recipientKey = undefined
    if (JSON.stringify(previousHash) === JSON.stringify(proposal.hash)) {
        recipientKey = proposal.publicKey
    } else {
        for (i = 0; i < proposal.counterOffers.length; i++) {
            if (JSON.stringify(previousHash) === JSON.stringify(proposal.counterOffers[i].hash)) {
                recipientKey = proposal.counterOffers[i].publicKey
                break
            }
        }
    }
    return recipientKey
}

const processProposal = async (param, proposals, keys) => {
    let proposalBody = JSON.parse(param)
    let proposal = buildMessage(proposalBody, keys, proposalSchema)
    proposal = await signMessage(proposal, keys)
    sendMessage('proposal', proposal)

    proposal.counterOffers = []
    proposal.acceptances = []
    proposal.fulfillments = []
    proposals.set(proposal.body.requestId, proposal)
}

const processProposals = (proposals) => {
    console.clear()
    if (proposals.size) {
        proposals.forEach((proposal, requestId) => {
            console.log('---------------------------------')
            console.log('request: ' + requestId)
            console.log('offer asset: ' + proposal.body.offerAsset)
            console.log('offer amount: ' + proposal.body.offerAmount)
            console.log('request asset: ' + proposal.body.requestAsset)
            console.log('request amount: ' + proposal.body.requestAmount)
            console.log('---------------------------------')
        })
    } else {
        logger.warn('no proposals')
    }
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
    } else {
        try {
            let message = buildMessage(messageBody, keys, negotiationSchema)
            message = await signMessage(message, keys)
            copyMessage = JSON.parse(JSON.stringify(message))
            message = await encryptMessage(message, recipientKey)
            sendMessage(messageType, message)
        } catch (e) {
            throw new Error('unable to sign and encrypt: ' + e)
        }
    }
    return copyMessage
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

    let message = buildMessage(signatureRequiredBody, keys, signatureRequiredSchema)
    message = await signMessage(message, keys)
    copyMessage = JSON.parse(JSON.stringify(message))
    message = await encryptMessage(message, recipientKey)
    sendMessage('signatureRequired', message)
    proposal.signatureRequired = copyMessage
}

const processDisburse = async (param, proposals, keys) => {
    //previous hash is of acceptance
    //TODO pass in adjudications or a flag for in dispute
    const adjudications = []

    let disbursementBody = JSON.parse(param)
    let { proposal, acceptance } = getResolvedAcceptance(disbursementBody.requestId, proposals)
    let recipientKey
    if (JSON.stringify(keys.publicKey) !== JSON.stringify(acceptance.publicKey)) {
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
    if (adjudications.length > 0) {
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
    if (JSON.stringify(keys.publicKey) !== JSON.stringify(acceptance.publicKey)) {
        recipientKey = acceptance.publicKey
    } else {
        recipientKey = getKeyFromPreviousHash(acceptance.body.previousHash, proposal)
    }
    if (!recipientKey) {
        throw new Error('Unable to match up hashes')
    }
    try {
        let message = buildMessage(fulfillmentBody, keys, fulfillmentSchema)
        message = await signMessage(message, keys)
        copyMessage = JSON.parse(JSON.stringify(message))
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
    if (JSON.stringify(keys.publicKey) !== JSON.stringify(acceptance.publicKey)) {
        recipientKey = acceptance.publicKey
    } else {
        recipientKey = getKeyFromPreviousHash(acceptance.body.previousHash, proposal)
    }
    if (!recipientKey) {
        throw new Error('Unable to match up hashes')
    }
    try {
        let settlementInitiatedBody = {}
        settlementInitiatedBody.makerId = proposal.body.makerId
        settlementInitiatedBody.takerId = acceptance.body.takerId
        settlementInitiatedBody.requestId = proposal.body.requestId
        settlementInitiatedBody.message = 'settlementInitiated'
        settlementInitiatedBody.escrow = escrowPair.publicKey()
        settlementInitiatedBody.previousHash = acceptance.hash

        let message = buildMessage(settlementInitiatedBody, keys, settlementInitiatedSchema)
        message = await signMessage(message, keys)
        copyMessage = JSON.parse(JSON.stringify(message))
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

const processCounterOffers = (param, proposals) => {
    let counteredProposal = proposals.get(param)
    if (!counteredProposal) {
        throw new Error('proposal not found')
    }
    counteredProposal.counterOffers.forEach((counterOffer) => {
        console.log('---------------------------------')
        console.log('request: ' + counterOffer.body.requestId)
        console.log('taker id: ' + counterOffer.body.takerId)
        console.log('offer asset: ' + counterOffer.body.offerAsset)
        console.log('offer amount: ' + counterOffer.body.offerAmount)
        console.log('request asset: ' + counterOffer.body.requestAsset)
        console.log('request amount: ' + counterOffer.body.requestAmount)
        console.log('---------------------------------')
    })
}

const processOfferHistory = (param, proposals) => {
    let proposal = proposals.get(param)
    if (!proposal) {
        throw new Error('proposal not found')
    }
    console.log('---------------------------------')
    console.log('Original Proposal')
    console.log('from public key: ' + JSON.stringify(proposal.publicKey))
    console.log('request: ' + proposal.body.requestId)
    console.log('maker id: ' + proposal.body.makerId)
    console.log('offer asset: ' + proposal.body.offerAsset)
    console.log('offer amount: ' + proposal.body.offerAmount)
    console.log('request asset: ' + proposal.body.requestAsset)
    console.log('request amount: ' + proposal.body.requestAmount)
    console.log('---------------------------------')
    proposal.counterOffers.forEach((counterOffer) => {
        console.log('---------------------------------')
        console.log('Counter Offer')
        console.log('from public key: ' + JSON.stringify(counterOffer.publicKey))
        console.log('request: ' + counterOffer.body.requestId)
        console.log('maker id: ' + counterOffer.body.makerId)
        console.log('taker id: ' + counterOffer.body.takerId)
        console.log('offer asset: ' + counterOffer.body.offerAsset)
        console.log('offer amount: ' + counterOffer.body.offerAmount)
        console.log('request asset: ' + counterOffer.body.requestAsset)
        console.log('request amount: ' + counterOffer.body.requestAmount)
        console.log('---------------------------------')
    })
    proposal.acceptances.forEach((acceptance) => {
        console.log('---------------------------------')
        console.log('Acceptance')
        console.log('from public key: ' + JSON.stringify(acceptance.publicKey))
        console.log('request: ' + acceptance.body.requestId)
        console.log('maker id: ' + acceptance.body.makerId)
        console.log('taker id: ' + acceptance.body.takerId)
        console.log('offer asset: ' + acceptance.body.offerAsset)
        console.log('offer amount: ' + acceptance.body.offerAmount)
        console.log('request asset: ' + acceptance.body.requestAsset)
        console.log('request amount: ' + acceptance.body.requestAmount)
        console.log('---------------------------------')
    })
    proposal.fulfillments.forEach((fulfillment) => {
        console.log('---------------------------------')
        console.log('Fulfillment')
        console.log('from public key: ' + JSON.stringify(fulfillment.publicKey))
        console.log('request: ' + fulfillment.body.requestId)
        console.log('maker id: ' + fulfillment.body.makerId)
        console.log('taker id: ' + fulfillment.body.takerId)
        console.log('message: ' + fulfillment.body.message)
        console.log('fulfullment: ' + JSON.stringify(fulfillment.body.fulfillment))
        console.log('---------------------------------')
    })
    if (proposal.resolution) {
        console.log('---------------------------------')
        console.log('Proposal resolved accepting taker id: ' + proposal.resolution.takerId)
        console.log('---------------------------------')
    }
    if (proposal.settlementInitiated) {
        console.log('---------------------------------')
        console.log('Settlement initiated with escrow id: ' + proposal.settlementInitiated.body.escrow)
        console.log('---------------------------------')
    }
    if (proposal.signatureRequired) {
        console.log('---------------------------------')
        console.log('The buyer issued disbursement')
        console.log('---------------------------------')
    }
}

const processTransactionHistory = async (accountId) => {
    const records = await transactionHistory(accountId)
    records.forEach((item) => {
        console.log('\n' + 'Source Account: ' + item.source_account)
        console.log('Source Account Sequence: ' + item.source_account_sequence)
        console.log('Created At: ' + item.created_at)
        console.log('Memo: ' + item.memo)
        console.log('Successful: ' + item.successful)
        console.log('Fee Paid: ' + item.fee_paid)
        console.log('Ledger number: ' + item.ledger)
    })
}

const processViewEscrow = async (param, proposals) => {
    const proposal = proposals.get(param)
    if (!proposal.settlementInitiated) {
        throw new Error('The settlement has not been initiated yet. No escrow account to view')
    }
    const escrowId = proposal.settlementInitiated.body.escrow
    const accountResult = await viewEscrow(escrowId)
    console.log('\nAccount Id: ' + accountResult.account_id)
    console.log('Sequence: ' + accountResult.sequence)
    console.log('Balance: ' + JSON.stringify(accountResult.balances[0]))
    for (i = 0; i < accountResult.signers.length; i++) {
        console.log('Signer: ' + JSON.stringify(accountResult.signers[i]))
    }
}

module.exports = { processCounterOffer, processCounterOffers, processProposal, processProposals, processAcceptProposal, processOfferHistory, processProposalResolved, processSettleProposal, processTransactionHistory, processFulfillment, processViewEscrow, processDisburse }