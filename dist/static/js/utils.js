const log = console.log.bind(console)

const e = (selector) => {
    const element = document.querySelector(selector)
    if (element == null) {
        // const s = `元素没找到，选择器 ${selector} 没有找到或者 js 没有放在 body 里`
        // log(s)
    } else {
        return element
    }
    return element
}

const es = (selector) => {
    const elements = document.querySelectorAll(selector)
    if (elements.length == 0) {
        // const s = `元素没找到，选择器 ${selector} 没有找到或者 js 没有放在 body 里`
        // log(s)
    } else {
        return elements
    }
}
const appendHtml = (element, html) => {
    element.insertAdjacentHTML('beforeend', html)
}

const bindEvent = (element, eventName, callback) => {
    element.addEventListener(eventName, callback)
}

const removeClassAll = (className) => {
    const selector = '.' + className
    const elements = es(selector)
    for (let i = 0; i < elements.length; i++) {
        const e = elements[i]
        e.classList.remove(className)
    }
}

const addClassAll = (className) => {
    const selector = '.' + className
    const elements = es(selector)
    for (let i = 0; i < elements.length; i++) {
        const e = elements[i]
        e.classList.add(className)
    }
}

const addClass = (element, className) => {
    if (element == null || element == undefined) {
        return
    }
    element.classList.add(className)
}

const removeClass = (element, className) => {
    if (element == null || element == undefined) {
        return
    }
    element.classList.remove(className)
}

const bindAll = (selector, eventName, callback) => {
    const elements = es(selector)
    for (let i = 0; i < elements.length; i++) {
        const e = elements[i]
        bindEvent(e, eventName, callback)
    }
}

const find = (element, selector) => {
    const e = element.querySelector(selector)
    if (e == null) {
        const s = `元素没找到，选择器 ${selector} 没有找到或者 js 没有放在 body 里`
        log(s)
    } else {
        return e
    }
}

const closestClass = (element, className) => {
    let e = element
    while (e != null) {
        if (e.classList.contains(className)) {
            return e
        } else {
            e = e.parentElement
        }
    }
    return null
}

const closestId = (element, idName) => {
    let e = element
    while (e != null) {
        if (e.id == idName) {
            return e
        } else {
            e = e.parentElement
        }
    }
    return null
}

const closestTag = (element, tagName) => {
    let e = element
    while (e != null) {
        if (e.tagName.toUpperCase() == tagName.toUpperCase()) {
            return e
        } else {
            e = e.parentElement
        }
    }
    return null
}

const closest = (element, selector) => {
    const c = selector[0]
    if (c == '.') {
        const className = selector.slice(1)
        return closestClass(element, className)
    } else if (c == '#') {
        const idName = selector.slice(1)
        return closestId(element, idName)
    } else {
        const tag = selector
        return closestTag(element, tag)
    }
}

const toggleClass = (element, className) => {
    if (element.classList.contains(className)) {
        element.classList.remove(className)
    } else {
        element.classList.add(className)
    }
}

// 补0操作
const getZero = (num) => {
    if (parseInt(num) < 10) {
        num = '0' + num
    }
    return num
}

const calPersent = (currentPrograss, goalTime) => {
    let persent = currentPrograss / goalTime
    // 转换百分比
    persent  = calculatePersent(persent, 2)
    let styleWidth = Number(persent.slice(0, persent.length-1))
    styleWidth = styleWidth > 100 ? "100%" : styleWidth + '%'
    return [persent, styleWidth]
}


// 时间戳转换成 年月日
const getDate = (str) => {
    // 新增了 没传 str 的情况
    let d = str ? new Date(str) : new Date()
    let year = d.getFullYear()
    let month = d.getMonth() + 1
    let day = d.getDate()
    //最后拼接时间
    let result = str ? year + '年' + getZero(month) + '月' + getZero(day) + '日' :  year + '' + getZero(month) + getZero(day)
    return result
}

