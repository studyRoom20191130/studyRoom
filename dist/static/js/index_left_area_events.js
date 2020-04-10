

// 首页左边区域（开始学习、结束学习、补录时间）的功能逻辑
const bindLeftDivBtnEvent = () => {
    bindEvent(e('.left'), 'click', event => {
        let target = event.target
        let contains = target.classList.contains.bind(target.classList)
        if (contains('btn')) {
            let button = target.dataset.button
            if (button === 'start') {
                startBtnHandle()
            } else if (button === 'end') {
                endBtnHandle()
            }

        }
    })
    bindTipEvent()
}

const bindTipEvent= () => {
    if (!e('.tips')) {return}
    bindEvent(e('.tips'), 'click', event => {
        let target = event.target
        let div = $(target).parent()[0]
        div.remove()
        setLocalStorage('showTips2', 'notShow')
    })
}



// 开始按钮防止重复点击
window.forbidStartBtnClick = false
window.forbidEndBtnClick = true
window.initToggle = true

const startBtnHandle = () => {
    // 点击开始，开始计时
    if (window.forbidStartBtnClick) {
        return
    }
    window.initToggle = true
    window.forbidStartBtnClick = true
    window.forbidEndBtnClick = false
    start()
    window.startHourAndMinute= getNowHourAndMinute()
    window.startTime = getTime()
}

const endBtnHandle = () => {
    if (window.forbidEndBtnClick) {
        swal({
            title: '先要开始，才能结束',
            text: '2秒后自动关闭',
            timer: 2000,
        }).then(function () {}, function () {})
        return
    }
    window.forbidEndBtnClick = true
    let studyContent = e('#textarea-study-content').value
    if (noStudyContent(studyContent)) {
        return
    }
    window.forbidStartBtnClick = false
    // 计算并转换时间数据
    let segmentation = getSegmentation()
    let [hourDuration, minuteDuration] = getDuration()
    let user = getLocalStorage('userInfo').split('-')[0]
    let signature = getLocalStorage('signature') || ''
    let time = new Date();
    let id = time.getTime()
    let today = moment().format("YYYY年MM月DD日")

    const singleRecord = {
        studyDate: getDate(), // 当天日期
        segmentation, // 12:30 - 13:30
        minuteDuration, // 60
        hourDuration, // 1
        studyContent, // 学习内容/备注
    }
    let userData = getLocalStorage('userInfo')
    const studyContentRecord = {
        userData,
        today,
        user,
        signature,
        id,
        table: [singleRecord],
    }

    ajax(studyContentRecord, "/sendRecordData", (res) => {
        // 获取数据，更新页面
        let studyDataList = res || []
        addHtmlToMainDiv(studyDataList)
        alertTip(singleRecord.minuteDuration)
        window.stopInterval = true
    })
    getOnlineUser()
}

const alertTip = (minuteDuration) => {
    let tip = `本次学习 ${minuteDuration} 分钟~`
    let m = Number(minuteDuration)
    if (m >= 60) {
        tip = `一口气竟然学了 ${minuteDuration} 分钟，好好休息一下~`
    }
    Swal.fire(
        tip,
        `距离目标又缩短了 ${minuteDuration} 分钟的距离`,
        'success'
    )
}

// 拼接评论部分的 html
const getCommentHtml = (commentList, user) => {
    let comment = ''
    let commentArray = commentList || []
    for (const obj of commentArray) {
        // 回复的评论
        if (obj.comment.includes('reply')) {
            let content = obj.comment.slice(5)
            comment += `<div data-user="${user}">
                            <span class="comments-span">${obj.commenter} </span>回复 <span class="comments-span">${obj.replyer}: </span><span>${content} </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--<span class="reply-span">回复</span>
                        </div>`
        } else {
            // 单纯评论
            comment += `<div data-user="${user}">
                            <span class="comments-span">${obj.commenter}: </span><span>${obj.comment} </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--<span class="reply-span">回复</span>
                        </div>`
        }
    }
    return comment
}

// 拼接表格数据部分的 html 并计算 分钟 和 小时
const getTrHtml = (list) => {
    let tr = `
        <tr class="success">
            <th>时间段</th>
            <th>时长</th>
            <th>内容/备注</th>
        </tr>`
    let totalHour = 0
    let totalMinitue = 0
    for (const obj of list) {
        tr += `<tr>
                    <td class="td-time">${obj.segmentation}</td>
                    <td class="td-hour">${obj.minuteDuration} min</td>
                    <td class="td-width">${obj.studyContent}</td>
                </tr>`
        totalHour += obj.hourDuration
        totalMinitue += obj.minuteDuration
    }
    totalHour = totalHour.toFixed(1)
    return [tr, totalHour, totalMinitue]
}

