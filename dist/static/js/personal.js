const timeTemplate = (array) => {
    let learns = array

    let r = ''
    learns.forEach((l) => {
        let t = `
        <tr>
            <td class="td-start-end">
                <span>${l.start}</span> - <span>${l.end}</span>
            </td>
            <td class="td-time">${l.timeSum} 分钟</td>
            <td class="td-content">${l.content}</td>
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
    if (o.allRecord.length > 0) {
        let all = timeTemplate(o.allRecord)
        t = `
            <div class="timeline-item" date-is='${o.date}&nbsp;&nbsp;&nbsp;&nbsp;今天总共学习时间：${o.allDaySum} 分钟'>
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

const fakeData = () => {
    let o = {
        date: '20191130',
        allDaySum: '12',
        allRecord: [
            {
                start: '15:26',
                end: '15:38',
                timeSum: '12',
                content: 'fep21',
            }

        ],
    }

    let o2 = {
        date: '20191129',
        allDaySum: '12',
        allRecord: [
            {
                start: '15:26',
                end: '15:38',
                timeSum: '12',
                content: 'fep21',
            }

        ],
    }

    let o3 = {
        date: '20191128',
        allDaySum: '93',
        allRecord: [
            {
                start: '11:57',
                end: '21:02',
                timeSum: '93',
                content: 'fep8',
            },
            {
                start: '21:28',
                end: '21:37',
                timeSum: '9',
                content: 'fep21',
            },

        ],
    }

    let o4 = {
        date: '20191127',
        allDaySum: '235',
        allRecord: [
            {
                start: '11:15',
                end: '22:59',
                timeSum: '235',
                content: 'fep20',
            }
        ],
    }

    let o5 = {
        date: '20191126',
        allDaySum: '0',
        allRecord: [],
        blessing: '今天生病了吗？好好休息，保重好自己呀',
    }

    let o6 = {
        date: '20191125',
        allDaySum: '0',
        allRecord: [],
        blessing: '今天没有学习噢，为什么呢？',
    }

    let o7 = {
        date: '20191124',
        allDaySum: '289',
        allRecord: [
            {
                start: '17:31',
                end: '17:51',
                timeSum: '20',
                content: 'pak',
            },
            {
                start: '18:13',
                end: '18:30',
                timeSum: '17',
                content: 'pak',
            },
            {
                start: '18:35',
                end: '19:29',
                timeSum: '54',
                content: 'pak',
            },
            {
                start: '21:50',
                end: '22:23',
                timeSum: '33',
                content: 'pak',
            },
            {
                start: '23:19',
                end: '23:29',
                timeSum: '10',
                content: 'pak',
            },
            {
                start: '23:38',
                end: '26:13',
                timeSum: '155',
                content: 'pak',
            },
        ],
    }

    let result = []
    result.push(o)
    result.push(o2)
    result.push(o3)
    result.push(o4)
    result.push(o5)
    result.push(o6)
    result.push(o7)
    return result

}

const generateTimeline = () => {
    let array = fakeData()
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
    generateTimeline()
    datePicker()
}

__main()
