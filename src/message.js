const localCache = require('./cache')
const hostConfiguration = require('./config/config')
const { decryptMessage } = require('./encrypt')
const thisAddress = hostConfiguration.address + ':' + hostConfiguration.port

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
        console.log('heard ping: ' + peerMessage.body + ' uuid: ' + peerMessage.uuid)
        serverSocket.emit('testPing', peerMessage)
        return true
    }
    return false
}

const proposalHandler = (peerMessage) => {

    if (!messageSeen(peerMessage.uuid)) {
        console.log('heard proposal: ' + JSON.stringify(peerMessage.body) + ' uuid: ' + peerMessage.uuid)
        serverSocket.emit('proposal', peerMessage)
        return true
    }
    return false
}

const counterOfferHandler = (peerMessage) => {

    if (!messageSeen(peerMessage.uuid)) {
        console.log('heard counterOffer: ' + JSON.stringify(peerMessage.body) + ' uuid: ' + peerMessage.uuid)
        serverSocket.emit('counterOffer', peerMessage)
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
            console.log('adding ' + peerMessage.address)
            directory.push(peerMessage.address)
            localCache.setKey('directory', directory)
            localCache.save()
        }
        return true
    }
    return false
}

module.exports = { addMeHandler, counterOfferHandler, pingHandler, proposalHandler }