const addHtmlToMainDiv = (studyDataList) => {
    // 增加龙王功能
    let dragonKingObj = {}
    let user = getLocalStorage('userInfo').split('-')[0]
    let html = ''
    for (const studyData of studyDataList) {
        let signature = studyData.signature || ''
        let [tr, totalHour, totalMinitue] = getTrHtml(studyData.table)
        let s = studyData.user
        let temp_s = studyData.user
        if(s == 'H.K') { temp_s = 'H-K'}
        dragonKingObj[temp_s] = totalMinitue
        let commentNum = studyData.commentArray ? `评论 (${studyData.commentArray.length})` : '评论'
        let comment = getCommentHtml(studyData.commentArray, s)

        html += `
        <article class="main-article">
            <div class="user-name title-weight ${temp_s}">
                <a href="personal.html" class="personal-page">${s} - ${totalMinitue} min / ${totalHour} h</a>
            </div>
            <div style="color: #409eff;margin: 5px 0;">${signature}</div>
            <div class="study-record">
               <table class="table table-bordered table-striped table-hover table-condensed">
                   ${tr}
               </table>
            </div>
            <div class="comments">
                <img src="reply.png" class="reply-icon"> ${commentNum}
            </div>
            <div class="comments-zone">
                <div class="edit-input" data-user="${s}">
                    <span class="comments-span">${user}</span> <textarea></textarea><button class="btn btn-common btn-new comment-submit">发布</button>
                </div>
                <div class="comments-content">
                    ${comment}
                </div>
            </div>
        </article>`
         tr = `
        <tr class="success">
            <th>时间段</th>
            <th>时长</th>
            <th>内容/备注</th>
        </tr>`
    }
    $(".main").empty()
    appendHtml(e(".main"), html)

    //
    commentDivHide()
    // 算出谁是龙王
    whoIsDragonKing(dragonKingObj)
}

const commentDivHide = () => {
    if (window.initToggle && es('.comments-zone')) {
        for (const element of es('.comments-zone')) {
            $(element).toggle()
        }
        window.initToggle = false
    }
}

const whoIsDragonKing = (dragonKingObj) => {
    let dragonKing = ''
    let num = -1
    for (let [key, value] of Object.entries(dragonKingObj)) {
        if (value > num) {
            num = value
            dragonKing = '.' + key
        }
    }
    if (dragonKing) {$(dragonKing).append(`<img src="dragon-king.png" style="width: 20px;height: 24.5px;margin-left: 5px;display: inline-block;
    padding-bottom: 6px;margin-bottom: 2px;">`)}
}

const addOnlineUser = (onlineUserList) => {
    let html = ''
    for (const user of onlineUserList) {
        html += `<div class="online-user">
                    <span class="user-circle"></span>
                    <a href="personal.html" class="personal-page">${user}</a>
                </div>`
    }

    $(".online").empty()
    appendHtml(e(".online"), html)
}

const getNowHourAndMinute = () => {
    return moment().format('HH:mm')
}

const getDuration = () => {
    let endTime = getTime()
    endTimeList  = endTime.slice(11, 16).split(':')

    let [endHour, endMinute] = endTimeList

    let [startHour, startMinute] = window.startTime.slice(11, 16).split(':')

    let hour = Number(endHour) - Number(startHour)

    // 23:00  -  00:20 这种情况
    if (startHour[0]=== '2' && endHour[0] === '0') {
        hour = Number(endHour[1]) + 24 -  Number(startHour)
    }

    let minutes = hour * 60
    minutes += Number(endMinute) - Number(startMinute)
    hour = Number((minutes / 60).toFixed(2))
    return [hour, minutes]
}

const getSegmentation = () => {
    let endHourAndMinute = getNowHourAndMinute()
    return window.startHourAndMinute + ' - ' + endHourAndMinute
}

const getTime= () => {
    return moment().format('YYYY-MM-DD HH:mm:ss')
}

const noStudyContent = (studyContent) => {
    if (studyContent.length === 0) {
        swal({
            title: '请输入学习内容或备注哦',
            text: '2秒后自动关闭',
            timer: 2000,
        }).then(function () {}, function () {})
        return true
    }
    return false
}

// 计时器的函数拿的网上的，先用着
let hour, minute , second;//时 分 秒
hour = minute = second = 0;//初始化
let millisecond = 0;//毫秒

let countIndex = 1; // 倒计时任务执行次数
let timeout = 250; // 触发倒计时任务的时间间隙


// 开始计时
const start = () => {
    window.stopInterval = false
    window.getStartTime = new Date().getTime();
    startCountdown(timeout);
}

function startCountdown(interval) {
    if (window.stopInterval) {
        e('.timer').innerHTML= ''
        millisecond = hour = minute = second = 0
        return
    }
    setTimeout(() => {
        const endTime = new Date().getTime();
        // 偏差值
        let deviation = endTime - (window.getStartTime + countIndex * timeout);
        if (deviation < 0) {deviation = 0}
        countIndex++;

        millisecond=millisecond+250;
        if(millisecond>=1000) {
            millisecond=0;
            second=second+1;
        }
        if(second>=60) {
            second=0;
            minute=minute+1;
        }

        if(minute>=60) {
            minute=0;
            hour=hour+1;
        }
        let arr = [hour, minute, second]
        arr = arr.map(val => getZero(val))
        e('.timer').innerHTML= arr[0]+'时'+arr[1]+'分'+arr[2]+'秒';

        // 下一次倒计时
        startCountdown(timeout - deviation);
    }, interval);
}
