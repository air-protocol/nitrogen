const argv = require('yargs').argv

const hostConfig = {
    bootNodes : ['127.0.0.1:4000'],
    address : argv.address || '127.0.0.1',
    bootNode: argv.bootNode || false,
    port : argv.port || 4020,
    outboundCount: 3
}
module.exports = hostConfig