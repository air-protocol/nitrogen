const uuid = require('uuid')
const localCache = require('../cache')
const hostConfiguration = require('../config/config')
const getDirectoryFromBootNodes = require('../boot')
const { consumerAddMeHandler, consumerCounterOfferHandler, consumerProposalHandler } = require('./consumerMessageHandler')

const Ajv = require('ajv')
const ajv = new Ajv({ allErrors: true })

let peers = []
let proposals = new Map()

if (hostConfiguration.refreshDirectory) {
    localCache.removeKey('directory')
    localCache.save()
}

const buildMessage = (body, key, schema) => {
    let message = { uuid: uuid(), publicKey: key.publicKey, body: body, makerId: body.makerId, takerId: body.takerId }
    if (schema) {
        ajv.validate(schema, message.body)
    }
    return message
}

const sendMessage = (messageType, message) => {
    peers.forEach(peer => {
        peer.emit(messageType, message)
    })
}

const consumerConnectToPeer = (clientio, peerAddress, keys) => {
    let promise = new Promise((resolve, reject) => {
        let peerSocket = clientio.connect('http://' + peerAddress, { forcenew: true, reconnection: false, timeout: 5000 })
        peerSocket.on('connect', (socket) => {
            resolve(peerSocket)
            peerSocket.on('addMe', consumerAddMeHandler)
            peerSocket.on('counterOffer', (counterOffer) => {
                consumerCounterOfferHandler(counterOffer, proposals, keys)
            })
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

const consumerConnectToPeers = async (clientio, bootNodes, keys) => {

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
            let peer = await consumerConnectToPeer(clientio, peerDirectory[peerIndex], keys)
            peers.push(peer)
        } catch (e) {
            console.log('error connecting to peer: ' + e)
        }
        peerDirectory = peerDirectory.filter(address => address !== peerDirectory[peerIndex])
    }
}

module.exports = { consumerConnectToPeers, proposals, buildMessage, sendMessage }