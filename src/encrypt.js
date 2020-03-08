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
    let signatureHash = await eccrypto.sign(keys.privateKey, hashed)
    message.signature = signatureHash.toString('hex')
    return message
}

const encryptMessage = async (message, recipientKey) => {
    message.body = await eccrypto.encrypt(Buffer.from(recipientKey, 'hex'), Buffer.from(JSON.stringify(message.body)))
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
        await eccrypto.verify(Buffer.from(message.publicKey, 'hex'), hashed, Buffer.from(message.signature, 'hex'))
        return true
    } catch (e) {
        return false
    }
}

const verifyHash = (message) => {
    let hashed = crypto.createHash('sha256').update(JSON.stringify(message.body)).digest()
    return message.hash === hashed.toString('hex')
}

const randomHash = () =>{
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    return crypto.createHash('sha1').update(current_date + random).digest('hex').toString('hex');
}

module.exports = { createKeys, decryptMessage, encryptMessage, signMessage, verifyMessage, verifyHash, randomHash }
