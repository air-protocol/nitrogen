const hostConfig = {
    bootNodes : ['127.0.0.1:4000','127.0.0.1:4010'],
    address : process.env.ADDRESS || '127.0.0.1',
    bootNode: process.env.BOOTNODE || false,
    port : process.env.PORT || 4020,
    outboundCount: 3
}
module.exports = hostConfig