// 时间戳转换成日期与 年月日时分秒
const convertTimeToSecond = (str) => {
    let d = new Date(str)
    let year = d.getFullYear()
    let month = d.getMonth() + 1
    let day = d.getDate()
    let hours = d.getHours()
    let minutes = d.getMinutes()
    let seconds = d.getSeconds()
    let result = year + '年' + getZero(month) + '月' + getZero(day) + '日' + ' ' + getZero(hours) + ':' + getZero(minutes) + ':' + getZero(seconds)
    return result
}

// 时间戳转换成日期与时间格式，年月日时分
const convertTimeToMinute = (str) => {
    let d = new Date(str)
    let year = d.getFullYear()
    let month = d.getMonth() + 1
    let day = d.getDate()
    let hours = d.getHours()
    let minutes = d.getMinutes()
    let result = year + '年' + getZero(month) + '月' + getZero(day) + '日' + ' ' + getZero(hours) + ':' + getZero(minutes)
    return result
}

const convertTimeToHour = (str) => {
    let d = new Date(str)
    let year = d.getFullYear()
    let month = d.getMonth() + 1
    let day = d.getDate()
    let hours = d.getHours()
    let result = year + '年' + getZero(month) + '月' + getZero(day) + '日' + ' ' + getZero(hours)
    return result
}

const getRandomInt = (max) => {
    let r = Math.floor(Math.random() * Math.floor(max))
    return r
}

const setLocalStorage = (key, value) => {
    localStorage.setItem(key,window.btoa(window.encodeURIComponent(JSON.stringify(value))))
}

const getLocalStorage = (key) => {
    if (localStorage.getItem(key)) {
        return JSON.parse(decodeURIComponent(window.atob(localStorage.getItem(key))));
    }
}

const alertMsg = (title) => {
    swal({
        title,
        text: '2秒后自动关闭',
        timer: 2000,
    }).then(
        function () {},
        function () {}
    )
}






const ajax = (data, url, callback, stop) => {
    $.ajax({
        //请求方式
        type : 'post',
        //请求的媒体类型
        contentType: 'application/json;charset=UTF-8',
        //请求地址
        url,
        //数据，json字符串
        data : JSON.stringify(data),
        //请求成功
        success : callback,
        //请求失败，包含具体的错误信息
        error : function(e){
            if (stop === 'stopInterval') {
                window.stopInterval = true;
            }
            console.log('e', e)
            swal({
                title: '请求失败了, 截图告诉我。。',
                text: 'sorry...',
                timer: 2000,
            }).then(function () {}, function () {})
        }
    })
}

/*格式 getBeforeDate('2015,5,20') */
/*
* auth:120975587@qq.com
* time:2015.5.6 9:45
* ******************
*/
// 计算今年已经过去了多久
function getBeforeDate(n){
    var now = new Date();
    var aftertime = new Date(n);
    var year = now.getFullYear();
    var mon= now.getMonth()+1;
    var day= now.getDate();
    var year_after = aftertime.getFullYear();
    var mon_after = aftertime.getMonth()+1;
    var day_after = aftertime.getDate();
    var chs = 0;
    //获取当月的天数
    function DayNumOfMonth(Year,Month)
    {
        return 32 - new Date(Year,Month-1,32).getDate();
    }
    if(aftertime.getTime() - now.getTime() < 0){
        var temp1 = day_after;
        var temp2 = mon_after;
        var temp3 = year_after;
        day_after = day;
        mon_after = mon;
        year_after = year;
        day = temp1;
        mon = temp2;
        year = temp3;
    }
    if(year == year_after){//不跨年
        if(mon == mon_after){//不跨年不跨月
            chs += day_after-day;
        }else{//不跨年跨月
            chs += DayNumOfMonth(year,mon)- day+1;//加上第一个不满的
            for(var i=1;i< mon_after-mon;i++){
                chs += DayNumOfMonth(year,mon+i);
            }
            chs += day_after-1;//加上
        }
    }else{//存在跨年
        chs += DayNumOfMonth(year,mon)- day+1;//加上开始年份不满的一个月
        for(var m=1;m<12-mon;m++){
            chs += DayNumOfMonth(year,mon+m);
        }
        for(var j=1;j < year_after-year;j++){
            if((year+j)%400 == 0 || (year+j)%4 == 0 && (year+j)%100 != 0){
                chs += 366;
            }else{
                chs += 365;
            }
        }
        for(var n=1;n <= mon_after;n++){
            chs += DayNumOfMonth(year_after,n);
        }
        chs += day_after-1;
    }
    if(aftertime.getTime() - now.getTime() < 0){
        return -chs;
    }else{
        return chs;
    }
}

