const fetch = require('node-fetch')
const logger = require('../clientLogging')
const hostConfiguration = require('../../config/config')
const Kit = require('@celo/contractkit')
const { CeloContract } = require('@celo/contractkit')
const path = require('path')

const MultiSigWallet = require('./celo/contracts/MultiSigWallet.json')
const NETWORK = 'https://alfajores-forno.celo-testnet.org'

const multiplier = 1000000000000 //Multiplier to equal amount to 1 Unit
const platformFees = 0.001 //Base platform fee (requires multiplier)

const createEscrow = async (kit, web3, buyerAddress, sellerAddress, juryAddress) => {
    const data = MultiSigWallet.bytecode + web3.eth.abi.encodeParameters(['address[]', 'uint'],[[buyerAddress, sellerAddress, juryAddress], 2]).slice(2)

    let tx = await kit.sendTransaction({
        from: buyerAddress,
        data: data
    })

    const receipt = await tx.waitReceipt()
    return receipt
}

const configureEscrow = async (kit, buyerAddress, challengeStake, nativeAmount, escrowAddress) => {
    let deposit = await kit.sendTransaction({
        from: buyerAddress,
        to: escrowAddress,
        value: (nativeAmount + challengeStake + platformFees)*multiplier
    })
}

const viewEscrow = async (accountId) => {
    //display escrow
}

const initiateSettlement = async (secret, sellerAddress, juryAddress, challengeStake, nativeAmount, proposal) => {
    // Connect to the desired network
    const kit = Kit.newKit(NETWORK)
    const web3 = kit.web3
    let buyerAccount = web3.eth.accounts.privateKeyToAccount(secret)
    buyerAddress = buyerAccount.address
    kit.addAccount(buyerAccount.privateKey)

    const escrowReceipt = await createEscrow(kit, web3, buyerAddress, sellerAddress, juryAddress)
    const escrowAddress = escrowReceipt.contractAddress

    await configureEscrow(kit, buyerAddress, challengeStake, nativeAmount, escrowAddress)
    const escrowPair = { //we use this structure to match previous keypair struct return
      publicKey : function(){
        return escrowAddress
      }
    }
    return escrowPair
}

const approvalEscrow = async (web3, sender, escrowAddress, txs) => {
  const simpleContract = new web3.eth.Contract(MultiSigWallet.abi, escrowAddress)
  //const sleep = require('util').promisify(setTimeout)

  let txs_post = []

  let tx
  for (i = 0; i < txs.length; i++) {
    let tx = txs[i]
    tx.data = await simpleContract.methods.submitTransaction(tx.destination, tx.amount, '0x0').send({from: sender})
  }

  txs_post = txs
  return txs_post
}

const createBuyerDisburseTransaction = async (secret, sellerKey, challengeStake, nativeAmount, escrowKey) => {
    const platformKey = hostConfiguration.platformKey
    const kit = Kit.newKit(NETWORK)
    const web3 = kit.web3
    let buyerAccount = web3.eth.accounts.privateKeyToAccount(secret)
    buyerAddress = buyerAccount.address
    kit.addAccount(buyerAccount.privateKey)
    console.log(`Account address: ${buyerAccount.address}`)

    let txs = [
      { //pay seller
        escrow: escrowKey,
        destination: sellerKey,
        asset: 'native',
        amount: (nativeAmount+challengeStake)*multiplier,
        data: ''
      },
      { //platform fee
        escrow: escrowKey,
        destination: platformKey,
        asset: 'native',
        amount: platformFees*multiplier,
        data: ''
      }
    ]
    let txs_post = await approvalEscrow(web3, buyerAddress, escrowKey, txs)
    return txs_post
}

const submitDisburseTransaction = async (secret, txs) => {
      const kit = Kit.newKit(NETWORK)
      const web3 = kit.web3
      let sellerAccount = web3.eth.accounts.privateKeyToAccount(secret)
      sellerAddress = sellerAccount.address
      kit.addAccount(sellerAccount.privateKey)
      console.log(`Account address: ${sellerAccount.address}`)
      console.debug(txs)
      const simpleContract = new web3.eth.Contract(MultiSigWallet.abi, txs[0].escrow)

      let tx
      for (i = 0; i < txs.length; i++) {
          tx = txs[i]
          let transactionId = tx.data.events.Submission.returnValues.transactionId
          console.log("ID "+transactionId)
          const confirm = await simpleContract.methods.confirmTransaction(transactionId).send({from: sellerAddress})
          console.log(confirm)
      }
}

const transactionHistory = async (accountId) => {
    //get account transaction history
}

const createFavorBuyerTransaction = async (secret, escrowKey, buyerKey, challengeStake, agreement, keys) => {
//ruling in favor of buyer - pay challenge fees to jury, platform, and merge escrow to buyers account
    const platformKey = hostConfiguration.platformKey
    const kit = Kit.newKit(NETWORK)
    const web3 = kit.web3
    let juryAccount = web3.eth.accounts.privateKeyToAccount(secret)
    juryAddress = juryAccount.address
    kit.addAccount(juryAccount.privateKey)
    console.log(`Account address: ${juryAccount.address}`)
    const nativeAmount = agreement.body.offerAmount

    const txs = [
      {
        escrow: escrowKey,
        destination: juryAddress,
        asset: 'native',
        amount: challengeStake*multiplier,
        data: ''
      },
      {
        escrow: escrowKey,
        destination: platformKey,
        asset: 'native',
        amount: platformFees*multiplier,
        data: ''
      },
      {
        escrow: escrowKey,
        destination: buyerKey,
        asset: 'native',
        amount: nativeAmount*multiplier,
        data: ''
      }
    ]

    let txs_post = await approvalEscrow(web3, juryAddress, escrowKey, txs)

    return txs_post
}

const createFavorSellerTransaction = async (secret, escrowKey, buyerKey, sellerKey, challengeStake, nativeAmount) => {
//ruling in favor of seller - pay challenge fees to jury, offerAmount to seller, and merge escrow to buyers account
  const platformKey = hostConfiguration.platformKey
  const kit = Kit.newKit(NETWORK)
  const web3 = kit.web3
  let juryAccount = web3.eth.accounts.privateKeyToAccount(secret)
  juryAddress = juryAccount.address
  kit.addAccount(juryAccount.privateKey)
  console.log(`Account address: ${juryAccount.address}`)

  const txs = [
    { //paymentToJury
      escrow: escrowKey,
      destination: juryAddress,
      asset: 'native',
      amount: challengeStake*multiplier,
      data: ''
    },
    {
      escrow: escrowKey,
      destination: platformKey,
      asset: 'native',
      amount: platformFees*multiplier,
      data: ''
    },
    {
      escrow: escrowKey,
      destination: sellerKey,
      asset: 'native',
      amount: nativeAmount*multiplier,
      data: ''
    }
  ]
  let txs_post = await approvalEscrow(web3, juryAddress, escrowKey, txs)

  return txs_post
}

const viewTransactionOperations = async (tx) => {
    return tx
}

module.exports = { initiateSettlement, transactionHistory, viewEscrow, createBuyerDisburseTransaction, submitDisburseTransaction, createFavorBuyerTransaction, createFavorSellerTransaction, viewTransactionOperations }
