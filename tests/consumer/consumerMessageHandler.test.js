jest.mock('../../src/consumer/messageTracker')
jest.mock('../../src/encrypt')
jest.mock('../../src/consumer/clientLogging')

const { messageSeen } = require('../../src/consumer/messageTracker')
const { decryptMessage, verifyMessage } = require('../../src/encrypt')
const logger = require('../../src/consumer/clientLogging')
const config = require('../../src/config/config')

const { consumerProposalHandler,
    consumerProposalResolvedHandler } = require('../../src/consumer/consumerMessageHandler')

let publicKey = Buffer.from('public')
let privateKey = Buffer.from('private')
let keys = { publicKey, privateKey }

beforeEach(() => {
    messageSeen.mockClear()
    decryptMessage.mockClear()
    verifyMessage.mockClear()
    logger.warn.mockClear()
})

test('consumerProposalHandler rejects messages with a bad signature', async () => {
    //Assemble
    const proposal = {
        'uuid': 'someid',
        'body': {
            'requestId': 'abc123'
        }
    }
    const proposals = new Map()
    verifyMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(false) }))
    messageSeen.mockReturnValue(false)

    //Action
    await consumerProposalHandler(proposal, proposals, keys)

    //Assert
    expect(proposals.size).toEqual(0)
    expect(logger.warn).toBeCalled()
    expect(logger.warn.mock.calls[0][0]).toEqual("Couldn't verify message signature on inbound proposal")
})

test('consumerProposalHandler adds proposal to data model when not seen', async () => {
    //Assemble
    const proposal = {
        'uuid': 'someid',
        'body': {
            'requestId': 'abc123'
        }
    }
    const proposals = new Map()
    verifyMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(true) }))
    messageSeen.mockReturnValue(false)

    //Action
    await consumerProposalHandler(proposal, proposals, keys)

    //Assert
    expect(proposals.get('abc123')).toBe(proposal)
})

test('consumerProposalHandler does not add proposal to data model when seen', async () => {
    //Assemble
    const proposal = {
        'uuid': 'someid',
        'body': {
            'requestId': 'abc123'
        }
    }
    const proposals = new Map()
    verifyMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(true) }))
    messageSeen.mockReturnValue(true)

    //Action
    await consumerProposalHandler(proposal, proposals, keys)

    //Assert
    expect(proposals.size).toEqual(0)
})

test('consumerProposalHandler rejects proposals with an existing id', async () => {
    //Assemble
    const proposal = {
        'uuid': 'someid',
        'body': {
            'requestId': 'abc123'
        }
    }
    const proposals = new Map()
    proposals.set('abc123', proposal)
    verifyMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(true) }))
    messageSeen.mockReturnValue(false)

    //Action
    await consumerProposalHandler(proposal, proposals, keys)

    //Assert
    expect(proposals.size).toEqual(1)
    expect(logger.warn).toBeCalled()
    expect(logger.warn.mock.calls[0][0]).toEqual("A proposal with that requestId already exists.")
})

test('consumerProposalResolvedHandler adds resolution to the data model', async () => {
    //Assemble
    config.consumerId = 'makerId'

    const proposal = {
        'uuid': 'someid',
        'body': {
            'requestId': 'abc123'
        }
    }

    const resolution = {
        'uuid': 'someid',
        'body': {
            'makerId': 'makerId',
            'takerId': 'takerId',
            'requestId': 'abc123'
        }
    }

    const proposals = new Map()
    proposals.set('abc123', proposal)

    verifyMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(true) }))
    messageSeen.mockReturnValue(false)

    //Action
    await consumerProposalResolvedHandler(resolution, proposals)

    //Assert
    expect(proposal.resolution).toBe(resolution)
})

test('consumerProposalResolvedHandler handles bad signature', async () => {
    //Assemble
    config.consumerId = 'makerId'

    const proposal = {
        'uuid': 'someid',
        'body': {
            'requestId': 'abc123'
        }
    }

    const resolution = {
        'uuid': 'someid',
        'body': {
            'makerId': 'makerId',
            'takerId': 'takerId',
            'requestId': 'abc123'
        }
    }

    const proposals = new Map()
    proposals.set('abc123', proposal)

    verifyMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(false) }))
    messageSeen.mockReturnValue(false)

    //Action
    await consumerProposalResolvedHandler(resolution, proposals)

    //Assert
    expect(proposal.resolution).toBe(undefined)
    expect(logger.warn).toBeCalled()
    expect(logger.warn.mock.calls[0][0]).toEqual("Couldn't verify message signature on inbound proposal resolution")
})

test('consumerProposalResolvedHandler rejects resolution for proposals not in data model', async () => {
    //Assemble
    config.consumerId = 'makerId'

    const proposal = {
        'uuid': 'someid',
        'body': {
            'requestId': 'cde123'
        }
    }

    const resolution = {
        'uuid': 'someid',
        'body': {
            'makerId': 'makerId',
            'takerId': 'takerId',
            'requestId': 'abc123'
        }
    }

    const proposals = new Map()
    proposals.set('cde123', proposal)

    verifyMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(true) }))
    messageSeen.mockReturnValue(false)

    //Action
    await consumerProposalResolvedHandler(resolution, proposals)

    //Assert
    expect(logger.warn).toBeCalled()
    expect(logger.warn.mock.calls[0][0]).toEqual("Unable to find proposal for inbound proposal resolution")
})