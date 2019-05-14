jest.mock('../src/cache')
jest.mock('socket.io-client')
jest.mock('../src/config/config')
jest.mock('../src/boot')

let localCache = require('../src/cache')
const clientio = require('socket.io-client')
const hostConfiguration = require('../src/config/config')
const getDirectoryFromBootNodes = require('../src/boot')
const connectToPeers = require('../src/peer')

const bootNodes = ['5.5.5.5']
const uuid = 'uuid'

test('connectToPeers makes outbound count connections from the peer directory', async () => {
    //Assemble
    hostConfiguration.outboundCount = 2
    localCache.getKey = jest.fn(key => ['1.2.3.4:4000', '2.3.4.5:5000', '3.4.5.6:6000'])

    let PeerSocket = function () {
        this.on = jest.fn(function (name, callback) {
            if (name === 'connect') {
                callback()
            }
        })
        this.emit = () => { }
    }

    clientio.connect = jest.fn((address, options) => {
        let peerSocket = new PeerSocket()
        return peerSocket
    })

    //Action
    await connectToPeers(bootNodes)

    //Assert
    expect(localCache.getKey).toBeCalled()
    expect(localCache.getKey.mock.calls[0][0]).toEqual('directory')
    expect(clientio.connect.mock.calls.length).toBe(2)
})

test('connectToPeers skips over failed connections', async () => {
    //Assemble
    let connectedCount = 0
    let failedCount = 0
    hostConfiguration.outboundCount = 2
    localCache.getKey = jest.fn(key => ['1.2.3.4:4000', '2.3.4.5:5000', '3.4.5.6:6000', '6.7.8.9:7000', '8.9.10.11:8000'])

    let PeerSocket = function () {
        this.on = jest.fn(function (name, callback) {
            if (name === 'connect') {
                connectedCount++
                callback()
            }
        })
        this.emit = () => { }
    }

    let BadSocket = function () {
        this.on = jest.fn(function (name, callback) {
            if (name === 'connect_error') {
                failedCount++
                callback('simulated failure')
            }
        })
        this.emit = () => { }
    }

    clientio.peers = []

    clientio.connect = jest.fn((address, options) => {
        return new PeerSocket()
    })
        .mockImplementationOnce((addres, options) => { return new BadSocket() })
        .mockImplementationOnce((addres, options) => { return new BadSocket() })

    //Action
    await connectToPeers(bootNodes)

    //Assert
    expect(localCache.getKey).toBeCalled()
    expect(localCache.getKey.mock.calls[0][0]).toEqual('directory')
    expect(connectedCount).toBe(hostConfiguration.outboundCount)
    expect(failedCount).toBe(2)
    expect(clientio.connect.mock.calls.length).toBe(4)
})

test('connectToPeers gets a directory from boot nodes when local cache is unavailable', async () => {
    //Assemble
    hostConfiguration.outboundCount = 2;
    localCache.getKey = jest.fn(key => undefined);
    getDirectoryFromBootNodes.mockImplementation((clientio, bootNodes) => {
        return new Promise((resolve, reject) => {
            resolve(['1.2.1.2:4000', '2.3.2.3:5000', '3.4.3.4:5000', '5.6.5.6:6000'])
        })
    })

    let PeerSocket = function () {
        this.on = jest.fn(function (name, callback) {
            if (name === 'connect') {
                callback()
            }
        })
        this.emit = () => { }
    }

    clientio.peers = []

    clientio.connect = jest.fn((address, options) => {
        let peerSocket = new PeerSocket()
        return peerSocket
    })

    //Action
    await connectToPeers(bootNodes)

    //Assert
    expect(localCache.getKey).toBeCalled()
    expect(localCache.getKey.mock.calls[0][0]).toEqual('directory')
    expect(getDirectoryFromBootNodes).toBeCalled()
    expect(clientio.connect.mock.calls.length).toBe(2)
})
