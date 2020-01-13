const assert = require('http-assert')
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    let user = req.session.user
    res.render('index', { user })
})


module.exports = router