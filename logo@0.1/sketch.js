let logoSketch = function (lp) {
    let _params = {
        colors: {
            background: [19, 20, 21],
            main: [255, 255, 255],
            debug: [255 * .6, 255 * .6, 255 * .6]
        }
    }

    let points = [];

    let myLinePoints = []

    const step = 10

    let _angleX = 0
    let _angleY = Math.PI / 2

    const projection = [
        [1, 0, 0],
        [0, 1, 0],
    ];

    let _scale
    let _path

    let angleX = 0
    let angleY = Math.PI / 2
    let angleZ = 0

    let _tempScaleToSee = 1
    let _swa = 1 * _tempScaleToSee
    let _swb = 2.1 * _tempScaleToSee

    let _totalFrames = 60 * 3

    let rotationX = [
        [1, 0, 0],
        [0, Math.cos(angleX), Math.sin(angleX)],
        [0, -Math.sin(angleX), Math.cos(angleX)],
    ];

    let rotationY = [
        [Math.cos(angleY), 0, -Math.sin(angleY)],
        [0, 1, 0],
        [Math.sin(angleY), 0, Math.cos(angleY)],
    ];

    let rotationZ = [
        [Math.cos(angleZ), Math.sin(angleZ), 0],
        [-Math.sin(angleZ), Math.cos(angleZ), 0],
        [0, 0, 1],
    ];

    lp.setup = function () {
        let canvas = lp.createCanvas(72 * _tempScaleToSee, 72 * _tempScaleToSee, lp.P2D);
        // canvas.id("canvas")
        canvas.parent('#logo-canvas')

        // create graphics
        createMyGraphics()

        // pick random form
        pickForm()

        // create path
        createPath()

        // define style
        lp.strokeCap(lp.SQUARE)
        lp.strokeJoin(lp.BEVEL)

        // define framerate
        lp.frameRate(60)
    }

    lp.draw = function () {
        lp.background(_params.colors.background);

        // translate to the middle
        lp.translate(lp.width / 2, lp.height / 2);

        // animation percentage
        let percent = (lp.frameCount % _totalFrames) / _totalFrames

        // ease animation
        percent = doubleExponentialSigmoid(percent);
        const tempVal = lp.map(percent, 0, 1, 0, 0 + lp.TWO_PI)

        // pick random form if the loop is done
        if (tempVal == 0) {
            pickForm()
        }

        // create rotation matrix
        _angleY = Math.PI / 2 + tempVal

        angleX = lp.lerp(angleX, _angleX, 0.1)
        angleY = _angleY

        rotationX = [
            [1, 0, 0],
            [0, Math.cos(angleX), Math.sin(angleX)],
            [0, -Math.sin(angleX), Math.cos(angleX)],
        ];

        rotationY = [
            [Math.cos(angleY), 0, -Math.sin(angleY)],
            [0, 1, 0],
            [Math.sin(angleY), 0, Math.cos(angleY)],
        ];

        rotationZ = [
            [Math.cos(angleZ), Math.sin(angleZ), 0],
            [-Math.sin(angleZ), Math.cos(angleZ), 0],
            [0, 0, 1],
        ];

        // project points
        const pts = projectPoints(myLinePoints)

        // start drawing
        // draw without path
        // lp.beginShape()
        // lp.noFill()
        // lp.stroke(..._params.colors.main)
        // lp.strokeWeight(_swa)
        // for (let i = 0; i < pts.length; i++) {
        //     const p = pts[i]
        //     lp.vertex(p.x, p.y)
        // }
        // lp.endShape(lp.CLOSE)

        // draw with path
        let currPath = 0
        let flip = false
        lp.beginShape()
        lp.noFill()
        lp.stroke(_params.colors.main)
        lp.strokeWeight(_swa)
        for (let i = 0; i < pts.length; i++) {
            if (i > 0) {
                lp.strokeWeight(flip ? _swa : _swb)
                const p1 = pts[i - 1]
                const p2 = pts[i]
                lp.vertex(p1.x, p1.y)
                lp.vertex(p2.x, p2.y)

            }
            // change strokeweight based on predefined path
            if (_path[currPath] == i) {
                lp.endShape()
                lp.beginShape()
                flip = !flip
                currPath++
            }
        }
        const p = pts[0]
        lp.vertex(p.x, p.y)
        lp.endShape()

        // console.log(lp.frameRate())
    }
    //————————————————————————————————————————————— ENDDRAW
    //————————————————————————————————————————————— ENDDRAW
    //————————————————————————————————————————————— ENDDRAW
    //————————————————————————————————————————————— ENDDRAW
    //————————————————————————————————————————————— ENDDRAW
    //————————————————————————————————————————————— ENDDRAW

    //————————————————————————————————————————————— helping functions
    /* Randomize array in-place using Durstenfeld shuffle algorithm */
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    function projectPoints(pts) {
        const projectedPoints = []
        for (let i = 0; i < pts.length; i++) {
            let rotated = matmul(rotationY, pts[i]);
            rotated = matmul(rotationX, rotated);
            let projected2d = matmul(projection, rotated);
            projected2d.mult(_scale);
            projectedPoints[i] = projected2d;
        }
        return projectedPoints
    }

    function createMyGraphics() {
        // size of the graphics in order to fit the canvas
        _scale = lp.height / 6 * 4

        // PUT CUBE POINTS
        points[0] = lp.createVector(-0.5, -0.5, -0.5);
        points[1] = lp.createVector(0.5, -0.5, -0.5); // 2a
        points[2] = lp.createVector(0.5, 0.5, -0.5); // 3a
        points[3] = lp.createVector(-0.5, 0.5, -0.5);

        points[4] = lp.createVector(-0.5, -0.5, 0.5);
        points[5] = lp.createVector(0.5, -0.5, 0.5); // 2
        points[6] = lp.createVector(0.5, 0.5, 0.5); // 3
        points[7] = lp.createVector(-0.5, 0.5, 0.5);
    }

    function randNumber() {
        const ans = (lp.floor(lp.random(0, step + 1)) / step) - 0.5
        return ans
    }

    function pickForm() {
        myLinePoints[0] = lp.createVector(randNumber(), -0.5, 0.0)
        myLinePoints[1] = lp.createVector(randNumber(), -0.4, 0.0)
        myLinePoints[2] = lp.createVector(randNumber(), -0.5, 0.2)
        myLinePoints[3] = lp.createVector(randNumber(), 0.5, 0.2)
        myLinePoints[4] = lp.createVector(randNumber(), 0.2, -0.2)
        myLinePoints[5] = lp.createVector(randNumber(), -0.2, 0.4)
    }

    // create path for stroke to be different sizes
    function createPath() {
        _path = new Array(myLinePoints.length - 2).fill(0).map((val, idx) => {
            return idx + 1
        })
        shuffleArray(_path)
        _path.splice(0, lp.floor(lp.random(myLinePoints.length - 2)))
        _path.sort()
    }

    function doubleExponentialSigmoid(_x, _a) {
        if (!_a) _a = 0.75; // default

        var min_param_a = 0.0 + Number.EPSILON;
        var max_param_a = 1.0 - Number.EPSILON;
        _a = lp.constrain(_a, min_param_a, max_param_a);
        _a = 1 - _a;

        var _y = 0;
        if (_x <= 0.5) {
            _y = (Math.pow(2.0 * _x, 1.0 / _a)) / 2.0;
        } else {
            _y = 1.0 - (Math.pow(2.0 * (1.0 - _x), 1.0 / _a)) / 2.0;
        }
        return (_y);
    }

    // MATRIX
    function vecToMatrix(v) {
        let m = [];
        for (let i = 0; i < 3; i++) {
            m[i] = [];
        }
        m[0][0] = v.x;
        m[1][0] = v.y;
        m[2][0] = v.z;
        return m;
    }

    function matrixToVec(m) {
        return lp.createVector(m[0][0], m[1][0], m.length > 2 ? m[2][0] : 0);
    }

    function matmulvec(a, vec) {
        let m = vecToMatrix(vec);
        let r = matmul(a, m);
        return matrixToVec(r);
    }

    function matmul(a, b) {
        if (b instanceof p5.Vector) {
            return matmulvec(a, b);
        }

        let colsA = a[0].length;
        let rowsA = a.length;
        let colsB = b[0].length;
        let rowsB = b.length;

        if (colsA !== rowsB) {
            console.error("Columns of A must match rows of B");
            return null;
        }

        result = [];
        for (let j = 0; j < rowsA; j++) {
            result[j] = [];
            for (let i = 0; i < colsB; i++) {
                let sum = 0;
                for (let n = 0; n < colsA; n++) {
                    sum += a[j][n] * b[n][i];
                }
                result[j][i] = sum;
            }
        }
        return result;
    }
}

new p5(logoSketch)