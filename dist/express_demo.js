
//写一个前后端交互的 todo 项目
//显示所有的 todo
//新增 todo
//删除 todo
//完成 todo
//编辑 todo




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
        log(`读取的 html 文件 ${path} 内容是`, data)
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
    let path = 'index.html'
    sendHtml(path, response)
})

app.get('/todo/all', (request, response) => {
    let r = JSON.stringify(todoList)
    response.send(r)
})

app.post('/todo/add', (request, response) => {
    // request.body 就是客户端发送过来的数据，用之前需使用 body-parser 解析成 json 格式
    let data = request.body
    if (todoList.length === 0) {
        data.id = 1
    } else {
        let tail = todoList.slice(-1)[0]
        data.id = tail.id + 1
    }
    todoList.push(data)
    response.send(data)
})

app.get('/todo/delete/:id', (request, response) => {
    let todoId = Number(request.params.id)
    for(let todo of todoList) {
        if (todo.id === todoId) {
            let data = todoList.splice(todoId - 1, 1)
            response.send(data[0])
            break
        }
    }
})

app.post('/todo/edit/:id', (request, response) => {
    let todoId = Number(request.params.id)
    let todoContent = request.body
    for(let todo of todoList) {
        if (todo.id === todoId) {
            todo.task = todoContent.task
        }
    }
})

const isDone = (todo) => {
    if (todo.done === true) {
        todo.done = false
    }  else {
        todo.done = true
    }
}

app.get('/todo/complete/:id', (request, response) => {
    let todoId = Number(request.params.id)
    for(let todo of todoList) {
        if (todo.id === todoId) {
            isDone(todo)
        }
    }

})

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
