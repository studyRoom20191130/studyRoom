const log = console.log.bind(console)

const e = (selector) => {
    const element = document.querySelector(selector)
    if (element == null) {
        const s = `元素没找到，选择器 ${selector} 没有找到或者 js 没有放在 body 里`
        log(s)
    } else {
        return element
    }
    return element
}

const es = (selector) => {
    const elements = document.querySelectorAll(selector)
    if (elements.length == 0) {
        const s = `元素没找到，选择器 ${selector} 没有找到或者 js 没有放在 body 里`
        log(s)
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

// 补0操作
const getZero = (num) => {
    if (parseInt(num) < 10) {
        num = '0' + num
    }
    return num
}


// 时间戳转换成 年月日
const getDate = (str) => {
    let d = new Date(str)
    let year = d.getFullYear()
    let month = d.getMonth() + 1
    let day = d.getDate()
    //最后拼接时间
    let result = year + '年' + getZero(month) + '月' + getZero(day) + '日'
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

