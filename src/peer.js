const uuid = require('uuid')
const localCache = require('./cache')
const { addMeHandler } = require('./message')
const getDirectoryFromBootNodes = require('./boot')
const hostConfiguration = require('./config/config')
const thisAddress = hostConfiguration.address + ':' + hostConfiguration.port

const connectToPeer = (clientio, peerAddress, addMeUUID) => {
    let promise = new Promise((resolve, reject) => {
        let peerSocket = clientio.connect('http://' + peerAddress, { forcenew: true })
        peerSocket.on('connect', (socket) => {
            console.log('sending addme message')
            peerSocket.emit('addMe', { 'address': thisAddress, 'addMeTTL': hostConfiguration.addMeTTL, 'uuid': addMeUUID })
            resolve(peerSocket)
        })
        peerSocket.on('connect_error', (error) => {
            reject('unable to connect to peer: ' + error)
        })
        peerSocket.on('disconnect', (socket) => {
            //TODO make a story for replacing peers
            console.log('disconnected: ' + peerAddress)
        })
        peerSocket.on('addMe', addMeHandler)
        setTimeout(() => {
            reject('peer timeout')
        }, 5000)
    })
    return promise
}

const connectToPeers = async (clientio, bootNodes) => {
    let peers = []
    let addMeUUID = uuid()

    let directory = localCache.getKey('directory')
    if (!directory) {
        directory = await getDirectoryFromBootNodes(clientio, bootNodes)
    }

    if (!directory) {
        reject('directory is unavailable')
    } else {
        localCache.setKey('directory', directory)
        localCache.save()
    }

    let peerDirectory = directory.filter(address => address !== thisAddress)

    while (peerDirectory.length && (peers.length < hostConfiguration.outboundCount)) {
        let peerIndex = Math.floor(Math.random() * peerDirectory.length)
        try {
            let peer = await connectToPeer(clientio, peerDirectory[peerIndex], addMeUUID)
            peers.push(peer)
        } catch (e) {
            console.log('error connecting to peer: ' + e)
        }
        peerDirectory = peerDirectory.filter(address => address !== peerDirectory[peerIndex])
    }
}

module.exports = connectToPeers
