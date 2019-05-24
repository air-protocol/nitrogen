const localCache = require('../cache')
const hostConfiguration = require('../config/config')
const uuid = require('uuid')
const argv = require('yargs').argv
const { decryptMessage, verifyMessage } = require('../encrypt')

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

const consumerProposalHandler = async (proposal, proposals) => {
    if (!messageSeen(proposal)) {
        if(await !verifyMessage(proposal)) {
            console.log("Couldn't verify message signature")
            return
        }
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

const consumerCounterOfferHandler = async (peerMessage, proposals, keys) => {
    /* If you have not processed the message
    and it is from the other party (your key !== message key)
    and you are either the maker or taker
    */
    if (!messageSeen(peerMessage.uuid) && 
    ((JSON.stringify(keys.publicKey) !== JSON.stringify(peerMessage.publicKey)) && 
    (peerMessage.makerId === consumerId || peerMessage.takerId === consumerId))) {
        peerMessage = await decryptMessage(peerMessage, keys.privateKey)
        let proposal = proposals.get(peerMessage.body.requestId)
        if(await !verifyMessage(peerMessage)){
            console.log("Couldn't verify message signature")
            return
        }
        if (proposal) {
            proposal.counterOffers.push(peerMessage)
        }
    }
}

module.exports = { consumerAddMeHandler, consumerCounterOfferHandler, consumerProposalHandler }