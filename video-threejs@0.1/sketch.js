let container;
let camera, scene, renderer;

let theta = 0;

const radius = 1000;
const frustumSize = 1000; // TODO: return to 1000, controls scale

let _params = {
	colors: {
		background: [19, 20, 21],
		main: [255, 255, 255],
		debug: [255 * .6, 255 * .6, 255 * .6],
		yellow: [255, 186, 8],
		gray1: new THREE.Color("rgba(36, 37, 40)"),
		gray2: new THREE.Color("rgba(50, 51, 54)"),
		gray3: new THREE.Color("rgba(59, 60, 62)"),
		gray4: new THREE.Color("rgba(63, 64, 67)"),
		gray5: new THREE.Color(`rgba(${255 * .6},${255 * .6},${255 * .6})`),
		lib1: new THREE.Color("rgba(255, 125, 125)"),
		lib2: new THREE.Color("rgba(125, 255, 125)"),
		lib3: new THREE.Color("rgba(125, 125, 255)"),
	}
}

let _rows = []
let _libBoxes = []

const rows = 25

// animation 
const _frameRate = 60
let _animationFrames = Math.floor(_frameRate / 6)
let _waitTime = Math.floor(_frameRate * 1)
let _newInputFreq = Math.floor(_frameRate / 15)
let _frameCount = 0

let _animation
let _currRow
let _waitCount

let clock = new THREE.Clock();
let delta = 0;
// 30 fps
let interval = 1 / _frameRate;

let _w, _h
let _pw, _ph

let _data = []

function resetVariables() {
	_rows = []
	_libBoxes = []

	_currRow = rows
	_animation = true
	_waitCount = 0
}

class libBox {
	constructor(obj) {
		this.obj = obj
		this.d = this.obj.position.y / 3 // FIXME: this value is hard written. 3 should be taken from where it is created

		this.reset()
	}

	reset() {
		this.obj.scale.y = 0
		this.obj.position.y = this.d

		this.fc = 0
		this.finished = false

		this.obj.visible = false
	}

	update() {
		if (!this.finished) {
			if (!this.obj.visible) this.obj.visible = true
			if (this.fc <= _animationFrames) {
				const percent = this.fc / _animationFrames

				this.obj.scale.y = mapValues(percent, 0, 1, 0, 1)
				this.obj.position.y = mapValues(percent, 0, 1, this.d, this.d * 3)

				this.fc++
			}
		}
	}
}

class myRow {
	constructor() {
		this.objcts = []
		this.objctsInfo = []
	}

	reset() {
		for (let i = 0; i < this.objcts.length - 1; i++) {
			const obj = this.objcts[i]
			const objInfo = this.objctsInfo[i]
			const h = objInfo.h
			const z = objInfo.pos.z
			obj.scale.z = 0
			obj.position.z = z - h / 2 + (h * obj.scale.z) / 2

			// set the visisbility to false
			obj.visible = false
		}

		const obj = this.objcts[this.objcts.length - 1]
		obj.scale.y = 0
		obj.visible = false

		this.fc = 0
		this.finished = false
	}

	update() {
		if (!this.finished) {
			if (this.fc <= _animationFrames) {
				const percent = this.fc / _animationFrames

				// go trough all objects, exclude the last one as a special case
				for (let i = 0; i < this.objcts.length - 1; i++) {
					const obj = this.objcts[i]
					const objInfo = this.objctsInfo[i]
					const h = objInfo.h
					const z = objInfo.pos.z
					obj.scale.z = mapValues(percent, 0, 1, 0, 1)
					obj.position.z = z - h / 2 + (h * obj.scale.z) / 2

					// set the visibility back
					if (!obj.visible) obj.visible = true
				}

				// final object
				const obj = this.objcts[this.objcts.length - 1]
				obj.scale.y = mapValues(percent, 0, 1, 0, 1)

				// set the visibility back
				if (!obj.visible) obj.visible = true


				// update individual framecount
				this.fc++
			} else {
				this.finished = true
			}
		}
	}
}

init()
animate();

