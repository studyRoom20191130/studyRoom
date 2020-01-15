
//写一个前后端交互的 todo 项目
//显示所有的 todo
//新增 todo
//删除 todo
//完成 todo
//编辑 todo


global.today = ''

// express_demo.js 文件
const fs = require('fs')

// 引入 express 并且创建一个 express 实例赋值给 app
const express = require('express')
const log = console.log.bind(console)

const bodyParser = require('body-parser')

const app = express()

const todoList = []

// 配置静态文件目录
app.use(express.static('static'))

//配置 body-parser，把前端发送过来的数据自动解析成 json 格式
//要求请求 header 中 Content-Type 的值为 'application/json'
app.use(bodyParser.json())


const sendHtml = (path, response) => {
    let options = {
        encoding: 'utf-8',
    }
    fs.readFile(path, options, (error, data) => {

        response.send(data)
    })
}
// 用 get 定义一个给用户访问的网址
// request 是浏览器发送的请求
// response 是我们要发给浏览器的响应
app.get('/', (request, response) => {
    // fs 是 file system 文件系统的缩写
    let options = {
        encoding: 'utf-8',
    }
    // fs.readFile(path, options, (error, data) => {
    //     console.log(`读取的 html 文件 ${path} 内容是`, data)
    //     response.send(data)
    // })
    let path = 'login.html'
    sendHtml(path, response)
})

const writeFile = (fileName, content) => {
    fs.writeFile(fileName, content, {flag:"w"}, function (err) {
        if(err){
            return console.log(err);
        }else {
            console.log("写入成功");
        }
    })
}



app.post('/login', (request, response) => {
    let body = request.body
    let userData = body.username + '-' + body.password

    // 先看下有没有这个文件，没有的话就创建
    fs.readdir("./static/user-data",function (err, data) {
        if(err){
            response.send(err)
            return;
        }else {
            let uesrNotExist = !(data.includes(userData+'.json'))
            if (uesrNotExist) {
                let fileName = `./static/user-data/${userData}.json`
                writeFile(fileName, '')
            }
        }
    })
    response.send(userData)
})

app.post('/sendRecordData', (request, response) => {
    let recorDataObj = request.body
    log('recorDataObj', recorDataObj)
    // 读取， 更新，写入 个人文件
    let fileName = `./static/user-data/${recorDataObj.userData}.json`
    fs.readFile(fileName, 'utf-8', function (err,data) {
        if(err){
            console.log(err);
        }else {
            // 读取，更新
            let dataList = []
            log('data', data)
            if (data) {
                log('????')
                dataList = JSON.parse(data)
            }
            let init = dataList.length === 0
            if (init) {
                dataList.unshift(recorDataObj)
            } else {
                let todayObj = dataList[0]
                if (todayObj.today === recorDataObj.today) {
                    todayObj.table.push(recorDataObj.table[0])
                    dataList[0] = todayObj
                } else {
                    dataList.unshift(recorDataObj)
                }

            }
            let t = JSON.stringify(dataList, null, '    ')
            // 更新完毕，重新写入个人文件
            writeFile(fileName, t)

            // 读取， 更新，写入 当日文件
            let path = `./static/study-record-data/${recorDataObj.today}.json`
            fs.readFile(path, 'utf-8', function (err,data) {
                if(err){
                    console.log(err);
                }else {
                    // 读取，更新
                    let dataArray = []
                    if (data) {
                        dataArray = JSON.parse(data)
                        log('dataArray1', dataArray)
                    }
                    log('dataArray2', dataArray)
                    for (const index in dataArray) {
                        let obj = dataArray[index]
                        log(1111, obj.userData, recorDataObj.userData)
                        if (obj.userData === recorDataObj.userData) {
                            dataArray.splice(index, 1)
                        }
                    }
                    log('dataList', dataList)
                    dataArray.unshift(dataList[0])
                    log('dataArray', dataArray)
                    let d = JSON.stringify(dataArray, null, '    ')
                    // 更新完毕，重新写入个人文件
                    log('d', d)
                    writeFile(path, d)
                    response.send(dataArray)
                }
            })
        }
    })




})

app.post('/getStudyDataList', (request, response) => {
    let body = request.body
    let recordData = ''
    // 先看下有没有今天的记录文件，有的话发送内容，没有的话就创建
    fs.readdir("./static/study-record-data",function (err, data) {
        if(err){
            response.send(err)
            return;
        }else {
            getTodayAllData(response, recordData, data, body.today)
        }
    })
})

const getTodayAllData = (response, recordData, data, today) => {
    let fileName = `./static/study-record-data/${today}.json`
    let uesrNotExist = !(data.includes(today+'.json'))
    if (uesrNotExist) {
        writeFile(fileName)
    } else {
        // 存在
        fs.readFile(fileName,function (err,data) {
            if(err){
                console.log(err);
            }else {
                response.send(data)
            }
        })
    }
}





const main = () => {
    // listen 函数的第一个参数是我们要监听的端口
    // 这个端口是要浏览器输入的
    // 默认的端口是 80
    // 所以如果你监听 80 端口的话，浏览器就不需要输入端口了
    // 但是 1024 以下的端口是系统保留端口，需要管理员权限才能使用
    let server = app.listen(3600, () => {
        let host = server.address().address
        let port = server.address().port

        log(`应用实例，访问地址为 http://${host}:${port}`)
    })
}

// 这个是套路写法, 上课会讲
if (require.main === module) {
    main()
}
