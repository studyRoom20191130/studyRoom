class GuaVector extends GuaObject {
    // 表示二维向量的类
    constructor(x, y, z) {
        super()
        this.x = x
        this.y = y
        this.z = z
    }
    interpolate(other, factor) {
        let p1 = this
        let p2 = other
        let x = p1.x + (p2.x - p1.x) * factor
        let y = p1.y + (p2.y - p1.y) * factor
        let z = p1.z + (p2.z - p1.z) * factor
        return GuaVector.new(x, y, z)
    }
}
