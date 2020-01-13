const log = console.log.bind(console)

window.onerror = function (...args) {
    log('args', args)
}
