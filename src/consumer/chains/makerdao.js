const fetch = require('node-fetch');
const Web3 = require('web3');
const util = require('util');
const Maker = require('@makerdao/dai');
const { McdPlugin } = require('@makerdao/dai-plugin-mcd');
const logger = require('../clientLogging');
const hostConfiguration = require('../../config/config');
const ProxyWallet = require('./makerdao/contracts/GnosisSafeProxy.json');
const SafeEscrow = require('./makerdao/contracts/GnosisSafe.json');
const ERC20 = require('./makerdao/contracts/ERC20.json');

const platformFees = 0.001; //Base platform fee
const safeTxTypehash = '0xbb8310d486368db6bd6f849402fdd73ad53d316b5a4b2644ad6efe0f941286d8';
const domainSeparatorTypehash = '0x035aff83d86937d35b32e04f0ddc6ff469290eef2f1b692d8a815c89404d4749';
let infuraURL = 'https://mainnet.infura.io/v3/'+hostConfiguration.infuraKey;
let DAIcontract = '0x6b175474e89094c44da98b954eedeac495271d0f';

if(hostConfiguration.dev)
{
    infuraURL = 'https://kovan.infura.io/v3/'+hostConfiguration.infuraKey;
    DAIcontract = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';
}

const createEscrow = async (
  maker,
  web3,
  buyerAddress,
  sellerAddress,
  juryAddress,
  secret
) => {

  //Create proxy contract pointing to master multisig contract
  const data =
    ProxyWallet.bytecode +
    web3.eth.abi
      .encodeParameters(
        ['address'],
        [hostConfiguration.masterMultisigContract]
      )
      .slice(2);

  const hexGasLimit = await web3.utils.toHex('300000').toString();
  const { fast } = await fetch('https://ethgasstation.info/api/ethgasAPI.json?api-key='+hostConfiguration.ethGasStationKey)
    .then(res => res.json())

  const gasPrice = fast*Math.pow(10,8);

  const tx = {
    data: data,
    from: buyerAddress,
    gasLimit: hexGasLimit,
    gas: hexGasLimit,
    gasPrice
  };

  // Sign the transaction
  let { rawTransaction } = await web3.eth.accounts.signTransaction(
    tx,
    secret
  );

  // Broadcast the transaction
  let proxyTransaction = await web3.eth.sendSignedTransaction(rawTransaction);

  //Make contract setup
  const simpleContract = await new web3.eth.Contract(
    SafeEscrow.abi,
    proxyTransaction.contractAddress
  );

  const nonce = await web3.eth.getTransactionCount(buyerAddress);
  const threshold = 2; 
  const to = '0x0000000000000000000000000000000000000000';
  const dataHex = '0x';
  const fallbackHandler = '0x0000000000000000000000000000000000000000';
  const paymentToken = '0x0000000000000000000000000000000000000000';
  const payment = 0;

  tx.nonce = '0x'+nonce.toString(16);
  tx.to = proxyTransaction.contractAddress;
  tx.data = await simpleContract.methods
    .setup([buyerAddress, sellerAddress, juryAddress], threshold, to, dataHex, fallbackHandler, paymentToken, 0, sellerAddress)
    .encodeABI();

  let signedTransaction = await web3.eth.accounts.signTransaction(
    tx,
    secret
  );

  let setupTransaction = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
  
  return proxyTransaction;
};

const configureEscrow = async (
  maker,
  buyerAddress,
  challengeStake,
  nativeAmount,
  escrowAddress
) => {
  try {
    const amount =
      (parseFloat(nativeAmount) +
        parseFloat(challengeStake) +
        parseFloat(platformFees));
    const dai = await maker.service('token').getToken('DAI');
    const tx = await dai.transfer(escrowAddress, amount);
  } catch (error) {
    throw new Error(error);
  }
};

const viewEscrow = async (accountId) => {
  //TODO: display escrow
};

