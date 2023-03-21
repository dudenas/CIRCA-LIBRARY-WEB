const _clrs = [
	[19, 20, 21], // background
	[255 * 0.87, 255 * 0.87, 255 * 0.87], // debug text
	[255, 186, 8], // main stroke color
]

let _clrsGraphics = [
	[255 * 0.60, 255 * 0.60, 255 * 0.60], // big circle
	[255 * 0.38, 255 * 0.38, 255 * 0.38] // graphics
]

let _ratio
let _path
let _w, _h
let _rdSeed = Math.random() * 1000

let csmd, csoc, csl

// grid
let _grid
let _gridRows
let _gridCols

// animation
let _trail = []
let _maxTrail = 50
let _skipCircles = 8
let _tpIndexes = 0

//————————————————————————————————————————————— setup
function setup() {
	const canvas = createCanvas(1920 / 3 * 2, 1080 / 3 * 2, P2D);
	// attach to the id
	canvas.parent('#header-canvas')

	// shuffle path array and decide how many parts there will be
	resizeMyCanvas()

	// style
	noFill()
	textAlign(CENTER, CENTER)
	strokeCap(SQUARE);
	strokeJoin(BEVEL);
	rectMode(CENTER)
	// textAlign(LEFT, BOTTOM)

	_w = width
	_h = height

	// parameters to control fucking randomness
	csmd = {
		len: random(),
		count: random(1, 5),
		w: random(),
	}

	csoc = {
		idx: floor(random(_points.length)),
		amt: random(),
		diam: random(width / 5, width / 2)
	}

	csl = {
		special1: random(),
		special2: random()
	}
}

//————————————————————————————————————————————— draw
function draw() {
	randomSeed(_rdSeed)
	background(_clrs[0])

	createSubgraphicsOverlayCircle(this)
	noFill()

	// show line
	stroke(..._clrsGraphics[1])
	// draw shape
	let flip = false
	let currPath = 0

	beginShape()
	_points.forEach((elm, idx) => {
		// draw element if it is not the first one
		if (idx > 0) {
			// draw line
			strokeWeight(flip ? params.swa : params.swb)
			elm.show(_points[idx - 1], this)
		}

		// change strokeweight based on predefined path
		if (_path[currPath] == idx) {
			endShape()
			beginShape()
			flip = !flip
			currPath++
		}
	})
	// connect last and the first points
	vertex(_points[0].pos.x, _points[0].pos.y)
	endShape()

	// create animation for the point to go from a to b
	let percent = (frameCount % 720) / 720

	let pointIdx = floor(map(percent, 0, 1, 0, _points.length))
	let currPoint = _points[pointIdx]
	let nextPoint = _points[(pointIdx + 1) % _points.length]
	let pointPercent = map(percent, (pointIdx) / (_points.length), (pointIdx + 1) / (_points.length), 0, 1)
	let pointPosX = map(pointPercent, 0, 1, currPoint.pos.x, nextPoint.pos.x)
	let pointPosY = map(pointPercent, 0, 1, currPoint.pos.y, nextPoint.pos.y)

	noStroke()
	fill(..._clrs[2])
	circle(pointPosX, pointPosY, params.swb * 2)

	if (_trail.length < _maxTrail) {
		if (frameCount % _skipCircles == 0) {
			const n = new TrailPoint(pointPosX, pointPosY, _tpIndexes)
			_tpIndexes = (_tpIndexes + 1) % _maxTrail
			_trail.push(n)
		}
	} else {
		_trail.shift()
	}

	// show trail
	for (let i = 0; i < _trail.length; i++) {
		const tp = _trail[i]
		tp.update(i - 1)
		tp.show()
		if (tp.idx % 10 == 0) {
			tp.showText()
		}
	}


	// supporting graphics
	const rndIdx = new Array(4).fill(0).map(x => floor(random(params.totalPoints)))
	createSubgraphicLines(params.linesTotal, rndIdx[0], (rndIdx[0] + 1) % params.totalPoints, this)
	createSubgraphicConnectingCircles(rndIdx[1], (rndIdx[1] + 1) % params.totalPoints, this)
	createSubgraphicConnectingCirclesCenter(rndIdx[2], (rndIdx[2] + 1) % params.totalPoints, this)
	createSubgraphicMidGraphics(rndIdx[3], (rndIdx[3] + 1) % params.totalPoints, this)
}
//————————————————————————————————————————————— ENDDRAW
//————————————————————————————————————————————— ENDDRAW
//————————————————————————————————————————————— ENDDRAW
//————————————————————————————————————————————— ENDDRAW
//————————————————————————————————————————————— ENDDRAW
//————————————————————————————————————————————— ENDDRAW

