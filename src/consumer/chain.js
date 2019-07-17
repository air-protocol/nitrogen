const stellar = require('stellar-sdk')
const fetch = require('node-fetch')
const logger = require('./clientLogging')
const hostConfiguration = require('../config/config')

//TODO remove for production
stellar.Network.useTestNetwork()

const platformFees = 10

const createEscrow = async (server, buyerPair, challengeStake, nativeAmount) => {
    //Covers minimum balance and operations costs.  Balance returned to buyer during merge.
    const baseAmount = 2 

    let buyerAccount
    try {
        buyerAccount = await server.loadAccount(buyerPair.publicKey())
    } catch (e) {
        logger.error('unable to load buyer account: ' + e)
        throw (e)
    }

    const escrowPair = stellar.Keypair.random()
    const txOptions = {
        fee: await server.fetchBaseFee()
    }

    const total = challengeStake + nativeAmount + baseAmount + platformFees

    const escrowAccountConfig = {
        destination: escrowPair.publicKey(),
        startingBalance: total.toString()
    }

    let createEscrowTransaction = new stellar.TransactionBuilder(buyerAccount, txOptions)
        .addOperation(stellar.Operation.createAccount(escrowAccountConfig))
        .setTimeout(stellar.TimeoutInfinite)
        .build()

    createEscrowTransaction.sign(buyerPair)
    await server.submitTransaction(createEscrowTransaction)

    return escrowPair
}

const configureEscrow = async (server, buyerPair, escrowPair, sellerKey, juryKey) => {
    let escrowAccount
    try {
        escrowAccount = await server.loadAccount(escrowPair.publicKey())
    } catch (e) {
        logger.error('unable to load escrow account: ' + e)
        throw (e)
    }

    const thresholds = {
        masterWeight: 0, // Escrow account has no rights
        lowThreshold: 1,
        medThreshold: 2, // payment threshold
        highThreshold: 2,
    }

    const buyer = {
        signer: {
            ed25519PublicKey: buyerPair.publicKey(),
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

    const txOptions = {
        fee: await server.fetchBaseFee()
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

const viewEscrow = async (accountId) => {
    const server = new stellar.Server('https://horizon-testnet.stellar.org')
    return server.accounts().accountId(accountId).call()
}

const initiateSettlement = async (secret, sellerKey, juryKey, challengeStake, nativeAmount) => {
    const server = new stellar.Server('https://horizon-testnet.stellar.org')

    const buyerPair = stellar.Keypair.fromSecret(secret)

    const escrowPair = await createEscrow(server, buyerPair, challengeStake, nativeAmount)

    await configureEscrow(server, buyerPair, escrowPair, sellerKey, juryKey)
    return escrowPair
}

const createBuyerDisburseTransaction = async (secret, sellerKey, challengeStake, nativeAmount, escrowKey) => {
    const server = new stellar.Server('https://horizon-testnet.stellar.org')
    const escrowAccount = await server.loadAccount(escrowKey)
    const platformKey = hostConfiguration.platformKey

    const buyerPair = stellar.Keypair.fromSecret(secret)

    const paymentToSeller = {
        destination: sellerKey,
        asset: stellar.Asset.native(),
        amount: nativeAmount.toString()
    }

    const paymentToPlatform = {
        destination: platformKey,
        asset: stellar.Asset.native(),
        amount: platformFees.toString()
    }

    const mergeToBuyer = {
        destination: buyerPair.publicKey()
    }

    //TODO platform

    const txOptions = {
        fee: await server.fetchBaseFee()
    }

    let transaction = new stellar.TransactionBuilder(escrowAccount, txOptions)
        .addOperation(stellar.Operation.payment(paymentToSeller))
        .addOperation(stellar.Operation.payment(paymentToPlatform))
        .addOperation(stellar.Operation.accountMerge(mergeToBuyer))
        .setTimeout(stellar.TimeoutInfinite)
        .build()

    transaction.sign(buyerPair)

    return transaction.toEnvelope().toXDR('base64')
}

const submitDisburseTransaction = async (secret, xdrTransaction) => {
    const server = new stellar.Server('https://horizon-testnet.stellar.org')

    const buyerPair = stellar.Keypair.fromSecret(secret)

    const xdrBuffer = Buffer.from(xdrTransaction, 'base64')
    const envelope = stellar.xdr.TransactionEnvelope.fromXDR(xdrBuffer, 'base64')
    const transaction = new stellar.Transaction(envelope)

    transaction.sign(buyerPair)
    try {
        const transactionRecord = await server.submitTransaction(transaction)
    } catch (e) {
        throw new Error('unable to disburse funds: ' + e.response.data.extras)
    }
}

const transactionHistory = async (accountId) => {
    const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${accountId}/transactions`)
    const responseJson = await response.json()
    return responseJson._embedded.records
}

module.exports = { initiateSettlement, transactionHistory, viewEscrow, createBuyerDisburseTransaction, submitDisburseTransaction }