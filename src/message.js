const localCache = require('./cache')
const hostConfiguration = require('./config/config')
const thisAddress = hostConfiguration.address + ':' + hostConfiguration.port
const logger = require('./logging')

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
        logger.info('heard ping: ' + peerMessage.body + ' uuid: ' + peerMessage.uuid)
        serverSocket.emit('testPing', peerMessage)
        return true
    }
    return false
}

const proposalHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard proposal uuid: ' + peerMessage.uuid)
        serverSocket.emit('proposal', peerMessage)
        return true
    }
    return false
}

const proposalResolvedHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard proposal resolved: ' + peerMessage.uuid)
        serverSocket.emit('resolved', peerMessage)
        return true
    }
    return false 
}

const counterOfferHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard counterOffer uuid: ' + peerMessage.uuid)
        serverSocket.emit('counterOffer', peerMessage)
        return true
    }
    return false
}

const acceptHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard acceptance uuid: ' + peerMessage.uuid)
        serverSocket.emit('accept', peerMessage)
        return true
    }
    return false
}

const rejectHandler = (peerMessage) => {
    if (!messageSeen(peerMessage.uuid)) {
        logger.info('heard rejection uuid: ' + peerMessage.uuid)
        serverSocket.emit('reject', peerMessage)
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
            logger.info('adding ' + peerMessage.address)
            directory.push(peerMessage.address)
            localCache.setKey('directory', directory)
            localCache.save()
        }
        return true
    }
    return false
}

module.exports = { addMeHandler, counterOfferHandler, pingHandler, proposalHandler, acceptHandler, rejectHandler, proposalResolvedHandler }