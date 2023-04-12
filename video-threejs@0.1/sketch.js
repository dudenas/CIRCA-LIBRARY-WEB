import * as THREE from 'three';

import Stats from './libraries/jsm/libs/stats.module.js';

let container, stats;
let camera, scene, renderer;

let theta = 0;

const radius = 1000;
const frustumSize = 2000; // TODO: return to 1000, controls scale

let _params = {
	colors: {
		background: [19, 20, 21],
		main: [255, 255, 255],
		debug: [255 * .6, 255 * .6, 255 * .6],
		yellow: [255, 186, 8],
		gray1: new THREE.Color("rgb(36, 37, 40)"),
		gray2: new THREE.Color("rgb(50, 51, 54)"),
		gray3: new THREE.Color("rgb(59, 60, 62)"),
		gray4: new THREE.Color("rgb(63, 64, 67)"),
		gray5: new THREE.Color(`rgb(${255 * .6},${255 * .6},${255 * .6})`),
		lib1: [255, 125, 125],
		lib2: [125, 255, 125],
		lib3: [125, 125, 255],
	}
}

const rows = 25

init();
animate();


function init() {

	container = document.createElement('div');
	document.body.appendChild(container);

	const aspect = window.innerWidth / window.innerHeight;
	camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 2000);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xf0f0f0);
	const d = 100
	const light = new THREE.DirectionalLight(0xffffff, .5);
	light.position.set(1, 2, 0).normalize();
	// light.castShadow = true;
	// light.shadow.camera.left = -d;
	// light.shadow.camera.right = d;
	// light.shadow.camera.top = d;
	// light.shadow.camera.bottom = -d;
	scene.add(light);

	const alight = new THREE.AmbientLight(0xffffff, 1);
	scene.add(alight);
	// variables

	const scl = 1.5
	const spacing = 300 / scl

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

	// FIXME: later delete this a helper geometry
	const geometry = new THREE.BoxGeometry(planeW, planeW, planeW);
	const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
		color: 0xff0000,
		wireframe: true
	}));
	scene.add(object)

	let libCount = drawMainLib(planeW, planeD, planeH, rowW, rowD, rowH, rows)

	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	stats = new Stats();
	container.appendChild(stats.dom);

	window.addEventListener('resize', onWindowResize);

}

function randomRange(min, max) {
	return Math.random() * (max - min) + min;
}

function drawMainLib(planeW, planeD, planeH, rowW, rowD, rowH, rows) {
	// first plane - library-app

	// push()
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
			drawBox(rowW, rowD, rowH, _params.colors.gray2, {
				x: offW,
				y: offD,
				z: offH
			})
		} else if (i == rows - 1) {
			// special case for the last box
			// draw row
			drawBox(rowW, rowD, rowH, _params.colors.gray2, {
				x: offW,
				y: offD,
				z: offH
			})
		} else if (i % 2 == 0) {
			// draw row
			drawBox(rowW, rowD, rowH, _params.colors.gray3, {
				x: offW,
				y: offD,
				z: offH
			})

			// draw inside row
			drawInsideRow(rowW, rowD, rowH, _params.colors.gray5, libCol, i)
		} else {
			// draw row
			drawBox(rowW, rowD, rowH, _params.colors.gray4, {
				x: offW,
				y: offD,
				z: offH
			})

			// 	// draw inside row
			// 	_fc[i] = drawInsideRow(rowW, rowD, rowH, _params.colors.gray5, libCol, i, _fc[i])
		}

		// translate to the next row
		offW += rowW
	}

	// pop();

	// plain
	drawBox(planeW, planeD, planeH, _params.colors.gray1)

	return libCount
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— draw inside row
function drawInsideRow(rowW, rowD, rowH, color, libCol, i) {
	const padding = 10
	const cellW = rowW / 5 * 2
	const cellH = rowH / 6 - (padding * 5) / 6
	const cellD = rowD / 2

	const firstCellH = cellH * 3
	const lastCellH = cellW
	const otherCellH = ((cellH * 6) - firstCellH - lastCellH) / 2

	// translate cell to the beginning of the row
	let offW = 0
	let offD = rowD / 2 + cellD * 4
	let offH = -rowH / 2 + firstCellH / 2 + padding

	let c1h = firstCellH * randomRange(.2, 1)
	let c2h = otherCellH * randomRange(.2, 1)
	let c3h = otherCellH * randomRange(.2, 1)


	// translate(0, 0, c1h / 2 - firstCellH / 2)
	drawBox(cellW, cellD, c1h, color, {
		// x: offW + 0,
		x: rowW + offW + 0,
		y: offD,
		z: offH + c1h / 2 - firstCellH / 2
		// z: offH
	})
	// box(cellW, cellD, c1h)

	// translate(0, 0, firstCellH / 2 + padding + otherCellH / 2)

	// push()
	// translate(0, 0, c2h / 2 - otherCellH / 2)
	// box(cellW, cellD, c2h)
	// pop()

	// translate(0, 0, otherCellH / 2 + padding + otherCellH / 2)

	// push()
	// translate(0, 0, c3h / 2 - otherCellH / 2)
	// box(cellW, cellD, c3h)
	// pop()

	// translate(0, 0, otherCellH / 2 + padding + lastCellH / 2)

	// ambientMaterial(...libCol);
	// box(cellW, cellD, lastCellH)

	// pop()
}

function drawBox(w, d, h, col, pos) {
	const geometry = new THREE.BoxGeometry(w, d, h);
	const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
		color: col,
	}));
	if (pos) {
		object.position.x = pos.x
		object.position.y = pos.y
		object.position.z = pos.z
	}
	scene.add(object)
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
	requestAnimationFrame(animate);

	render();
	stats.update();

}

function render() {
	// theta += 1
	const gOff = 10
	const xOff = (Math.asin(1 / Math.sqrt(3))) * 114.59155903
	const yOff = -(Math.PI / 4 + Math.PI / 2) * 114.59155903
	camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(xOff + gOff + theta));
	camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(yOff + gOff));
	camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(gOff));

	camera.lookAt(scene.position);

	camera.updateMatrixWorld();

	renderer.render(scene, camera);

}