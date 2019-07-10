const localCache = require('./cache')
const { serverSocket, server } = require('./server')

const hostConfiguration = require('./config/config')

const connectToPeers = require('./peer')
const logger = require('./logging')
const { addMeHandler,
    counterOfferHandler,
    pingHandler,
    proposalHandler,
    acceptHandler,
    proposalResolvedHandler,
    fulfillmentHandler,
    settlementInitiatedHandler } = require('./message')

if (hostConfiguration.refreshDirectory) {
    localCache.setKey('directory', hostConfiguration.bootNodes)
    localCache.save()
}

connectToPeers().then(() => { logger.info('peers connected') }).catch((e) => {
    if (!hostConfiguration.bootNode) {
        logger.error('Unable to locate a directory of peer nodes: ' + e)
        server.close()
        process.exit()
    }
})

server.listen(hostConfiguration.port, hostConfiguration.address, () => {
    logger.info('listen address: ' + server.address().address + ':' + server.address().port)
    serverSocket.sockets.on('connect', (socket) => {
        logger.silly('inbound connection made')

        //Add message handlers
        socket.on('directory', (message) => {
            let directory = localCache.getKey('directory')
            logger.silly('sending directory: ' + directory)
            socket.emit('directoryCast', directory)
        })

        socket.on('testPing', pingHandler)
        socket.on('proposal', proposalHandler)
        socket.on('counterOffer', counterOfferHandler)
        socket.on('accept', acceptHandler)
        socket.on('resolved', proposalResolvedHandler)
        socket.on('fulfillment', fulfillmentHandler)
        socket.on('settlementInitiated', settlementInitiatedHandler)
        socket.on('addMe', (message) => {
            if (addMeHandler(message)) {
                connectToPeers()
            }
        })
    })
})