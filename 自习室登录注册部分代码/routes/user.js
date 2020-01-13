var log = console.log.bind(console)
const express = require('express')
const router = express.Router()

const User = require('../models/User')
const userApi = require('./api/user')(User)

const sendError = (err, res) => {
    let code = err.status
    res.status(code).send(err)
}

const render = (res, page) => res.render(page)


session.login = (req, user) => {
    req.session.user = user
}
session.logout = (req) => {
    delete req.session.user
}

router.get('/login', (req, res) => {
    render(res, 'login')
})

router.post('/login', (req, res) => {
    let form = req.body
    userApi.login(form).then(user => {
        session.login(req, user)
        res.redirect('/')
    }).catch(err => sendError(err, res))
})

router.get('/logout', (req, res) => {
    session.logout(req)
    res.redirect('/')
})

router.get('/join', (req, res) => {
    render(res, 'join')
})

router.post('/join', (req, res) => {
    let form = req.body
    userApi.register(form).then(user => {
        log('user', user)
        res.redirect('/')
    }).catch(err => sendError(err, res))
})

router.get('/admin/all', (req, res) => {
    userApi.all().then(users => {
        log('users', users)
        res.send(users)
    })
})

module.exports = router

