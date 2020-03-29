class AxeMesh extends GuaObject {
    constructor() {
        super()
        this.position = GuaVector.new(0, 0, 0)
        // 旋转角度
        this.rotation = GuaVector.new(0, 0, 0)
        // 三角形数组
        this.triangles = []
    }

    static fromAxe3D(axe3dString) {

    }
}
