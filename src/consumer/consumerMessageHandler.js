const localCache = require('../cache')
const hostConfiguration = require('../config/config')
const { decryptMessage, verifyMessage } = require('../encrypt')
const logger = require('../logging')

const consumerId = hostConfiguration.consumerId
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
        proposal.fulfillments = []
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

const proposalResolvedWithAcceptance = (proposal) => {
    if (!(proposal && proposal.resolution)) {
        return false
    }
    let acceptance = undefined
    for (i = 0; i < proposal.acceptances.length; i++) {
        if (proposal.acceptances[i].takerId === proposal.resolution.takerId) {
            acceptance = proposal.acceptances[i]
        }
    }
    if (!acceptance) {
        return false
    }
    return true
}

const consumerFulfillmentHandler = async (peerMessage, proposals, keys) => {
    try {
        let fulfillmentMessage = await negotiationMessageProcessor(peerMessage, keys)
        if (!fulfillmentMessage) {
            return
        }
        let proposal = proposals.get(fulfillmentMessage.body.requestId)

        if (!proposalResolvedWithAcceptance(proposal)) {
            logger.warn("unable to locate proposal that resolved with acceptance for inbound fulfillment")
            return
        }
        proposal.fulfillments.push(fulfillmentMessage)
    } catch (e) {
        logger.warn("unable to process inbound fulfillment: " + e)
    }
}

const consumerSettlementInitiatedHandler = async (peerMessage, proposals, keys) => {
    try {
        let settlementInitiatedMessage = await negotiationMessageProcessor(peerMessage, keys)
        let proposal = proposals.get(settlementInitiatedMessage.body.requestId)
        if (!settlementInitiatedMessage) {
            return
        }
        if (!proposalResolvedWithAcceptance(proposal)) {
            logger.warn("unable to locate proposal that resolved with acceptance for inbound settlementInitiated")
            return
        }
        proposal.settlementInitiated = settlementInitiatedMessage
    } catch (e) {
        logger.warn("unable to process inbound settlementInitiated: " + e)
    }
}

module.exports = { consumerAddMeHandler, consumerCounterOfferHandler, consumerProposalHandler, consumerAcceptHandler, consumerProposalResolvedHandler, consumerFulfillmentHandler }