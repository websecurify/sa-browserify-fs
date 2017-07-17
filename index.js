const browserifyFs = require('ws-browserify-fs')

const remote = 'https://fs.secapps.com'
const hostname = 'secapps.com'

if (typeof(document) === 'undefined') {
    module.exports = browserifyFs
} else
if (document.location.origin === remote) {
    document.domain = hostname

    module.exports = browserifyFs
} else {
    var promise

    const wrap = function (name) {
        return function () {
            const args = arguments

            if (!promise) {
                promise = new Promise(function (resolve, reject) {
                    const iframe = document.createElement('iframe')

                    iframe.src = remote
                    iframe.style = 'opacity: 0; width: 1px; height: 1px'

                    document.body.appendChild(iframe)

                    iframe.onload = function () {
                        const documentDomain = document.domain

                        document.domain = hostname

                        resolve(iframe.contentWindow.fs)

                        document.document = documentDomain
                    }

                    iframe.onerror = function (error) {
                        reject(error)
                    }
                })
            }

            promise
            .then(function (fs) {
                fs[name].apply(fs, args)
            })
            .catch(function (error) {
                const callback = args[args.length - 1]

                if (callback && typeof(callback) === 'function') {
                    callback(error)
                }
            })
        }
    }

    Object.keys(browserifyFs).forEach(function (name) {
        module.exports[name] = wrap(name)
    })
}