const initiateSettlement = async (
  secret,
  sellerAddress,
  juryAddress,
  challengeStake,
  nativeAmount,
  proposal
) => {
  try {
    // Connect to the desired network
    const maker = await Maker.create('http', {
      url: infuraURL,
      privateKey: secret,
      plugins: [McdPlugin],
      web3: { statusTimerDelay: 15000000, pollingInterval: 15000000 },
    });

    const web3 = new Web3(infuraURL);

    let buyerAccount = web3.eth.accounts.privateKeyToAccount(secret);
    buyerAddress = buyerAccount.address;

    await maker.authenticate();

    const escrowReceipt = await createEscrow(
      maker,
      web3,
      buyerAddress,
      sellerAddress,
      juryAddress,
      secret
    );

    const escrowAddress = escrowReceipt.contractAddress;

    await configureEscrow(
      maker,
      buyerAddress,
      challengeStake,
      nativeAmount,
      escrowAddress
    );

    const escrowPair = {
      //we use this structure to match previous keypair struct return
      publicKey: function() {
        return escrowAddress;
      },
    };

    return escrowPair;
  } catch (e) {
    console.log(e);
    return {
      //we use this structure to match previous keypair struct return
      publicKey: null,
      message: e,
    };
  }
};

const approvalEscrow = async (web3, sender, escrowAddress, txs) => {

  try {
    const ERC20contract = await new web3.eth.Contract(
      ERC20.abi,
      DAIcontract
    );
  
    let txs_post = [];
    let tx;
    for (i = 0; i < txs.length; i++) {
      let tx = txs[i];
  
      const transferData = ERC20contract.methods
        .transfer(tx.destination, tx.amount)
        .encodeABI();
  
      const transferDataSolidity = web3.utils.soliditySha3(transferData);
      const value = 0;
      const operation = 0;
      const safeTxGas = 0;
      const baseGas = 0;
      const gasPrice = 0;
      const gasToken = '0x0000000000000000000000000000000000000000';
      const refundReceiver = '0x0000000000000000000000000000000000000000';
      const contractNonce = i;
  
      const data =
        web3.eth.abi
        .encodeParameters(
          ['bytes32', 'address', 'uint256', 'bytes32', 'uint', 'uint256', 'uint256', 'uint256', 'address', 'address', 'uint256'],
          [safeTxTypehash, DAIcontract, value, transferDataSolidity, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, contractNonce]
        )                                                                        
  
      const prevHash = web3.utils.keccak256(data);
      const extraBytes = '000000000000000000000000';
                                                                                                                                 
      const preDomainSeparator = domainSeparatorTypehash+extraBytes+escrowAddress.slice(2);
      const domainSeparator = web3.utils.keccak256(preDomainSeparator);
  
      const preTransactionHash = '0x19' + '01' + domainSeparator.slice(2) + prevHash.slice(2);
      const transactionHash = web3.utils.keccak256(preTransactionHash);
      
      let tempSignature = await web3.eth.accounts.sign(transactionHash, sender);
      tempSignature.v = (parseInt(tempSignature.v, 16) + parseInt(4, 16)).toString(16); //add 4 because it's required by contract
      const sign = tempSignature.r.slice(2)+tempSignature.s.slice(2)+tempSignature.v;
  
      txs[i].signature1 = sign;
    }
  
    txs_post = txs;
    return txs_post;
  } catch (e) {
    throw new Error(e)
  }
};

const createBuyerDisburseTransaction = async (
  secret,
  sellerKey,
  challengeStake,
  nativeAmount,
  escrowKey
) => {

  try {
    const platformKey = hostConfiguration.platformKey;

    const web3 = new Web3(infuraURL);
    let buyerAccount = web3.eth.accounts.privateKeyToAccount(secret);
    buyerAddress = buyerAccount.address;

    const sellerAmount = web3.utils.toWei(
      (parseFloat(nativeAmount)).toString(),
      'ether'
    );
    const platformAmount = web3.utils.toWei(
      (parseFloat(platformFees)).toString(),
      'ether'
    );
    const juryAmount = web3.utils.toWei(
      (parseFloat(challengeStake)).toString(),
      'ether'
    );    

    const hexGasLimit = await web3.utils.toHex('500000').toString();
    const { fast } = await fetch('https://ethgasstation.info/api/ethgasAPI.json?api-key='+hostConfiguration.ethgasstationKey)
    .then(res => res.json())

    const gasPrice = fast*Math.pow(10,8);

    let txs = [
      {
        //return jury fee
        escrow: escrowKey,
        destination: buyerAddress,
        asset: 'native',
        amount: juryAmount,
        data: '',
        gasLimit: hexGasLimit,
        gas: hexGasLimit,
        gasPrice,
        to: escrowKey,
      },
      {
        //pay seller
        escrow: escrowKey,
        destination: sellerKey,
        asset: 'native',
        amount: sellerAmount,
        data: '',
        gasLimit: hexGasLimit,
        gas: hexGasLimit,
        gasPrice,
        to: escrowKey,
      },
      {
        //platform fee
        escrow: escrowKey,
        destination: platformKey,
        asset: 'native',
        amount: platformAmount,
        data: '',
        gasLimit: hexGasLimit,
        gas: hexGasLimit,
        gasPrice,
        to: escrowKey,
      },
    ];
    let txs_post = await approvalEscrow(web3, secret, escrowKey, txs);
    return txs_post;
  } catch (e) {
    return e;
  }
};

