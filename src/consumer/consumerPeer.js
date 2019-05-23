const { createKeys, encryptMessage, signMessage } = require('../encrypt')
const uuid = require('uuid')
const localCache = require('../cache')
const hostConfiguration = require('../config/config')
const getDirectoryFromBootNodes = require('../boot')
const { consumerAddMeHandler, counterOfferHandler, consumerProposalHandler } = require('./consumerMessageHandler')

const key = createKeys()
const Ajv = require('ajv')

const ajv = new Ajv({ allErrors: true })

let peers = []
let proposals = new Map()

if (hostConfiguration.refreshDirectory) {
    localCache.removeKey('directory')
    localCache.save()
}

const buildAndSendMessage = async (messageType, body, schema, recipientPublicKey) => {
    let message = { uuid: uuid(), publicKey: key.publicKey, body: body, makerId: body.makerId }
    if (!schema || ajv.validate(schema, message.body)) {
        message = await signMessage(message, key)
        if (recipientPublicKey) {
            message = await encryptMessage(message, recipientPublicKey)
        }
        peers.forEach(peer => {
            peer.emit(messageType, message)
        })
    }
    else {
        console.log("Invalid input ")
        console.log(ajv.errorsText())
    }
}

const consumerConnectToPeer = (clientio, peerAddress) => {
    let promise = new Promise((resolve, reject) => {
        let peerSocket = clientio.connect('http://' + peerAddress, { forcenew: true, reconnection: false, timeout: 5000 })
        peerSocket.on('connect', (socket) => {
            resolve(peerSocket)
            peerSocket.on('addMe', consumerAddMeHandler)
            peerSocket.on('counterOffer', counterOfferHandler)
            peerSocket.on('proposal', (proposal) => {
                consumerProposalHandler(proposal, proposals)
            })
        })
        peerSocket.on('connect_error', (error) => {
            reject('unable to connect to peer: ' + error)
        })
        peerSocket.on('disconnect', (socket) => {
            console.log('disconnected: ' + peerAddress)
        })
    })
    return promise
}

const consumerConnectToPeers = async (clientio, bootNodes) => {

    let directory = localCache.getKey('directory')
    if (!directory) {
        directory = await getDirectoryFromBootNodes(clientio, bootNodes)
    }

    if (!directory) {
        throw ('directory is unavailable')
    } else {
        localCache.setKey('directory', directory)
        localCache.save()
    }

    let peerDirectory = directory

    while (peerDirectory.length && (peers.length < hostConfiguration.outboundCount)) {
        let peerIndex = Math.floor(Math.random() * peerDirectory.length)
        try {
            let peer = await consumerConnectToPeer(clientio, peerDirectory[peerIndex])
            peers.push(peer)
        } catch (e) {
            console.log('error connecting to peer: ' + e)
        }
        peerDirectory = peerDirectory.filter(address => address !== peerDirectory[peerIndex])
    }
}

module.exports = { buildAndSendMessage, consumerConnectToPeers, proposals }