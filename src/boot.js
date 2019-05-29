const logger = require('./logging')

const getDirectoryFromBootNode = (clientio, hostAddress) => {
    let promise = new Promise((resolve, reject) => {
        let hostPath = 'http://' + hostAddress
        let outboundSocket = clientio.connect(hostPath, { forcenew: true, reconnection: false, timeout: 5000 })
        logger.info('attempt to connect to: ' + hostPath)
        outboundSocket.on('connect', (socket) => {
            logger.silly('requesting directory')
            outboundSocket.emit('directory')
        })

        outboundSocket.on('directoryCast', (hostDirectory) => {
            logger.silly('directory received: ' + hostDirectory)
            outboundSocket.close()
            resolve(hostDirectory)
        })

        outboundSocket.on('connect_error', (error) => {
            reject('unable to connect: ' + error)
        })
    })
    return promise
}

const getDirectoryFromBootNodes = async (clientio, bootNodes) => {
    for (let i = 0; i < bootNodes.length; i++) {
        try {
            directory = await getDirectoryFromBootNode(clientio, bootNodes[i])
        } catch (e) {
            logger.error('Error connecting to boot nodes: ' + e)
        }
        if (directory !== undefined) {
            break;
        }
    }
    return directory
}

module.exports = getDirectoryFromBootNodes