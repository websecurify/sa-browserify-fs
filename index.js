const browserifyFs = require('ws-browserify-fs')

const remote = 'https://fs.secapps.com'
const hostname = 'secapps.com'

let promise

const wrap = (name) => () => {
    const args = arguments

    if (!promise) {
        promise = new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe')

            iframe.src = remote
            iframe.style = 'opacity: 0; width: 1px; height: 1px'

            document.body.appendChild(iframe)

            iframe.onload = () => {
                const documentDomain = document.domain

                document.domain = hostname

                resolve(iframe.contentWindow.fs)

                document.document = documentDomain
            }

            iframe.onerror = (error) => {
                reject(error)
            }
        })
    }

    promise
    .then((fs) => {
        fs[name].apply(fs, args)
    })
    .catch((error) => {
        const callback = args[args.length - 1]

        if (callback && typeof(callback) === 'function') {
            callback(error)
        }
    })
}

Object.keys(browserifyFs).forEach((name) => {
    module.exports[name] = wrap(name)
})
