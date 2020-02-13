


global.today = ''


const fs = require('fs')


const express = require('express')
const log = console.log.bind(console)

const bodyParser = require('body-parser')

const app = express()

const todoList = []


app.use(express.static('static'))


app.use(bodyParser.json())


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

    let fileName = `./static/user-data/${recorDataObj.userData}.json`
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
            writeFile(fileName, t)

            let path = `./static/study-record-data/${recorDataObj.today}.json`
            fs.readFile(path, 'utf-8', function (err,data) {
                if(err){
                    console.log(err);
                }else {
                    let dataArray = []
                    if (data) {
                        dataArray = JSON.parse(data)
                        log('dataArray1', dataArray)
                    }
                    log('dataArray2', dataArray)
                    for (const index in dataArray) {
                        let obj = dataArray[index]
                        if (obj.userData === recorDataObj.userData) {
                            dataArray.splice(index, 1)
                        }
                    }
                    log('dataList', dataList)
                    dataArray.unshift(dataList[0])
                    log('dataArray', dataArray)
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
    let recordData = ''

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
    log('fileName', fileName)
    let uesrNotExist = !(data.includes(today+'.json'))
    log('uesrNotExist', uesrNotExist)
    if (uesrNotExist) {
        log(111)
        writeFile(fileName, '')
    } else {
        log(2222)
        fs.readFile(fileName,function (err,data) {
            if(err){
                console.log(err);
            }else {
                log('data', data.toString())
                response.send(data.toString())
            }
        })
    }
}





const main = () => {
    let server = app.listen(3600, () => {
        let host = server.address().address
        let port = server.address().port

        log(`应用实例，访问地址为 http://${host}:${port}`)
    })
}


if (require.main === module) {
    main()
}
