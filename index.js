const config = require('./config')

if (typeof(document) === 'undefined') {
    module.exports = require('ws-browserify-fs')
} else
if (document.location.origin === config.remote) {
    module.exports = require('ws-browserify-fs')

    document.domain = config.hostname
} else {
    module.exports = require('./lib')
}
