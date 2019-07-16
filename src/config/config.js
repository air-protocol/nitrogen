//TODO make a separate config file for the consumer
const argv = require('yargs').argv

const hostConfig = {
    bootNodes: [argv.leader || '127.0.0.1:50505'],
    address: argv.address || '127.0.0.1',
    bootNode: argv.bootNode || false,
    refreshDirectory: argv.refreshDirectory || false,
    port: argv.port || 4020,
    outboundCount: 3,
    maxMessageStore: argv.maxMessageStore || 5000,
    addMeTTL: argv.addMeTTL || 500,
    addMeTTLBound: argv.addMeTTLBound,
    juryKey: argv.juryKey || 'GDIAIGUHDGMTDLKC6KFU2DIR7JVNYI4WFQ5TWTVKEHZ4G3T47HEFNUME',
    juryMeshPublicKey: '044a68235838f9a58de9caf1ef2c678bf2c9338da35affa33a978116c8a4de94f73850b15623fd44b8811b14faef1850b43ad819e8a4e80d75c3e4c276e3ce00b6',
    consumerId: argv.consumerId,
    meshPublicKey: argv.meshPublicKey,
    meshPrivateKey: argv.meshPrivateKey
}
module.exports = hostConfig
