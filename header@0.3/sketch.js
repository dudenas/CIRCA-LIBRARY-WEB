let headerSketch = function (p) {
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

	// scale to fit the whole div
	let _scaleToFit = 3

	//————————————————————————————————————————————— setup
	p.setup = function () {
		const canvas = p.createCanvas(1920 / 3 * 2, 1080 / 3 * 2, p.P2D);
		// attach to the id
		canvas.parent('#header-canvas')
		// shuffle path array and decide how many parts there will be
		resizeMyCanvas()
		createPath()

		// style
		p.noFill()
		p.textAlign(p.CENTER, p.CENTER)
		p.strokeCap(p.SQUARE);
		p.strokeJoin(p.BEVEL);
		p.rectMode(p.CENTER)
		// textAlign(LEFT, BOTTOM)

		_w = p.width
		_h = p.height

		// parameters to control fucking randomness
		csmd = {
			len: p.random(),
			count: p.random(1, 5),
			w: p.random(),
		}

		csoc = {
			idx: p.floor(p.random(_points.length)),
			amt: p.random(),
			diam: p.random(p.width / 5, p.width / 2)
		}

		csl = {
			special1: p.random(),
			special2: p.random()
		}

		p.frameRate(60)
		p.noLoop()
	}

	//————————————————————————————————————————————— draw
	p.draw = function () {
		p.randomSeed(_rdSeed)
		p.background(_clrs[0])

		createSubgraphicsOverlayCircle(this)
		p.noFill()

		// show line
		p.stroke(..._clrsGraphics[1])
		// draw shape
		let flip = false
		let currPath = 0

		p.beginShape()
		_points.forEach((elm, idx) => {
			// draw element if it is not the first one
			if (idx > 0) {
				// draw line
				p.strokeWeight(flip ? params.swa : params.swb)
				elm.show(_points[idx - 1], this)
			}

			// change strokeweight based on predefined path
			if (_path[currPath] == idx) {
				p.endShape()
				p.beginShape()
				flip = !flip
				currPath++
			}
		})
		// connect last and the first points
		p.vertex(_points[0].pos.x, _points[0].pos.y)
		p.endShape()

		// create animation for the point to go from a to b
		// let percent = (p.frameCount % 720) / 720

		// let pointIdx = p.floor(p.map(percent, 0, 1, 0, _points.length))
		// let currPoint = _points[pointIdx]
		// let nextPoint = _points[(pointIdx + 1) % _points.length]
		// let pointPercent = p.map(percent, (pointIdx) / (_points.length), (pointIdx + 1) / (_points.length), 0, 1)
		// let pointPosX = p.map(pointPercent, 0, 1, currPoint.pos.x, nextPoint.pos.x)
		// let pointPosY = p.map(pointPercent, 0, 1, currPoint.pos.y, nextPoint.pos.y)

		// p.noStroke()
		// p.fill(..._clrs[2])
		// p.circle(pointPosX, pointPosY, params.swb * 2)

		// if (_trail.length < _maxTrail) {
		// 	if (p.frameCount % _skipCircles == 0) {
		// 		const n = new TrailPoint(pointPosX, pointPosY, _tpIndexes)
		// 		_tpIndexes = (_tpIndexes + 1) % _maxTrail
		// 		_trail.push(n)
		// 	}
		// } else {
		// 	_trail.shift()
		// }

		// // show trail
		// for (let i = 0; i < _trail.length; i++) {
		// 	const tp = _trail[i]
		// 	tp.update(i - 1)
		// 	tp.show()
		// 	if (tp.idx % 10 == 0) {
		// 		tp.showText()
		// 	}
		// }


		// supporting graphics
		const rndIdx = new Array(4).fill(0).map(x => p.floor(p.random(params.totalPoints)))
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
		const len = p.min(100, lenBetween / 2) * csmd.len
		const count = p.floor(csmd.count)
		const w = csmd.w * p.width / 4


		switch (mode) {
			case 0:
				p.push()
				p.rectMode(p.CENTER)
				p.noStroke()
				p.fill(_clrsGraphics[1])
				posCenter.div(2)
				p.rect(posCenter.x, posCenter.y, w, params.swb * 2)
				p.pop()
				break
			case 1:
				p.push()
				p.rectMode(p.CENTER)
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
			const percent1 = p.map((i + 1) / (total + 1), 0, 1, 0, special1);
			const percent2 = p.map((i + 1) / (total + 1), 0, 1, 0, special2);
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
		p.randomSeed(_rdSeed)
		// create grid
		createGrid()
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
		_path.splice(0, p.floor(p.random(params.totalPoints - 2)))
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
		const i = p.floor(p.random(0, _gridRows + 1))
		const j = p.floor(p.random(0, _gridCols + 1))
		return _grid[i][j]
	}

	/**
	 * create grid
	 * @function
	 */
	function createGrid() {
		// calculate ratio
		_ratio = p.width / params.scl
		_grid = []
		_gridRows = params.scl
		_gridCols = Math.floor(p.height / p.width * params.scl / _scaleToFit)
		for (let i = 0; i < _gridRows + 1; i++) {
			const x = i * _ratio
			_grid[i] = []

			for (let j = 0; j < _gridCols + 1; j++) {
				const y = j * _ratio
				_grid[i][j] = p.createVector(x, y)
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
		p.redraw()
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
				this.x = p.lerp(other.ox, this.ox, percent)
				this.y = p.lerp(other.oy, this.oy, percent)
				this.fr++
			}
		}

		//————————————————————————————————————————————— Point show
		show() {
			p.noStroke()
			p.fill(..._clrs[2])
			p.circle(this.x, this.y, params.swb)
		}

		//————————————————————————————————————————————— Point showText
		showText() {
			const txt = `${p.floor(this.x)} ${p.floor(this.y)}`
			const txtWidth = p.textWidth(txt)
			p.noStroke()
			p.fill(..._clrs[0])
			p.rect(this.x, this.y, txtWidth, 15)
			p.fill(..._clrs[1])
			p.text(txt, this.x, this.y)
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

	let _pw, _ph

	//———————————————————————————————————————————————————————————————————————————————————————————————— getWidthAndHeight
	function getWidthAndHeight() {
		// resize and center image
		var myDiv = document.getElementById('header-canvas').parentElement;
		_w = myDiv.offsetWidth
		_h = myDiv.offsetHeight
	}

	//———————————————————————————————————————————————————————————————————————————————————————————————— resizeMyCanvas
	function resizeMyCanvas() {
		getWidthAndHeight()
		// only create graphics if the previous widht and height has changed
		if (_pw != _w || _ph != _h) {
			p.resizeCanvas(_w, _h * _scaleToFit)
			_trail = []
			createGRFC()
		}

		// update previous widht and height
		_pw = _w, _ph = _h
	}

	window.addEventListener('resize', resizeMyCanvas, false);
}

new p5(headerSketch)