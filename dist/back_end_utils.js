const fs = require('fs')
const moment = require('moment')
const writeFile = (fileName, content) => {
    fs.writeFile(fileName, content, {flag: "w"}, function (err) {
        if (err) {
            return console.log(err);
        }
    })
}

const jsonFilePath = './static/json'
const nodemailer = require('nodemailer')

// 邮件功能
const showTotalHour = (list) => {
    let obj = {};
    let totalHour = 0
    for (const record of list) {
        let table = record.table;
        for (const signalRecord of table) {
            let studyContent = signalRecord.studyContent;
            totalHour += signalRecord.hourDuration
            if (studyContent.includes('-')) {
                let index = studyContent.indexOf('-');
                let key = studyContent.slice(0, index).trim();
                if (key in obj) {
                    obj[key] += signalRecord.hourDuration;
                } else {
                    obj[key] = signalRecord.hourDuration;
                }
            }
        }
    }
    return [obj, totalHour]
}

const createMailContent = (mailUsers) => {
    let users = mailUsers
    let html = `<div style="display: flex;flex-wrap: wrap">`
    for (const user of users) {
        let fileName = `${jsonFilePath}/${global.year}/user-data/${user}.json`

        let dataArray = fs.readFileSync(fileName, 'utf-8');
        dataArray = JSON.parse(dataArray)
        dataArray = dataArray.slice(0, 7)
        //在后端直接算好 echarts 需要的数据
        let [totalHourObj, totalHour] = showTotalHour(dataArray)
        totalHour = totalHour.toFixed(1)
        let penHour = (totalHour / 7).toFixed(1)


        // 过去七天的总学习时长
        let special = ``
        // 短横线项目的时长

        for (const key in totalHourObj) {
            const totalHour = Math.round(totalHourObj[key]);
            let color = key.trim() === '浪费时间' ? 'deepskyblue' : 'lightslategray'
            special += `<div style="line-height: 30px;color: ${color} ;">
        <span class="">${key} - </span><span class="">共计 ${totalHour} 小时，平均每天${(totalHour / 7).toFixed(1)}小时</span>
    </div>`;
        }

        let h = `
    <div style="border: 1px solid #ccc;padding: 20px;width: 25%;text-align: center">
    <div style="color: lightcoral;"><b>${user}</b></div>
    <div style="line-height: 30px;color: lightslategray;font-weight: bold;">过去 7 天总记录时长 ${totalHour} 小时</div>
    <div style="line-height: 30px;color: lightcoral;">平均每天记录时长 ${penHour} 小时 </div>
    ${special}
    </div>
    `
        html += h
    }
    return html + '</div>'
}

