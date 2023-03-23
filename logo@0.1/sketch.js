let _params = {
    colors: {
        background: [19, 20, 21],
        main: [255, 255, 255],
        debug: [255 * .6, 255 * .6, 255 * .6]
    }
}

let angle = 0;

let points = [];

let myLinePoints = []

let gridPoints = []


const step = 10

let _angleX = 0
let _angleY = Math.PI / 2

const projection = [
    [1, 0, 0],
    [0, 1, 0],
];

let _scale = 1088
let _path

let angleX = 0
let angleY = Math.PI / 2
let angleZ = 0

let _tempScaleToSee = 5
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

let _debug = false
let _changeTime = Infinity

let ease, styles

let _showTrail = false

function setup() {
    let canvas = createCanvas(72 * _tempScaleToSee, 72 * _tempScaleToSee);
    canvas.id("canvas")

    // create graphics
    createMyGraphics()

    // pick random form
    pickForm()

    // create path
    createPath()

    // define style
    strokeCap(SQUARE)
    strokeJoin(BEVEL)

    // init motion style
    ease = new p5.Ease();
    styles = ease.listAlgos();
    styles = [
        'quadraticInOut', 'doubleEllipticOgee',
        'circularInOut', 'doubleExponentialSigmoid',
        'gompertz', 'exponentialEmphasis', 'normalizedInverseErf'
    ];

    // define framerate
    frameRate(60)
}

function createMyGraphics() {
    // size of the graphics in order to fit the canvas
    _scale = height / 6 * 4

    // PUT CUBE POINTS
    points[0] = createVector(-0.5, -0.5, -0.5);
    points[1] = createVector(0.5, -0.5, -0.5); // 2a
    points[2] = createVector(0.5, 0.5, -0.5); // 3a
    points[3] = createVector(-0.5, 0.5, -0.5);

    points[4] = createVector(-0.5, -0.5, 0.5);
    points[5] = createVector(0.5, -0.5, 0.5); // 2
    points[6] = createVector(0.5, 0.5, 0.5); // 3
    points[7] = createVector(-0.5, 0.5, 0.5);

    // PUT GRID POINTS
    for (let i = 0; i < step + 1; i++) {
        for (let j = 0; j < step + 1; j++) {
            const idx = i + j * (step + 1)
            const x = ((i) / step) - 0.5
            const y = ((j) / step) - 0.5
            gridPoints[idx] = createVector(x, y, -0.5)
        }
    }
    for (let i = 0; i < step + 1; i++) {
        for (let j = 0; j < step + 1; j++) {
            const idx = i + j * (step + 1) + (pow(step + 1, 2))
            const x = ((i) / step) - 0.5
            const y = ((j) / step) - 0.5
            gridPoints[idx] = createVector(x, y, 0.5)
        }
    }
    for (let i = 0; i < step + 1; i++) {
        for (let j = 0; j < step + 1; j++) {
            const idx = i + j * (step + 1) + (pow(step + 1, 2)) * 2
            const x = ((i) / step) - 0.5
            const y = ((j) / step) - 0.5
            gridPoints[idx] = createVector(0.5, x, y)
        }
    }
    for (let i = 0; i < step + 1; i++) {
        for (let j = 0; j < step + 1; j++) {
            const idx = i + j * (step + 1) + (pow(step + 1, 2)) * 3
            const x = ((i) / step) - 0.5
            const y = ((j) / step) - 0.5
            gridPoints[idx] = createVector(-0.5, x, y)
        }
    }
}

function randNumber() {
    const ans = (floor(random(0, step + 1)) / step) - 0.5
    return ans
}

function pickForm() {
    myLinePoints[0] = createVector(randNumber(), -0.5, 0.0)
    myLinePoints[1] = createVector(randNumber(), -0.4, 0.0)
    myLinePoints[2] = createVector(randNumber(), -0.5, 0.2)
    myLinePoints[3] = createVector(randNumber(), 0.5, 0.2)
    myLinePoints[4] = createVector(randNumber(), 0.2, -0.2)
    myLinePoints[5] = createVector(randNumber(), -0.2, 0.4)
}

function draw() {
    background(_params.colors.background);

    // translate to the middle
    translate(width / 2, height / 2);

    // create rotation matrix
    let percent = (frameCount % _totalFrames) / _totalFrames
    percent = ease[styles[3]](percent);
    const tempVal = map(percent, 0, 1, 0, 0 + TWO_PI)
    if (tempVal == 0) {
        pickForm()
    }

    _angleY = Math.PI / 2 + tempVal

    angleX = lerp(angleX, _angleX, 0.1)
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
    let projected = projectPoints(points)

    const pts = projectPoints(myLinePoints)

    // start drawing
    // draw without path
    // beginShape()
    // noFill()
    // stroke(..._params.colors.main)
    // strokeWeight(_swa)
    // for (let i = 0; i < pts.length; i++) {
    //     const p = pts[i]
    //     vertex(p.x, p.y)
    // }
    // endShape(CLOSE)

    // draw with path
    let currPath = 0
    let flip = false
    beginShape()
    noFill()
    stroke(_params.colors.main)
    strokeWeight(_swa)
    // if (mouseX < width / 2) filxzl(255)
    for (let i = 0; i < pts.length; i++) {
        if (i > 0) {
            strokeWeight(flip ? _swa : _swb)
            const p1 = pts[i - 1]
            const p2 = pts[i]
            vertex(p1.x, p1.y)
            vertex(p2.x, p2.y)

        }
        // change strokeweight based on predefined path
        if (_path[currPath] == i) {
            endShape()
            beginShape()
            flip = !flip
            currPath++
        }
    }
    const p = pts[0]
    vertex(p.x, p.y)
    endShape()


    // draw GRID
    if (_debug) {
        noStroke();
        fill(..._params.colors.debug)
        for (let i = 0; i < projected.length; i++) {
            const v = projected[i];
            ellipse(v.x, v.y, _swa * 2, _swa * 2);
        }

        // Connecting
        strokeWeight(_swa / 3)
        for (let i = 0; i < 4; i++) {
            connect(i, (i + 1) % 4, projected);
            connect(i + 4, ((i + 1) % 4) + 4, projected);
            connect(i, i + 4, projected);
        }

        const projectedGridPoints = projectPoints(gridPoints)
        noStroke()
        for (let i = 0; i < gridPoints.length; i++) {
            const p = projectedGridPoints[i]
            ellipse(p.x, p.y, _swa, _swa)
        }
    }
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

function connect(i, j, points) {
    const a = points[i];
    const b = points[j];
    stroke(..._params.colors.debug);
    line(a.x, a.y, b.x, b.y);
}

// create path for stroke to be different sizes
function createPath() {
    _path = new Array(myLinePoints.length - 2).fill(0).map((val, idx) => {
        return idx + 1
    })
    shuffleArray(_path)
    _path.splice(0, floor(random(myLinePoints.length - 2)))
    _path.sort()
}