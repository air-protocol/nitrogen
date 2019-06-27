const argv = require('yargs').argv
const fs = require('fs')
const fetch = require('node-fetch')
const stellar = require('stellar-sdk')

const createAccount = async () => {
    const keys = stellar.Keypair.random()
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(keys.publicKey())}`)
    return keys
}

const main = async () => {
    try {
        keys = await createAccount()
    } catch(e) {
        console.log('unable to create account: ' + e)
        return
    }
    const accountName = argv.accountName
    fs.appendFile('account.txt', 'accountName: ' + accountName + '\n', (err) => {
        if (err) {
            console.log('cannot write account info' + e)
        }
    })
    fs.appendFile('account.txt', 'accountId: ' + keys.publicKey() + '\n', (err) => {
        if (err) {
            console.log('cannot write account info' + e)
        }
    })
    fs.appendFile('account.txt', 'secret: ' + keys.secret() + '\n\n', (err) => {
        if (err) {
            console.log('cannot write account info' + e)
        }
    })
}

main()