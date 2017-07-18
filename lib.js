const through = require('through')
const browserifyFs = require('ws-browserify-fs')

const remote = 'https://fs.secapps.com'
const hostname = 'secapps.com'

var promise

const getPromise = function () {
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

    return promise
}

const wrapCreateReadStream = function () {
    return function () {
        const readable = through(
            function (data) {
                if (data) {
                    this.queue(data)
                }
            },
            function () {
                this.queue(null)
            }
        )

        readable.pause()

        const args = arguments

        getPromise()
        .then((fs) => {
            fs.createReadStream.apply(fs, args).pipe(readable)

            readable.resume()
        })
        .catch((error) => {
            readable.emit('error', error)
        })

        return readable
    }
}

const wrapCreateWriteStream = function () {
    return function () {
        const writable = through(
            function (data) {
                if (data) {
                    this.queue(data)
                }
            },
            function () {
                this.queue(null)
            }
        )

        writable.pause()

        const args = arguments

        getPromise()
        .then((fs) => {
            writable.pipe(fs.createWriteStream.apply(fs, args))

            writable.resume()
        })
        .catch((error) => {
            writable.emit('error', error)
        })

        return writable
    }
}

const wrapFunction = function (name) {
    return function () {
        const args = arguments

        getPromise()
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
    if (name === 'createReadStream') {
        module.exports[name] = wrapCreateReadStream()
    } else
    if (name === 'createWriteStream') {
        module.exports[name] = wrapCreateWriteStream()
    } else {
        module.exports[name] = wrapFunction(name)
    }
})
