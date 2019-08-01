jest.mock('../../src/consumer/chain')
jest.mock('../../src/config/config')
jest.mock('../../src/encrypt')
jest.mock('../../src/consumer/consumerPeer')
jest.mock('../../src/consumer/agreement')
jest.mock('../../src/consumer/proposalHelper')

const agreement = require('../../src/consumer/agreement')
const chain = require('../../src/consumer/chain')
const config = require('../../src/config/config')
const encrypt = require('../../src/encrypt')
const consumerPeer = require('../../src/consumer/consumerPeer')
const proposalHelper = require('../../src/consumer/proposalHelper')
const makerMeshPublic = '04955cda95e98f3af8b46f4d3d5ba52bdda031984f51b657434f9d95d399b17a417ab0726076c30c4828b86b95a39c0de6b9d09d3c9b7b5d2046f22c6264ef633e'
const takerMeshPublic = '04a9238a2b56a5c5fe31553e6aa2c3677985d90b4aa635fccfdc6c8fa407eb3f6b3a3c55ef5a7c45b078e9a51fcec82e165d9aaf88147d28ca7a19718948f33782'
const { processSettleProposal,
    processValidateAgreement,
    processProposal,
    processProposalResolved,
    processAcceptProposal,
    processNegotiationMessage,
    processCounterOffer,
    processDisburse,
    processFulfillment,
    processAdjudication,
    processRuling } = require('../../src/consumer/commandProcessor')

chain.initiateSettlement.mockReturnValue({ publicKey: () => 'escrowPublicKey' })

config.juryKey = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'

let publicKey = Buffer.from('public')
let privateKey = Buffer.from('private')
let keys = { publicKey, privateKey }

afterEach(() => {
})

beforeEach(() => {
    chain.initiateSettlement.mockClear()
    chain.createBuyerDisburseTransaction.mockClear()
    chain.submitDisburseTransaction.mockClear()
    chain.createFavorBuyerTransaction.mockClear()
    chain.createFavorSellerTransaction.mockClear()
    agreement.validateAgreement.mockClear()
    agreement.pullValuesFromAgreement.mockClear()
    consumerPeer.sendMessage.mockClear()
    consumerPeer.buildMessage.mockClear()
    encrypt.encryptMessage.mockClear()
    encrypt.signMessage.mockClear()

    proposalHelper.getResolvedAcceptance.mockRestore()

    consumerPeer.buildMessage.mockReturnValue({})
    encrypt.encryptMessage.mockReturnValue({})
    encrypt.signMessage.mockReturnValue({})
})

test('processSettleProposal calls initiateSettlement on chain when proposal is resolved (taker as buyer)', async () => {
    //Assemble
    config.consumerId = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const buyerPublic = config.consumerId
    const buyerSecret = 'SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT'
    const sellerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const juryPublic = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    const makerMeshKey = '0413e8ec78f2aa667b33ada471a677a9f41cb12a08a976d493351b93c08506ef7aa84f28338f820114998ed6a0c3c5a96c44cc50799443754ec03e49e8cc33e06f'

    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}'
    const challengeStake = 100
    const requestAmount = 200
    const proposal = {
        "body": {
            "requestId":
                "abc1234",
            "offerAsset":
                "piano",
            "makerId": sellerPublic
        }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset":
                "piano",
            "makerId": sellerPublic,
            "takerId": buyerPublic,
            "challengeStake": challengeStake,
            "requestAmount": requestAmount
        },
        "publicKey": keys.publicKey
    }

    const mockProposals = new Map()
    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(makerMeshKey)

    //Action
    await processSettleProposal(settlementJson, mockProposals, keys)

    //Assert
    expect(chain.initiateSettlement).toBeCalled()
    expect(chain.initiateSettlement.mock.calls[0][0]).toEqual(buyerSecret)
    expect(chain.initiateSettlement.mock.calls[0][1]).toEqual(sellerPublic)
    expect(chain.initiateSettlement.mock.calls[0][2]).toEqual(juryPublic)
    expect(chain.initiateSettlement.mock.calls[0][3]).toEqual(challengeStake)
    expect(chain.initiateSettlement.mock.calls[0][4]).toEqual(requestAmount)
})

test('processSettleProposal does not call initiateSettlement on chain when caller is not the buyer (taker as buyer)', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const buyerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const sellerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const makerMeshKey = '0413e8ec78f2aa667b33ada471a677a9f41cb12a08a976d493351b93c08506ef7aa84f28338f820114998ed6a0c3c5a96c44cc50799443754ec03e49e8cc33e06f'

    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}'
    const challengeStake = 100
    const requestAmount = 200
    const proposal = {
        "body": {
            "requestId":
                "abc1234",
            "offerAsset":
                "piano",
            "makerId": sellerPublic
        }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset":
                "piano",
            "makerId": sellerPublic,
            "takerId": buyerPublic,
            "challengeStake": challengeStake,
            "requestAmount": requestAmount
        },
        "publicKey": keys.publicKey
    }

    const mockProposals = new Map()
    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(makerMeshKey)

    //Action
    try {
        await processSettleProposal(settlementJson, mockProposals, keys)
    } catch (e) {
        //noop
    }

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
})

test('processSettleProposal throws an error when caller is not the buyer (taker as buyer)', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const buyerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const sellerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const makerMeshKey = '0413e8ec78f2aa667b33ada471a677a9f41cb12a08a976d493351b93c08506ef7aa84f28338f820114998ed6a0c3c5a96c44cc50799443754ec03e49e8cc33e06f'

    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}'
    const challengeStake = 100
    const requestAmount = 200
    const proposal = {
        "body": {
            "requestId":
                "abc1234",
            "offerAsset":
                "piano",
            "makerId": sellerPublic
        }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset":
                "piano",
            "makerId": sellerPublic,
            "takerId": buyerPublic,
            "challengeStake": challengeStake,
            "requestAmount": requestAmount
        },
        "publicKey": keys.publicKey
    }

    const mockProposals = new Map()
    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(makerMeshKey)

    //Action
    try {
        await processSettleProposal(settlementJson, mockProposals, keys)
    } catch (e) {
        //Assert
        expect(e.message).toMatch('only party buying with lumens can initiate settlement')
    }

})

