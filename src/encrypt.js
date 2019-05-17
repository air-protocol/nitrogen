const curve = require('elliptic').ec

const ec = new curve('secp256k1')

String.prototype.getBytes = function () {
    let bytes = []
    for (let i = 0; i < this.length; i++) {
      bytes.push(this.charCodeAt(i))
    }
    return bytes
  }

const createKeys = () => {
    return ec.genKeyPair()
}

const signMessage = (message, key) => {
    message.signature = key.sign(message.body.getBytes).toDER()
    message.publicKey = key.getPublic().encode('hex')
    return message
}

const verifyMessage = (message) => {
    let recepientKey = ec.keyFromPublic(message.publicKey, 'hex')
    return recepientKey.verify(message.body.getBytes(), message.signature)
}

module.exports = {createKeys, signMessage, verifyMessage}