const express = require('express')
const http = require('http')
const serverio = require('socket.io')
const clientio = require('socket.io-client')
const path = require('path')
const flatCache = require('flat-cache')

const app = express()
const server = http.createServer(app)
const serverSocket = serverio(server)

const hostConfiguration = require('./config/config')
const localCache = flatCache.load('localCache')

const thisAddress = hostConfiguration.address + ':' + hostConfiguration.port

const getDirectoryFromBootNode = (clientio, hostAddress) => {
    let promise = new Promise((resolve, reject) => {
        let outboundSocket = clientio.connect(path.join('http://', hostAddress), { forcenew: true })
        outboundSocket.on('connection', (socket) => {
            socket.emit('directory')
        })

        outboundSocket.on('connect_error', (error) => {
            reject('unable to connect')
        })

        outboundSocket.on('directoryCast', (hostDirectory) => {
            outboundSocket.close()
            resolve(hostDirectory)
        })
        setTimeout(() => {
            reject('boot node timeout')
        }, 5000)
    })
    return promise
}

const getDirectoryFromBootNodes = async (clientio, bootNodes) => {
    for (let i = 0; i < bootNodes.length; i++) {
        try {
            directory = await getDirectoryFromBootNode(clientio, bootNodes[i])
        } catch (e) {
            console.log(e)
        }
        if (directory !== undefined) {
            break;
        }
    }
    return directory
}

const connectToPeer = (clientio, peerAddress) => {
    let promise = new Promise((resolve, reject) => {
        let peerSocket = clientio.connect(path.join('http://', peerAddress), { forcenew: true })
        peerSocket.on('connection', (socket) => {
            resolve(peerSocket)
            //add message handlers
        })
        peerSocket.on('connect_error', (error) => {
            reject('unable to connect to peer')
        })
        setTimeout(() => {
            reject('peer timeout')
        }, 5000)
    })
    return promise
}

const connectToPeers = async (clientio, bootNodes) => {
    let peers = []

    let directory = localCache.getKey('directory')
    if (directory === undefined) {
        directory = await getDirectoryFromBootNodes(clientio, bootNodes)
    }

    if (directory === undefined) {
        reject('directory is unavailable')
    } else {
        localCache.setKey('directory', directory)
        localCache.save()
    }

    let peerDirectory = directory.filter((address) => { address !== thisAddress })

    while (peers.length < hostConfiguration.outboundCount) {
        let peerIndex = Math.floor(Math.random() * peerDirectory.length) + 1
        try {
            let peer = await connectToPeer(clientio, peerDirectory[peerIndex])
            peers.push(peer)
        } catch (e) {
            //noop
        }
    }
}

connectToPeers(clientio, hostConfiguration.bootNodes).then(() => { console.log('peers connected') }).catch((e) => {
    if (!hostConfiguration.bootNode) {
        console.log('Unable to locate a directory of peer nodes')
        server.close()
    }
})

server.listen(hostConfiguration.port, hostConfiguration.address, () => {

    server.on('connection', (socket) => {
        let peerAddress = socket.address().address + ':' + socket.address().port
        if (!directory.includes(peerAddress)) {
            directory.push(peerAddress)
            flatCache.setKey('directory', directory)
        }

        //Add message handlers
        socket.on('directory', (message) => {
            socket.emit('directoryCast', directory)
        })
    })

})