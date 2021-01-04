const fs = require('fs')

// const path = require("path");

const express = require('express')
const log = console.log.bind(console)

const bodyParser = require('body-parser')
const nodemailer = require('nodemailer');
const app = express()

const todoList = []


app.use(express.static('static'))
// app.use(express.static(path.join('static', 'public'),{maxAge:1000*60*60*24*90}));

app.use(bodyParser.json())

const createMailContent = (mailUsers) => {
    let users = mailUsers
    let html = `<div style="display: flex;flex-wrap: wrap">`
    for (const user of users) {
        let fileName = `./static/user-data/${user}.json`

        let dataArray = fs.readFileSync(fileName,'utf-8');
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
            let color = key.trim() === '浪费时间' ? 'deepskyblue': 'lightslategray'
            special += `<div style="line-height: 30px;color: ${color} ;">
        <span class="">${key} - </span><span class="">共计 ${totalHour} 小时，平均每天${(totalHour/7).toFixed(1)}小时</span>
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
    return  html + '</div>'

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
    });

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
        // console.log('Message sent: %s', info.messageId);
        // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
    });
}

app.post('/sendMail', (request, response) => {
    let mailUsers = request.body.mailUsers
    let mailAddress = request.body.mailAddress
    sendMail(mailUsers, mailAddress)
    response.send("邮件已发送")
})

const sendHtml = (path, response) => {
    let options = {
        encoding: 'utf-8',
    }
    fs.readFile(path, options, (error, data) => {
        response.send(data)
    })
}



app.get('/', (request, response) => {
    let options = {
        encoding: 'utf-8',
    }

    let path = 'login.html'
    sendHtml(path, response)
})

app.post('/removeOfflineUser', (request, response) => {
    try {
        let user = request.body.user
        let fileName = `./static/online-list/user.json`
        let data = fs.readFileSync(fileName,'utf-8');
        let dataList = JSON.parse(data)
        if (dataList.includes(user)) {
            let index = dataList.indexOf(user)
            dataList.splice(index, 1)
        }
        let t = JSON.stringify(dataList)
        writeFile(fileName, t)
    } catch (e) {

    }
})


app.post('/getOnlineUser', (request, response) => {
    let user = request.body.user
    let fileName = `./static/online-list/user.json`
    let data = fs.readFileSync(fileName,'utf-8');
    try {
        let dataList = JSON.parse(data)
        let init = dataList.length === 0
        let notInclude = !dataList.includes(user)
        if (init || notInclude) {
            dataList.unshift(user)
            let t = JSON.stringify(dataList)
            writeFile(fileName, t)
        }
        response.send(dataList)
    } catch (e) {
        response.send(["你自己"])
    }

})


const writeFile = (fileName, content) => {
    fs.writeFile(fileName, content, {flag:"w"}, function (err) {
        if(err){
            return console.log(err);
        }
    })
}



app.post('/login', (request, response) => {
    let body = request.body
    let username = body.username
    let userData = username + '-' + body.password

    fs.readdir("./static/user-data",function (err, data) {
        if(err){
            response.send(err)
            return;
        }else {
            let uesrNotExist = !(data.includes(username +'.json'))
            if (uesrNotExist) {
                let fileName = `./static/user-data/${username}.json`
                writeFile(fileName, '')
            }
        }
    })
    response.send(userData)
})

const getAvatarOrWeapon = (user, directoryName) => {
    let isWeapon = directoryName === 'weapon'
    let filename =  isWeapon ?
        `./static/weapon/weaponMapper.json`  :  `./static/hero/${user}.txt`
    let data = ''
    try {
        data = fs.readFileSync(filename,'utf-8')
        if (isWeapon) {
            data = JSON.parse(data)
            return data[user] || ''
        }
    } catch (err) {
    }
    return data
}



app.post('/getPersonalStudyData', (request, response) => {
    let user = request.body.user
    let fileName = `./static/user-data/${user}.json`
    fs.readFile(fileName, 'utf-8', function (err,data) {
        if (err) {
            console.log(err);
        } else {
            let dataArray = []
            if (data) {
                dataArray = JSON.parse(data)
                let [totalHourObj, d] = showTotalHour(dataArray)
                let num = request.body.num || 30
                dataArray = processPersonalStudyData(dataArray, num)
                // 把签名和英雄带上
                let signature = fs.readFileSync(`./static/signature/${user}.txt`,'utf-8');
                let hero = getAvatarOrWeapon(user, 'hero')

                dataArray[0].signature = signature
                dataArray[0].hero = hero
                //在后端直接算好 echarts 需要的数据

                dataArray[0].totalHourObj = totalHourObj
            }
            response.send(dataArray)
        }
    })
})

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

// 计算所有的短横线时间
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

const getSignature = (user) => {
    let signaturePath = `./static/signature/${user}.txt`
    fs.readFileSync(signaturePath, 'utf-8', function (err,data) {
        let signature = data || ''
        return signature
    })
}


app.post('/sendRecordData', (request, response) => {
    let requestObj = request.body
    let fileName = `./static/user-data/${requestObj.user}.json`
    let signature = fs.readFileSync(`./static/signature/${requestObj.user}.txt`,'utf-8')
    let hero = getAvatarOrWeapon(requestObj.user, 'hero')
    let weapon = getAvatarOrWeapon(requestObj.user, 'weapon')
    fs.readFile(fileName, 'utf-8', function (err,data) {
        if(err){
            console.log(err);
        }else {
            let dataList = []
            if (data) {
                dataList = JSON.parse(data)
            }
            let init = dataList.length === 0
            if (init) {
                dataList.unshift(requestObj)
            } else {
                let todayObj = dataList[0]
                if (todayObj.today === requestObj.today) {
                    todayObj.table.push(requestObj.table[0])
                    dataList[0] = todayObj
                } else {
                    dataList.unshift(requestObj)
                }

            }
            let t = JSON.stringify(dataList, null, '    ')
            writeFile(fileName, t)


            makeSureTodayFileExist(requestObj.today)
            let path = `./static/study-record-data/${requestObj.today}.json`
            fs.readFile(path, 'utf-8', function (err,data) {
                if(err){
                    console.log(err);
                }else {
                    let dataArray = []
                    if (data) {
                        dataArray = JSON.parse(data)
                    }

                    for (const index in dataArray) {
                        let obj = dataArray[index]
                        if (obj.userData === requestObj.userData) {
                            dataArray.splice(index, 1)
                        }
                    }
                    // 每次都替换一下 签名 和 头像
                    dataList[0].signature = signature
                    dataList[0].hero = hero
                    dataList[0].weapon = weapon

                    dataArray.unshift(dataList[0])
                    let d = JSON.stringify(dataArray, null, '    ')
                    writeFile(path, d)
                    response.send(dataArray)
                }
            })
        }
    })
})

const makeSureTodayFileExist = (today) => {
    let path = `./static/study-record-data`
    let data = fs.readdirSync(path)
    let fileNotExist = !(data.includes(today+'.json'))

    if (fileNotExist) {
        let fileName = `./static/study-record-data/${today}.json`
        writeFile(fileName, '')
        // 每天重置在线同学的列表
        writeFile('./static/online-list/user.json', JSON.stringify([]))
        // 每天重置装备列表
        writeFile('./static/weapon/weaponMapper.json', JSON.stringify({}))
    }
}

app.post('/sendComment', (request, response) => {
    let requestObj = request.body
    let today = requestObj.today
    let fileName = `./static/user-data/${requestObj.user}.json`
    fs.readFile(fileName, 'utf-8', function (err,data) {
        if(err){
            console.log(err);
        }else {
            let dataList = JSON.parse(data)
            let todayObj = dataList[0]
            let commentObj = {
                comment: requestObj.comment,
                commenter: requestObj.commenter,
                replyer: requestObj.replyer,
            }
            let commentArray = todayObj.commentArray || []
            commentArray.push(commentObj)
            dataList[0].commentArray = commentArray
            let t = JSON.stringify(dataList, null, '    ')
            writeFile(fileName, t)

            // 如果想在页面中展示 评论时间，这里可以存进 json，但好像没有展示的必要
            // let s = requestObj.commentTime.slice(0, 10).split('-')
            // let today = s[0] + '年' + s[1] + '月' + s[2] + '日'
            // 如果没有当天的文件，新建一个
            let s = requestObj.commentTime.slice(0, 10).split('-')
            let today = s[0] + '年' + s[1] + '月' + s[2] + '日'
            makeSureTodayFileExist(today)
            let path = `./static/study-record-data/${today}.json`
            fs.readFile(path, 'utf-8', function (err,data) {
                if(err){
                    console.log(err);
                }else {
                    let dataArray = JSON.parse(data)

                    for (const index in dataArray) {
                        let obj = dataArray[index]
                        if (obj.user === requestObj.user) {
                            dataArray.splice(index, 1)
                        }
                    }
                    dataArray.unshift(dataList[0])
                    let d = JSON.stringify(dataArray, null, '    ')
                    writeFile(path, d)
                    response.send(dataArray)
                }
            })
        }
    })
})

app.post('/getStudyDataList', (request, response) => {
    let body = request.body
    let user = body.user
    let recordData = ''

    fs.readdir("./static/study-record-data",function (err, data) {
        if(err){
            response.send(err)
            return;
        }else {
            getTodayAllData(response, recordData, data, body.today)
        }
    })

    fs.readdir("./static/signature",function (err, data) {
        let fileName = `./static/signature/${user}.txt`
        let uesrNotExist = !(data.includes(user +'.txt'))
        if (uesrNotExist) {
            writeFile(fileName, '')
        }
    })
})


const makeSureUsersWeeklyReport = (today) => {
    let users = [ '点点',
        'LD',
        'Sean',
        '黑白灰',
        'life',
        '东斌',
        '亭川',
        '古泽',
        'daimian',
        'Ly',
        '卡']
    for (const user of users) {
        let fileName = `./static/user-data/${user}.json`
        let dataList = fs.readFileSync(fileName,'utf-8')
        dataList = JSON.parse(dataList)
        let todayRecord = {...dataList[0]}
        todayRecord.today = today
        todayRecord.table = []
        dataList.unshift(todayRecord)
        let t = JSON.stringify(dataList, null, '    ')
        writeFile(fileName, t)
    }
}

const getTodayAllData = (response, recordData, data, today) => {
    let fileName = `./static/study-record-data/${today}.json`

    let uesrNotExist = !(data.includes(today+'.json'))

    if (uesrNotExist) {

        writeFile(fileName, '')
        // 每天重置在线同学的列表
        writeFile('./static/online-list/user.json', JSON.stringify([]))
        // 每天重置装备列表
        writeFile('./static/weapon/weaponMapper.json', JSON.stringify({}))
        // 每天给成员生成对应的文件
        // makeSureUsersWeeklyReport(today)
    } else {
        fs.readFile(fileName,function (err,data) {
            if(err){
                console.log(err);
            }else {

                response.send(data.toString())
            }
        })
    }
}

app.post('/saveSignature', (request, response) => {
    let {signature, user} = request.body

    fs.readdir("./static/signature",function (err, data) {
        if(err){
            response.send(err)
            return;
        }else {
            let fileName = `./static/signature/${user}.txt`
            // let uesrNotExist = !(data.includes(today+'.json'))
            // if (uesrNotExist) {
            //     writeFile(fileName, signature)
            // }
            writeFile(fileName, signature)
        }
    })
})


app.post('/chooseHero', (request, response) => {
    let {hero, user} = request.body
    fs.readdir("./static/hero",function (err, data) {
        if(err){
            response.send(err)
            return;
        }else {
            let fileName = `./static/hero/${user}.txt`
            writeFile(fileName, hero)
        }
    })
    response.send('')
})

app.post('/chooseWeapon', (request, response) => {
    let {user, weapon} = request.body
    let fileName = './static/weapon/weaponMapper.json'
    let weaponMapper = fs.readFileSync(fileName,'utf-8')
    weaponMapper = JSON.parse(weaponMapper)
    let w = weapon + '-'
    if (user in weaponMapper) {
        weaponMapper[user] += w
    } else {
        weaponMapper[user] = w
    }
    let d = JSON.stringify(weaponMapper, null, '    ')

    writeFile(fileName, d)
    response.send('')
})



app.post('/dailyReport', (request, response) => {
    let user = request.body.user
    let fileName = `./static/user-data/${user}.json`
    fs.readFile(fileName, 'utf-8', function (err,data) {
        if (err) {
            console.log(err);
        } else {
            let dataArray = []
            if (data) {
                dataArray = JSON.parse(data)
                response.send(dataArray[0])
            }
        }
    })
})


const main = () => {
    let server = app.listen(5000, () => {
        let host = server.address().address
        let port = server.address().port
    })
}


if (require.main === module) {
    main()
}