/**
 * create overlay circle
 * @function
 */
function createSubgraphicsOverlayCircle(p) {
	const idx = csoc.idx
	const posA = _points[idx].pos.copy()
	const posB = _points[(idx + 1) % _points.length].pos.copy()
	const amt = csoc.amt
	const pos = p5.Vector.lerp(posA, posB, amt)
	const diam = csoc.diam

	p.noStroke()
	p.fill(_clrsGraphics[0])
	p.circle(pos.x, pos.y, diam)
}

/**
 * create subraphic mid graphics
 * @function
 */
function createSubgraphicMidGraphics(idx1, idx2, p) {
	p.stroke(..._clrsGraphics[1])
	const mode = params.midGraphicsMode
	const posA = _points[idx1].pos.copy()
	const posB = _points[idx2].pos.copy()
	const posCenter = posA.add(posB)

	const lenBetween = p5.Vector.sub(posA, posB).mag() / 2
	const len = min(100, lenBetween / 2) * csmd.len
	const count = floor(csmd.count)
	const w = csmd.w * width / 4


	switch (mode) {
		case 0:
			p.push()
			p.rectMode(CENTER)
			p.noStroke()
			p.fill(_clrsGraphics[1])
			posCenter.div(2)
			p.rect(posCenter.x, posCenter.y, w, params.swb * 2)
			p.pop()
			break
		case 1:
			p.push()
			p.rectMode(CENTER)
			p.noStroke()
			p.fill(_clrsGraphics[1])
			posCenter.div(2)
			p.circle(posCenter.x, posCenter.y, len)
			p.pop()
			break
		case 2:
			p.noFill()
			p.strokeWeight(params.swa)
			posCenter.div(2)
			for (let i = -count; i < count; i++) {
				const y = posCenter.y + i * len / 2
				p.circle(posCenter.x, y, len)
			}
			break
		case 3:
			p.noFill()
			p.strokeWeight(params.swa)
			posCenter.div(2)
			for (let i = -count; i < count; i++) {
				const val = (i + 1) / (count + 1) * .25
				const posRect = posCenter.copy().add(p5.Vector.sub(posA, posB).mult(val))
				p.line(posRect.x - w / 2, posRect.y, posRect.x + w / 2, posRect.y)
			}

			break
		default:
			console.log('check createSubgraphicsMidGraphics some indexes are going not where they should')
	}
}

/**
 * create subraphic lines
 * @function
 */
function createSubgraphicLines(total, idx1, idx2, p) {
	p.noFill()
	p.stroke(..._clrsGraphics[1])
	p.strokeWeight(params.swa)
	const posA = _points[idx1 % _points.length].pos.copy()
	const posB = _points[(idx1 + 1) % _points.length].pos.copy()
	const posC = _points[idx2 % _points.length].pos.copy()
	const posD = _points[(idx2 + 1) % _points.length].pos.copy()
	const special1 = csl.special1
	const special2 = csl.special2
	for (let i = 0; i < total; i++) {
		const percent1 = map((i + 1) / (total + 1), 0, 1, 0, special1);
		const percent2 = map((i + 1) / (total + 1), 0, 1, 0, special2);
		const pos1 = p5.Vector.lerp(posA, posB, percent1)
		const pos2 = p5.Vector.lerp(posD, posC, percent2)
		p.line(pos1.x, pos1.y, pos2.x, pos2.y)
	}
}

/**
 * create connecting circles center
 * @function
 */
function createSubgraphicConnectingCirclesCenter(idx1, idx2, p) {
	p.noFill()
	// params.highlightConnectingCirclesCenter ? p.stroke(..._clrs[2]) : p.stroke(..._clrsGraphics[1])
	p.stroke(..._clrs[2])
	p.strokeWeight(params.swa)
	const posA = _points[idx1].pos.copy()
	const posB = _points[idx2].pos.copy()
	const diam = p5.Vector.dist(posB, posA) * 2
	p.circle(posA.x, posA.y, diam)
}

/**
 * create connecting circles
 * @function
 */
