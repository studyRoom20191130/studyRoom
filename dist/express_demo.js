


global.today = ''


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

const createMailContent = () => {
    let users = ['life', 'H.K', 'LD', 'Sean']
    let html = `<h1>如果不想被统计，可以和我（life）说哦</h1>`
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
            special += `<div style="line-height: 30px;color: lightslategray;">
        <span class="">${key} - </span><span class="">共计 ${totalHour} 小时，平均每天投入${(totalHour/7).toFixed(1)}小时</span>
    </div>`;
        }

        let h = `
    <div style="border: 1px solid #ccc;padding: 20px;width: 30%;text-align: center">
    <div style="color: lightcoral;"><b>${user}</b></div>
    <div style="line-height: 30px;color: lightslategray;">过去 7 天总记录时长 ${totalHour} 小时</div>
    <div style="line-height: 30px;color: lightslategray;">平均每天记录时长 ${penHour} 小时 </div>
    ${special}
    </div>
    `
        html += h
    }
    return  html

}

const sendMail = () => {

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

    let html = createMailContent()

    let mailOptions = {
        from: ' "自习室统计周报" <2518921392@qq.com>', // sender address
        to: '2518921392@qq.com, 460337379@qq.com, xm9295@qq.com, 1109218203@qq.com', // list of receivers
        subject: '自习室统计周报(在过去168小时中我们留下的痕迹)', // Subject line
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
    sendMail()
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
    let user = request.body.user
    let fileName = `./static/online-list/user.json`
    fs.readFile(fileName, 'utf-8', function (err,data) {
        if(err){
            console.log(err);
        }else {
            let dataList = JSON.parse(data)
            if (dataList.includes(user)) {
                let index = dataList.indexOf(user)
                dataList.splice(index, 1)
            }
            let t = JSON.stringify(dataList)
            writeFile(fileName, t)
        }
    })
})


app.post('/getOnlineUser', (request, response) => {
    let user = request.body.user
    let fileName = `./static/online-list/user.json`
    fs.readFile(fileName, 'utf-8', function (err,data) {
        if(err){
            console.log(err);
        }else {
            let dataList = JSON.parse(data)
            let init = dataList.length === 0
            let notInclude = !dataList.includes(user)
            if (init || notInclude) {
                dataList.unshift(user)
                let t = JSON.stringify(dataList)
                writeFile(fileName, t)
            }
            response.send(dataList)
        }
    })
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
                // 把签名带上
                let signature = fs.readFileSync(`./static/signature/${user}.txt`,'utf-8');
                dataArray[0].signature = signature
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
    log('user', user)
    let signaturePath = `./static/signature/${user}.txt`
    fs.readFileSync(signaturePath, 'utf-8', function (err,data) {
        let signature = data || ''
        log('getSignature', signature)
        return signature
    })
}






app.post('/sendRecordData', (request, response) => {
    let requestObj = request.body
    let fileName = `./static/user-data/${requestObj.user}.json`
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
                    // 每次都替换一下 签名
                    todayObj.signature = fs.readFileSync(`./static/signature/${requestObj.user}.txt`,'utf-8')
                    dataList[0] = todayObj
                } else {
                    dataList.unshift(requestObj)
                }

            }
            let t = JSON.stringify(dataList, null, '    ')
            writeFile(fileName, t)


            makesureTodayFileExist(requestObj.today)
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
                    dataArray.unshift(dataList[0])
                    let d = JSON.stringify(dataArray, null, '    ')
                    writeFile(path, d)
                    response.send(dataArray)
                }
            })
        }
    })
})

const makesureTodayFileExist = (today) => {
    let path = `./static/study-record-data`
    let data = fs.readdirSync(path)
    let fileNotExist = !(data.includes(today+'.json'))

    if (fileNotExist) {
        let fileName = `./static/study-record-data/${today}.json`
        writeFile(fileName, '')
        // 每天重置在线同学的列表
        writeFile('./static/online-list/user.json', JSON.stringify([]))
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
            makesureTodayFileExist(today)
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




const getTodayAllData = (response, recordData, data, today) => {
    let fileName = `./static/study-record-data/${today}.json`

    let uesrNotExist = !(data.includes(today+'.json'))

    if (uesrNotExist) {

        writeFile(fileName, '')
        // 每天重置在线同学的列表
        writeFile('./static/online-list/user.json', JSON.stringify([]))
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




const main = () => {
    let server = app.listen(5555, () => {
        let host = server.address().address
        let port = server.address().port
    })
}


if (require.main === module) {
    main()
}
