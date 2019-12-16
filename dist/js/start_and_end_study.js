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

const startBtnHandle = () => {
    // 点击开始，开始计时
    start()
    window.startHourAndMinute = getNowHourAndMinute()
    window.startTime = getTime()
}

const endBtnHandle = () => {
    let studyContent = e('#textarea-study-content').value
    if (noStudyContent(studyContent)) { return }
    // 计算并转换时间数据
    let studyContentRecord = getConvertData(studyContent)
    // 发送本次记录
    sendData(studyContentRecord)
    reset()
}

const getConvertData = (studyContent) => {
    let segmentation = getSegmentation()
    let [hourDuration, minuteDuration] = getDuration()
    const studyContentRecord = {
        studyDate: getDate(), // 当天日期
        segmentation, // 12:30 - 13:30
        minuteDuration, // 60
        hourDuration, // 1
        studyContent, // 学习内容/备注
        userId: '123',
        userName: '风行',
    }
    return studyContentRecord
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

const sendData = (studyContentRecord) => {
    // 这里如果是真实 api 的话，直接发送本次数据就可以，但是用 storage，要先获取之前所有的数据，再发送
    let studyDataList = getLocalStorage('studyDataList') || []
    let listLength = studyDataList.length
    if (listLength === 0) {
        let studyData = {
            userName: '风行',
            userId: '123',
            table: [
                studyContentRecord
            ]
        }
        studyDataList.push(studyData)
    }
    // 发送数据
    // [
    //   {
    //       user: name,
    //       id: '123'
    //       table: [
    //           {
    //               segmentation: 12:30 - 13:30,
    //               minuteDuration: 60,
    //               hourDuration, 1,
    //               studyContent: 'dsfs',
    //           }
    //       ]
    //   }
    // ]
    if (listLength > 0) {
        // 找到对应元素，把record push进table数组， 删掉旧元素，把更新的元素 unshift
        let index = studyDataList.findIndex(element => element.userId === studyContentRecord.userId)
        let tableList = studyDataList[index].table
        tableList.push(studyContentRecord)
        studyDataList[index].table = tableList
        let newRecord = studyDataList[index]
        studyDataList.splice(index, 1)
        studyDataList.push(newRecord)
    }
    setLocalStorage('studyDataList', studyDataList)
    alertTip(studyContentRecord.minuteDuration)
    // 获取数据，更新页面
    addHtmlToMainDiv(studyDataList)
}

const addHtmlToMainDiv = (studyDataList) => {
    studyDataList = Array.isArray(studyDataList) ? studyDataList : [studyDataList]
    let mainDiv = e(".main")
    let html = ''
    let tr = `
        <tr>
            <th>时间段</th>
            <th>时长</th>
            <th>内容/备注</th>
        </tr>`
    for (studyData of studyDataList) {
        for (obj of studyData.table) {
            tr += `<tr>
                    <td>${obj.segmentation}</td>
                    <td>${obj.minuteDuration}</td>
                    <td class="td-width">${obj.studyContent}</td>
                </tr>`
        }
        html += `
        <article class="main-article">
            <div class="user-name title-weight">
                ${studyData.userName}
            </div>
            <div class="study-record">
               <table class="table table-bordered">
                   ${tr}
               </table>
            </div>
            <div class="comment">
                评论(3)
            </div>
        </article>`
    }
    mainDiv.innerHTML = ''
    appendHtml(mainDiv, html)
}

const getNowHourAndMinute = () => {
    return moment().format('HH:mm')
}

const getDuration = () => {
    let endTime = getTime()
    let t1 = moment(window.startTime)
    let t2 = moment(endTime)
    let dura = t2.format('x') - t1.format('x')
    let tempTime = this.moment.duration(dura)
    return [tempTime.hours(), tempTime.minutes()]
}

const getSegmentation = () => {
    let endHourAndMinute = getNowHourAndMinute()
    return window.startHourAndMinute + ' - ' + endHourAndMinute
}

const getTime = () => {
    return moment().format('YYYY-MM-DD HH:mm:ss')
}

const noStudyContent = (studyContent) => {
    if (studyContent.length === 0) {
        swal({
            title: '请输入学习内容或备注哦',
            text: '2秒后自动关闭',
            timer: 2000,
        }).then(function () {
        }, function () {
        })
        return true
    }
    return false
}

// 计时器的函数拿的网上的，先用着
let hour, minute, second //时 分 秒
hour = minute = second = 0 //初始化
let millisecond = 0 //毫秒
let int
//重置
const reset = () => {
    window.clearInterval(int)
    millisecond = hour = minute = second = 0
    e('.timer').innerHTML = ''
}

// 开始计时
const start = () => {
    int = setInterval(timer, 250)
}

const timer = () => {
    millisecond = millisecond + 250
    if (millisecond >= 1000) {
        millisecond = 0
        second = second + 1
    }
    if (second >= 60) {
        second = 0
        minute = minute + 1
    }

    if (minute >= 60) {
        minute = 0
        hour = hour + 1
    }
    let arr = [hour, minute, second]
    arr = arr.map(val => getZero(val))
    e('.timer').innerHTML = arr[0] + '时' + arr[1] + '分' + arr[2] + '秒'
} 
