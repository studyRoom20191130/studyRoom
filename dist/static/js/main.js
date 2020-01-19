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
    let today = moment().format("YYYY年MM月DD日")
    let data = {
        today,
    }
    ajax(data, "/getStudyDataList", (res) => {
        let studyDataList = []
        if (res) {
            studyDataList = JSON.parse(res)
        }
        log('studyDataList', studyDataList)
        addHtmlToMainDiv(studyDataList)
    })
}

const __main = () => {
    bindEvents()
    getstudyDataList()
    todoInit()
}

__main()