const submitDisburseTransaction = async (secret, txs) => {
  try {
    const web3 = new Web3(infuraURL);

    let sellerAccount = web3.eth.accounts.privateKeyToAccount(secret);
    sellerAddress = sellerAccount.address;

    const ERC20contract = await new web3.eth.Contract(
      ERC20.abi,
      DAIcontract
    );

    const simpleContract = await new web3.eth.Contract(
      SafeEscrow.abi,
      txs[0].escrow
    );

    let tx;
    for (i = 0; i < txs.length; i++) {
      let tx = txs[i];

      delete tx['nonce'];
      delete tx['chainId'];
      delete tx['networkId'];
      
      const transferData = ERC20contract.methods
        .transfer(tx.destination, tx.amount)
        .encodeABI();

      const transferDataSolidity = web3.utils.soliditySha3(transferData);
      const value = 0;
      const operation = 0;
      const safeTxGas = 0;
      const baseGas = 0;
      const gasPrice = 0;
      const gasToken = '0x0000000000000000000000000000000000000000';
      const refundReceiver = '0x0000000000000000000000000000000000000000';
      const contractNonce = i;

      const data =
        web3.eth.abi
        .encodeParameters(
          ['bytes32', 'address', 'uint256', 'bytes32', 'uint', 'uint256', 'uint256', 'uint256', 'address', 'address', 'uint256'],
          [safeTxTypehash, DAIcontract, value, transferDataSolidity, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, contractNonce]
        ) 

      const prevHash = web3.utils.keccak256(data);
      const extraBytes = '000000000000000000000000';
                                                                                                                                 
      const preDomainSeparator = domainSeparatorTypehash+extraBytes+tx.escrow.slice(2);
      const domainSeparator = web3.utils.keccak256(preDomainSeparator);

      const preTransactionHash = '0x19' + '01' + domainSeparator.slice(2) + prevHash.slice(2);
      const transactionHash = web3.utils.keccak256(preTransactionHash);

      const sign = tx.signature1;
      let tempSignature2 = await web3.eth.accounts.sign(transactionHash,'0x'+secret);
      tempSignature2.v = (parseInt(tempSignature2.v, 16) + parseInt(4, 16)).toString(16);
      const sign2 = tempSignature2.r.slice(2)+tempSignature2.s.slice(2)+tempSignature2.v;
      
      let signature = '0x' + sign + sign2;

      if(sellerAddress < txs[0].destination){
        signature = '0x' + sign2 + sign;
      }

      tx.from = sellerAddress;
      tx.data = await simpleContract.methods
        .execTransaction(DAIcontract, value, transferData, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signature)
        .encodeABI();        

      const { rawTransaction } = await web3.eth.accounts.signTransaction(
        tx,
        secret 
      );

      transaction = await web3.eth.sendSignedTransaction(rawTransaction);
    }
    
  } catch (e) {
    return e;
  }
};

const transactionHistory = async (accountId) => {
  //TODO: get account transaction history
};

