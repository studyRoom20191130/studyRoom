const fs = require('fs')
const moment = require('moment')

// const path = require("path");

const express = require('express')
const log = console.log.bind(console)
const bodyParser = require('body-parser')

const {updateUserData, updateUserInfo, processPersonalStudyData, sendMail, writeFile, getAvatarOrWeapon, getTotalHourObj,
    updateTotalHour, updateRecordData, getTodayAllData, makeSureTodayFileExist, updateEditData, updateTodayData} = require("./back_end_utils");

const app = express()

const jsonFilePath = './static/json'

global.year = new Date().getFullYear()

global.users = {}

app.use(express.static('static'))
// app.use(express.static(path.join('static', 'public'),{maxAge:1000*60*60*24*90}));

app.use(bodyParser.json())


app.get('/', (request, response) => {
    fs.readFile('login.html', {encoding: 'utf-8',}, (error, data) => {
        response.send(data)
    })
})

app.post('/login', (request, response) => {
    let body = request.body
    let username = body.username
    let userData = username + '-' + body.password

    fs.readdir(`${jsonFilePath}/${global.year}/user-data`, function (err, data) {
        if (err) {
            response.send(err)
            return;
        } else {
            let uesrNotExist = !(data.includes(username + '.json'))
            if (uesrNotExist) {
                let fileName = `${jsonFilePath}/${global.year}/user-data/${username}.json`
                writeFile(fileName, '')
            }
        }
    })
    response.send(userData)
})

app.post('/sendMail', (request, response) => {
    let mailUsers = request.body.mailUsers
    let mailAddress = request.body.mailAddress
    sendMail(mailUsers, mailAddress)
    response.send("邮件已发送！")
})

app.post('/getPersonalStudyData', (request, response) => {
    let {user, year} = request.body
    let userList = ['点点',
        'LD',
        'Sean',
        'life',
        '亭川',
        '荒',
        'Ly',
    ]
    if (year < 2021 && !(userList.includes(user))) {
        response.send([])
        return

    }
    if (user.includes('Clement')) {
        user = 'Clement'
    }

    let fileName = `${jsonFilePath}/${year}/user-data/${user}.json`
    let dataArray = []
    let data = fs.readFileSync(fileName, 'utf-8')
    if (data) {
        dataArray = JSON.parse(data)
        let totalHourObj = getTotalHourObj(user)
        let num = request.body.num || 30
        dataArray = processPersonalStudyData(dataArray, num)
        // 把签名和英雄带上

        let signature = fs.readFileSync(`${jsonFilePath}/signature/${user}.txt`, 'utf-8')
        let hero = getAvatarOrWeapon(user, 'hero')

        dataArray[0].signature = signature
        dataArray[0].hero = hero
        //在后端直接算好 echarts 需要的数据

        dataArray[0].totalHourObj = totalHourObj
    }
    response.send(dataArray)
})

// 点击开始按钮，记录当下时间
app.post('/startCountTime', (request, response) => {
    let user = request.body.user
    let startHourAndMinute = moment().format('HH:mm');
    let startTime = moment().format('YYYY-MM-DD HH:mm:ss')
    global.users[user] = {
        startHourAndMinute,
        startTime,
    }
    response.send("")
})

app.post('/endCountTime', (request, response) => {
    let requestObj = request.body
    let todayObj = updateUserData(request.body, response)
    if (todayObj == null) {
        return
    }
    makeSureTodayFileExist()
    let yearlyObj = updateTotalHour(requestObj)
    updateRecordData(requestObj, todayObj, yearlyObj, response)
})

app.post('/updateContent', (request, response) => {
    // 到当天文件里面修改
    // 如果是删除,还要去 todocount 里面删除对应的时间
    let [obj, user] = updateEditData(request.body)

    updateTodayData(obj, user, response)
})

