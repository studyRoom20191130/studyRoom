const test_drawTriangle1 = function(canvas) {
    let p1 = GuaVector.new(50, 50, 1);
    let p2 = GuaVector.new(0, 200, 1);
    let p3 = GuaVector.new(100, 200, 1);
    let v1 = GuaVertex.new(p1, GuaColor.red());
    let v2 = GuaVertex.new(p2, GuaColor.green());
    let v3 = GuaVertex.new(p3, GuaColor.blue());

    canvas.drawTriangle1(v1, v2, v3);
    canvas.render();
};

const test_drawTriangle2 = function(canvas) {
    let p1 = GuaVector.new(50, 50, 0);
    let p2 = GuaVector.new(0, 50, 0);
    let p3 = GuaVector.new(25, 100, 0);
    let v1 = GuaVertex.new(p1, GuaColor.red());
    let v2 = GuaVertex.new(p2, GuaColor.green());
    let v3 = GuaVertex.new(p3, GuaColor.blue());
    canvas.drawTriangle2(v1, v2, v3);
    canvas.render();
};


const drawPlane = function(canvas) {
    let v1 = GuaVertex.new(GuaVector.new(100, 100, 1), GuaColor.red())
    let v2 = GuaVertex.new(GuaVector.new(200, 150, 1), GuaColor.new(0, 255, 0, 255))
    let v3 = GuaVertex.new(GuaVector.new(100, 150, 1), GuaColor.new(0, 0, 255, 255))

    let v4 = GuaVertex.new(GuaVector.new(150, 100, 0), GuaColor.red())
    let v5 = GuaVertex.new(GuaVector.new(250, 150, 0), GuaColor.new(0, 255, 0, 255))
    let v6 = GuaVertex.new(GuaVector.new(150, 150, 0), GuaColor.black())

    canvas.drawTriangle(v1, v2, v3)
    canvas.drawTriangle(v4, v5, v6)
}

const pureColor = function(canvas) {
    let v1 = GuaVertex.new(GuaVector.new(100, 100, 1), GuaColor.red())
    let v2 = GuaVertex.new(GuaVector.new(200, 150, 1), GuaColor.new(0, 255, 0, 255))
    let v3 = GuaVertex.new(GuaVector.new(100, 150, 1), GuaColor.new(0, 0, 255, 255))

    let v4 = GuaVertex.new(GuaVector.new(150, 100, 0), GuaColor.red())
    let v5 = GuaVertex.new(GuaVector.new(250, 150, 0), GuaColor.new(0, 255, 0, 255))
    let v6 = GuaVertex.new(GuaVector.new(150, 150, 0), GuaColor.black())

    canvas.drawTriangle(v1, v2, v3)
    canvas.drawTriangle(v4, v5, v6)
}

