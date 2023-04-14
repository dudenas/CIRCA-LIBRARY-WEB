import * as THREE from 'three';

import Stats from './libraries/jsm/libs/stats.module.js';

let container, stats;
let camera, scene, renderer;

let theta = 0;

const radius = 1000;
const frustumSize = 1000; // TODO: return to 1000, controls scale
let incr = 0;

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

const rows = 25

class myRow {
	constructor() {
		this.objcts = []
	}
}
init();
animate();


function init() {

	container = document.createElement('div');
	document.body.appendChild(container);

	const aspect = window.innerWidth / window.innerHeight;
	camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 5000);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xf0f0f0);
	const d = 100
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

	renderer = new THREE.WebGLRenderer({
		antialias: true
	});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap/

	container.appendChild(renderer.domElement);

	stats = new Stats();
	container.appendChild(stats.dom);

	window.addEventListener('resize', onWindowResize);

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
			// push()

			if (libChoise.length > 0) {
				for (let n = 0; n < libChoise.length; n++) {
					if (libChoise[n] == idx) {
						col = libCol

						// d *= 2
						offD = d * 3
						break
					}
				}
			}

			drawBox(libW, d, libH, col, group, {
				x: x - planeW / 2 + libW / 2,
				y: offD,
				z: z1 - planeH / 2 + libH / 2
			})
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
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— draw main lib : box
function drawBox(w, d, h, col, group, pos, obj) {
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
	}
}

function onWindowResize() {

	const aspect = window.innerWidth / window.innerHeight;

	camera.left = -frustumSize * aspect / 2;
	camera.right = frustumSize * aspect / 2;
	camera.top = frustumSize / 2;
	camera.bottom = -frustumSize / 2;

	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	const obj = _rows[0].objcts[0]
	const depth = obj.geometry.parameters.depth
	const pos = obj.position.z
	obj.scale.z = .1
	obj.position.z = pos * 0.1 - 200
	// obj.geometry.translate(0, 0, -depth * 2); // three.js r.72
	// console.log(obj, depth)

	// animation happens here
	// requestAnimationFrame(animate);

	render();
	stats.update();
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