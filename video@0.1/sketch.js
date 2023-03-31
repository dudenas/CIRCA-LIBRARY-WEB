let _params = {
	colors: {
		background: [19, 20, 21],
		main: [255, 255, 255],
		debug: [255 * .6, 255 * .6, 255 * .6],
		yellow: [255, 186, 8],
		gray1: [255 * 0.2, 255 * 0.2, 255 * 0.2],
		gray2: [255 * 0.3, 255 * 0.3, 255 * 0.3],
		gray3: [255 * 0.4, 255 * 0.4, 255 * 0.4],
		gray4: [255 * 0.5, 255 * 0.5, 255 * 0.5],
		gray5: [255 * 0.6, 255 * 0.6, 255 * 0.6],
		lib1: [255, 125, 125],
		lib2: [125, 255, 125],
		lib3: [125, 125, 255],
	}
}

let _newInput = true

const rows = 25
let _animationFrames = 10
let _waitTime = 60
let _newInputFreq = 4

let _currRow
let _seed
let _fc
let _animation
let _waitCount

let firstLibChoise, secondLibChoise, thirdLibChoise



//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— setup
function setup() {
	const canvas = createCanvas(1080, 1080, WEBGL);
	// attach to the id
	canvas.parent('#video-canvas')

	// create ortho projection
	ortho(-width / 2, width / 2, height / 2, -height / 2, 0, 1080 * 2);
	orbitControl();


	// set global style
	strokeWeight(2)
	// noLoop()

	frameRate(60)

	resetVariables()
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— draw
function draw() {
	// constant random Seed for the same results
	randomSeed(_seed)

	// background
	background(_params.colors.background)

	directionalLight(255, 255, 255, 1, -1, 0);
	ambientLight(175);
	stroke(255, 0, 85)
	noStroke()


	rotateX(Math.asin(1 / Math.sqrt(3)));
	rotateY(Math.PI / 4 + PI / 2);

	// define spacing inbetween the planes
	const scl = map(mouseY, 0, windowHeight, 1, 2)
	const spacing = 300 / scl

	// translate to the middle
	translate(0, -(spacing * 3) / 2, 0)

	// define plane
	const planeW = 300 * scl
	const planeD = 10
	const planeH = 300 * scl

	// define row
	const rowW = planeW / rows
	const rowD = planeD
	const rowH = planeH

	// define cell
	const libCells = 20
	const libTotal = Math.pow(libCells, 2)
	const libW = planeW / libCells
	const libD = rowD
	const libH = planeH / libCells

	// MAIN LIB
	push()
	translate(0, spacing * 3, 0)
	libCount = drawMainLib(planeW, planeD, planeH, rowW, rowD, rowH, rows)
	pop()

	// OTHER LIBRARIES
	if (_newInput) {
		// randomise the choice of cubes
		firstLibChoise = new Array(libTotal).fill(0).map((elm, idx) => elm = idx)
		shuffleArray(firstLibChoise)
		firstLibChoise = firstLibChoise.splice(0, libCount[0])

		secondLibChoise = new Array(libTotal).fill(0).map((elm, idx) => elm = idx)
		shuffleArray(secondLibChoise)
		secondLibChoise = secondLibChoise.splice(0, libCount[1])

		thirdLibChoise = new Array(libTotal).fill(0).map((elm, idx) => elm = idx)
		shuffleArray(thirdLibChoise)
		thirdLibChoise = thirdLibChoise.splice(0, libCount[2])

		_newInput = false
	}

	// draw libraries
	push()
	translate(0, spacing * 2, 0)
	drawLib(planeW, planeD, planeH, libCells, libW, libD, libH, firstLibChoise, _params.colors.lib1)
	pop()

	push()
	translate(0, spacing * 1, 0)
	drawLib(planeW, planeD, planeH, libCells, libW, libD, libH, secondLibChoise, _params.colors.lib2)
	pop()

	push()
	translate(0, 0, 0)
	drawLib(planeW, planeD, planeH, libCells, libW, libD, libH, thirdLibChoise, _params.colors.lib3)
	pop()

	if (frameCount % _newInputFreq == 0 && _currRow > 0) {
		_currRow--
	}

	// if finnished new animation
	if (_animation == false) {
		if (_waitCount == _waitTime) {
			resetVariables()
		} else {
			_waitCount++
		}
	}
}

function resetVariables() {
	_seed = Math.random() * 1000
	_currRow = rows
	_fc = new Array(rows).fill(0)
	_animation = true
	_newInput = true
	_waitCount = 0
}

function drawMainLib(planeW, planeD, planeH, rowW, rowD, rowH, rows) {
	// first plane - library-app
	push()
	// translate to the beginning of the table
	translate(-planeW / 2 + rowW / 2, planeD / 2 + rowD / 2, 0)
	// draw rows
	// const randLibChoise = new Array(rows).fill(0).map(elm => random(1)).sort()
	const randLibChoise = new Array(2).fill(0).map(elm => random(1)).sort()
	const libCount = [0, 0, 0]

	for (let i = 0; i < rows; i++) {
		// define libCol
		let libCol = null

		if (randLibChoise[1] < i / rows && i != 0 && i != rows - 1) {
			libCol = _params.colors.lib1
			libCount[0]++
		} else if (randLibChoise[0] < i / rows && i != 0 && i != rows - 1) {
			libCol = _params.colors.lib2
			libCount[1]++
		} else if (i != 0 && i != rows - 1) {
			libCol = _params.colors.lib3
			libCount[2]++
		}


		// every second box different color
		if (i == 0) {
			// special case for the first box
			ambientMaterial(..._params.colors.gray2);

			// draw row
			box(rowW, rowD, rowH)
		} else if (i == rows - 1) {
			// special case for the last box
			ambientMaterial(..._params.colors.gray2);

			// draw row
			box(rowW, rowD, rowH)

		} else if (i % 2 == 0) {
			ambientMaterial(..._params.colors.gray3);

			// draw row
			box(rowW, rowD, rowH)

			// draw inside row
			_fc[i] = drawInsideRow(rowW, rowD, rowH, _params.colors.gray5, libCol, i, _fc[i])
		} else {
			ambientMaterial(..._params.colors.gray4);

			// draw row
			box(rowW, rowD, rowH)

			// draw inside row
			_fc[i] = drawInsideRow(rowW, rowD, rowH, _params.colors.gray5, libCol, i, _fc[i])
		}

		// translate to the next row
		translate(rowW, 0, 0)
	}

	pop();

	// plane
	ambientMaterial(..._params.colors.gray1);
	box(planeW, planeD, planeH)

	return libCount
}

function drawLib(planeW, planeD, planeH, libCells, libW, libD, libH, libChoise, libCol) {
	push()
	for (let i = 0; i < libCells; i++) {
		for (let j = 0; j < libCells; j++) {
			const x = i * libW
			const z = j * libH

			let d = libD
			const idx = i + j * libCells
			push()

			// if that is a special cell, draw it differently
			if (libChoise.length > 0) {
				for (let n = 0; n < libChoise.length; n++) {
					if (libChoise[n] == idx) {
						ambientMaterial(...libCol);
						noStroke()
						d *= 2
						break
					} else {
						ambientMaterial(..._params.colors.gray1);
						stroke(..._params.colors.gray2)
					}
				}
			} else {
				ambientMaterial(..._params.colors.gray1);
				stroke(..._params.colors.gray2)
			}

			translate(x - planeW / 2 + libW / 2, planeD / 2 + d / 2, z - planeH / 2 + libH / 2)
			box(libW, d, libH)
			pop()
		}
	}

	// plane
	noStroke()
	ambientMaterial(..._params.colors.gray1);
	box(planeW, planeD, planeH)
	pop()
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— draw inside row
function drawInsideRow(rowW, rowD, rowH, color, libCol, i, fc) {
	const padding = 10
	const cellW = rowW / 5 * 2
	const cellH = rowH / 6 - (padding * 5) / 6
	const cellD = rowD / 2

	const firstCellH = cellH * 3
	const lastCellH = cellW
	const otherCellH = ((cellH * 6) - firstCellH - lastCellH) / 2

	push()
	ambientMaterial(...color);

	// translate cell to the beginning of the row
	translate(0, rowD / 2 + cellD / 2, -rowH / 2 + firstCellH / 2 + padding)

	let c1h = firstCellH * random(.2, 1)
	let c2h = otherCellH * random(.2, 1)
	let c3h = otherCellH * random(.2, 1)

	if (i > _currRow) {
		// animation part
		if (_animation && fc < _animationFrames) {
			const percent = fc / _animationFrames
			c1h = lerp(0, c1h, percent)
			c2h = lerp(0, c2h, percent)
			c3h = lerp(0, c3h, percent)
			fc++
		} else if (_animation && i == 1) {
			console.log('finished animation')
			_animation = false
		}


		push()
		translate(0, 0, c1h / 2 - firstCellH / 2)
		box(cellW, cellD, c1h)
		pop()

		translate(0, 0, firstCellH / 2 + padding + otherCellH / 2)

		push()
		translate(0, 0, c2h / 2 - otherCellH / 2)
		box(cellW, cellD, c2h)
		pop()

		translate(0, 0, otherCellH / 2 + padding + otherCellH / 2)

		push()
		translate(0, 0, c3h / 2 - otherCellH / 2)
		box(cellW, cellD, c3h)
		pop()

		translate(0, 0, otherCellH / 2 + padding + lastCellH / 2)

		ambientMaterial(...libCol);
		box(cellW, cellD, lastCellH)
	}
	pop()
	return fc
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— Other functions
/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}