const sendMail = (mailUsers, mailAddress) => {
    let transporter = nodemailer.createTransport({
        // host: 'smtp.ethereal.email',
        service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
        secure: true,
        auth: {
            user: '2518921392@qq.com',
            // 这里密码不是qq密码，是你设置的smtp授权码
            pass: 'odowqlojztaqebji',
        }
    })

    let html = createMailContent(mailUsers)

    let mailOptions = {
        from: ' "自习室统计周报" <2518921392@qq.com>', // sender address
        to: mailAddress,
        // to: '2518921392@qq.com', // list of receivers
        subject: '自习室统计周报(过去168小时中的学习记录)', // Subject line
        // 发送text或者html格式
        // text: 'Hello world?', // plain text body

        html, // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
}

const getAvatarOrWeapon = (user, directoryName) => {
    let isWeapon = directoryName === 'weapon'
    let filename = isWeapon ?
        `${jsonFilePath}/weapon/weaponMapper.json` : `${jsonFilePath}/hero/${user}.txt`
    let data = ''
    try {
        data = fs.readFileSync(filename, 'utf-8')
        if (isWeapon) {
            data = JSON.parse(data)
            return data[user] || ''
        }
    } catch (err) {
    }
    return data
}


const getTotalHourObj = (user) => {
    let path = `${jsonFilePath}/todo-count/${user}.json`
    let list = fs.readdirSync(`${jsonFilePath}/todo-count`, 'utf-8')
    let fileNotExist = !(list.includes(user + '.json'))
    if (fileNotExist) {
        writeFile(path, JSON.stringify({}))
        return {}
    }
    let data = fs.readFileSync(path, 'utf-8')
    let totalHourObj = JSON.parse(data)
    return totalHourObj
}

const processPersonalStudyData = (dataArray, num) => {
    // 全部数据
    let d = dataArray
    let len = d.length
    if (len <= 30 || num > len || num === 'all') {
        // 总数据不足 30 天，直接返回全部
        // 要求返回的数据大于总数据，直接返回全部
        d[0].responseAllData = true
        return d
    } else {
        // 每次传30条数据过去
        return d.slice(num - 30, num)
    }
}

const updateUserInfo = (user, userObj, yearlyObj) => {
    let signature = fs.readFileSync(`${jsonFilePath}/signature/${user}.txt`, 'utf-8')
    let hero = getAvatarOrWeapon(user, 'hero')
    let weapon = getAvatarOrWeapon(user, 'weapon')
    userObj.signature = signature
    userObj.hero = hero
    userObj.weapon = weapon
    userObj.yearlyObj = yearlyObj
    return userObj
}

// 计算时间段
const hourAndMinutes = (startHour, startMinute, endHour, endMinute) => {
    let hour = Number(endHour) - Number(startHour);

    // 23:00  -  00:20 这种情况
    if (startHour[0] === '2' && endHour[0] === '0') {
        hour = Number(endHour[1]) + 24 - Number(startHour);
    }

    let minutes = hour * 60;
    minutes += Number(endMinute) - Number(startMinute);
    hour = Number((minutes / 60).toFixed(2));
    return [hour, minutes]
}


const getDuration = (startTime) => {
    let endTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let endTimeList = endTime.slice(11, 16).split(':');

    let [endHour, endMinute] = endTimeList;
    let [startHour, startMinute] = startTime.slice(11, 16).split(':');
    return hourAndMinutes(startHour, startMinute, endHour, endMinute)
}


const calTime = (requestObj) => {
    let {s, e} = requestObj
    let user = requestObj.user
    // 如果是补录时间
    if (s && e) {
        let start = s.slice(0, 2) + ':' + s.slice(2)
        let end = e.slice(0, 2) + ':' + e.slice(2)
        let segmentation = start + ' - ' + end
        let [hourDuration, minuteDuration] = hourAndMinutes(s.slice(0, 2), s.slice(2), e.slice(0, 2), e.slice(2))
        return [segmentation, hourDuration, minuteDuration]
    } else {
        let {startHourAndMinute, startTime} = global.users[user]
        let endHourAndMinute = moment().format('HH:mm')
        let segmentation = startHourAndMinute + ' - ' + endHourAndMinute
        let [hourDuration, minuteDuration] = getDuration(startTime)
        return [segmentation, hourDuration, minuteDuration]
    }
}

const processCurrentRecord = (requestObj) => {
    // 计算时长
    let today = moment().format('YYYY年MM月DD日')

    let [segmentation, hourDuration, minuteDuration] = calTime(requestObj)

    let {studyContent, expectation} = requestObj
    // currentRecord
    let currentRecord = {
        segmentation, // 12:30 - 13:30
        minuteDuration, // 60
        hourDuration, // 1
        studyContent,
        expectation,
    }
    requestObj.table = [currentRecord]
    requestObj.today = today
    return [requestObj, currentRecord]
}

const minuteDurationInvalid = (minuteDuration) => {
    if (minuteDuration < 0) {
        return [true, '输入时间错误，请确认输入是否正确']
    }
    if (minuteDuration > 180) {
        // alertMsg()
        return [true, '时间超过180分钟，请拆分细化后再补录']
    }
    return [false]
}

const updateUserData = (requestObj, response) => {
    let fileName = `${jsonFilePath}/${global.year}/user-data/${requestObj.user}.json`
    let data = fs.readFileSync(fileName, 'utf-8')

    let [recordObj, currentRecord] = processCurrentRecord(requestObj)
    let [invalid, errMsg] = minuteDurationInvalid(currentRecord.minuteDuration)
    if (invalid) {
        response.send({errMsg})
        return null
    }
    let dataList = []
    if (data) {
        dataList = JSON.parse(data)
    }
    let init = dataList.length === 0

    if (init) {
        dataList.unshift(recordObj)
    } else {
        let todayObj = dataList[0]

        if (todayObj.today === recordObj.today) {
            todayObj.table.push(currentRecord)
            dataList[0] = todayObj
        } else {
            dataList.unshift(recordObj)
        }
    }
    let t = JSON.stringify(dataList, null, '    ')
    writeFile(fileName, t)
    return dataList[0]
}

// 计算时间段

const makeSureTodayFileExist = () => {
    let today = moment().format('YYYY年MM月DD日')
    let path = `${jsonFilePath}/${global.year}/study-record-data`
    let data = fs.readdirSync(path)
    let fileNotExist = !(data.includes(today + '.json'))

    if (fileNotExist) {
        let fileName = `${jsonFilePath}/${global.year}/study-record-data/${today}.json`
        writeFile(fileName, '')
        // 每天重置在线同学的列表
        // writeFile('${jsonFilePath}/online-list/user.json', JSON.stringify([]))
        // 每天重置装备列表
        writeFile('${jsonFilePath}/weapon/weaponMapper.json', JSON.stringify({}))
    }
}


const updateWeapon = (data, user) => {
    data = JSON.parse(data)
    let weapon = getAvatarOrWeapon(user, 'weapon')
    let signature = fs.readFileSync(`${jsonFilePath}/signature/${user}.txt`, 'utf-8')

    for (const datum of data) {
        let u = datum.user
        if (user === u) {
            datum.signature = signature
            datum.weapon = weapon
        }
    }
    return JSON.stringify(data)
}

const getTodayAllData = (response, recordData, data, body) => {
    let {today, user} = body
    let fileName = `${jsonFilePath}/${global.year}/study-record-data/${today}.json`

    let uesrNotExist = !(data.includes(today + '.json'))

    if (uesrNotExist) {

        writeFile(fileName, '')
        // 每天重置在线同学的列表
        writeFile(`${jsonFilePath}/online-list/user.json`, JSON.stringify([]))
        // 每天重置装备列表
        writeFile(`${jsonFilePath}/weapon/weaponMapper.json`, JSON.stringify({}))
        // 每天给成员生成对应的文件
        // makeSureUsersWeeklyReport(today)
    } else {
        fs.readFile(fileName, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                // 实际应该分接口的， 但还是合到一个接口吧
                // 找到 user 把装备内容写进去
                if (data.length != 0) {
                    data = updateWeapon(data, user)
                }
                response.send(data)
            }
        })
    }
}

