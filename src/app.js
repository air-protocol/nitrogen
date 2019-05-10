const localCache = require('./cache')
const clientio = require('socket.io-client')
const { serverSocket, server } = require('./server')

const hostConfiguration = require('./config/config')
const thisAddress = hostConfiguration.address + ':' + hostConfiguration.port

const connectToPeers = require('./peer')
const { addMeHandler, pongHandler } = require('./message')

if(hostConfiguration.refreshDirectory) {
    localCache.removeKey('directory')
    localCache.save()
}

connectToPeers(clientio, hostConfiguration.bootNodes.filter(address => address !== thisAddress)).then(() => { console.log('peers connected') }).catch((e) => {
    if (!hostConfiguration.bootNode) {
        console.log('Unable to locate a directory of peer nodes: ' + e)
        server.close()
    }
})

server.listen(hostConfiguration.port, hostConfiguration.address, () => {

    console.log('listening: ' + hostConfiguration.port)
    console.log('listen address: ' + server.address().address + ':' + server.address().port)
    serverSocket.sockets.on('connect', (socket) => {
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

        socket.on('testPing', pongHandler)
        socket.on('addMe', addMeHandler)
    })
})