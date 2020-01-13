const assert = require('http-assert')
const bcrypt = require('bcryptjs')
const Api = require('./api')
class UserApi extends Api {
    login(form) {
        let username = form.username
        let query = {
            username,
        }
        let fetch = this.fetch(query)
        return fetch.then(user => {
            let error = [422, '用户不存在 or 密码错误']
            assert(user != null, ...error)
            let valid = this.compare(form, user)
            assert(valid, ...error)
            return user
        })
    }
    register(form) {
        // TODO 注册的表单验证
        // 检查 密码长度 组合
        let username = form.username
        let query = {
            username,
        }
        let fetch = this.fetch(query)
        return fetch.then(user => {
            let error = [422, '用户名存在']
            assert(user == null, ...error)
        }).then(() => {
            let password = form.password
            let salt = bcrypt.genSaltSync(10)
            password = bcrypt.hashSync(password, salt)
            let data = {
                username: form.username,
                password,
            }
            let user = this.add(data)
            return user
        })
    }
    compare(form, user) {
        let p1 = form.password
        let p2 = user.password
        return bcrypt.compareSync(p1, p2)
    }
}

module.exports = (model) => {
    return new UserApi(model)
}