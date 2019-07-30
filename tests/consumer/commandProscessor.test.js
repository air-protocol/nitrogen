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
    processDisburse } = require('../../src/consumer/commandProcessor')

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
    agreement.validateAgreement.mockClear()
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
    expect(agreement.validateAgreement.mock.calls[0][0]).toEqual(mockAgreement)
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

test('ProcessProposal does', async () => {
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
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toEqual(mockSignedMessage)
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
    expect(signatureRequiredBody.transaction).toEqual(mockTransaction)

    expect(encrypt.signMessage).toBeCalled
    expect(encrypt.signMessage.mock.calls[0][0]).toEqual(mockSignatureRequiredMessage)
    expect(encrypt.signMessage.mock.calls[0][1]).toEqual(keys)

    expect(encrypt.encryptMessage).toBeCalled
    expect(encrypt.encryptMessage.mock.calls[0][0]).toEqual(mockSignedMessage)
    expect(encrypt.encryptMessage.mock.calls[0][1]).toEqual(takerMeshPublic)

    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toEqual('signatureRequired')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toEqual(mockEncryptedMessage)
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
    expect(signatureRequiredBody.transaction).toEqual(mockTransaction)

    expect(encrypt.signMessage).toBeCalled
    expect(encrypt.signMessage.mock.calls[0][0]).toEqual(mockSignatureRequiredMessage)
    expect(encrypt.signMessage.mock.calls[0][1]).toEqual(keys)

    expect(encrypt.encryptMessage).toBeCalled
    expect(encrypt.encryptMessage.mock.calls[0][0]).toEqual(mockSignedMessage)
    expect(encrypt.encryptMessage.mock.calls[0][1]).toEqual(makerMeshPublic)

    expect(consumerPeer.sendMessage).toBeCalled()
    expect(consumerPeer.sendMessage.mock.calls[0][0]).toEqual('signatureRequired')
    expect(consumerPeer.sendMessage.mock.calls[0][1]).toEqual(mockEncryptedMessage)
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
    expect(chain.submitDisburseTransaction.mock.calls[0][1]).toEqual(mockTransaction)
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
        expect(e.message).toEqual('transaction is in dispute')
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
        expect(e.message).toEqual('jury did not rule in your favor')
    }

    //Assert
    expect(chain.submitDisburseTransaction).not.toBeCalled()
})