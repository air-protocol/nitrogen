//TODO make a separate config file for the consumer
//In production set addresses to externally available ip
const argv = require('yargs').argv

const hostConfig = {
    bootNodes: [argv.leader || '127.0.0.1:50505'],
    address: argv.address || '127.0.0.1',
    bootNode: argv.bootNode || false,
    refreshDirectory: argv.refreshDirectory || false,
    port: argv.port || 50505,
    outboundCount: 3,
    maxMessageStore: argv.maxMessageStore || 5000,
    addMeTTL: argv.addMeTTL || 500,
    addMeTTLBound: argv.addMeTTLBound,
    juryKey: argv.juryKey,
    juryMeshPublicKey: argv.juryMeshKey,
    consumerId: argv.consumerId,
    meshPublicKey: argv.meshPublicKey,
    meshPrivateKey: argv.meshPrivateKey,
    platformKey: argv.platformKey,
    mode: argv.mode ||  'normal',
    chain: argv.chain || 'stellar',
    tssPort: argv.tss_port || 1240,
    tssIP: argv.tss_ip || '127.0.0.1',
    tssHome: argv.tss_home || argv.meshPublicKey,
    infuraKey: argv.infuraKey,
    masterMultisigContract: argv.masterContract,
    ethGasStationKey: argv.ethGasStationKey
}
module.exports = hostConfig
