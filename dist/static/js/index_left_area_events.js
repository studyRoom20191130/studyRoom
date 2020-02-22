

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
}


// 开始按钮防止重复点击
window.forbidStartBtnClick = false

const startBtnHandle = () => {
    // 点击开始，开始计时
    if (window.forbidStartBtnClick) {
        return
    }
    window.forbidStartBtnClick = true
    start()
    window.startHourAndMinute= getNowHourAndMinute()
    window.startTime = getTime()
}

const endBtnHandle = () => {
    let studyContent = e('#textarea-study-content').value
    if (noStudyContent(studyContent)) {
        return
    }
    window.forbidStartBtnClick = false
    // 计算并转换时间数据
    let segmentation = getSegmentation()
    let [hourDuration, minuteDuration] = getDuration()
    let user = getLocalStorage('userInfo').split('-')[0]
    let time = new Date();
    let id = time.getTime()
    let today = moment().format("YYYY年MM月DD日")
    log('today', today)
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
        id,
        table: [singleRecord],
    }

    ajax(studyContentRecord, "/sendRecordData", (res) => {
        log(111, res)
        // 获取数据，更新页面
        let studyDataList = res || []
        addHtmlToMainDiv(studyDataList)
        alertTip(singleRecord.minuteDuration)
        window.stopInterval = true
    })
    getOnlineUser()
}

const alertTip = (minuteDuration) => {
    let tip = `本次学习投入 ${minuteDuration} 分钟~`
    let m = Number(minuteDuration)
    if (60 < m && m < 120) {
        tip = `本次学习怒砸 ${minuteDuration} 分钟~`
    } else if (m >= 120) {
        tip = `一口气竟然学习了 ${minuteDuration} 分钟，好好休息一下~`
    }
    Swal.fire(
        tip,
        `距离目标又缩短了 ${minuteDuration} 分钟的距离`,
        'success'
    )
}

const addHtmlToMainDiv = (studyDataList) => {
    let html = ''
    let tr = `
        <tr class="success">
            <th>时间段</th>
            <th>时长</th>
            <th>内容/备注</th>
        </tr>`
    for (studyData of studyDataList) {
        for (obj of studyData.table) {
            tr += `<tr>
                    <td class="td-time">${obj.segmentation}</td>
                    <td class="td-hour">${obj.minuteDuration}</td>
                    <td class="td-width">${obj.studyContent}</td>
                </tr>`

        }
        html += `
        <article class="main-article">
            <div class="user-name title-weight">
                <a href="personal.html" class="personal-page">${studyData.user}</a>
            </div>
            <div class="study-record">
               <table class="table table-bordered table-striped table-hover table-condensed">
                   ${tr}
               </table>
            </div>
            <div class="comment">
                <!--评论(3)-->
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
}

const addOnlineUser = (onlineUserList) => {
    log('onlineUserList', onlineUserList)
    let html = ''
    for (const user of onlineUserList) {
        log(999)
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
        log(Number(endHour[1]), Number(startHour[1]))
        hour = Number(endHour[1]) + 24 -  Number(startHour)
    }

    let minutes = hour * 60
    minutes += Number(endMinute) - Number(startMinute)
    hour = Number((minutes / 60).toFixed(1))
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