function createMyGraphics() {
	// initing the initial values
	resetVariables()

	// clear scene
	while (scene.children.length > 0) {
		scene.remove(scene.children[0]);
	}

	// lights
	const light = new THREE.DirectionalLight(0xffffff, .75);
	light.position.set(-1, 2, 0).normalize();
	light.castShadow = true;
	scene.add(light);

	const alight = new THREE.AmbientLight(0xffffff, .75);
	scene.add(alight);

	// variables
	const scl = 1.5

	// define plane
	const planeW = 300 * scl
	const planeD = 10
	const planeH = 300 * scl
	const spacing = 200
	const offset = spacing * 3 / 2

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

	// FIXME: later delete this a helper geometry
	const geometry = new THREE.BoxGeometry(planeW, planeW, planeW);
	const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
		color: 0xff0000,
		wireframe: true
	}));
	scene.add(object)

	// create a group for main lib
	const group = new THREE.Group();
	let libCount = drawMainLib(planeW, planeD, planeH, rowW, rowD, rowH, rows, group)
	scene.add(group)
	group.position.y = spacing * 3 - offset

	// 
	// 
	// 
	// count libraries
	let firstLibChoise = new Array(libTotal).fill(0).map((elm, idx) => elm = idx)
	shuffleArray(firstLibChoise)
	firstLibChoise = firstLibChoise.splice(0, libCount[0])

	let secondLibChoise = new Array(libTotal).fill(0).map((elm, idx) => elm = idx)
	shuffleArray(secondLibChoise)
	secondLibChoise = secondLibChoise.splice(0, libCount[1])

	let thirdLibChoise = new Array(libTotal).fill(0).map((elm, idx) => elm = idx)
	shuffleArray(thirdLibChoise)
	thirdLibChoise = thirdLibChoise.splice(0, libCount[2])
	// 
	// 
	// 

	const group2 = new THREE.Group();
	drawLib(planeW, planeD, planeH, libCells, libW, libD, libH, firstLibChoise, _params.colors.lib1, group2)
	scene.add(group2)
	group2.position.y = spacing * 2 - offset

	const group3 = new THREE.Group();
	drawLib(planeW, planeD, planeH, libCells, libW, libD, libH, secondLibChoise, _params.colors.lib2, group3)
	scene.add(group3)
	group3.position.y = spacing - offset

	const group4 = new THREE.Group();
	drawLib(planeW, planeD, planeH, libCells, libW, libD, libH, thirdLibChoise, _params.colors.lib3, group4)
	scene.add(group4)
	group4.position.y = 0 - offset
}

function successFunction(data) {
	// read data
	var allRows = data.split(/\r?\n|\r/);
	for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
		var rowCells = allRows[singleRow].split(',');
		if (singleRow !== 0) {
			_data.push([rowCells[0], rowCells[1]])
		}

	}
	// console.log(_data)
}


function init() {
	$.ajax({
		url: 'https://uploads-ssl.webflow.com/6409e1e8bee24b5462f985c8/64390e4492efb9545759dd38_data.csv',
		dataType: 'text',
	}).done(successFunction);

	container = document.createElement('div');
	document.getElementById("video-canvas").appendChild(container);

	camera = new THREE.OrthographicCamera(frustumSize / -2, frustumSize / 2, frustumSize / 2, frustumSize / -2, 1, 5000);

	// clear scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xf0f0f0);

	createMyGraphics()

	renderer = new THREE.WebGLRenderer({
		antialias: true
	});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(1080, 1080);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap/

	container.appendChild(renderer.domElement);

	window.addEventListener('resize', resizeMyCanvas);

	resizeMyCanvas()

}

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

