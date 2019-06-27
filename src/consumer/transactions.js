const stellar = require('stellar-sdk')
const server = new stellar.Server('https://horizon-testnet.stellar.org')
const fetch = require('node-fetch')

const transactionHistory = (accountId) => {
    fetch(`https://horizon-testnet.stellar.org/accounts/${accountId}/transactions`)
    .then(res => res.json())
    .then(json => json._embedded.records.forEach((item) => {
        console.log('\n' + 'Source Account: ' + item.source_account)
        console.log('Source Account Sequence: '+ item.source_account_sequence)
        console.log('Created At: ' + item.created_at)
        console.log('Memo: ' + item.memo)
        console.log('Successful: ' + item.successful)
        console.log('Fee Paid: ' + item.fee_paid)
        console.log('Ledger number: ' + item.ledger)
    }))
}

module.exports = transactionHistory