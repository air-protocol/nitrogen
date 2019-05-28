const localCache = require('./cache')
const { serverSocket, server } = require('./server')

const hostConfiguration = require('./config/config')

const connectToPeers = require('./peer')
const { addMeHandler, counterOfferHandler, pingHandler, proposalHandler, rejectHandler } = require('./message')

if (hostConfiguration.refreshDirectory) {
    localCache.setKey('directory', hostConfiguration.bootNodes)
    localCache.save()
}

connectToPeers().then(() => { console.log('peers connected') }).catch((e) => {
    if (!hostConfiguration.bootNode) {
        console.log('Unable to locate a directory of peer nodes: ' + e)
        server.close()
    }
})

server.listen(hostConfiguration.port, hostConfiguration.address, () => {
    console.log('listen address: ' + server.address().address + ':' + server.address().port)
    serverSocket.sockets.on('connect', (socket) => {
        console.log('connection made')

        //Add message handlers
        socket.on('directory', (message) => {
            let directory = localCache.getKey('directory')
            console.log('sending directory: ' + directory)
            socket.emit('directoryCast', directory)
        })

        socket.on('testPing', pingHandler)
        socket.on('proposal', proposalHandler)
        socket.on('counterOffer', counterOfferHandler)
        socket.on('reject', rejectHandler)
        socket.on('addMe', (message) => {
            if (addMeHandler(message)) {
                connectToPeers()
            }
        })
    })
})