const localCache = require('./cache')
const hostConfiguration = require('./config/config')
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

const pongHandler = (peerMessage) => {
    console.log('heard pong: ' + peerMessage.message + ' uuid: ' + peerMessage.uuid)
    if (!messageSeen(peerMessage.uuid)) {
        console.log ('sending pong on')
        serverSocket.emit('testPong', peerMessage)
    }
}

const addMeHandler = (peerMessage) => {
    if (peerMessage.address === thisAddress) {
        return
    }
    if (!messageSeen(peerMessage.uuid) && peerMessage.addMeTTL--) {
        serverSocket.emit('addMe', peerMessage)
        let directory = localCache.getKey('directory')
        if ((directory !== undefined) && (!directory.includes(peerMessage.address))) {
            directory.push(peerMessage.address)
            localCache.setKey('directory', directory)
            localCache.save()
        }
    }
    console.log('add me for: ' + peerMessage.address)
}

module.exports = { addMeHandler, pongHandler }