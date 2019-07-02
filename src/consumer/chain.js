// TODO add additional lumens to escrow to cover configuration fees 1 per signature


const stellar = require('stellar-sdk')
const fetch = require('node-fetch')


const initiateSettlement = async (secret, sellerKey, juryKey, challengeStake, nativeAmount) => {
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

    let createEscrowTransaction = new stellar.TransactionBuilder(account, txOptions)
        .addOperation(stellar.Operation.createAccount(escrowAccountConfig))
        .setTimeout(stellar.TimeoutInfinite)
        .build()

    createEscrowTransaction.sign(pair)
    await server.submitTransaction(createEscrowTransaction)

    const escrowAccount = await server.loadAccount(escrowPair.publicKey())

    const thresholds = {
        masterWeight: 0, // Escrow account has no rights
        lowThreshold: 1,
        medThreshold: 2, // payment threshold
        highThreshold: 2,
    }

    const buyer = {
        signer: {
            ed25519PublicKey: pair.publicKey(),
            weight: 1,
        }
    }

    const seller = {
        signer: {
            ed25519PublicKey: sellerKey,
            weight: 1,
        }
    }

    const jury = {
        signer: {
            ed25519PublicKey: juryKey,
            weight: 1,
        }
    }

    let configureEscrowTransaction = new stellar.TransactionBuilder(escrowAccount, txOptions)
        .addOperation(stellar.Operation.setOptions(thresholds))
        .addOperation(stellar.Operation.setOptions(buyer))
        .addOperation(stellar.Operation.setOptions(seller))
        .addOperation(stellar.Operation.setOptions(jury))
        .setTimeout(stellar.TimeoutInfinite)
        .build()

    configureEscrowTransaction.sign(escrowPair)
    await server.submitTransaction(configureEscrowTransaction)
}

const transactionHistory = async (accountId) => {
    const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${accountId}/transactions`)
    const responseJson = await response.json()
    return responseJson._embedded.records
}

module.exports = { initiateSettlement, transactionHistory }