function calculatePersent(num, n){
    num  = String(num.toFixed(n) * 100)
    num = num.slice(0, n + 1)
    if (num.slice(length -1) === '.') {
        num = num.slice(0, length-1) + '%'
    } else {
        num += '%'
    }
    return num
}

const addBgColor = (studyContent) => {
    let colorMapper = {
        tf: 'lightblue',
        工作: 'lightblue',
        axe: 'lightcoral',
        fep: 'lightcoral',
        斧头: 'lightcoral',
        mo: 'lightseagreen',
        摸鱼: 'lightseagreen',
    }
    // 赏心悦目的背景色由 LD 聚聚提供
    let colorMapper2 = {
        tf: '#FAF9DE',
        挖煤: '#FAF9DE',
        work: '#FAF9DE',
        工作: '#FAF9DE',
        work: '#FAF9DE',
        axe: '#E9EBFE',
        fep: '#E9EBFE',
        study: '#E9EBFE',
        斧头: '#E9EBFE',
        mo: '#FDE6E0',
        摸鱼: '#FDE6E0',
        fish: '#FDE6E0',
    }
    for (const key in colorMapper2) {
        if (studyContent.includes(key)) {
            return colorMapper2[key]
        }
    }
    return ''
}


const emptyTr = (s) => {
    // <tr style="background: #EAEAEF">
    return `<tr>
                    <td class="td-time font-bold">${s}</td>
                </tr>`
}

const hasExpectation = (list) => {
    for (const obj of list) {
        if (obj.expectation) {
            return true
        }
    }
    return false
}

const resetTr = (hasExpectationTime) => {
    let expectationTr = hasExpectationTime ? `<th>预期</th>` : ''
    let s = `
        <tr class="sccess head-tr">
            <th>时段</th>
            <th>时长</th>
            ${expectationTr}
            <th class="th-left">内容</th>
        </tr>`;
    return s
}

String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
};


// 把带 - 的数据找出来，拼成对象
const getprograssObj = (list) => {
    let prograssObj = {};
    for (const obj of list) {
        let s = obj.studyContent
        let index = s.indexOf('-');
        if (index < 0) {
            continue
        }
        let key = s.slice(0, index).trim();// tf
        let time = obj.minuteDuration // 1-0
        if (key in prograssObj) {
            prograssObj[key] += time
        } else {
            prograssObj[key] = time
        }
    }
    return prograssObj
}

// 获取直观的事项时间
const countItemTime = (list) => {
    // {axe: 180, tf: 150, mo: 130}
    let l = getprograssObj(list)
    let o = {}
    for (const key in l) {
        let v = l[key]
        o[v] = key
    }

    //o {130: "mo", 150: "tf", 180: "axe"}
    return o
}

// 生成记录项目的单独时长
const generateItemHtml= (table) => {
    let itemObj = countItemTime(table)
    let itemTimeList = Object.keys(itemObj).sort(function (a, b) {
        return Number(a) - Number(b)
    }).reverse()
    let len = itemTimeList.length
    if (len == 0) {
        return ''
    }
    let itemHtml = '( '
    for (let i = 0; i < len; i++) {
        if (i === 4) {
            break
        }
        let time = itemTimeList[i]
        let item = itemObj[time]
        time = (itemTimeList[i] / 60).toFixed(1)
        itemHtml += `${item} - ${time} h, `
    }
    itemHtml = itemHtml.slice(0, -2) + ' )'
    return itemHtml
}