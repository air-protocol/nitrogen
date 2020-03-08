const stellar = require('stellar-sdk')
const fetch = require('node-fetch')
const logger = require('../clientLogging')
const hostConfiguration = require('../../config/config')
const axios = require('axios');
const crypto = require('crypto')

const override =  false
const BnbApiClient = require('@binance-chain/javascript-sdk');

const asset = 'BNB'; // asset string
const amount = 1.123; // amount float
const addressTo = 'tbnb1hgm0p7khfk85zpz5v0j8wnej3a90w709zzlffd'; // addressTo string
const message = 'A note to you'; // memo string
const api = 'https://testnet-dex.binance.org/'; /// api string
const rawTransactionMultiplier = 100000000

const platformFees = 1

const initEscrow = async (requestId, keys) => {
    // var current_date = (new Date()).valueOf().toString();
    // var random = Math.random().toString();
    // crypto.createHash('sha1').update(current_date + random).digest('hex');
    let hashedPublic = crypto.createHash('sha256').update(keys.publicKey.toString('hex')).digest('hex').substring(0, 10)
    let hashedPrivate = crypto.createHash('sha256').update(keys.privateKey.toString('hex')).digest('hex').substring(0, 10)

    let info = false
    let data = ''
    try {
        data = await axios.post('http://'+hostConfiguration.tssIP+":"+hostConfiguration.tssPort+'/init', {
        home: hashedPublic,
        vault: requestId, //transactionID
        moniker:  hashedPublic, //meshPublicKey
        password: hashedPrivate//, //meshPrivateKey?
        //override: override
      })
    } catch (error) {
      console.error(error)
    }
    if (data !== ""){
      info = true
    }
    return info
}

const createChannel = async(expiration)=>{
    let channelId = "DEADBEEF"
    let data = ""
    try {

      data = await axios.post('http://'+hostConfiguration.tssIP+":"+hostConfiguration.tssPort+'/channel', {
          expiration: expiration
      }).then((response) => {
        //console.log(response.data.channelId);
        channelId = response.data.channelId
      })
    } catch (error) {
      console.error(error)
    }
    //console.log(channelId)
    return channelId

}
//
const tssKeyGen = async (requestId, partyNumber, channelPass, channelId, threshold, keys) => {
  let escrowAddress = ""
  let hashedPublic = crypto.createHash('sha256').update(keys.publicKey.toString('hex')).digest('hex').substring(0, 10)
  let hashedPrivate = crypto.createHash('sha256').update(keys.privateKey.toString('hex')).digest('hex').substring(0, 10)
  let data = ''


  try {

    data = await axios.post('http://'+hostConfiguration.tssIP+":"+hostConfiguration.tssPort+'/keygen', {
      home: hashedPublic,
      vault: requestId,
      moniker:  hashedPublic,
      password: hashedPrivate,
      parties: partyNumber,
      threshold: threshold,
      channelId: channelId,
      channelPass: channelPass
    }).then((response) => {
      //console.log(response.data.address)
      escrowAddress = response.data.address
    })
  } catch (error) {
    console.error(error)
  }
  return escrowAddress
}

const createEscrow = async (server, buyerPair, challengeStake, nativeAmount) => {
    //Covers minimum balance and operations costs.  Balance returned to buyer during merge.

    return null
}

const configureEscrow = async (bnbClient, buyer, escrow, challengeStake, nativeAmount) => {
  const baseAmount = 0.1
  const total = challengeStake + nativeAmount + baseAmount + platformFees
  const httpClient = axios.create({ baseURL: api });
  const sequenceURL = `${api}api/v1/account/${buyer}/sequence`;

  httpClient
    .get(sequenceURL)
    .then((res) => {
        const sequence = res.data.sequence || 0
        return bnbClient.transfer(buyer, escrow, total, asset, message, sequence)
    })
    .then((result) => {
        console.log(result);
        if (result.status === 200) {
          console.log('success', result.result[0].hash+"\n");
        } else {
          console.error('error', result);
        }
    })
    .catch((error) => {
      console.error('error', error);
    });
}

