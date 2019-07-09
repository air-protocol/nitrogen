const { encryptMessage, signMessage } = require('../encrypt')
const { buildMessage, sendMessage } = require('./consumerPeer')
const { proposalSchema, negotiationSchema, proposalResolvedSchema, fulfillmentSchema } = require('../models/schemas')
const { initiateSettlement, transactionHistory } = require('./chain')
const hostConfiguration = require('../config/config')
const logger = require('../logging')

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
            logger.info('---------------------------------')
            logger.info('request: ' + requestId)
            logger.info('offer asset: ' + proposal.body.offerAsset)
            logger.info('offer amount: ' + proposal.body.offerAmount)
            logger.info('request asset: ' + proposal.body.requestAsset)
            logger.info('request amount: ' + proposal.body.requestAmount)
            logger.info('---------------------------------')
        })
    } else {
        logger.warn('no proposals')
    }
}

const processProposalResolved = async (param, proposals, keys) => {
    let resolveBody = JSON.parse(param)
    let proposal = proposals.get(resolveBody.requestId)
    if (!proposal) {
        logger.warn("Unable to find proposal")
    }
    let resolution = buildMessage(resolveBody, keys, proposalResolvedSchema)
    resolution = await signMessage(resolution, keys)
    proposal.resolution = resolution
    sendMessage('resolved', resolution)
}

const processNegotiationMessage = async (messageBody, proposal, keys, messageType) => {
    let recipientKey = getKeyFromPreviousHash(messageBody.previousHash, proposal)
    if (!recipientKey) {
        logger.warn('Unable to match up hashes')
    } else {
        try {
            let message = buildMessage(messageBody, keys, negotiationSchema)
            message = await signMessage(message, keys)
            copyMessage = JSON.parse(JSON.stringify(message))
            message = await encryptMessage(message, recipientKey)
            sendMessage(messageType, message)
        } catch (e) {
            logger.warn('unable to sign and encrypt: ' + e)
        }
    }
    return copyMessage
}

const processFulfillment = async (param, proposals, keys) => {
    //previous hash is of acceptance
    let fulfillmentBody = JSON.parse(param)
    let proposal = proposals.get(fulfillmentBody.requestId)
    if(! proposal) {
        throw new Error('Unable to locate proposal')
    }
    if (! proposal.resolution) {
        throw new Error('Proposal is not resolved')
    }
    let acceptance = undefined
    for(i = 0; i < proposal.acceptances.length; i++) {
        if (proposal.acceptances[i].takerId === proposal.resolution.takerId) {
            acceptance = proposal.acceptances[i]
        }
    }
    if (! acceptance) {
        throw new Error('Proposal did not resolve an acceptance')
    }
    let recipientKey
    if(JSON.stringify(keys.publicKey) !== JSON.stringify(acceptance.publicKey))
    {
        recipientKey = acceptance.publicKey
    } else {
        recipientKey = getKeyFromPreviousHash(acceptance.body.previousHash, proposal)
    }
    if (!recipientKey) {
        logger.warn('Unable to match up hashes')
    } else {
        try {
            let message = buildMessage(fulfillmentBody, keys, fulfillmentSchema)
            message = await signMessage(message, keys)
            copyMessage = JSON.parse(JSON.stringify(message))
            message = await encryptMessage(message, recipientKey)
            sendMessage('fulfillment', message)
            proposal.fulfillments.push(copyMessage)
        } catch (e) {
            logger.warn('unable to sign and encrypt: ' + e)
        }
    }
}

const processAcceptProposal = async (param, proposals, keys) => {
    let acceptBody = JSON.parse(param)
    let proposal = proposals.get(acceptBody.requestId)
    if (proposal) {
        let acceptanceMessage = await processNegotiationMessage(acceptBody, proposal, keys, 'accept')
        proposal.acceptances.push(acceptanceMessage)
    } else {
        logger.warn('Unable to match acceptance to original proposal')
    }
}

const processSettleProposal = async (param, proposals) => {
    let settlement = JSON.parse(param)
    let proposal = proposals.get(settlement.requestId)
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
    if (proposal.body.offerAsset === 'native') {
        if (hostConfiguration.consumerId !== proposal.body.makerId) {
            throw new Error('only party buying with lumens can initiate settlement')
        }
        initiateSettlement(settlement.secret, acceptance.body.takerId, hostConfiguration.juryKey, acceptance.body.challengeStake, acceptance.body.offerAmount)
    } else {
        if (hostConfiguration.consumerId !== acceptance.body.takerId) {
            throw new Error('only party buying with lumens can initiate settlement')
        }
        initiateSettlement(settlement.secret, acceptance.body.makerId, hostConfiguration.juryKey, acceptance.body.challengeStake, acceptance.body.requestAmount)
    }

}

