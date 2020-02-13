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
        addHtmlToMainDiv(studyDataList)
    })
}

const autoRefresh = () => {
    let 每十五分钟自动刷新一次 = 1000 * 60 * 15
    setInterval(() => dataInit(), 每十五分钟自动刷新一次)
}

const getOnlineUser = () => {
    let user = getLocalStorage('userInfo').split('-')[0]
    let data = {
        user,
    }
    ajax(data, "/getOnlineUser", (res) => {
        let onlineUserList = res || []
        log()
        addOnlineUser(onlineUserList)
    })
}

const dataInit = () => {
    getstudyDataList()
    getOnlineUser()
}

const removeOfflineUser = () => {
    window.onunload  = () => {
        let user = getLocalStorage('userInfo').split('-')[0]
        let data = {
            user,
        }
        ajax(data, "/removeOfflineUser", (res) => {})
    }
    window.onbeforeunload   = () => {
        let user = getLocalStorage('userInfo').split('-')[0]
        let data = {
            user,
        }
        ajax(data, "/removeOfflineUser", (res) => {})
    }

}

const __main = () => {
    bindEvents()
    dataInit()
    todoInit()
    autoRefresh()
    removeOfflineUser()
}

__main()