test('processSettleProposal calls initiateSettlement on chain when proposal is resolved (maker as buyer)', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const buyerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const buyerSecret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const juryPublic = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const makerMeshKey = '0413e8ec78f2aa667b33ada471a677a9f41cb12a08a976d493351b93c08506ef7aa84f28338f820114998ed6a0c3c5a96c44cc50799443754ec03e49e8cc33e06f'
    const challengeStake = 100
    const offerAmount = 200
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'
    const proposal = {
        "body": {
            "requestId":
                "abc1234",
            "offerAsset":
                "native",
            "makerId": buyerPublic,
        }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset":
                "native",
            "makerId": buyerPublic,
            "takerId": sellerPublic,
            "challengeStake": challengeStake,
            "offerAmount": offerAmount
        },
        "publicKey": keys.publicKey
    }

    const mockProposals = new Map()
    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(makerMeshKey)

    //Action
    await processSettleProposal(settlementJson, mockProposals, keys)

    //Assert
    expect(chain.initiateSettlement).toBeCalled()
    expect(chain.initiateSettlement.mock.calls[0][0]).toEqual(buyerSecret)
    expect(chain.initiateSettlement.mock.calls[0][1]).toEqual(sellerPublic)
    expect(chain.initiateSettlement.mock.calls[0][2]).toEqual(juryPublic)
    expect(chain.initiateSettlement.mock.calls[0][3]).toEqual(challengeStake)
    expect(chain.initiateSettlement.mock.calls[0][4]).toEqual(offerAmount)
})


test('processSettleProposal does not call initiateSettlement on chain when caller is not the buyer (maker as buyer)', async () => {
    //Assemble
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const buyerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const makerMeshKey = '0413e8ec78f2aa667b33ada471a677a9f41cb12a08a976d493351b93c08506ef7aa84f28338f820114998ed6a0c3c5a96c44cc50799443754ec03e49e8cc33e06f'
    const challengeStake = 100
    const offerAmount = 200
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'

    config.consumerId = sellerPublic

    const proposal = {
        "body": {
            "requestId":
                "abc1234",
            "offerAsset":
                "native",
            "makerId": buyerPublic,
        }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset":
                "native",
            "makerId": buyerPublic,
            "takerId": sellerPublic,
            "challengeStake": challengeStake,
            "offerAmount": offerAmount
        },
        "publicKey": keys.publicKey
    }

    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(makerMeshKey)
    const mockProposals = new Map()

    //Action
    try {
        await processSettleProposal(settlementJson, mockProposals, keys)
    } catch (e) {
        //noop
    }

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
})

test('processSettleProposal throws an error when caller is not the buyer (maker as buyer)', async () => {
    //Assemble
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const buyerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const makerMeshKey = '0413e8ec78f2aa667b33ada471a677a9f41cb12a08a976d493351b93c08506ef7aa84f28338f820114998ed6a0c3c5a96c44cc50799443754ec03e49e8cc33e06f'
    const challengeStake = 100
    const offerAmount = 200
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'

    config.consumerId = sellerPublic

    const proposal = {
        "body": {
            "requestId":
                "abc1234",
            "offerAsset":
                "native",
            "makerId": buyerPublic,
        }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset":
                "native",
            "makerId": buyerPublic,
            "takerId": sellerPublic,
            "challengeStake": challengeStake,
            "offerAmount": offerAmount
        },
        "publicKey": keys.publicKey
    }

    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(makerMeshKey)
    const mockProposals = new Map()

    //Action
    try {
        await processSettleProposal(settlementJson, mockProposals, keys)
    } catch (e) {
        //Assert
        expect(e.message).toMatch('only party buying with lumens can initiate settlement')
    }
})


test('processSettleProposal doest not call initiateSettlement when proposal is missing', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'
    proposalHelper.getResolvedAcceptance.mockImplementation((requestId, proposals) => {
        throw new Error('Unable to locate proposal')
    })
    const mockProposals = new Map()

    //Action
    try {
        await processSettleProposal(settlementJson, mockProposals, keys)
    } catch (e) {
        //noop
    }

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
})

test('processSettleProposal does not call initiateSettlement when proposal is not resolved', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'
    proposalHelper.getResolvedAcceptance.mockImplementation((requestId, proposals) => {
        throw new Error('Proposal in not resolved')
    })
    const mockProposals = new Map()

    //Action
    try {
        await processSettleProposal(settlementJson, mockProposals, keys)
    } catch (e) {
        //noop
    }

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
})

test('processSettleProposal doest not call initiateSettlement when proposal is resolved without a taker', async () => {
    //Assemble
    config.consumerId = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const settlementJson = '{ "requestId" : "abc1234", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'
    proposalHelper.getResolvedAcceptance.mockImplementation((requestId, proposals) => {
        throw new Error('Proposal did not resolve an acceptance')
    })
    const mockProposals = new Map()

    //Action
    try {
        await processSettleProposal(settlementJson, mockProposals, keys)
    } catch (e) {
        //noop
    }

    //Assert
    expect(chain.initiateSettlement).not.toBeCalled()
})

test('processValidateAgreement does', async () => {
    //Assemble
    const param = '{"requestId": "abc1234", "agreementIndex": 0}'
    let mockAgreement = {}
    let mockAdjudication = { agreement: mockAgreement }
    let mockAdjudications = new Map()
    mockAdjudications.set('abc1234', [mockAdjudication])

    //Action
    await processValidateAgreement(param, mockAdjudications)

    //Assert
    expect(agreement.validateAgreement).toBeCalled()
    expect(agreement.validateAgreement.mock.calls[0][0]).toBe(mockAgreement)
})

test('processValidateAGreement handles bad agreement index', async () => {
    //Assemble
    const param = '{"requestId": "abc1234", "agreementIndex": 1}'
    let mockAgreement = {}
    let mockAdjudication = { agreement: mockAgreement }
    let mockAdjudications = new Map()
    mockAdjudications.set('abc1234', [mockAdjudication])

    //Action
    try {
        await processValidateAgreement(param, mockAdjudications)
    } catch (e) {
        //Assert
        expect(e.message).toMatch('No agreement associated with that index')
    }
})

