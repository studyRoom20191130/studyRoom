const bindOtherTime = () => {
    let btn = e('.btn-other-time')
    let div = e('.other-time')
    bindEvent(btn, 'click', (event) => {
        log('btn')
        // $('.other-time').toggleClass('hidden', false)
        let has = $('.other-time').hasClass('hidden')
        if (has) {
            $('.other-time').removeClass('hidden')
        } else {
            $('.other-time').addClass('hidden')
        }
    })
}

const bindEvents = () => {
    bindOtherTime()
}


const __main = () => {
    bindEvents()
}

__main()
