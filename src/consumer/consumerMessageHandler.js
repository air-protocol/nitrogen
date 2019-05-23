const localCache = require('../cache')
const hostConfiguration = require('../config/config')
const uuid = require('uuid')
const argv = require('yargs').argv
const { decryptMessage } = require('../encrypt')

const consumerId = argv.consumerId || uuid()
let messageUUIDs = []

const messageSeen = (messageUUID) => {
    if (!messageUUIDs.includes(messageUUID)) {
        if (messageUUIDs.length >= hostConfiguration.maxMessageStore) {
            messageUUIDs.shift()
        }
        messageUUIDs.push(messageUUID)
        return false
    }
    return true
}

const consumerProposalHandler = (proposal, proposals) => {
    if (!messageSeen(proposal)) {
        proposal.counterOffers = []
        proposals.set(proposal.body.requestId, proposal)
    }
}

const consumerAddMeHandler = (peerMessage) => {
    let directory = localCache.getKey('directory')
    if ((directory !== undefined) && (!directory.includes(peerMessage.address))) {
        directory.push(peerMessage.address)
        localCache.setKey('directory', directory)
        localCache.save()
    }
    console.log('add me for: ' + peerMessage.address)
}

const consumerCounterOfferHandler = async (peerMessage, proposals, privateKey) => {
    if (!messageSeen(peerMessage.uuid) && peerMessage.makerId === consumerId) {
        peerMessage = await decryptMessage(peerMessage, privateKey)
        console.log(peerMessage)
        let proposal = proposals.get(peerMessage.body.requestId)
        if (proposal) {
            proposal.counterOffers.push(peerMessage)
        }
    }
}

module.exports = { consumerAddMeHandler, consumerCounterOfferHandler, consumerProposalHandler}