test('processValidateAGreement handles bad proposal ids', async () => {
    //Assemble
    const param = '{"requestId": "def1234", "agreementIndex": 0}'
    let mockAgreement = {}
    let mockAdjudication = { agreement: mockAgreement }
    let mockAdjudications = new Map()
    mockAdjudications.set('abc1234', [mockAdjudication])

    //Action
    try {
        await processValidateAgreement(param, mockAdjudications)
    } catch (e) {
        //Assert
        expect(e.message).toMatch('No agreement associated with that index')
    }
})

test('processProposal does', async () => {
    //Assemble
    const param = '{ "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 100, "timeStamp": "2019-07-23T15:28:56.782Z", "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 100, "audience" : []}'
    let proposals = new Map()
    const mockProposalMessage = { "body": { "requestId": "abc1234" } }
    consumerPeer.buildMessage.mockReturnValue(mockProposalMessage)
    const mockSignedMessage = { "body": { "requestId": "abc1234" } }
    encrypt.signMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockSignedMessage) }))

    //Action
    await processProposal(param, proposals, keys)

    //Assert
    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toEqual('proposal')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toBe(mockSignedMessage)
})

test('processProposalResolved does', async () => {
    //Assemble
    const param = '{ "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "resolved", "timeStamp": "2019-07-23T15:28:56.782Z", "previousHash" : "61e000d3d2733a5982c3a7ffe944480829302b193d6747f3a545c8e752278e76"}'
    const proposals = new Map()
    proposals.set('cde1234', {})

    const mockProposalResolvedMessage = {}
    consumerPeer.buildMessage.mockReturnValue(mockProposalResolvedMessage)
    const mockSignedMessage = {}
    encrypt.signMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockSignedMessage) }))

    //Action 
    await processProposalResolved(param, proposals, keys)

    //Assert
    expect(consumerPeer.buildMessage).toBeCalled()
    expect(encrypt.signMessage).toBeCalled()
    expect(encrypt.signMessage.mock.calls[0][0]).toBe(mockProposalResolvedMessage)
    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toMatch('resolved')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toBe(mockSignedMessage)
})

test('processFulfillment does', async () => {
    //Assemble
    const buyerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const buyerSecret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const sellerSecret = 'SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT'
    const challengeStake = 100
    const offerAmount = 200

    const mockFulfillmentMessage = {}
    const mockEncryptedMessage = {}
    const mockSignedMessage = {}
    const param = '{ "requestId" : "abc1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "fulfillment", "timeStamp": "2019-07-23T15:28:56.782Z", "fulfillment" : "account transfer", "previousHash" : "5d5214ba78b97d49a04a49092ba2ffc1de7b545d64a8c906d5db11c531f78b4f"}'
    const proposals = new Map()

    consumerPeer.buildMessage.mockReturnValue(mockFulfillmentMessage)
    encrypt.signMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockSignedMessage) }))
    encrypt.encryptMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockEncryptedMessage) }))

    config.consumerId = buyerPublic

    const proposal = {
        "body": {
            "requestId":
                "abc1234",
            "offerAsset":
                "native",
            "makerId": buyerPublic,
        },
        "publicKey": makerMeshPublic,
        "fulfillments": [],
        "settlementInitiated": { "body": { "escrow": "some_account" } }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "native",
            "makerId": buyerPublic,
            "takerId": sellerPublic,
            "challengeStake": challengeStake,
            "offerAmount": offerAmount
        },
        "publicKey": takerMeshPublic,
    }

    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })

    //Action
    await processFulfillment(param, proposals, keys)

    //Assert
    expect(consumerPeer.buildMessage).toBeCalled()
    expect(encrypt.signMessage).toBeCalled
    expect(encrypt.signMessage.mock.calls[0][0]).toBe(mockFulfillmentMessage)
    expect(encrypt.signMessage.mock.calls[0][1]).toBe(keys)
    expect(encrypt.encryptMessage).toBeCalled()
    expect(encrypt.encryptMessage.mock.calls[0][0]).toBe(mockSignedMessage)
    expect(encrypt.encryptMessage.mock.calls[0][1]).toMatch(takerMeshPublic)
    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toMatch('fulfillment')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toBe(mockEncryptedMessage)
})

test('processAcceptProposal does', async () => {
    //Assemble
    const param = '{ "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 80, "timeStamp": "2019-07-23T15:28:56.782Z", "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "accepted", "previousHash" : "534309e0e155bbf01442fde4e23b236bacfcd83c2dcd93775fa4306009ad9f8e"}'

    const proposals = new Map()
    proposals.set('cde1234', {'acceptances': []})

    const mockAcceptMessage = {}
    consumerPeer.buildMessage.mockReturnValue(mockAcceptMessage)
    const mockSignedMessage = {}
    encrypt.signMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockSignedMessage) }))
    const encryptedAcceptMessage = {}
    encrypt.encryptMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(encryptedAcceptMessage) }))

    //Action 
    await processAcceptProposal(param, proposals, keys)

    //Assert
    expect(encrypt.signMessage).toBeCalled()
    expect(encrypt.signMessage.mock.calls[0][0]).toBe(mockAcceptMessage)
    expect(encrypt.encryptMessage).toBeCalled()
    expect(encrypt.encryptMessage.mock.calls[0][0]).toBe(mockSignedMessage)
    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toMatch('accept')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toBe(encryptedAcceptMessage)
})

test('processCounterOffer does', async () => {
    //Assemble
   const param =  '{ "requestId" : "cde1234", "makerId" : "GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3", "offerAsset" : "native", "offerAmount" : 200, "requestAsset" : "peanuts", "requestAmount" : 80, "timeStamp": "2019-07-23T15:28:56.782Z", "conditions" : [], "juryPool" : "ghi1234", "challengeStake" : 5, "audience" : [], "takerId" : "GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV", "message" : "countered", "previousHash" : "61e000d3d2733a5982c3a7ffe944480829302b193d6747f3a545c8e752278e76"}'
    const proposals = new Map()
    proposals.set('cde1234', {'counterOffers': []})

    //Action
    await processCounterOffer(param, proposals, keys)

    const mockCounterOfferMessage = {}
    consumerPeer.buildMessage.mockReturnValue(mockCounterOfferMessage)
    const mockSignedMessage = {}
    encrypt.signMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockSignedMessage) }))
    const encryptedCounterOfferMessage = {}
    encrypt.encryptMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(encryptedCounterOfferMessage) }))

    //Assert
    expect(encrypt.signMessage).toBeCalled()
    expect(encrypt.signMessage.mock.calls[0][0]).toEqual(mockCounterOfferMessage)
    expect(encrypt.encryptMessage).toBeCalled()
    expect(encrypt.encryptMessage.mock.calls[0][0]).toEqual(mockSignedMessage)
    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toMatch('counterOffer')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toEqual(encryptedCounterOfferMessage)
})

