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

module.exports = getDirectoryFromBootNodes