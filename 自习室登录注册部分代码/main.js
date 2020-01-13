const log = console.log.bind(console)
const path = require('path')

// 数据库
const mongoose = require('mongoose')

const connectMongo = (uri, callback) => {
    let option = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
    mongoose.connect(uri, option).then(db => {
        log('数据库连接成功')
        callback(db)
    }).catch(e => log('数据库连接失败', e))
}

const express = require('express')
const app = express()


// 模板引擎
// 理论上指定 views 目录可以不加
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// 静态目录
app.use(express.static(path.join(__dirname, 'static')))

// parser
// 以前可能需要引入 body-parser, json-parser
// 但是现在版本的 express 内部加入了这种中间件
// 这里配置 urlencoded 的 extended 是为了拿到 FormData
// 测试的时候我用的 FormData, 之后直接用 JSON 就好了
app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())

// session 中间件
const session = require('express-session')
app.use(session({
    secret: 'iskanfiqh9ay4u9uppeajasi03u2',
    resave: false,
    saveUninitialized: true,
}))

// 路由
app.use('/', require('./routes/index'))
app.use('/', require('./routes/user'))

// 错误拦截
let errorHandler = (err, req, res, next) => {
    let code = err.status || 500
    let message = err.message
    // 如果 err 没有 message
    // 说明不是我们自己抛出的异常
    if (message == undefined) {
        errorHandler(err)
        message = err.toString()
    }
    let data = {
        message
    }
    res.status(code).send(message)
    log('错误', err)
}
app.use(errorHandler)

const serve = (port, ...args) => {
    let server = app.listen(port, () => {
        log('服务器启动')
        log(`访问地址: http://localhost:${port}`)
    })
}

const main = () => {
    let config = require('./config')
    connectMongo(config.mongoURI, (db) => {
        serve(config.port)
    })
}

if (require.main === module) {
    main()
}