test('processDisburse sends signature required to seller when the maker is buyer', async () => {
    //Assemble
    const buyerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    config.consumerId = buyerPublic
    const buyerSecret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const challengeStake = 100
    const offerAmount = 200
    const buyerDisburseJson = '{ "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH"}'

    keys.publicKey = Buffer.from(makerMeshPublic, 'hex')

    const proposal = {
        "body": {
            "requestId":
                "abc1234",
            "offerAsset":
                "native",
            "makerId": buyerPublic,
        },
        "publicKey": makerMeshPublic,
        "settlementInitiated": { "body": { "escrow": "some_account" } }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "native",
            "makerId": buyerPublic,
            "takerId": sellerPublic,
            "challengeStake": challengeStake,
            "offerAmount": offerAmount
        },
        "publicKey": takerMeshPublic,
    }

    const mockProposals = new Map()
    const mockAdjudications = new Map()
    const mockRulings = new Map()

    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })

    const mockSignatureRequiredMessage = { "body": {} }
    const mockSignedMessage = { "body": {} }
    const mockEncryptedMessage = { "body": {} }
    const mockTransaction = {}

    consumerPeer.buildMessage.mockReturnValue(mockSignatureRequiredMessage)
    encrypt.signMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockSignedMessage) }))
    encrypt.encryptMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockEncryptedMessage) }))
    chain.createBuyerDisburseTransaction.mockReturnValue(new Promise((resolve, reject) => { resolve(mockTransaction) }))

    //Action
    await processDisburse(buyerDisburseJson, mockProposals, mockAdjudications, mockRulings, keys)

    //Assert
    expect(chain.createBuyerDisburseTransaction).toBeCalled()
    expect(chain.createBuyerDisburseTransaction.mock.calls[0][0]).toEqual(buyerSecret)
    expect(chain.createBuyerDisburseTransaction.mock.calls[0][1]).toEqual(sellerPublic)
    expect(chain.createBuyerDisburseTransaction.mock.calls[0][2]).toEqual(challengeStake)
    expect(chain.createBuyerDisburseTransaction.mock.calls[0][3]).toEqual(offerAmount)
    expect(chain.createBuyerDisburseTransaction.mock.calls[0][4]).toEqual(proposal.settlementInitiated.body.escrow)

    expect(consumerPeer.buildMessage).toBeCalled()
    expect(consumerPeer.buildMessage.mock.calls[0][3]).toEqual(takerMeshPublic)
    let signatureRequiredBody = consumerPeer.buildMessage.mock.calls[0][0]
    expect(signatureRequiredBody.transaction).toBe(mockTransaction)

    expect(encrypt.signMessage).toBeCalled
    expect(encrypt.signMessage.mock.calls[0][0]).toBe(mockSignatureRequiredMessage)
    expect(encrypt.signMessage.mock.calls[0][1]).toBe(keys)

    expect(encrypt.encryptMessage).toBeCalled
    expect(encrypt.encryptMessage.mock.calls[0][0]).toBe(mockSignedMessage)
    expect(encrypt.encryptMessage.mock.calls[0][1]).toEqual(takerMeshPublic)

    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toEqual('signatureRequired')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toBe(mockEncryptedMessage)
})

test('processDisburse sends signature required to seller when the taker is buyer', async () => {
    //Assemble
    const sellerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const buyerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const buyerSecret = 'SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT'
    config.consumerId = buyerPublic
    const challengeStake = 100
    const requestAmount = 200
    const buyerDisburseJson = '{ "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}'

    keys.publicKey = Buffer.from(takerMeshPublic, 'hex')
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(takerMeshPublic)

    const proposal = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "piano",
            "requestAsset": "native",
            "makerId": sellerPublic,
            "requestAmount": requestAmount
        },
        "publicKey": makerMeshPublic,
        "settlementInitiated": { "body": { "escrow": "some_account" } }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "piano",
            "requestAsset": "native",
            "makerId": sellerPublic,
            "takerId": buyerPublic,
            "challengeStake": challengeStake,
            "requestAmount": requestAmount
        },
        "publicKey": takerMeshPublic
    }

    const mockProposals = new Map()
    const mockAdjudications = new Map()
    const mockRulings = new Map()

    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(makerMeshPublic)

    const mockSignatureRequiredMessage = { "body": {} }
    const mockSignedMessage = { "body": {} }
    const mockEncryptedMessage = { "body": {} }
    const mockTransaction = {}

    consumerPeer.buildMessage.mockReturnValue(mockSignatureRequiredMessage)
    encrypt.signMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockSignedMessage) }))
    encrypt.encryptMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockEncryptedMessage) }))
    chain.createBuyerDisburseTransaction.mockReturnValue(new Promise((resolve, reject) => { resolve(mockTransaction) }))

    //Action
    await processDisburse(buyerDisburseJson, mockProposals, mockAdjudications, mockRulings, keys)

    //Assert
    expect(chain.createBuyerDisburseTransaction).toBeCalled()
    expect(chain.createBuyerDisburseTransaction.mock.calls[0][0]).toEqual(buyerSecret)
    expect(chain.createBuyerDisburseTransaction.mock.calls[0][1]).toEqual(sellerPublic)
    expect(chain.createBuyerDisburseTransaction.mock.calls[0][2]).toEqual(challengeStake)
    expect(chain.createBuyerDisburseTransaction.mock.calls[0][3]).toEqual(requestAmount)
    expect(chain.createBuyerDisburseTransaction.mock.calls[0][4]).toEqual(proposal.settlementInitiated.body.escrow)

    expect(consumerPeer.buildMessage).toBeCalled()
    expect(consumerPeer.buildMessage.mock.calls[0][3]).toEqual(makerMeshPublic)
    let signatureRequiredBody = consumerPeer.buildMessage.mock.calls[0][0]
    expect(signatureRequiredBody.transaction).toBe(mockTransaction)

    expect(encrypt.signMessage).toBeCalled
    expect(encrypt.signMessage.mock.calls[0][0]).toBe(mockSignatureRequiredMessage)
    expect(encrypt.signMessage.mock.calls[0][1]).toBe(keys)

    expect(encrypt.encryptMessage).toBeCalled
    expect(encrypt.encryptMessage.mock.calls[0][0]).toBe(mockSignedMessage)
    expect(encrypt.encryptMessage.mock.calls[0][1]).toBe(makerMeshPublic)

    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toEqual('signatureRequired')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toBe(mockEncryptedMessage)
})

