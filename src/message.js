const localCache = require('./cache')
const hostConfiguration = require('./config/config')
const crypto = require('crypto')
const thisAddress = hostConfiguration.address + ':' + hostConfiguration.port
const {publicKey, sign} = require('./consumer')

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
    const verifier = crypto.createVerify('sha256')
    verifier.update('test')
    const verified = verifier.verify(publicKey, sign, 'base64')
    console.log('Verified: ' + verified)
    if (!messageSeen(peerMessage.uuid)) {
        console.log('heard ping: ' + peerMessage.message + ' uuid: ' + peerMessage.uuid)
        serverSocket.emit('testPing', peerMessage)
        return true
    }
    return false
}

const addMeHandler = (peerMessage) => {
    if (peerMessage.address === thisAddress) {
        return false
    }
    if (!messageSeen(peerMessage.uuid) && peerMessage.addMeTTL--) {
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

module.exports = { addMeHandler, pingHandler }