const timeTemplate = (array) => {
    let learns = array

    let r = ''
    learns.forEach((l) => {
        let t = `
        <tr>
            <td class="td-start-end">
                <span>${l.segmentation}</span>
            </td>
            <td class="td-time">${l.minuteDuration} min</td>
            <td class="td-content">${l.studyContent}</td>
            <td class="td-others">
                <span>修改</span>
                <span>删除</span>
            </td>
        </tr>
        `
        r += t
    })
    return r
}

const timelineTemplate = (object) => {
    let o = object
    let t = ''
    if (o.table.length > 0) {
        //计算总当天总学习时间
        let totalMinitue = 0
        let totalHour = 0
        for (const obj of o.table) {
            totalMinitue += obj.minuteDuration
            totalHour += obj.hourDuration
        }
        totalHour = totalHour.toFixed(1)
        let all = timeTemplate(o.table)
        t = `
            <div class="timeline-item" date-is='${o.today}&nbsp;&nbsp;&nbsp;&nbsp;当天总共学习：${totalMinitue} min (${totalHour} h)'>
                <div class="study-record">
                    <table class="table table-bordered">
                        <tr class="head-tr">
                            <th>时间段</th>
                            <th>时长</th>
                            <th>内容</th>
                            <th>操作</th>
                        </tr>
                        ${all}
                    </table>
                </div>

                <div class="message-bord">
                    <span class="">留言板</span>
                </div>


            </div>
        `
    } else {
        t = `
            <div class="timeline-item" date-is='${o.date}&nbsp;&nbsp;&nbsp;&nbsp;${o.blessing}'>
                <div class="message-bord">
                    <span class="">留言板</span>
                </div>
            </div>
        `
    }

    return t
}

const getPersonalStudyData = () => {
    let user = getLocalStorage('personal').split('-')[0].trim()
    e('#user-name').innerHTML = user
    let data = {
        user,
    }

    ajax(data, "/getPersonalStudyData", (res) => {
        generateTimeline(res)
    })
}

const generateTimeline = (res) => {
    let array = res
    let html = ''
    array.forEach((e) => {
        let t = timelineTemplate(e)
        html += t
    })
    let last = `
        <div class="show-more">
            <a href="#">显示更多</a>
        </div>
    `
    // 获取个性签名
    e('#user-sign').innerHTML = '点击编辑签名，按回车确认'
    if (res[0]) {e('#user-sign').innerHTML = res[0].signature || '点击编辑签名，按回车确认'}

    html = html + last
    let container = e('.timeline-container')
    appendHtml(container, html)
}

const datePicker = () => {
    $('#datepicker').datepicker({
        onSelect: function(formattedDate, date, inst) {
            log('拿到日期', formattedDate, typeof formattedDate)
        }
    })
}

const bindWeekTodo = () => {
    bindEvent(e('#personal-page'), 'click', event => {
        swal({
            title: '展示每周计划，待开发',
            text: '2秒后自动关闭',
            timer: 2000,
        }).then(function () {}, function () {})
    })
}




const bindEvents = () => {
    bindWeekTodo()
    bindSignatureEvent()
}


const bindSignatureEvent = () => {
    let div = e('#user-sign')
    div.addEventListener('click', event => {
        div.contentEditable = true
        div.focus()
        // 点击全选
        let range = document.createRange();
        range.selectNodeContents(div);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    })
    div.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault()
            div.contentEditable = false
            saveSignature(div)
        }
    })
    div.addEventListener('blur', event => {
        saveSignature(div)
    })
}

const saveSignature = (div) => {
    let signature = div.textContent
    if (signature.trim()) {
        setLocalStorage('signature', signature)
    } else {
        div.textContent = '点击编辑签名，按回车确认'
    }
}


const __main = () => {
    getPersonalStudyData()
    datePicker()
    bindEvents()
}

__main()