test('processDisburse submits transaction when the seller disburses', async () => {
    //Assemble
    const buyerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const buyerSecret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const sellerSecret = 'SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT'
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const challengeStake = 100
    const offerAmount = 200
    const sellerDisburseJson = '{ "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}'

    config.consumerId = sellerPublic

    keys.publicKey = Buffer.from(makerMeshPublic, 'hex')

    const mockTransaction = {}

    const signatureRequired = {
        "body": {
            "transaction": mockTransaction
        }
    }

    const proposal = {
        "body": {
            "requestId":
                "abc1234",
            "offerAsset":
                "native",
            "makerId": buyerPublic,
        },
        "publicKey": makerMeshPublic,
        "signatureRequired": signatureRequired,
        "settlementInitiated": { "body": { "escrow": "some_account" } }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "native",
            "makerId": buyerPublic,
            "takerId": sellerPublic,
            "challengeStake": challengeStake,
            "offerAmount": offerAmount
        },
        "publicKey": takerMeshPublic,
    }

    const mockProposals = new Map()
    const mockAdjudications = new Map()
    const mockRulings = new Map()

    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })

    //Action
    await processDisburse(sellerDisburseJson, mockProposals, mockAdjudications, mockRulings, keys)

    //Assert
    expect(chain.submitDisburseTransaction).toBeCalled()
    expect(chain.submitDisburseTransaction.mock.calls[0][0]).toEqual(sellerSecret)
    expect(chain.submitDisburseTransaction.mock.calls[0][1]).toBe(mockTransaction)
})

test('processDisburse does not when in adjudication and no ruling', async () => {
    //Assemble
    const sellerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const buyerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const buyerSecret = 'SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT'
    config.consumerId = buyerPublic
    const challengeStake = 100
    const requestAmount = 200
    const buyerDisburseJson = '{ "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}'

    keys.publicKey = Buffer.from(takerMeshPublic, 'hex')
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(takerMeshPublic)

    const proposal = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "piano",
            "requestAsset": "native",
            "makerId": sellerPublic,
            "requestAmount": requestAmount
        },
        "publicKey": makerMeshPublic,
        "settlementInitiated": { "body": { "escrow": "some_account" } }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "piano",
            "requestAsset": "native",
            "makerId": sellerPublic,
            "takerId": buyerPublic,
            "challengeStake": challengeStake,
            "requestAmount": requestAmount
        },
        "publicKey": takerMeshPublic
    }

    const mockProposals = new Map()
    const mockProposalAdjudications = [{}]

    const mockAdjudications = new Map()
    mockAdjudications.set('abc1234', mockProposalAdjudications)

    const mockRulings = new Map()

    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(makerMeshPublic)

    const mockSignatureRequiredMessage = { "body": {} }
    const mockSignedMessage = { "body": {} }
    const mockEncryptedMessage = { "body": {} }
    const mockTransaction = {}

    consumerPeer.buildMessage.mockReturnValue(mockSignatureRequiredMessage)
    encrypt.signMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockSignedMessage) }))
    encrypt.encryptMessage.mockReturnValue(new Promise((resolve, reject) => { resolve(mockEncryptedMessage) }))
    chain.createBuyerDisburseTransaction.mockReturnValue(new Promise((resolve, reject) => { resolve(mockTransaction) }))

    //Action
    try {
        await processDisburse(buyerDisburseJson, mockProposals, mockAdjudications, mockRulings, keys)
    } catch (e) {
        expect(e.message).toMatch('transaction is in dispute')
    }
})

test('processDisburse allows favored party to submit to chain', async () => {
    //Assemble
    const sellerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const buyerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const buyerSecret = 'SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT'
    config.consumerId = buyerPublic
    const challengeStake = 100
    const requestAmount = 200
    const buyerDisburseJson = '{ "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}'

    keys.publicKey = Buffer.from(takerMeshPublic, 'hex')
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(takerMeshPublic)

    const proposal = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "piano",
            "requestAsset": "native",
            "makerId": sellerPublic,
            "requestAmount": requestAmount
        },
        "publicKey": makerMeshPublic,
        "settlementInitiated": { "body": { "escrow": "some_account" } }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "piano",
            "requestAsset": "native",
            "makerId": sellerPublic,
            "takerId": buyerPublic,
            "challengeStake": challengeStake,
            "requestAmount": requestAmount
        },
        "publicKey": takerMeshPublic
    }

    const mockTransaction = {}

    const ruling = {
        "body": {
            "transaction": mockTransaction
        }
    }

    const mockProposals = new Map()
    const mockProposalAdjudications = [{}]

    const mockAdjudications = new Map()
    mockAdjudications.set('abc1234', mockProposalAdjudications)

    const mockRulings = new Map()
    mockRulings.set('abc1234', ruling)

    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(makerMeshPublic)

    //Action
    await processDisburse(buyerDisburseJson, mockProposals, mockAdjudications, mockRulings, keys)

    //Assert
    expect(chain.submitDisburseTransaction).toBeCalled()
    expect(chain.submitDisburseTransaction.mock.calls[0][0]).toEqual(buyerSecret)
    expect(chain.submitDisburseTransaction.mock.calls[0][1]).toEqual(mockTransaction)
})

