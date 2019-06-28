const stellar = require('stellar-sdk')
const fetch = require('node-fetch')

const initiateSettlement = async (secret, challengeStake, nativeAmount) => {

}

const transactionHistory = async (accountId) => {
    const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${accountId}/transactions`)
    const responseJson = await response.json()
    return responseJson._embedded.records
}

module.exports = { initiateSettlement, transactionHistory }