const viewEscrow = async (accountId) => {

    const httpClient = axios.create({ baseURL: api });
    const accountURL = `${api}api/v1/account/${accountId}`;
    let data = ""
    httpClient
      .get(accountURL)
      .then((res) =>{
          console.log(accountURL+"\n")
          console.log (JSON.stringify(res.data)+"\n")
          const fData =  {
            account_id: res.data.address,
            sequence: res.data.sequence,
            balances: res.data.balances,
            signers: {"signers": "TSS"}
          }
          return fData
      })
      .catch((error) => {
        console.error('error', error);
      });
}

const initiateSettlement = async (secret, sellerKey, juryKey, challengeStake, nativeAmount, proposal) => {

    const bnbClient = new BnbApiClient(api);

    bnbClient.chooseNetwork("testnet"); // or this can be "mainnet
    bnbClient.setPrivateKey(secret);
    bnbClient.initChain();

    const buyer = bnbClient.getClientKeyAddress(); // sender address string (e.g. bnb1...)

    proposal.informs.forEach((inform) => {
        console.log(JSON.stringify(inform))
    })

    let escrow = proposal.informs[0].body.data.escrow

    if(escrow == undefined || escrow === ""){
      console.log("escrow not set\n")
    }

    const escrowPair = { //we use this structure to match stellar keypair return
      publicKey : function(){
        return escrow
      }
    }

    await configureEscrow(bnbClient, buyer, escrow, challengeStake, nativeAmount)

    return escrowPair
}

const createBuyerDisburseTransaction = async (secret, sellerKey, challengeStake, nativeAmount, escrowKey, proposal, keys) => {
    const platformKey = hostConfiguration.platformKey

    const bnbClient = new BnbApiClient(api);

    bnbClient.chooseNetwork("testnet"); // or this can be "mainnet
    bnbClient.setPrivateKey(secret);
    bnbClient.initChain();

    const buyer = bnbClient.getClientKeyAddress(); // sender address string (e.g. bnb1...)

    const paymentToSeller = {
        type: 'Send',
        destination: sellerKey,
        asset: 'BNB',
        amount: (nativeAmount*rawTransactionMultiplier).toString()
    }

    const paymentToPlatform = {
        type: 'Send',
        destination: platformKey,
        asset: 'BNB',
        amount: (platformFees*rawTransactionMultiplier).toString()
    }

    const paymentToBuyer = {
        type: 'Send',
        destination: buyer,
        asset: 'BNB',
        amount: (platformFees*rawTransactionMultiplier).toString()
    }

    const  txData = [paymentToSeller, paymentToPlatform, paymentToBuyer]

    requestId = proposal.informs[0].body.requestId
    channelPass = proposal.informs[0].body.data.password
    channelId = proposal.informs[0].body.data.channel
    tssSend(requestId, channelPass, channelId, keys, txData)

    return txData
}

const tssSend = async (requestId, channelPass, channelId, keys, txData) => {

  let escrowAddress = ""
  let hashedPublic = crypto.createHash('sha256').update(keys.publicKey.toString('hex')).digest('hex').substring(0, 10)
  let hashedPrivate = crypto.createHash('sha256').update(keys.privateKey.toString('hex')).digest('hex').substring(0, 10)
  let data = ''


  try {

    await axios.post('http://'+hostConfiguration.tssIP+":"+hostConfiguration.tssPort+'/sign3', {
      vault: requestId,
      moniker:  hashedPublic,
      password: hashedPrivate,
      channelId: channelId,
      channelPassword: channelPass,
      to1: txData[0].destination,
      asset1: txData[0].asset,
      amount1: txData[0].amount,
      to2: txData[1].destination,
      asset2: txData[1].asset,
      amount2: txData[1].amount,
      to3: txData[2].destination,
      asset3: txData[2].asset,
      amount3: txData[2].amount,
    }).then((response) => {
      console.log("Success \n")
      data = response
    })
  } catch (error) {
    console.error(error)
  }

  return data
}

const submitDisburseTransaction = async (secret, txData, proposal, keys) => {

    requestId = proposal.informs[0].body.requestId
    channelPass = proposal.informs[0].body.data.password
    channelId = proposal.informs[0].body.data.channel

    try {
        tssSend(requestId, channelPass, channelId, keys, txData)
    } catch (e) {
        throw new Error('unable to disburse funds: ' + JSON.stringify(e.response.data.extras))
    }
}

