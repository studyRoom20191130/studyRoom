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
    bindTodoInputEvent()
    bindLeftDivBtnEvent()
    bindRightDivEvents()
}

const getstudyDataList =() => {
    log(111)
    let today = moment().format("YYYY年MM月DD日")
    let user = getLocalStorage('userInfo').split('-')[0]
    let data = {
        today,
        user,
    }
    ajax(data, "/getStudyDataList", (res) => {
        let studyDataList = []
        if (res) {
            studyDataList = JSON.parse(res)
        }
        addHtmlToMainDiv(studyDataList)
    })


}

const autoRefresh = () => {
    let 每十五分钟自动刷新一次 = 1000 * 60 * 15
    setInterval(() => getstudyDataList(), 每十五分钟自动刷新一次)
}

const __main = () => {
    bindEvents()
    getstudyDataList()
    autoRefresh()
    todoInit()
}

__main()