function randomRange(min, max) {
	return Math.random() * (max - min) + min;
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— draw lib
function drawLib(planeW, planeD, planeH, libCells, libW, libD, libH, libChoise, libCol, group) {
	for (let i = 0; i < libCells; i++) {
		for (let j = 0; j < libCells; j++) {
			const x = i * libW
			const z1 = j * libH
			let col = i % 2 == 0 && j % 2 == 0 ? _params.colors.gray2 : _params.colors.gray3

			let d = libD
			let offD = d
			const idx = i + j * libCells
			let isLibBox = false
			// push()

			if (libChoise.length > 0) {
				for (let n = 0; n < libChoise.length; n++) {
					if (libChoise[n] == idx) {
						col = libCol

						// d *= 2
						offD = d * 3
						isLibBox = true
						break
					}
				}
			}

			drawBox(libW, d, libH, col, group, {
				x: x - planeW / 2 + libW / 2,
				y: offD,
				z: z1 - planeH / 2 + libH / 2
			}, null, isLibBox)
		}
	}

	// plane
	drawBox(planeW, planeD, planeH, _params.colors.gray1, group)
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— draw main lib
function drawMainLib(planeW, planeD, planeH, rowW, rowD, rowH, rows, group) {
	// first plane - library-app

	// translate to the beginning of the table
	let offW = -planeW / 2 + rowW / 2
	let offD = planeD / 2 + rowD / 2
	let offH = 0

	// draw rows
	const randLibChoise = new Array(2).fill(0).map(elm => Math.random()).sort()
	const libCount = [0, 0, 0]

	for (let i = 0; i < rows; i++) {
		// define libCol
		let libCol = null

		// put each row to a different library
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
			// draw row
			drawBox(rowW, rowD, rowH, _params.colors.gray2, group, {
				x: offW,
				y: offD,
				z: offH
			})
		} else if (i == rows - 1) {
			// special case for the last box
			// draw row
			drawBox(rowW, rowD, rowH, _params.colors.gray2, group, {
				x: offW,
				y: offD,
				z: offH
			})
		} else if (i % 2 == 0) {
			// draw row
			drawBox(rowW, rowD, rowH, _params.colors.gray3, group, {
				x: offW,
				y: offD,
				z: offH
			})

			// draw inside row
			drawInsideRow(rowW, rowD, rowH, offW, _params.colors.gray5, libCol, group, )
		} else {
			// draw row
			drawBox(rowW, rowD, rowH, _params.colors.gray4, group, {
				x: offW,
				y: offD,
				z: offH
			})

			// draw inside row
			drawInsideRow(rowW, rowD, rowH, offW, _params.colors.gray5, libCol, group)
		}

		// translate to the next row
		offW += rowW
	}

	// plain
	drawBox(planeW, planeD, planeH, _params.colors.gray1, group)

	return libCount
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— draw main lib : inside row
function drawInsideRow(rowW, rowD, rowH, offWOut, color, libCol, group) {
	// row
	_rows.push(new myRow())
	const row = _rows[_rows.length - 1]

	// variables
	const padding = 10
	const cellW = rowW / 5 * 2
	const cellH = rowH / 6 - (padding * 5) / 6
	const cellD = rowD / 2

	const firstCellH = cellH * 3
	const lastCellH = cellW
	const otherCellH = ((cellH * 6) - firstCellH - lastCellH) / 2

	// translation matrixes
	let offW = offWOut
	let offD = rowD + cellD * 1.5 // FIXME: this number comes out of nowhere
	let offH = -rowH / 2 + firstCellH / 2 + padding

	// random length 
	let c1h = firstCellH * randomRange(.2, 1)
	let c2h = otherCellH * randomRange(.2, 1)
	let c3h = otherCellH * randomRange(.2, 1)


	offH += -firstCellH / 2
	drawBox(cellW, cellD, c1h, color, group, {
		x: offW,
		y: offD,
		z: offH + c1h / 2
	}, row)

	offH += firstCellH + padding
	drawBox(cellW, cellD, c2h, color, group, {
		x: offW,
		y: offD,
		z: offH + c2h / 2
	}, row)

	offH += otherCellH + padding
	drawBox(cellW, cellD, c3h, color, group, {
		x: offW,
		y: offD,
		z: offH + c3h / 2
	}, row)

	offH += otherCellH + padding
	drawBox(cellW, cellD, lastCellH, libCol, group, {
		x: offW,
		y: offD,
		z: offH + lastCellH / 2
	}, row)

	row.reset()
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— draw main lib : box
function drawBox(w, d, h, col, group, pos, obj, isLibBox) {
	const geometry = new THREE.BoxGeometry(w, d, h);
	const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
		color: col,
	}));

	object.castShadow = true; //default is false
	object.receiveShadow = true; //default

	if (pos) {
		object.position.x = pos.x
		object.position.y = pos.y
		object.position.z = pos.z
	}

	if (group) {
		group.add(object)
	} else {
		scene.add(object)
	}


	if (obj) {
		obj.objcts.push(object)
		obj.objctsInfo.push({
			w,
			d,
			h,
			col,
			group,
			pos
		})
	}

	if (isLibBox) {
		_libBoxes.push(new libBox(object))
	}
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— Resize
// function onWindowResize() {

// 	const aspect = window.innerWidth / window.innerHeight;

// 	camera.left = -frustumSize * aspect / 2;
// 	camera.right = frustumSize * aspect / 2;
// 	camera.top = frustumSize / 2;
// 	camera.bottom = -frustumSize / 2;

// 	camera.updateProjectionMatrix();

// 	renderer.setSize(window.innerWidth, window.innerHeight);

// }

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— Resize
//———————————————————————————————————————————————————————————————————————————————————————————————— getWidthAndHeight

function getWidthAndHeight() {
	// resize and center image
	var myDiv = document.getElementById('video-canvas').parentElement;
	_w = myDiv.offsetWidth
	_h = myDiv.offsetHeight

	if (_w > _h) _w = _h
	else _h = _w
}

//———————————————————————————————————————————————————————————————————————————————————————————————— resizeMyCanvas
function resizeMyCanvas() {
	getWidthAndHeight()
	// only create graphics if the previous widht and height has changed
	if (_pw != _w || _ph != _h) {
		// console.log(_w, _h)
		renderer.setSize(_w, _h);
	}

	// update previous widht and height
	_pw = _w, _ph = _h
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— P5 functions
function lerp(x, y, z, amt) {
	this.x += (x - this.x) * amt || 0;
	this.y += (y - this.y) * amt || 0;
	this.z += (z - this.z) * amt || 0;
	return this;
};

function constrain(n, low, high) {
	return Math.max(Math.min(n, high), low);
};

function mapValues(n, start1, stop1, start2, stop2, withinBounds) {
	const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
	if (start2 < stop2) {
		return constrain(newval, start2, stop2);
	} else {
		return constrain(newval, stop2, start2);
	}
};

function animate() {
	// animation happens here
	delta += clock.getDelta();

	if (delta > interval) {
		// go through rows and animate them
		if (_animation) {
			// UPDATE MAIN GRAPHICS
			let countFinished = 0
			for (let i = _rows.length - 1; i >= _currRow; i--) {
				const row = _rows[i]
				row.update()
				_libBoxes[_libBoxes.length - i - 1].update()

				// update count of finished
				countFinished = row.finished ? ++countFinished : countFinished;
			}

			// update current dow
			if (_frameCount % _newInputFreq == 0 && _currRow > 0) {
				_currRow--
			}

			// if everything is finished next step of the animation
			if (countFinished == _rows.length) {
				_animation = false

				// change text
				changeText()
			}
		} else {
			if (_waitCount == _waitTime) {
				// console.log('new animation')
				createMyGraphics()
			} else {
				_waitCount++
			}
		}


		// update framecount
		_frameCount++

		// The draw or time dependent code are here
		render();

		delta = delta % interval;
	}

	requestAnimationFrame(animate);
}

function render() {
	// theta += 1
	const gOff = 10
	const xOff = (Math.asin(1 / Math.sqrt(3))) * 114.59155903 + gOff + 180
	// const yOff = 0
	const yOff = -(Math.PI / 4 + Math.PI / 2) * 114.59155903 + gOff
	const zOff = gOff + 180
	camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(xOff + theta));
	camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(yOff));
	camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(zOff + theta));

	camera.lookAt(scene.position);

	camera.updateMatrixWorld();

	renderer.render(scene, camera);
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— Typewritaer
// typewriter 