test('processDisburse does not allow unfavored party to submit to chain', async () => {
    //Assemble
    const sellerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const buyerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const buyerSecret = 'SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT'
    config.consumerId = buyerPublic
    const challengeStake = 100
    const requestAmount = 200
    const buyerDisburseJson = '{ "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "secret" : "SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT"}'

    keys.publicKey = Buffer.from(takerMeshPublic, 'hex')
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(takerMeshPublic)

    const proposal = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "piano",
            "requestAsset": "native",
            "makerId": sellerPublic,
            "requestAmount": requestAmount
        },
        "publicKey": makerMeshPublic,
        "settlementInitiated": { "body": { "escrow": "some_account" } }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "piano",
            "requestAsset": "native",
            "makerId": sellerPublic,
            "takerId": buyerPublic,
            "challengeStake": challengeStake,
            "requestAmount": requestAmount
        },
        "publicKey": takerMeshPublic
    }

    const ruling = {
        "body": {
        }
    }

    const mockProposals = new Map()
    const mockProposalAdjudications = [{}]

    const mockAdjudications = new Map()
    mockAdjudications.set('abc1234', mockProposalAdjudications)

    const mockRulings = new Map()
    mockRulings.set('abc1234', ruling)

    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })
    proposalHelper.getKeyFromPreviousHash.mockReturnValue(makerMeshPublic)

    //Action
    try {
        await processDisburse(buyerDisburseJson, mockProposals, mockAdjudications, mockRulings, keys)
    }
    catch (e) {
        expect(e.message).toMatch('jury did not rule in your favor')
    }

    //Assert
    expect(chain.submitDisburseTransaction).not.toBeCalled()
})

test('processAdjudicationMessage does', async () => {
    //Assemble
    const param = '{ "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z" }'
    const buyerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const buyerSecret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const sellerSecret = 'SDN5W3B2RSO4ZHVCY3EXUIZQD32JDWHVDBAO5A3FBUF4BPQBZZ3ST6IT'
    const challengeStake = 100
    const offerAmount = 200

    config.consumerId = buyerPublic
    config.juryMeshPublicKey = 'some_key'

    keys.publicKey = Buffer.from(makerMeshPublic, 'hex')

    const mockTransaction = {}

    const signatureRequired = {
        "body": {
            "transaction": mockTransaction
        }
    }

    const proposal = {
        "body": {
            "requestId":
                "abc1234",
            "offerAsset":
                "native",
            "makerId": buyerPublic,
        },
        "publicKey": makerMeshPublic,
        "signatureRequired": signatureRequired,
        "settlementInitiated": { "body": { "escrow": "some_account" } }
    }

    const acceptance = {
        "body": {
            "requestId": "abc1234",
            "offerAsset": "native",
            "makerId": buyerPublic,
            "takerId": sellerPublic,
            "challengeStake": challengeStake,
            "offerAmount": offerAmount
        },
        "publicKey": takerMeshPublic,
    }

    const mockProposals = new Map()
    const mockAdjudications = new Map()

    const recipientMessage = {}
    const juryMessage = {}

    const recipientSignedMessage = {}
    const jurySignedMessage = {}

    const recipientEncryptedMessage = {}
    const juryEncryptedMessage = {}

    proposalHelper.getResolvedAcceptance.mockReturnValue({ proposal, acceptance })
    consumerPeer.buildMessage.mockReturnValueOnce(recipientMessage).mockReturnValueOnce(juryMessage)

    encrypt.signMessage.mockReturnValueOnce(new Promise((resolve, reject) => { resolve(recipientSignedMessage) }))
        .mockReturnValueOnce(new Promise((resolve, reject) => { resolve(jurySignedMessage) }))

    encrypt.encryptMessage.mockReturnValueOnce(new Promise((resolve, reject) => { resolve(recipientEncryptedMessage) }))
        .mockReturnValueOnce(new Promise((resolve, reject) => { resolve(juryEncryptedMessage) }))

    //Action
    await processAdjudication(param, mockProposals, mockAdjudications, keys)

    //Assert
    expect(consumerPeer.buildMessage).toBeCalled()
    expect(consumerPeer.buildMessage.mock.calls[0][3]).toEqual(takerMeshPublic)
    expect(consumerPeer.buildMessage.mock.calls[1][3]).toEqual(config.juryMeshPublicKey)

    expect(encrypt.signMessage).toBeCalled()
    expect(encrypt.signMessage.mock.calls[0][0]).toBe(recipientMessage)
    expect(encrypt.signMessage.mock.calls[1][0]).toBe(juryMessage)

    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toMatch('adjudicate')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toBe(recipientEncryptedMessage)
    expect(consumerPeer.sendMessage.mock.calls[1][0]).toMatch('adjudicate')
    expect(consumerPeer.sendMessage.mock.calls[1][1]).toBe(juryEncryptedMessage)
})