const updateRecordData = (requestObj, todayObj, yearlyObj, response) => {
    let fileName = `${jsonFilePath}/${global.year}/study-record-data/${requestObj.today}.json`
    let data = fs.readFileSync(fileName, 'utf-8')
    let dataArray = []
    if (data) {
        dataArray = JSON.parse(data)
    }
    let a = []
    for (const index in dataArray) {
        let obj = dataArray[index]
        if (obj.user !== requestObj.user) {
            a.push(obj)
        }
    }
    // 每次都替换一下 签名 和 头像 和年度计划
    let userObj = updateUserInfo(requestObj.user, todayObj, yearlyObj)
    a.unshift(userObj)
    let d = JSON.stringify(a, null, '    ')
    writeFile(fileName, d)
    response.send(a)
}


const updateTotalHour = (requestObj) => {
    let latestRecord = requestObj.table[0]
    let {studyContent, hourDuration} = latestRecord
    let totalObj = getTotalHourObj(requestObj.user)
    let obj = totalObj[global.year]
    if (studyContent.includes('-')) {
        let totalObj = getTotalHourObj(requestObj.user)
        let obj = totalObj[global.year] || {}
        let index = studyContent.indexOf('-')
        let key = studyContent.slice(0, index).trim()
        if (key in obj) {
            obj[key] += hourDuration
        } else {
            obj[key] = hourDuration
        }
        totalObj[global.year] = obj
        let path = `${jsonFilePath}/todo-count/${requestObj.user}.json`
        writeFile(path, JSON.stringify(totalObj, null, '    '))
    }
    return obj
}

module.exports = {
    writeFile,
    sendMail,
    getAvatarOrWeapon,
    getTotalHourObj,
    processPersonalStudyData,
    updateUserInfo,
    updateUserData,
    makeSureTodayFileExist,
    getTodayAllData,
    updateRecordData,
    updateTotalHour,
}