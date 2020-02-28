const timeTemplate = (array) => {
    let learns = array

    let r = ''
    learns.forEach((l) => {
        let t = `
        <tr>
            <td class="td-start-end">
                <span>${l.segmentation}</span>
            </td>
            <td class="td-time">${l.minuteDuration} 分钟</td>
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
    // log('o', o)
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
                        <tr>
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


const __main = () => {
    getPersonalStudyData()
    datePicker()
}

__main()
