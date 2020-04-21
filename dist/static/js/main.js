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

const showTips =  () => {
    let shouldShowTips = getLocalStorage('showTips4') || 'show'
    if (shouldShowTips === 'show') {
        let html = `
        <br>
        <div style="text-align: left">
            <p>新增了预期字段，输入预期完成时间，比如 30</p>
            <hr>
            <p>新增了补录功能</p>
            <p>输入了补录的结束时间后直接按回车或点击输入框外完成补录</p>
            <hr>
            <p>如果想要统计某一项内容的总时长，可以加上 - </p>
            <p>比如 axe作业16 - 做作业</p>
            <p>比如 重写guagame - 视频1</p>
            <p>这样，就可以在个人主页里用 echarts 展现各项内容具体的时长统计</p>
            <p>如果有需要，可以先这么做，功能会尽快开发……</p>
            <p class="tips" style="text-decoration: underline;cursor: pointer">不再提示</p>
        </div>`
        let div = e(`.right`)
        div.insertAdjacentHTML('beforeend', html)
    }
}

const __main = () => {
    // 数据初始化
    dataInit()
    // 右侧 todo 数据初始化
    todoInit()
    // 轮询
    // autoRefresh()
    // 关闭页面回调，移除在线
    removeOfflineUser()
    // 绑定页面所需的所有事件
    bindEvents()
    //展现更新提示
    showTips()
}

__main()
