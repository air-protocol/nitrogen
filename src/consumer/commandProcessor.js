const { encryptMessage, signMessage } = require('../encrypt')
const { buildMessage, sendMessage } = require('./consumerPeer')
const { proposalSchema, negotiationSchema, proposalResolvedSchema, fulfillmentSchema } = require('../models/schemas')
const { initiateSettlement, transactionHistory } = require('./chain')
const hostConfiguration = require('../config/config')

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
    proposal.rejections = []
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
        console.log('no proposals')
    }
}

const processProposalResolved = async (param, proposals, keys) => {
    let resolveBody = JSON.parse(param)
    let proposal = proposals.get(resolveBody.requestId)
    if (!proposal) {
        console.log("Unable to find proposal")
        return
    }
    let resolution = buildMessage(resolveBody, keys, proposalResolvedSchema)
    resolution = await signMessage(resolution, keys)
    proposal.resolution = resolution
    sendMessage('resolved', resolution)
}

const processNegotiationMessage = async (messageBody, proposal, keys, messageType) => {
    let recipientKey = getKeyFromPreviousHash(messageBody.previousHash, proposal)
    if (!recipientKey) {
        console.log('Unable to match up hashes')
    } else {
        try {
            let message = buildMessage(messageBody, keys, negotiationSchema)
            message = await signMessage(message, keys)
            copyMessage = JSON.parse(JSON.stringify(message))
            message = await encryptMessage(message, recipientKey)
            sendMessage(messageType, message)
        } catch (e) {
            console.log('unable to sign and encrypt: ' + e)
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

const processFulfillment = async (param, proposals, keys) => {
    //previous hash is of acceptance
    let fulfillmentBody = JSON.parse(param)
    let {proposal, acceptance}  = getResolvedAcceptance(fulfillmentBody.requestId, proposals)
    let recipientKey
    if (JSON.stringify(keys.publicKey) !== JSON.stringify(acceptance.publicKey)) {
        recipientKey = acceptance.publicKey
    } else {
        recipientKey = getKeyFromPreviousHash(acceptance.body.previousHash, proposal)
    }
    if (!recipientKey) {
        console.log('Unable to match up hashes')
    } else {
        try {
            let message = buildMessage(fulfillmentBody, keys, fulfillmentSchema)
            message = await signMessage(message, keys)
            copyMessage = JSON.parse(JSON.stringify(message))
            message = await encryptMessage(message, recipientKey)
            sendMessage('fulfillment', message)
            proposal.fulfillments.push(copyMessage)
        } catch (e) {
            console.log('unable to sign and encrypt: ' + e)
        }
    }
}

const processRejectProposal = async (param, proposals, keys) => {
    let rejectBody = JSON.parse(param)
    let proposal = proposals.get(rejectBody.requestId)
    if (proposal) {
        let rejectionMessage = await processNegotiationMessage(rejectBody, proposal, keys, 'reject')
        proposal.rejections.push(rejectionMessage)
    } else {
        console.log('Unable to match rejection to original proposal')
    }
}

const processAcceptProposal = async (param, proposals, keys) => {
    let acceptBody = JSON.parse(param)
    let proposal = proposals.get(acceptBody.requestId)
    if (proposal) {
        let acceptanceMessage = await processNegotiationMessage(acceptBody, proposal, keys, 'accept')
        proposal.acceptances.push(acceptanceMessage)
    } else {
        console.log('Unable to match acceptance to original proposal')
    }
}

const processSettleProposal = async (param, proposals) => {
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

}

const processCounterOffer = async (param, proposals, keys) => {
    let counterOfferBody = JSON.parse(param)
    let proposal = proposals.get(counterOfferBody.requestId)
    if (proposal) {
        let counterOfferMessage = await processNegotiationMessage(counterOfferBody, proposal, keys, 'counterOffer')
        proposal.counterOffers.push(counterOfferMessage)
    } else {
        console.log('Unable to match counter offer to a proposal')
    }
}

const processCounterOffers = (param, proposals) => {
    let counteredProposal = proposals.get(param)
    if (counteredProposal) {
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
    } else {
        console.log('proposal not found')
    }
}

const processOfferHistory = (param, proposals) => {
    let proposal = proposals.get(param)
    if (proposal) {
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
        proposal.rejections.forEach((rejection) => {
            console.log('---------------------------------')
            console.log('Rejection')
            console.log('from public key: ' + JSON.stringify(rejection.publicKey))
            console.log('request: ' + rejection.body.requestId)
            console.log('maker id: ' + rejection.body.makerId)
            console.log('taker id: ' + rejection.body.takerId)
            console.log('offer asset: ' + rejection.body.offerAsset)
            console.log('offer amount: ' + rejection.body.offerAmount)
            console.log('request asset: ' + rejection.body.requestAsset)
            console.log('request amount: ' + rejection.body.requestAmount)
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
        proposals.fulfillments.forEach((fulfillment) => {
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
        }
    } else {
        console.log('proposal not found')
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

module.exports = { processCounterOffer, processCounterOffers, processProposal, processProposals, processAcceptProposal, processRejectProposal, processOfferHistory, processProposalResolved, processSettleProposal, processTransactionHistory, processFulfillment }