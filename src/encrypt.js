const crypto = require('crypto')
const eccrypto = require('eccrypto')

const createKeys = () => {
    let privateKey = eccrypto.generatePrivate()
    let publicKey = eccrypto.getPublic(privateKey)
    return { publicKey, privateKey }
}

const signMessage = async (message, keys) => {
    let hashed = crypto.createHash('sha256').update(message.body).digest()
    message.publicKey = keys.publicKey
    message.signature = await eccrypto.sign(keys.privateKey, hashed)
    return message
}

const encryptMessage = async (message, recipientPublicKey) => {
    message.body = await eccrypto.encrypt(recipientPublicKey, Buffer.from(message.body))
    return message
}

const decryptMessage = async (message, keys) => {
    message.body = await eccrypto.decrypt(keys.privateKey, message.body)
    return message
}

const verifyMessage = async (message) => {
    let hashed = crypto.createHash('sha256').update(message.body).digest()
    try {
        await eccrypto.verify(message.publicKey, hashed, message.signature)
        return true
    } catch (e) {
        return false
    }
}

module.exports = { createKeys, signMessage, verifyMessage }