var _typeWriter = {
	count: 0,
	textOld: "Steel",
	textNew: "Steel",
	textResults: "836",
	speed: 60,
	write: true,
	currRow: 0
};

function changeText() {
	// get random row
	// const randRow = Math.floor(Math.random() * _data.length)
	_typeWriter.currRow = (_typeWriter.currRow + 1) % _data.length
	const randRow = _typeWriter.currRow
	const searchTerm = _data[randRow][0]
	const searchResults = _data[randRow][1]
	const capitalizedSearchTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)
	_typeWriter.textNew = capitalizedSearchTerm
	_typeWriter.textResults = searchResults

	// _typeWriter.textNew = String(Math.floor(Math.random() * 1000000))
	document.getElementById("search-bar-top-text-count").innerHTML = `∞ results`
	typeWriter()
}

function typeWriter() {
	// if write
	if (_typeWriter.write) {
		if (_typeWriter.count < _typeWriter.textNew.length) {
			document.getElementById("search-bar-top-text-input").innerHTML += _typeWriter.textNew.charAt(_typeWriter.count)
			_typeWriter.count++
			setTimeout(typeWriter, _typeWriter.speed);
		} else {
			// document.getElementById("search-bar-top-text-count").innerHTML = `${Math.floor(Math.random() * 1000)} results`
			document.getElementById("search-bar-top-text-count").innerHTML = `${_typeWriter.textResults} results`
			_typeWriter.textOld = _typeWriter.textNew
			resetTypeWriter()
		}
	}

	// if delete
	else if (!_typeWriter.write) {
		if (_typeWriter.count < _typeWriter.textOld.length) {
			document.getElementById("search-bar-top-text-input").innerHTML = document.getElementById("search-bar-top-text-input").innerHTML.slice(0, -1)
			_typeWriter.count++
			setTimeout(typeWriter, _typeWriter.speed / 2);
		} else {
			resetTypeWriter()
			setTimeout(typeWriter, _typeWriter.speed);
		}
	}
}

function resetTypeWriter() {
	_typeWriter.write = !_typeWriter.write
	_typeWriter.count = 0
}

typeWriter()