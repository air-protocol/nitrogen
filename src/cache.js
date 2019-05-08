const flatCache = require('flat-cache')
const localCache = flatCache.load('localCache')
module.exports = localCache