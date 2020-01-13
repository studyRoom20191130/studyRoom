class Api {
    constructor(model) {
        this.model = model
    }
    fetch(query) {
        return this.model.findOne(query)
    }
    add(data) {
        return this.model.create(data)
    }
    all() {
        return this.model.find()
    }
}

module.exports = Api
