if (typeof(document) === 'undefined') {
    module.exports = require('ws-browserify-fs')
} else
if (document.location.origin === remote) {
    module.exports = require('ws-browserify-fs')

    document.domain = hostname
} else {
    module.exports = require('./lib')
}
