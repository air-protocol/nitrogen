
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
    //stellar.Server.mockClear()
})

test('initiateSettlement pulls account', async () => {
    //Assemble
    const secret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const challengeStake = 10
    const nativeAmount = 200
    const accountPair = new stellar.Keypair()
    accountPair.publicKey = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const escrowPair = new stellar.Keypair()
    escrowPair.publicKey = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    stellar.Keypair.fromSecret.mockReturnValue(accountPair)
    stellar.Keypair.random.mockReturnValue(escrowPair)

    //Action
    await initiateSettlement(secret, challengeStake, nativeAmount)

    //Assert
    expect(stellar.Keypair.fromSecret).toBeCalledWith(secret)
    expect(mockLoadAccount).toBeCalledWith(accountPair.publicKey)
})

test('initiateSettlement creates funded escrow', async () => {
    //Assemble
    const secret = 'SAQEACFGGCOY46GR5ZNVNGX53COWMEOTXEFZSM5RNBIJ4LPKHIFIDWUH'
    const challengeStake = 10
    const nativeAmount = 200
    const accountPair = new stellar.Keypair()
    accountPair.publicKey = 'GAMCL7NNPCQQRUPZTFCSYGU36E7HVS53IWWHFPHMHD26HXIJEKKMM7Y3'
    const escrowPair = new stellar.Keypair()
    escrowPair.publicKey = 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME'
    stellar.Keypair.fromSecret.mockReturnValue(accountPair)
    stellar.Keypair.random.mockReturnValue(escrowPair)

    //Action
    await initiateSettlement(secret, challengeStake, nativeAmount)

    //Assert
    const transaction = mockSubmitTransaction.mock.calls[0][0]
    expect(transaction.operations[0].type).toEqual('createAccount')
    expect(transaction.operations[0].destination).toEqual('GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME')

    //Base fee is mocked to 2
    //Challenge stake is 10
    //Native amount paid is 200
    expect(transaction.operations[0].startingBalance).toEqual('212.0000000')
})