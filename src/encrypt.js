const crypto = require('crypto')
const eccrypto = require('eccrypto')

const createKeys = () => {
    let privateKey = eccrypto.generatePrivate()
    let publicKey = eccrypto.getPublic(privateKey)
    return { publicKey, privateKey }
}

const signMessage = async (message, keys) => {
    let hashed = crypto.createHash('sha256').update(JSON.stringify(message.body)).digest()
    message.hash = hashed.toString('hex')
    message.signature = await eccrypto.sign(keys.privateKey, hashed).toString('hex')
    return message
}

const encryptMessage = async (message, recipientKey) => {
    message.body = await eccrypto.encrypt(recipientKey, Buffer.from(JSON.stringify(message.body)))
    return message
}

const decryptMessage = async (message, privateKey) => {
    let decryptedBody = await eccrypto.decrypt(privateKey, message.body)
    message.body = JSON.parse(decryptedBody)
    return message
}

const verifyMessage = async (message) => {
    let hashed = crypto.createHash('sha256').update(JSON.stringify(message.body)).digest()
    try {
        await eccrypto.verify(Buffer.from(message.publicKey, 'hex'), hashed, message.signature)
        return true
    } catch (e) {
        return false
    }
}

module.exports = { createKeys, decryptMessage, encryptMessage, signMessage, verifyMessage }