app.post('/sendComment', (request, response) => {
    let requestObj = request.body
    let user = requestObj.user
    if (requestObj.user.includes('Clement')) {
        user = 'Clement'
    }
    // console.log("requestObj", requestObj)
    let fileName = `${jsonFilePath}/${global.year}/user-data/${user}.json`
    fs.readFile(fileName, 'utf-8', function (err, data) {
        if (err) {
            console.log(err);
        } else {
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
            makeSureTodayFileExist()
            let today = moment().format('YYYY年MM月DD日')
            let path = `${jsonFilePath}/${global.year}/study-record-data/${today}.json`
            fs.readFile(path, 'utf-8', function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    let dataArray = JSON.parse(data)

                    for (const index in dataArray) {
                        let obj = dataArray[index]
                        if (obj.user === requestObj.user) {
                            dataArray.splice(index, 1)
                        }
                    }
                    let userObj = updateUserInfo(requestObj.user, dataList[0])
                    dataArray.unshift(userObj)
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
    fs.readdir(`${jsonFilePath}/${global.year}/study-record-data`, function (err, data) {
        if (err) {
            response.send(err)
            return;
        } else {
            getTodayAllData(response, recordData, data, body)
        }
    })

    if (user.includes('Clement')) {
        user = 'Clement'
    }

    fs.readdir(`${jsonFilePath}/signature`, function (err, data) {
        let fileName = `${jsonFilePath}/signature/${user}.txt`
        let uesrNotExist = !(data.includes(user + '.txt'))
        if (uesrNotExist) {
            writeFile(fileName, '')
        }
    })
})

app.post('/updatePlan', (request, response) => {
    let body = request.body
    let {
        type,
        user,
        planList,
    } = body
    let path = `${jsonFilePath}/${global.year}/user-${type}-plan`
    let data = fs.readdirSync(path)
    let fileNotExist = !(data.includes(user + '.json'))
    let fileName = `${jsonFilePath}/${global.year}/user-${type}-plan/${user}.json`
    writeFile(fileName, JSON.stringify(planList, null, '    '))
    response.send('')
})

app.post('/getPlan', (request, response) => {
    let body = request.body
    console.log("body", body)
    let {
        type,
        user,
    } = body
    let path = `${jsonFilePath}/${global.year}/user-${type}-plan`
    let data = fs.readdirSync(path)
    let fileNotExist = !(data.includes(user + '.json'))
    if (fileNotExist) {
        response.send([])
        return
    }
    let fileName = `${jsonFilePath}/${global.year}/user-${type}-plan/${user}.json`
    let list = fs.readFileSync(fileName, 'utf-8')
    response.send(JSON.parse(list))
})

app.post('/saveSignature', (request, response) => {
    let {signature, user} = request.body

    fs.readdir(`${jsonFilePath}/signature`, function (err, data) {
        if (err) {
            response.send(err)
            return;
        } else {
            if (user.includes('Clement')) {
                user = 'Clement'
            }
            let fileName = `${jsonFilePath}/signature/${user}.txt`
            // let uesrNotExist = !(data.includes(today+'.json'))
            // if (uesrNotExist) {
            //     writeFile(fileName, signature)
            // }
            writeFile(fileName, signature)
            response.send('')
        }
    })
})

app.post('/chooseHero', (request, response) => {
    let {hero, user} = request.body
    fs.readdir(`${jsonFilePath}/hero`, function (err, data) {
        if (err) {
            response.send(err)
            return;
        } else {
            let fileName = `${jsonFilePath}/hero/${user}.txt`
            writeFile(fileName, hero)
        }
    })
    response.send('')
})

app.post('/chooseWeapon', (request, response) => {
    let {user, weapon} = request.body
    let fileName = `${jsonFilePath}/weapon/weaponMapper.json`
    let weaponMapper = fs.readFileSync(fileName, 'utf-8')
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
    if (user.includes('Clement')) {
        user = 'Clement'
    }
    let fileName = `${jsonFilePath}/${global.year}/user-data/${user}.json`
    fs.readFile(fileName, 'utf-8', function (err, data) {
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
