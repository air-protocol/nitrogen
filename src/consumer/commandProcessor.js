const { encryptMessage, signMessage } = require('../encrypt')
const { buildMessage, sendMessage } = require('./consumerPeer')
const { proposalSchema, negotiationSchema } = require('../models/schemas')

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
    proposals.set(proposal.body.requestId, proposal)
}

const processProposals = (proposals) => {
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

const processRejectProposal = async (param, proposals, keys) => {
    let rejectBody = JSON.parse(param)
    let proposal = proposals.get(rejectBody.requestId)
    if (proposal) {
        let rejectionMessage = await processNegotiationMessage(rejectBody, proposal, keys, 'reject')
        proposal.rejection = rejectionMessage
    } else {
        console.log('Unable to match rejection to original proposal')
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
            console.log(JSON.stringify(counterOffer.hash))
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

module.exports = { processCounterOffer, processCounterOffers, processProposal, processProposals, processRejectProposal }