const config = require('./config')

if (typeof(document) === 'undefined') {
    module.exports = require('ws-browserify-fs')
} else {
    const isSafari = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1
    
    if (isSafari) {
        module.exports = require('ws-browserify-fs')

        document.domain = config.hostname
    } else
    if (document.location.origin === config.remote) {
        module.exports = require('ws-browserify-fs')

        document.domain = config.hostname
    } else {
        module.exports = require('./lib')
    }
}
