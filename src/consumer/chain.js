const stellar = require('stellar-sdk')
const fetch = require('node-fetch')


const initiateSettlement = async (secret, challengeStake, nativeAmount) => {
    const server = new stellar.Server('https://horizon-testnet.stellar.org');
    stellar.Network.useTestNetwork()

    const pair = stellar.Keypair.fromSecret(secret)
    const escrowPair = stellar.Keypair.random()
    let account = undefined

    try {
        account = await server.loadAccount(pair.publicKey())
    } catch (e) {
        console.log('unable to load account: ' + e)
        return
    }

    const txOptions = {
        fee: await server.fetchBaseFee()
    }

    const total = challengeStake + nativeAmount

    const escrowAccountConfig = {
        destination: escrowPair.publicKey(),
        startingBalance: total.toString()
    }

    let transaction = new stellar.TransactionBuilder(account, txOptions)
        .addOperation(stellar.Operation.createAccount(escrowAccountConfig))
        .setTimeout(stellar.TimeoutInfinite)
        .build()

    transaction.sign(pair)

    await server.submitTransaction(transaction)
}

const transactionHistory = async (accountId) => {
    const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${accountId}/transactions`)
    const responseJson = await response.json()
    return responseJson._embedded.records
}

module.exports = { initiateSettlement, transactionHistory }