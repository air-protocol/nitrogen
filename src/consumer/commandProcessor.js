const { encryptMessage, signMessage } = require('../encrypt')
const { buildMessage, sendMessage } = require('./consumerPeer')
const { counterOfferSchema, proposalSchema } = require('../models/schemas')

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
    let message = buildMessage(proposalBody, keys, proposalSchema)
    message = await signMessage(message, keys)
    sendMessage('proposal', message)
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

const processCounterOffer = async (param, proposals, keys) => {
    let counterOfferBody = JSON.parse(param)
    let proposal = proposals.get(counterOfferBody.requestId)
    if (proposal) {
        let recipientKey = getKeyFromPreviousHash(counterOfferBody.previousHash, proposal)
        if (!recipientKey) {
            console.log('Unable to match up hashes')
        } else {
            try {
                let message = buildMessage(counterOfferBody, keys, counterOfferSchema)
                message = await signMessage(message, keys)
                let copyMessage = JSON.parse(JSON.stringify(message))
                proposal.counterOffers.push(copyMessage)
                message = await encryptMessage(message, recipientKey)
                sendMessage('counterOffer', message)
            } catch (e) {
                console.log('unable to sign and encrypt: ' + e)
            }
        }
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

module.exports = { processCounterOffer, processCounterOffers, processProposal, processProposals }