function createSubgraphicConnectingCircles(idx1, idx2, p) {
	p.noFill()
	p.stroke(..._clrs[2])
	p.strokeWeight(params.swa)
	const posA = _points[idx1].pos.copy()
	const posB = _points[idx2].pos.copy()
	const posCenter = posA.add(posB)
	posCenter.div(2)
	const diam = p5.Vector.dist(posB, posA) * 2
	p.circle(posCenter.x, posCenter.y, diam)
}

/**
 * create graphics, first a path then points
 * @function
 */
function createGRFC() {
	randomSeed(_rdSeed)
	// create grid
	createGrid()
	createPath()
	createPoints()
}

/**
 * create path
 * @function
 */
function createPath() {
	_path = new Array(params.totalPoints - 2).fill(0).map((val, idx) => {
		return idx + 1
	})
	shuffleArray(_path)
	_path.splice(0, floor(random(params.totalPoints - 2)))
	_path.sort()
}


//————————————————————————————————————————————— helping functions
/**
 * Randomize array in-place using Durstenfeld shuffle algorithm 
 * @function
 * */
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

/**
 * gets random position within a grid
 * @function
 */
function getGridPosition() {
	const i = floor(random(0, _gridRows + 1))
	const j = floor(random(0, _gridCols + 1))
	return _grid[i][j]
}

/**
 * create grid
 * @function
 */
function createGrid() {
	// calculate ratio
	_ratio = width / params.scl
	_grid = []
	_gridRows = params.scl
	_gridCols = Math.floor(height / width * params.scl)
	console.log(_gridRows, _gridCols)
	for (let i = 0; i < _gridRows + 1; i++) {
		const x = i * _ratio
		_grid[i] = []

		for (let j = 0; j < _gridCols + 1; j++) {
			const y = j * _ratio
			_grid[i][j] = createVector(x, y)
		}
	}
}

let _points

/**
 * creates new points
 * @function
 */
function createPoints() {
	_points = []

	for (let n = 0; n < params.totalPoints; n++) {
		_points.push(new Point(n))
	}
	redraw()
}

//————————————————————————————————————————————— Point
class Point {
	constructor(idx) {
		this.pos = getGridPosition()

		this.idx = idx
	}

	//————————————————————————————————————————————— Point update
	update() {

	}

	//————————————————————————————————————————————— Point show
	show(other, p) {
		p.vertex(other.pos.x, other.pos.y)
		p.vertex(this.pos.x, this.pos.y)
	}
}

class TrailPoint {
	constructor(x, y, idx) {
		this.x = x
		this.y = y
		this.ox = x
		this.oy = y
		this.fr = 0
		this.idx = idx
	}

	//————————————————————————————————————————————— Point update
	update(otherIdx) {
		if (otherIdx >= 0) {
			const other = _trail[otherIdx]
			const total = _maxTrail * _skipCircles
			const percent = this.fr / total
			this.x = lerp(other.ox, this.ox, percent)
			this.y = lerp(other.oy, this.oy, percent)
			this.fr++
		}
	}

	//————————————————————————————————————————————— Point show
	show() {
		noStroke()
		fill(..._clrs[2])
		circle(this.x, this.y, params.swb)
	}

	//————————————————————————————————————————————— Point showText
	showText() {
		const txt = `${floor(this.x)} ${floor(this.y)}`
		const txtWidth = textWidth(txt)
		noStroke()
		fill(..._clrs[0])
		rect(this.x, this.y, txtWidth, 15)
		fill(..._clrs[1])
		text(txt, this.x, this.y)
	}
}

let params = {
	scl: 40,
	totalPoints: 6,
	swb: 6,
	swa: 1,

	linesTotal: Math.floor(Math.random() * 20),
	midGraphicsMode: Math.floor(Math.random() * 4),
}

//———————————————————————————————————————————————————————————————————————————————————————————————— getWidthAndHeight
function getWidthAndHeight() {
	// resize and center image
	var myDiv = document.getElementById('header-canvas');
	_w = myDiv.offsetWidth
	_h = myDiv.offsetHeight
}

//———————————————————————————————————————————————————————————————————————————————————————————————— resizeMyCanvas
function resizeMyCanvas() {
	getWidthAndHeight()
	resizeCanvas(_w, _h)
	_trail = []
	createGRFC()
}

window.addEventListener('resize', resizeMyCanvas, false);