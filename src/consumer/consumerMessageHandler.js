const localCache = require('../cache')
const hostConfiguration = require('../config/config')
const uuid = require('uuid')
const argv = require('yargs').argv
const { decryptMessage, verifyMessage } = require('../encrypt')
const logger = require('../logging')

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

const consumerProposalHandler = async (proposal, proposals, keys) => {
    //If you have not processed the message
    //and it is from another party (your key !== message key)
    if ((!messageSeen(proposal)) && (JSON.stringify(keys.publicKey) !== JSON.stringify(proposal.publicKey))) {
        if (await !verifyMessage(proposal)) {
            logger.warn("Couldn't verify message signature on inbound proposal")
            return
        }
        proposal.counterOffers = []
        proposal.rejections = []
        proposal.acceptances = []
        proposals.set(proposal.body.requestId, proposal)
    }
}

const consumerProposalResolvedHandler = async (resolution, proposals) => {
    if (!messageSeen(resolution.uuid)) {
        if (await !verifyMessage(resolution)) {
            logger.warn("Couldn't verify message signature on inbound proposal resolution")
            return
        }
        if ((resolution.makerId != consumerId) && (resolution.takerId != consumerId)) {
            proposals.delete(resolution.body.requestId)
        } else {
            let proposal = proposals.get(resolution.body.requestId)
            if (!proposal) {
                logger.warn("Unable to find proposal for inbound proposal resolution")
                return
            }
            proposal.resolution = resolution
        }
    }
}

const consumerAddMeHandler = (peerMessage) => {
    let directory = localCache.getKey('directory')
    if ((directory !== undefined) && (!directory.includes(peerMessage.address))) {
        directory.push(peerMessage.address)
        localCache.setKey('directory', directory)
        localCache.save()
    }
    logger.info('add me discovered for: ' + peerMessage.address)
}

const negotiationMessageProcessor = async (peerMessage, keys) => {
    /* If you have not processed the message
    and it is from the other party (your key !== message key)
    and you are either the maker or taker
    */
    let processedPeerMessage = undefined
    if (!messageSeen(peerMessage.uuid) &&
        ((JSON.stringify(keys.publicKey) !== JSON.stringify(peerMessage.publicKey)) &&
            (peerMessage.makerId === consumerId || peerMessage.takerId === consumerId))) {
        processedPeerMessage = await decryptMessage(peerMessage, keys.privateKey)
        if (await !verifyMessage(peerMessage)) {
            throw new Error("Couldn't verify message signature")
        }
    }
    return processedPeerMessage
}

const consumerCounterOfferHandler = async (peerMessage, proposals, keys) => {
    try {
        let counterOfferMessage = await negotiationMessageProcessor(peerMessage, keys)
        if (!counterOfferMessage) {
            return
        }
        let proposal = proposals.get(counterOfferMessage.body.requestId)
        if (!proposal) {
            logger.warn("Unable to locate original proposal for inbound counter offer")
            return
        }
        proposal.counterOffers.push(counterOfferMessage)
    } catch (e) {
        logger.warn("unable to process inbound counter offer: " + e)
    }
}

const consumerAcceptHandler = async (peerMessage, proposals, keys) => {
    try {
        let acceptMessage = await negotiationMessageProcessor(peerMessage, keys)
        if (!acceptMessage) {
            return
        }
        let proposal = proposals.get(acceptMessage.body.requestId)
        if (!proposal) {
            logger.warn("Unable to locate original proposal for inbound acceptance")
            return
        }
        proposal.acceptances.push(acceptMessage)
    } catch (e) {
        logger.warn("unable to process inbound acceptance: " + e)
    }
}

const consumerRejectHandler = async (peerMessage, proposals, keys) => {
    try {
        let rejectMessage = await negotiationMessageProcessor(peerMessage, keys)
        if (!rejectMessage) {
            return
        }
        let proposal = proposals.get(rejectMessage.body.requestId)
        if (!proposal) {
            logger.warn("Unable to locate original proposal for inbound rejection")
            return
        }
        proposal.rejections.push(rejectMessage)
    } catch (e) {
        logger.warn("unable to process inbound rejection: " + e)
    }
}

module.exports = { consumerAddMeHandler, consumerCounterOfferHandler, consumerProposalHandler, consumerAcceptHandler, consumerRejectHandler, consumerProposalResolvedHandler}