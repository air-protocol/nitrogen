
jest.mock('stellar-sdk')
const stellar = require('stellar-sdk')
const { TransactionBuilder, Operation, Network } = jest.requireActual('stellar-sdk')
stellar.TransactionBuilder = TransactionBuilder
stellar.Operation = Operation
stellar.Network = Network

const { initiateSettlement } = require('../../src/consumer/chain')

const account = {
    sequenceNumber: () => 1,
    accountId: () => 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3',
    incrementSequenceNumber: () => { }
}

const mockLoadAccount = jest.fn(function (accountId) {
    return new Promise((resolve, reject) => {
        resolve(account)
    })
})

const mockSubmitTransaction = jest.fn(function (transaction) {
    return new Promise((resolve, reject) => {
        resolve({})
    })
})

const mockFetchBaseFee = jest.fn(function () {
    return new Promise((resolve, reject) => {
        resolve(2)
    })
})

stellar.Server.mockImplementation((url) => {
    return { loadAccount: mockLoadAccount, submitTransaction: mockSubmitTransaction, fetchBaseFee: mockFetchBaseFee }
})

afterEach(() => {
    stellar.Server.mockClear()
})

test('initiateSettlement pulls account', async () => {
    //Assemble
    const buyerSecret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const buyerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const escrowPublic = 'GAQK62EZBRINSGVCWRKOTYTK3JOLKODYLI223OMPOYOHPOXHW66XG3KQ'
    const juryPublic = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const challengeStake = 10
    const nativeAmount = 200
    const accountPair = new stellar.Keypair()
    accountPair.publicKey = () => buyerPublic
    const escrowPair = new stellar.Keypair()
    escrowPair.publicKey = () => escrowPublic
    stellar.Keypair.fromSecret.mockReturnValue(accountPair)
    stellar.Keypair.random.mockReturnValue(escrowPair)

    //Action
    await initiateSettlement(buyerSecret, sellerPublic, juryPublic, challengeStake, nativeAmount)

    //Assert
    expect(stellar.Keypair.fromSecret).toBeCalledWith(buyerSecret)
    expect(mockLoadAccount).toBeCalledWith(accountPair.publicKey())
})

test('initiateSettlement creates funded escrow', async () => {
    //Assemble
    const buyerSecret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const buyerPublic = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const escrowPublic = 'GAQK62EZBRINSGVCWRKOTYTK3JOLKODYLI223OMPOYOHPOXHW66XG3KQ'
    const juryPublic = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    const sellerPublic = 'GBRI4IPIXK63UJ2CLRWNPNCGDE43CAPIZ5B3VMWG3M4DQIWZPRQAGAHV'
    const challengeStake = 10
    const nativeAmount = 200
    const accountPair = new stellar.Keypair()
    accountPair.publicKey = () => buyerPublic
    const escrowPair = new stellar.Keypair()
    escrowPair.publicKey = () => escrowPublic
    stellar.Keypair.fromSecret.mockReturnValue(accountPair)
    stellar.Keypair.random.mockReturnValue(escrowPair)

    //Action
    await initiateSettlement(buyerSecret, sellerPublic, juryPublic, challengeStake, nativeAmount)

    //Assert
    const transaction = mockSubmitTransaction.mock.calls[0][0]
    expect(transaction.operations[0].type).toEqual('createAccount')
    expect(transaction.operations[0].destination).toEqual('GAQK62EZBRINSGVCWRKOTYTK3JOLKODYLI223OMPOYOHPOXHW66XG3KQ')

    //Challenge stake is 10
    //Native amount paid is 200
    expect(transaction.operations[0].startingBalance).toEqual('210.0000000')
})