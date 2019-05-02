const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const socketClient = require('socket.io-client')
const path = require('path')
const flatCache = require('flat-cache')

const app = express()
const server = http.createServer(app)
const serverio = socketio(server)

const hostConfiguration = require('./config/config')

const localCache = flatCache.load('localCache')

const fallBackToBootNode = (socketClient, hostConfiguration) => {
    const bootNodeCount = hostConfiguration.bootNodes.length
    let outboundSockets = []
    let directory
    let failCount = 0

    for (i = 0; i < bootNodeCount; i++) {
        outboundSockets[i] = socketClient.connect(path.join('http://', hostConfiguration.bootNodes[i]))

        outboundSockets[i].on('connection', () => {
            outboundSockets[i].emit('directory')
        })

        outboundSockets[i].on('connect_error', (error) => {
            failCount++
            console.log('error: ' + error)
            if (failCount === bootNodeCount) {
                throw ('Unable to Connect to Boot Nodes')
            }
        })

        outboundSockets[i].on('directoryCast', (hostDirectory) => {
            localCache.setKey('directory', hostDirectory)
            localCache.save()
            if (directory === undefined) {
                directory = hostDirectory
                standUpOutboundConnections(directory)
            }
        })
    }
}

let directory = localCache.getKey('directory')
if (directory === undefined) {
    try {
        fallBackToBootNode(socketClient, hostConfiguration)
    } catch (e) {
        console.log(e)
        server.close()
    }
} else {
    standUpOutboundConnections(directory)
}

server.listen(hostConfiguration.port)