const transactionHistory = async (accountId) => {

    const httpClient = axios.create({ baseURL: api });
    const sequenceURL = `${api}api/v1/account/${buyer}/sequence`;
    let data = ""
    httpClient
      .get(sequenceURL)
      .then((res) => {
          data = res
      })
      .catch((error) => {
        console.error('error', error);
      });
    let fData = []
    data.tx.forEach((item) => {
      fData.push(
        {
          source_account: item.fromAddr,
          source_account_sequence: item.sequence,
          created_at: item.timeStamp,
          to_account: item.toAddr,
          asset: item.txAsset,
          value: item.value,
          memo: item.memo,
          successful: item.confirmBlocks,
          fee_paid: item.txFee,
          ledger: item.sequence
        }
      )
    })

    return fData
}

const createFavorBuyerTransaction = async (secret, escrowStellarKey, buyerStellarKey, challengeStake, agreement, keys) => {
//ruling in favor of buyer - pay challenge fees to jury, platform, and merge escrow to buyers account
    const platformKey = hostConfiguration.platformKey
    const bnbClient = new BnbApiClient(api);

    bnbClient.chooseNetwork("testnet"); // or this can be "mainnet
    bnbClient.setPrivateKey(secret);
    bnbClient.initChain();
    console.log(JSON.stringify(agreement))

    let  nativeAmount = agreement.body.offerAmount

    const juryPair = bnbClient.getClientKeyAddress();

    const paymentToJury = {
        type: 'Send',
        destination: juryPair,
        asset: 'BNB',
        amount: (challengeStake*rawTransactionMultiplier).toString()
    }

    const paymentToPlatform = {
        type: 'Send',
        destination: platformKey,
        asset: 'BNB',
        amount: (platformFees*rawTransactionMultiplier).toString()
    }

    const reverseToBuyer = {
        type: 'Send',
        destination: buyerStellarKey,
        asset: 'BNB',
        amount: (nativeAmount*rawTransactionMultiplier).toString()
    }

    const  txData = [paymentToJury, paymentToPlatform, reverseToBuyer]

    requestId = agreement.next.informs[0].body.requestId
    channelPass = agreement.next.informs[0].body.data.password
    channelId = agreement.next.informs[0].body.data.channel
    tssSend(requestId, channelPass, channelId, keys, txData)

    return txData
}

const createFavorSellerTransaction = async (secret, escrowStellarKey, buyerStellarKey, sellerStellarKey, challengeStake, nativeAmount, agreement, keys) => {
//ruling in favor of seller - pay challenge fees to jury, offerAmount to seller, and merge escrow to buyers account
    const platformKey = hostConfiguration.platformKey
    const bnbClient = new BnbApiClient(api);

    bnbClient.chooseNetwork("testnet"); // or this can be "mainnet
    bnbClient.setPrivateKey(secret);
    bnbClient.initChain();

    const juryPair = bnbClient.getClientKeyAddress();

    const paymentToJury = {
        type: 'Send',
        destination: juryPair,
        asset: 'BNB',
        amount: (challengeStake*rawTransactionMultiplier).toString()
    }

    const paymentToPlatform = {
        type: 'Send',
        destination: platformKey,
        asset: 'BNB',
        amount: (platformFees*rawTransactionMultiplier).toString()
    }

    const paymentToSeller = {
        type: 'Send',
        destination: sellerStellarKey,
        asset: 'BNB',
        amount: (nativeAmount*rawTransactionMultiplier).toString()
    }

    const  txData = [paymentToJury, paymentToPlatform, paymentToSeller]

    requestId = agreement.next.informs[0].body.requestId
    channelPass = agreement.next.informs[0].body.data.password
    channelId = agreement.next.informs[0].body.data.channel
    tssSend(requestId, channelPass, channelId, keys, txData)

    return txData
}

const viewTransactionOperations = async (transactions) => {
    return transactions
}


module.exports = { tssKeyGen, createChannel, initEscrow, initiateSettlement, transactionHistory, viewEscrow, createBuyerDisburseTransaction, submitDisburseTransaction, createFavorBuyerTransaction, createFavorSellerTransaction, viewTransactionOperations }
