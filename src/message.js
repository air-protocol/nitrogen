const localCache = require('./cache')
const hostConfiguration = require('./config/config')
const thisAddress = hostConfiguration.address + ':' + hostConfiguration.port
const logger = require('./logging')

const timeStamp = new Date()
timeStamp.toISOString()

let messageUUIDs = []

const serverSocket = require('./server').serverSocket

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

const pingHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard ping: ' + peerMessage.body + ' uuid: ' + peerMessage.uuid + ` on ${timeStamp}`)
        serverSocket.emit('testPing', peerMessage)
        return true
    }
    return false
}

const proposalHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard proposal uuid: ' + peerMessage.uuid + ` on ${timeStamp}`)
        logger.info('heard proposal hash: ' + peerMessage.hash)
        serverSocket.emit('proposal', peerMessage)
        return true
    }
    return false
}

const proposalResolvedHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard proposal resolved: ' + peerMessage.uuid + ` on ${timeStamp}`)
        logger.info('heard proposal resolved hash: ' + peerMessage.hash)
        serverSocket.emit('resolved', peerMessage)
        return true
    }
    return false
}

const counterOfferHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard counterOffer uuid: ' + peerMessage.uuid + ` on ${timeStamp}`)
        logger.info('heard counterOffer hash: ' + peerMessage.hash)
        serverSocket.emit('counterOffer', peerMessage)
        return true
    }
    return false
}

const acceptHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard acceptance uuid: ' + peerMessage.uuid + ` on ${timeStamp}`)
        logger.info('heard acceptance hash: ' + peerMessage.hash)
        serverSocket.emit('accept', peerMessage)
        return true
    }
    return false
}

const fulfillmentHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard fulfillment uuid: ' + peerMessage.uuid + ` on ${timeStamp}`)
        logger.info('heard fulfillment hash: ' + peerMessage.hash)
        serverSocket.emit('fulfillment', peerMessage)
        return true
    }
    return false
}

const informHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard inform uuid: ' + peerMessage.uuid + ` on ${timeStamp}`)
        logger.info('heard inform hash: ' + peerMessage.hash)
        serverSocket.emit('inform', peerMessage)
        return true
    }
    return false
}


const settlementInitiatedHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard settlementInitiated uuid: ' + peerMessage.uuid + ` on ${timeStamp}`)
        logger.info('heard settlementInitiated hash: ' + peerMessage.hash)
        serverSocket.emit('settlementInitiated', peerMessage)
        return true
    }
    return false
}

const signatureRequiredHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard signatureRequired uuid: ' + peerMessage.uuid + ` on ${timeStamp}`)
        logger.info('heard signatureRequired hash: ' + peerMessage.hash)
        serverSocket.emit('signatureRequired', peerMessage)
        return true
    }
    return false
}

const disbursedHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard disbursed uuid: ' + peerMessage.uuid + ` on ${timeStamp}`)
        logger.info('heard disbursed hash: ' + peerMessage.hash)
        serverSocket.emit('disbursed', peerMessage)
        return true
    }
    return false
}

const adjudicationHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard adjudication uuid: ' + peerMessage.uuid + ` on ${timeStamp}`)
        logger.info('heard adjudication hash: ' + peerMessage.hash)
        serverSocket.emit('adjudicate', peerMessage)
        return true
    }
    return false
}

const rulingHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard ruling uuid: ' + peerMessage.uuid + ` on ${timeStamp}`)
        logger.info('heard ruling hash: ' + peerMessage.hash)
        serverSocket.emit('ruling', peerMessage)
        return true
    }
    return false
}

const addMeHandler = (peerMessage) => {
    if (peerMessage.address === thisAddress) {
        return false
    }
    if (!messageSeen(peerMessage.uuid)
        && ((!hostConfiguration.addMeTTLBound) || (peerMessage.addMeTTL <= hostConfiguration.addMeTTLBound))
        && peerMessage.addMeTTL--) {
        serverSocket.emit('addMe', peerMessage)
        let directory = localCache.getKey('directory')
        if ((directory !== undefined) && (!directory.includes(peerMessage.address))) {
            logger.info('adding ' + peerMessage.address + ` on ${timeStamp}`)
            directory.push(peerMessage.address)
            localCache.setKey('directory', directory)
            localCache.save()
        }
        return true
    }
    return false
}

module.exports = { addMeHandler, adjudicationHandler, counterOfferHandler, pingHandler, proposalHandler, acceptHandler, proposalResolvedHandler, fulfillmentHandler, settlementInitiatedHandler, signatureRequiredHandler, rulingHandler, disbursedHandler, informHandler }
