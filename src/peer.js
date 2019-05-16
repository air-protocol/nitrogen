const uuid = require('uuid')
const localCache = require('./cache')
const { addMeHandler, pingHandler } = require('./message')
const getDirectoryFromBootNodes = require('./boot')
const hostConfiguration = require('./config/config')
const thisAddress = hostConfiguration.address + ':' + hostConfiguration.port
const clientio = require('socket.io-client')
clientio.peers = []

const serverSocket = require('./server').serverSocket

const connectToPeer = (peerAddress, addMeUUID) => {
    console.log('attempting to connect to: ' + peerAddress)
    let promise = new Promise((resolve, reject) => {
        let peerSocket = clientio.connect('http://' + peerAddress, { forcenew: true, reconnection: false, timeout: 5000})
        peerSocket.on('connect', (socket) => {
            console.log('connected to ' + peerAddress)
            peerSocket.emit('addMe', { 'address': thisAddress, 'addMeTTL': hostConfiguration.addMeTTL, 'uuid': addMeUUID })
            peerSocket.on('addMe', (message) => {
                if (addMeHandler(message)) {
                    connectToPeers()
                }
            })
            peerSocket.on('testPing', pingHandler)
            peerSocket.peerAddress = peerAddress
            resolve(peerSocket)
        })
        peerSocket.on('connect_error', (error) => {
            reject('unable to connect to peer: ' + error)
        })
        peerSocket.on('disconnect', (socket) => {
            clientio.peers = clientio.peers.filter((peer) => { return peer !== peerSocket })
            connectToPeers()
        })
    })
    return promise
}

const connectToPeers = async () => {
    if (clientio.peers.length === hostConfiguration.outboundCount) {
        return
    }
    let addMeUUID = uuid()

    let directory = localCache.getKey('directory')
    if (!directory) {
        directory = await getDirectoryFromBootNodes(clientio, hostConfiguration.bootNodes.filter(address => address !== thisAddress))
    }

    if (!directory) {
        throw ('directory is unavailable')
    } else {
        localCache.setKey('directory', directory)
        localCache.save()
    }

    let peerDirectory = directory.filter(address => address !== thisAddress)

    //filter out the addresses of peers that are already connected
    clientio.peers.forEach((peer) => {
        peerDirectory = peerDirectory.filter(address => address !== peer.peerAddress)
    })

    while (peerDirectory.length && (clientio.peers.length < hostConfiguration.outboundCount)) {
        let peerIndex = Math.floor(Math.random() * peerDirectory.length)
        try {
            let peer = await connectToPeer(peerDirectory[peerIndex], addMeUUID)
            clientio.peers.push(peer)
        } catch (e) {
            //console.log('error connecting to peer: ' + e)
        }
        peerDirectory = peerDirectory.filter(address => address !== peerDirectory[peerIndex])
    }
}
module.exports = connectToPeers