test('processRuling calls createFavorBuyerTransaction when buyer is favored', async () => {
    //Assemble
    const buyerMeshKey = 'buyerMeshKey'
    const sellerMeshKey = 'sellerMeshKey'
    const buyerStellarKey = 'buyerStellarKey'
    const sellerStellarKey = 'sellerStellarKey'
    const escrowStellarKey = 'escrowStellarKey'
    const nativeAmount = 200
    const challengeStake = 10
    const makerId = 'makerId'
    const takerId = 'takerId'
    const requestId = 'abc1234'
    const acceptanceHash = 'acceptanceHash'
    const param = '{ "secret" : "SC5LFR4I5NEYXAWIPUD5C5NWLIK65BLG2DYRWHIBP7JMVQ3D3BIUU46J", "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "adjudicationIndex" : 0, "favor" : "buyer", "justification" : "for the fact" }'
    const jurySecret = 'SC5LFR4I5NEYXAWIPUD5C5NWLIK65BLG2DYRWHIBP7JMVQ3D3BIUU46J'
    const rulings = new Map()
    const buyerMessage = { "body": { } }
    const sellerMessage = { "body": { } }
    const buyerSignedMessage = {}
    const sellerSignedMessage = {}
    const buyerEncryptedMessage = {}
    const sellerEncryptedMessage = {}

    consumerPeer.buildMessage.mockReturnValueOnce(buyerMessage).mockReturnValueOnce(sellerMessage)
    encrypt.signMessage.mockReturnValueOnce(buyerSignedMessage).mockReturnValueOnce(sellerSignedMessage)
    encrypt.encryptMessage.mockReturnValueOnce(buyerEncryptedMessage).mockReturnValueOnce(sellerEncryptedMessage)

    const mockAgreement = {}
    const adjudication = {
        "body": {
            "agreement": mockAgreement
        }
    }
    const adjudicationsForProposals = [adjudication]

    const adjudications = new Map()
    adjudications.set('abc1234', adjudicationsForProposals)

    const transaction = {}
    chain.createFavorSellerTransaction.mockReturnValue(transaction)

    agreement.pullValuesFromAgreement.mockReturnValue(
        {
            buyerMeshKey,
            sellerMeshKey,
            buyerStellarKey,
            sellerStellarKey,
            escrowStellarKey,
            nativeAmount,
            challengeStake,
            makerId,
            takerId,
            requestId,
            acceptanceHash
        }
    )

    //Action
    await processRuling(param, adjudications, rulings, keys)

    //Assert
    expect(agreement.pullValuesFromAgreement).toBeCalled()
    expect(agreement.pullValuesFromAgreement.mock.calls[0][0]).toBe(mockAgreement)
    expect(chain.createFavorBuyerTransaction).toBeCalled()
    expect(chain.createFavorBuyerTransaction.mock.calls[0][0]).toMatch(jurySecret)
    expect(chain.createFavorBuyerTransaction.mock.calls[0][1]).toMatch(escrowStellarKey)
    expect(chain.createFavorBuyerTransaction.mock.calls[0][2]).toMatch(buyerStellarKey)
    expect(chain.createFavorBuyerTransaction.mock.calls[0][3]).toEqual(challengeStake)
})

test('processRuling calls createFavorSellerTransaction when seller is favored', async () => {
    //Assemble
    const buyerMeshKey = 'buyerMeshKey'
    const sellerMeshKey = 'sellerMeshKey'
    const buyerStellarKey = 'buyerStellarKey'
    const sellerStellarKey = 'sellerStellarKey'
    const escrowStellarKey = 'escrowStellarKey'
    const nativeAmount = 200
    const challengeStake = 10
    const makerId = 'makerId'
    const takerId = 'takerId'
    const requestId = 'abc1234'
    const acceptanceHash = 'acceptanceHash'
    const param = '{ "secret" : "SC5LFR4I5NEYXAWIPUD5C5NWLIK65BLG2DYRWHIBP7JMVQ3D3BIUU46J", "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "adjudicationIndex" : 0, "favor" : "seller", "justification" : "for the fact" }'
    const jurySecret = 'SC5LFR4I5NEYXAWIPUD5C5NWLIK65BLG2DYRWHIBP7JMVQ3D3BIUU46J'
    const rulings = new Map()
    const buyerMessage = { "body": { } }
    const sellerMessage = { "body": { } }
    const buyerSignedMessage = {}
    const sellerSignedMessage = {}
    const buyerEncryptedMessage = {}
    const sellerEncryptedMessage = {}

    consumerPeer.buildMessage.mockReturnValueOnce(buyerMessage).mockReturnValueOnce(sellerMessage)
    encrypt.signMessage.mockReturnValueOnce(buyerSignedMessage).mockReturnValueOnce(sellerSignedMessage)
    encrypt.encryptMessage.mockReturnValueOnce(buyerEncryptedMessage).mockReturnValueOnce(sellerEncryptedMessage)

    const mockAgreement = {}
    const adjudication = {
        "body": {
            "agreement": mockAgreement
        }
    }
    const adjudicationsForProposals = [adjudication]

    const adjudications = new Map()
    adjudications.set('abc1234', adjudicationsForProposals)

    const transaction = {}
    chain.createFavorSellerTransaction.mockReturnValue(transaction)

    agreement.pullValuesFromAgreement.mockReturnValue(
        {
            buyerMeshKey,
            sellerMeshKey,
            buyerStellarKey,
            sellerStellarKey,
            escrowStellarKey,
            nativeAmount,
            challengeStake,
            makerId,
            takerId,
            requestId,
            acceptanceHash
        }
    )

    //Action
    await processRuling(param, adjudications, rulings, keys)

    //Assert
    expect(agreement.pullValuesFromAgreement).toBeCalled()
    expect(agreement.pullValuesFromAgreement.mock.calls[0][0]).toBe(mockAgreement)
    expect(chain.createFavorSellerTransaction).toBeCalled()
    expect(chain.createFavorSellerTransaction.mock.calls[0][0]).toMatch(jurySecret)
    expect(chain.createFavorSellerTransaction.mock.calls[0][1]).toMatch(escrowStellarKey)
    expect(chain.createFavorSellerTransaction.mock.calls[0][2]).toMatch(buyerStellarKey)
    expect(chain.createFavorSellerTransaction.mock.calls[0][3]).toMatch(sellerStellarKey)
    expect(chain.createFavorSellerTransaction.mock.calls[0][4]).toEqual(challengeStake)
    expect(chain.createFavorSellerTransaction.mock.calls[0][5]).toEqual(nativeAmount)
})

