const path = require('path')
const hostConfiguration = require('./config/config')
const flatCache = require('flat-cache')
const localCache = flatCache.load('localCache', path.resolve('./cache/' + hostConfiguration.port))
let directory = localCache.getKey('directory')
if(hostConfiguration.bootNode && ((directory === undefined) || (directory.length === 0)))
{
    localCache.setKey('directory', hostConfiguration.bootNodes)
    localCache.save()
}
module.exports = localCache