const createFavorBuyerTransaction = async (
  secret,
  escrowKey,
  buyerKey,
  challengeStake,
  agreement,
  keys
) => {
  try{
    //ruling in favor of buyer - pay challenge fees to jury, platform, and merge escrow to buyers account
    const platformKey = hostConfiguration.platformKey;
    
    const web3 = new Web3(infuraURL);

    let juryAccount = web3.eth.accounts.privateKeyToAccount(secret);
    juryAddress = juryAccount.address;

    const nativeAmount = agreement.body.offerAmount;

    const juryAmount = web3.utils.toWei(
      (parseFloat(challengeStake)).toString(),
      'ether'
    );
    const platformAmount = web3.utils.toWei(
      (parseFloat(platformFees)).toString(),
      'ether'
    );
    const txAmount = web3.utils.toWei(
      (parseFloat(nativeAmount)).toString(),
      'ether'
    );

    const hexGasLimit = await web3.utils.toHex('500000').toString();
    const { fast } = await fetch('https://ethgasstation.info/api/ethgasAPI.json?api-key='+hostConfiguration.ethgasstationKey)
    .then(res => res.json())

    const gasPrice = fast*Math.pow(10,8);

    const txs = [
      {
        escrow: escrowKey,
        destination: juryAddress,
        asset: 'native',
        amount: juryAmount,
        gasLimit: hexGasLimit,
        gas: hexGasLimit,
        gasPrice,
        data: '',
        to: escrowKey,
      },
      {
        escrow: escrowKey,
        destination: platformKey,
        asset: 'native',
        amount: platformAmount,
        gasLimit: hexGasLimit,
        gas: hexGasLimit,
        gasPrice,
        data: '',
        to: escrowKey,
      },
      {
        escrow: escrowKey,
        destination: buyerKey,
        asset: 'native',
        amount: txAmount,
        gasLimit: hexGasLimit,
        gas: hexGasLimit,
        gasPrice,
        data: '',
        to: escrowKey,
      },
    ];

    let txs_post = await approvalEscrow(web3, secret, escrowKey, txs);
    return txs_post;
  } catch(e){
    throw new Error(e);
  }
};

const createFavorSellerTransaction = async (
  secret, //jury
  escrowKey,
  buyerKey,
  sellerKey,
  challengeStake,
  nativeAmount
) => {
  try{
    //ruling in favor of seller - pay challenge fees to jury, offerAmount to seller, and merge escrow to buyers account
    const platformKey = hostConfiguration.platformKey;
    
    const web3 = new Web3(infuraURL);

    let juryAccount = web3.eth.accounts.privateKeyToAccount(secret);
    juryAddress = juryAccount.address;

    const juryAmount = web3.utils.toWei(
      (parseFloat(challengeStake)).toString(),
      'ether'
    );
    const platformAmount = web3.utils.toWei(
      (parseFloat(platformFees)).toString(),
      'ether'
    );
    const txAmount = web3.utils.toWei(
      (parseFloat(nativeAmount)).toString(),
      'ether'
    );
    
    const hexGasLimit = await web3.utils.toHex('500000').toString();
    const { fast } = await fetch('https://ethgasstation.info/api/ethgasAPI.json?api-key='+hostConfiguration.ethgasstationKey)
    .then(res => res.json())

    const gasPrice = fast*Math.pow(10,8);

    const txs = [
      {
        //paymentToJury
        escrow: escrowKey,
        destination: juryAddress,
        asset: 'native',
        amount: juryAmount,
        gasLimit: hexGasLimit,
        gas: hexGasLimit,
        gasPrice,
        data: '',
        to: escrowKey,
      },
      {
        escrow: escrowKey,
        destination: platformKey,
        asset: 'native',
        amount: platformAmount,
        gasLimit: hexGasLimit,
        gas: hexGasLimit,
        gasPrice,
        data: '',
        to: escrowKey,
      },
      {
        escrow: escrowKey,
        destination: sellerKey,
        asset: 'native',
        amount: txAmount,
        gasLimit: hexGasLimit,
        gas: hexGasLimit,
        gasPrice,
        data: '',
        to: escrowKey,
      },
    ];
    let txs_post = await approvalEscrow(web3, secret, escrowKey, txs);

    return txs_post;
  } catch (e) {
    throw new Error(e)
  }
};

const viewTransactionOperations = async (tx) => {
  return tx;
};

module.exports = {
  initiateSettlement,
  transactionHistory,
  viewEscrow,
  createBuyerDisburseTransaction,
  submitDisburseTransaction,
  createFavorBuyerTransaction,
  createFavorSellerTransaction,
  viewTransactionOperations,
};