const processCounterOffer = async (param, proposals, keys) => {
    let counterOfferBody = JSON.parse(param)
    let proposal = proposals.get(counterOfferBody.requestId)
    if (proposal) {
        let counterOfferMessage = await processNegotiationMessage(counterOfferBody, proposal, keys, 'counterOffer')
        proposal.counterOffers.push(counterOfferMessage)
    } else {
        logger.warn('Unable to match counter offer to a proposal')
    }
}

const processCounterOffers = (param, proposals) => {
    let counteredProposal = proposals.get(param)
    if (counteredProposal) {
        counteredProposal.counterOffers.forEach((counterOffer) => {
            logger.info('---------------------------------')
            logger.info('request: ' + counterOffer.body.requestId)
            logger.info('taker id: ' + counterOffer.body.takerId)
            logger.info('offer asset: ' + counterOffer.body.offerAsset)
            logger.info('offer amount: ' + counterOffer.body.offerAmount)
            logger.info('request asset: ' + counterOffer.body.requestAsset)
            logger.info('request amount: ' + counterOffer.body.requestAmount)
            logger.info('---------------------------------')
        })
    } else {
        logger.info('proposal not found')
    }
}

const processOfferHistory = (param, proposals) => {
    let proposal = proposals.get(param)
    if (proposal) {
        logger.info('---------------------------------')
        logger.info('Original Proposal')
        logger.info('from public key: ' + JSON.stringify(proposal.publicKey))
        logger.info('request: ' + proposal.body.requestId)
        logger.info('maker id: ' + proposal.body.makerId)
        logger.info('offer asset: ' + proposal.body.offerAsset)
        logger.info('offer amount: ' + proposal.body.offerAmount)
        logger.info('request asset: ' + proposal.body.requestAsset)
        logger.info('request amount: ' + proposal.body.requestAmount)
        logger.info('---------------------------------')
        proposal.counterOffers.forEach((counterOffer) => {
            logger.info('---------------------------------')
            logger.info('Counter Offer')
            logger.info('from public key: ' + JSON.stringify(counterOffer.publicKey))
            logger.info('request: ' + counterOffer.body.requestId)
            logger.info('maker id: ' + counterOffer.body.makerId)
            logger.info('taker id: ' + counterOffer.body.takerId)
            logger.info('offer asset: ' + counterOffer.body.offerAsset)
            logger.info('offer amount: ' + counterOffer.body.offerAmount)
            logger.info('request asset: ' + counterOffer.body.requestAsset)
            logger.info('request amount: ' + counterOffer.body.requestAmount)
            logger.info('---------------------------------')
        })
        proposal.acceptances.forEach((acceptance) => {
            logger.info('---------------------------------')
            logger.info('Acceptance')
            logger.info('from public key: ' + JSON.stringify(acceptance.publicKey))
            logger.info('request: ' + acceptance.body.requestId)
            logger.info('maker id: ' + acceptance.body.makerId)
            logger.info('taker id: ' + acceptance.body.takerId)
            logger.info('offer asset: ' + acceptance.body.offerAsset)
            logger.info('offer amount: ' + acceptance.body.offerAmount)
            logger.info('request asset: ' + acceptance.body.requestAsset)
            logger.info('request amount: ' + acceptance.body.requestAmount)
            logger.info('---------------------------------')
        })
        proposal.fulfillments.forEach((fulfillment) => {
            logger.info('---------------------------------')
            logger.info('Fulfillment')
            logger.info('from public key: ' + JSON.stringify(fulfillment.publicKey))
            logger.info('request: ' + fulfillment.body.requestId)
            logger.info('maker id: ' + fulfillment.body.makerId)
            logger.info('taker id: ' + fulfillment.body.takerId)
            logger.info('message: ' + fulfillment.body.message)
            logger.info('fulfullment: ' + JSON.stringify(fulfillment.body.fulfillment))
            logger.info('---------------------------------')
        })
        if (proposal.resolution) {
            logger.info('---------------------------------')
            logger.info('Proposal resolved accepting taker id: ' + proposal.resolution.takerId)
        }
    } else {
        logger.warn('proposal not found')
    }
}

const processTransactionHistory = async (accountId) => {
    const records = await transactionHistory(accountId)
    records.forEach((item) => {
        logger.info('\n' + 'Source Account: ' + item.source_account)
        logger.info('Source Account Sequence: ' + item.source_account_sequence)
        logger.info('Created At: ' + item.created_at)
        logger.info('Memo: ' + item.memo)
        logger.info('Successful: ' + item.successful)
        logger.info('Fee Paid: ' + item.fee_paid)
        logger.info('Ledger number: ' + item.ledger)
    })
}

module.exports = { processCounterOffer, processCounterOffers, processProposal, processProposals, processAcceptProposal, processOfferHistory, processProposalResolved, processSettleProposal, processTransactionHistory, processFulfillment }