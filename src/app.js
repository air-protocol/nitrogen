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
        let hostPath = 'http://' + hostAddress
        let outboundSocket = clientio.connect(hostPath, { forcenew: true })
        console.log('attempt to connect to: ' + hostPath)
        outboundSocket.on('connect', (socket) => {
            console.log('requesting directory')
            outboundSocket.emit('directory')

        })

        outboundSocket.on('directoryCast', (hostDirectory) => {
            console.log('directory received: ' + hostDirectory)
            outboundSocket.close()
            resolve(hostDirectory)
        })

        outboundSocket.on('connect_error', (error) => {
            reject('unable to connect: ' + error)
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
            if (bootNodes[i] === thisAddress) {
                continue
            }
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
        let peerSocket = clientio.connect('http://' + peerAddress, { forcenew: true })
        peerSocket.on('connect', (socket) => {
            //add message handlers
            console.log('sending addme message')
            peerSocket.emit('addMe', thisAddress)
            resolve(peerSocket)
        })
        peerSocket.on('connect_error', (error) => {
            reject('unable to connect to peer: ' + error)
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
            let peer = await connectToPeer(clientio, peerDirectory[peerIndex])
            peers.push(peer)
        } catch (e) {
            console.log('error connecting to peer: ' + e)
        }
        peerDirectory = peerDirectory.filter(address => address !== peerDirectory[peerIndex])
    }
}

connectToPeers(clientio, hostConfiguration.bootNodes).then(() => { console.log('peers connected') }).catch((e) => {
    if (!hostConfiguration.bootNode) {
        console.log('Unable to locate a directory of peer nodes: ' + e)
        server.close()
    }
})

server.listen(hostConfiguration.port, hostConfiguration.address, () => {

    console.log('listening: ' + hostConfiguration.port)
    console.log('listen address: ' + server.address().address + ':' + server.address().port)
    serverSocket.sockets.on('connection', (socket) => {
        console.log('connection made')

        //Add message handlers
        socket.on('directory', (message) => {
            let directory = localCache.getKey('directory')
            if (hostConfiguration.bootNode && (!directory)) {
                directory = hostConfiguration.bootNodes
            }
            console.log('sending directory: ' + directory)
            socket.emit('directoryCast', directory)
        })

        socket.on('addMe', (peerAddress) => {
            let directory = localCache.getKey('directory')
            if ((directory !== undefined) && (!directory.includes(peerAddress))) {
                directory.push(peerAddress)
                localCache.setKey('directory', directory)
                localCache.save()
            }
            console.log('discovered peer: ' + peerAddress)
        })
    })
})