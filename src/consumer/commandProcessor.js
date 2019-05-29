const { encryptMessage, signMessage } = require('../encrypt')
const { buildMessage, sendMessage } = require('./consumerPeer')
const { proposalSchema, negotiationSchema, proposalResolvedSchema } = require('../models/schemas')

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

const processProposalResolved = async (param, proposals, keys) => {
    let resolveBody = JSON.parse(param)
    let proposal = proposals.get(resolveBody.requestId)
    if(! proposal) {
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
        if (proposal.resolution) {
            console.log('---------------------------------')
            console.log('Proposal resolved accepting taker id: ' + proposal.resolution.takerId)
        }
    } else {
        console.log('proposal not found')
    }
}

module.exports = { processCounterOffer, processCounterOffers, processProposal, processProposals, processAcceptProposal, processRejectProposal, processOfferHistory, processProposalResolved }
