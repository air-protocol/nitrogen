const localCache = require('../cache')
const config = require('../config/config')
const { decryptMessage, verifyMessage } = require('../encrypt')
const logger = require('./clientLogging')
const {messageSeen} = require('./messageTracker')

const consumerProposalHandler = async (proposal, proposals, keys) => {
    //If you have not processed the message
    //and it is from another party (your key !== message key)
    if ((!messageSeen(proposal.uuid)) && (keys.publicKey.toString('hex') !== proposal.publicKey)) {
        if (! await verifyMessage(proposal)) {
            logger.warn("Couldn't verify message signature on inbound proposal")
            return
        }
        if (proposals.get(proposal.body.requestId)) {
             logger.warn('A proposal with that requestId already exists.')
             return
        }
        proposal.counterOffers = []
        proposal.acceptances = []
        proposal.fulfillments = []
        proposals.set(proposal.body.requestId, proposal)
    }
}

const consumerProposalResolvedHandler = async (resolution, proposals) => {
    if (!messageSeen(resolution.uuid)) {
        if (! await verifyMessage(resolution)) {
            logger.warn("Couldn't verify message signature on inbound proposal resolution")
            return
        }
        if ((resolution.body.makerId !== config.consumerId) && (resolution.body.takerId !== config.consumerId)) {
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
    let processedPeerMessage = undefined
    if (!messageSeen(peerMessage.uuid) && (keys.publicKey.toString('hex') === peerMessage.recipientKey)) {
        processedPeerMessage = await decryptMessage(peerMessage, keys.privateKey)
        if (! await verifyMessage(peerMessage)) {
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
        if (!settlementInitiatedMessage) {
            return
        }
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

const consumerFinalDisburseHandler = async (peerMessage, proposals, keys) => {
    try {
        let finalDisbursedMessage = await negotiationMessageProcessor(peerMessage, keys)
        if (!finalDisbursedMessage) {
            return
        }
        let proposal = proposals.get(finalDisbursedMessage.body.requestId)
        if (!proposal) {
            logger.warn("unable to locate proposal for inbound disbursed")
            return
        }
        if (!proposalResolvedWithAcceptance(proposal)) {
            logger.warn("unable to locate proposal that resolved with acceptance for inbound disbursed")
            return
        }
        proposal.disbursed = finalDisbursedMessage
    } catch (e) {
        logger.warn("unable to process inbound disbursed: " + e)
    }
}

const consumerAdjudicationHandler = async (peerMessage, adjudications, keys) => {
    try {
        let adjudicationMessage = await negotiationMessageProcessor(peerMessage, keys)
        if (!adjudicationMessage) {
            return
        }
        if(!adjudications.get(adjudicationMessage.body.requestId)) {
            adjudications.set(adjudicationMessage.body.requestId, [])
        }
        adjudications.get(adjudicationMessage.body.requestId).push(adjudicationMessage)
    } catch (e) {
        logger.warn("unable to process inbound adjudication: " + e)
    }
}

const consumerRulingHandler = async (peerMessage, rulings, keys) => {
    try {
        let rulingMessage = await negotiationMessageProcessor(peerMessage, keys)
        if (!rulingMessage) {
            return
        }
        rulings.set(rulingMessage.body.requestId, rulingMessage)
    } catch (e) {
        logger.warn("unable to process inbound ruling: " + e)
    }
}

const consumerSignatureRequiredHandler = async (peerMessage, proposals, keys) => {
    try {
        let signatureRequiredMessage = await negotiationMessageProcessor(peerMessage, keys)
        if (!signatureRequiredMessage) {
            return
        }
        let proposal = proposals.get(signatureRequiredMessage.body.requestId)
        if (!signatureRequiredMessage) {
            return
        }
        if (!proposalResolvedWithAcceptance(proposal)) {
            logger.warn("unable to locate proposal that resolved with acceptance for inbound signatureRequired")
            return
        }
        proposal.signatureRequired = signatureRequiredMessage
    } catch (e) {
        logger.warn("unable to process inbound signatureRequired: " + e)
    }
}

module.exports = { consumerAddMeHandler, consumerAdjudicationHandler, consumerCounterOfferHandler, consumerProposalHandler, consumerAcceptHandler, consumerProposalResolvedHandler, consumerFulfillmentHandler, consumerSettlementInitiatedHandler, consumerSignatureRequiredHandler, consumerRulingHandler, consumerFinalDisburseHandler }