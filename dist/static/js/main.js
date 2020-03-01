// const bindOtherTime = () => {
//     let btn = e('.btn-other-time')
//     let div = e('.other-time')
//     bindEvent(btn, 'click', (event) => {
//         log('btn')
//         // $('.other-time').toggleClass('hidden', false)
//         let has = $('.other-time').hasClass('hidden')
//         if (has) {
//             $('.other-time').removeClass('hidden')
//         } else {
//             $('.other-time').addClass('hidden')
//         }
//     })
// }



const bindEvents = () => {
    setTimeout(() => {
        // bindOtherTime()
        bindTodoInputEvent()
        bindLeftDivBtnEvent()
        bindRightDivEvents()
        bindWeekTodo()
        bindOtherPersonalPage()
        bindMainArticleEvent()
    }, 1500)
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

const dataInit = () => {
    // 第一次创建当天记录文件的时候会清空在线人员名单，但是无法保证清空和写入的先后顺序
    getstudyDataList()

    // 所以用延时来确保先清空后写入
    setTimeout(() =>{
        getOnlineUser()
    }, 50)
}

const getOnlineUser = () => {
    let user = getLocalStorage('userInfo').split('-')[0]
    let data = {
        user,
    }
    ajax(data, "/getOnlineUser", (res) => {
        let onlineUserList = res || []
        addOnlineUser(onlineUserList)
    })
}


const removeOfflineUser = () => {
    window.onbeforeunload   = () => {
        let user = getLocalStorage('userInfo').split('-')[0]
        let data = {
            user,
        }
        ajax(data, "/removeOfflineUser", (res) => {})
    }
}

const __main = () => {
    // 数据初始化
    dataInit()
    // 右侧 todo 数据初始化
    todoInit()
    // 轮询
    autoRefresh()
    // 关闭页面回调，移除在线
    removeOfflineUser()
    // 绑定页面所需的所有事件
    bindEvents()
}

__main()