test('processRuling sends transaction to buyer when favored', async () => {
    //Assemble
    const buyerMeshKey = 'buyerMeshKey'
    const sellerMeshKey = 'sellerMeshKey'
    const buyerStellarKey = 'buyerStellarKey'
    const sellerStellarKey = 'sellerStellarKey'
    const escrowStellarKey = 'escrowStellarKey'
    const nativeAmount = 200
    const challengeStake = 10
    const makerId = 'makerId'
    const takerId = 'takerId'
    const requestId = 'abc1234'
    const acceptanceHash = 'acceptanceHash'
    const param = '{ "secret" : "SC5LFR4I5NEYXAWIPUD5C5NWLIK65BLG2DYRWHIBP7JMVQ3D3BIUU46J", "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "adjudicationIndex" : 0, "favor" : "buyer", "justification" : "for the fact" }'
    const rulings = new Map()
    const buyerMessage = { "body": { } }
    const sellerMessage = { "body": { } }
    const buyerSignedMessage = {}
    const sellerSignedMessage = {}
    const buyerEncryptedMessage = {}
    const sellerEncryptedMessage = {}

    consumerPeer.buildMessage.mockReturnValueOnce(buyerMessage).mockReturnValueOnce(sellerMessage)
    encrypt.signMessage.mockReturnValueOnce(buyerSignedMessage).mockReturnValueOnce(sellerSignedMessage)
    encrypt.encryptMessage.mockReturnValueOnce(buyerEncryptedMessage).mockReturnValueOnce(sellerEncryptedMessage)

    const mockAgreement = {}
    const adjudication = {
        "body": {
            "agreement": mockAgreement
        }
    }
    const adjudicationsForProposals = [adjudication]

    const adjudications = new Map()
    adjudications.set('abc1234', adjudicationsForProposals)

    const transaction = {}
    chain.createFavorBuyerTransaction.mockReturnValue(transaction)

    agreement.pullValuesFromAgreement.mockReturnValue(
        {
            buyerMeshKey,
            sellerMeshKey,
            buyerStellarKey,
            sellerStellarKey,
            escrowStellarKey,
            nativeAmount,
            challengeStake,
            makerId,
            takerId,
            requestId,
            acceptanceHash
        }
    )

    //Action
    await processRuling(param, adjudications, rulings, keys)

    //Assert
    expect(agreement.pullValuesFromAgreement).toBeCalled()
    expect(agreement.pullValuesFromAgreement.mock.calls[0][0]).toBe(mockAgreement)

    expect(consumerPeer.buildMessage).toBeCalled()
    expect(consumerPeer.buildMessage.mock.calls[0][3]).toEqual(buyerMeshKey)
    expect(consumerPeer.buildMessage.mock.calls[1][3]).toEqual(sellerMeshKey)

    expect(encrypt.signMessage).toBeCalled()
    expect(encrypt.signMessage.mock.calls[0][0]).toBe(buyerMessage)
    expect(encrypt.signMessage.mock.calls[1][0]).toBe(sellerMessage)

    expect(buyerMessage.body.transaction).toBe(transaction)
    expect(sellerMessage.body.transaction).toBe(undefined)

    expect(encrypt.encryptMessage).toBeCalled()
    expect(encrypt.encryptMessage.mock.calls[0][0]).toBe(buyerSignedMessage)
    expect(encrypt.encryptMessage.mock.calls[1][0]).toBe(sellerSignedMessage)

    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toMatch('ruling')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toBe(buyerEncryptedMessage)

    expect(consumerPeer.sendMessage.mock.calls[1][0]).toMatch('ruling')
    expect(consumerPeer.sendMessage.mock.calls[1][1]).toBe(sellerEncryptedMessage)
})

test('processRuling sends transaction to seller when favored', async () => {
    //Assemble
    const buyerMeshKey = 'buyerMeshKey'
    const sellerMeshKey = 'sellerMeshKey'
    const buyerStellarKey = 'buyerStellarKey'
    const sellerStellarKey = 'sellerStellarKey'
    const escrowStellarKey = 'escrowStellarKey'
    const nativeAmount = 200
    const challengeStake = 10
    const makerId = 'makerId'
    const takerId = 'takerId'
    const requestId = 'abc1234'
    const acceptanceHash = 'acceptanceHash'
    const param = '{ "secret" : "SC5LFR4I5NEYXAWIPUD5C5NWLIK65BLG2DYRWHIBP7JMVQ3D3BIUU46J", "requestId" : "abc1234", "timeStamp": "2019-07-23T15:28:56.782Z", "adjudicationIndex" : 0, "favor" : "seller", "justification" : "for the fact" }'
    const rulings = new Map()
    const buyerMessage = { "body": { } }
    const sellerMessage = { "body": { } }
    const buyerSignedMessage = {}
    const sellerSignedMessage = {}
    const buyerEncryptedMessage = {}
    const sellerEncryptedMessage = {}

    consumerPeer.buildMessage.mockReturnValueOnce(buyerMessage).mockReturnValueOnce(sellerMessage)
    encrypt.signMessage.mockReturnValueOnce(buyerSignedMessage).mockReturnValueOnce(sellerSignedMessage)
    encrypt.encryptMessage.mockReturnValueOnce(buyerEncryptedMessage).mockReturnValueOnce(sellerEncryptedMessage)

    const mockAgreement = {}
    const adjudication = {
        "body": {
            "agreement": mockAgreement
        }
    }
    const adjudicationsForProposals = [adjudication]

    const adjudications = new Map()
    adjudications.set('abc1234', adjudicationsForProposals)

    const transaction = {}
    chain.createFavorSellerTransaction.mockReturnValue(transaction)

    agreement.pullValuesFromAgreement.mockReturnValue(
        {
            buyerMeshKey,
            sellerMeshKey,
            buyerStellarKey,
            sellerStellarKey,
            escrowStellarKey,
            nativeAmount,
            challengeStake,
            makerId,
            takerId,
            requestId,
            acceptanceHash
        }
    )

    //Action
    await processRuling(param, adjudications, rulings, keys)

    //Assert
    expect(agreement.pullValuesFromAgreement).toBeCalled()
    expect(agreement.pullValuesFromAgreement.mock.calls[0][0]).toBe(mockAgreement)

    expect(consumerPeer.buildMessage).toBeCalled()
    expect(consumerPeer.buildMessage.mock.calls[0][3]).toEqual(buyerMeshKey)
    expect(consumerPeer.buildMessage.mock.calls[1][3]).toEqual(sellerMeshKey)

    expect(encrypt.signMessage).toBeCalled()
    expect(encrypt.signMessage.mock.calls[0][0]).toBe(buyerMessage)
    expect(encrypt.signMessage.mock.calls[1][0]).toBe(sellerMessage)

    expect(sellerMessage.body.transaction).toBe(transaction)
    expect(buyerMessage.body.transaction).toBe(undefined)

    expect(encrypt.encryptMessage).toBeCalled()
    expect(encrypt.encryptMessage.mock.calls[0][0]).toBe(buyerSignedMessage)
    expect(encrypt.encryptMessage.mock.calls[1][0]).toBe(sellerSignedMessage)

    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toMatch('ruling')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toBe(buyerEncryptedMessage)

    expect(consumerPeer.sendMessage.mock.calls[1][0]).toMatch('ruling')
    expect(consumerPeer.sendMessage.mock.calls[1][1]).toBe(sellerEncryptedMessage)
})