let _params = {
	colors: {
		background: [19, 20, 21],
		main: [255, 255, 255],
		debug: [255 * .6, 255 * .6, 255 * .6],
		yellow: [255, 186, 8],
	}
}

// projection
const _projection = [
	[1, 0, 0],
	[0, 1, 0],
];

// rotation
let _angleX = Math.asin(1 / Math.sqrt(3)) //Math.PI / 6
let _angleY = Math.PI / 4
let _angleZ = 0

let _rotationX = [
	[1, 0, 0],
	[0, Math.cos(_angleX), Math.sin(_angleX)],
	[0, -Math.sin(_angleX), Math.cos(_angleX)],
];

let _rotationY = [
	[Math.cos(_angleY), 0, -Math.sin(_angleY)],
	[0, 1, 0],
	[Math.sin(_angleY), 0, Math.cos(_angleY)],
];

let _rotationZ = [
	[Math.cos(_angleZ), Math.sin(_angleZ), 0],
	[-Math.sin(_angleZ), Math.cos(_angleZ), 0],
	[0, 0, 1],
];

// graphics
let points = []

let gridPoints = []

const step = 10

let _scale = 200 * 2

// animation
const _totalFrames = 120

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— setup
function setup() {
	const canvas = createCanvas(1080, 1080, P2D);
	// attach to the id
	canvas.parent('#video-canvas')

	// set global style
	strokeWeight(1)
	strokeCap(SQUARE)

	points[0] = createVector(-0.5, -0.5, -0.5);
	points[1] = createVector(0.5, -0.5, -0.5); // 2a
	points[2] = createVector(0.5, 0.5, -0.5); // 3a
	points[3] = createVector(-0.5, 0.5, -0.5);

	points[4] = createVector(-0.5, -0.5, 0.5);
	points[5] = createVector(0.5, -0.5, 0.5); // 2
	points[6] = createVector(0.5, 0.5, 0.5); // 3
	points[7] = createVector(-0.5, 0.5, 0.5);

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

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— draw
function draw() {
	// background
	background(_params.colors.background)

	// translate to the middle of the canvas
	translate(width / 2, height / 2);

	// _angleY += 0.005

	// rotation matrixes
	_rotationX = [
		[1, 0, 0],
		[0, Math.cos(_angleX), Math.sin(_angleX)],
		[0, -Math.sin(_angleX), Math.cos(_angleX)],
	];

	_rotationY = [
		[Math.cos(_angleY), 0, -Math.sin(_angleY)],
		[0, 1, 0],
		[Math.sin(_angleY), 0, Math.cos(_angleY)],
	];

	_rotationZ = [
		[Math.cos(_angleZ), Math.sin(_angleZ), 0],
		[-Math.sin(_angleZ), Math.cos(_angleZ), 0],
		[0, 0, 1],
	];

	// draw graphics
	let projected = projectPoints(points)

	// draw GRID
	noStroke();
	fill(_params.colors.main)
	for (let i = 0; i < projected.length; i++) {
		const v = projected[i];
		ellipse(v.x, v.y, 6, 6);
	}

	const projectedGridPoints = projectPoints(gridPoints)
	for (let i = 0; i < gridPoints.length; i++) {
		const p = projectedGridPoints[i]
		ellipse(p.x, p.y, 1, 1)
	}

	// draw top ground
	beginShape()
	for (let i = 0; i < projected.length; i++) {
		const v = projected[i];
		ellipse(v.x, v.y, 6, 6);
	}
	endShape()

}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— Other functions
//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— project points
function projectPoints(pts) {
	const projectedPoints = []
	for (let i = 0; i < pts.length; i++) {
		let rotated = matmul(_rotationY, pts[i]);
		rotated = matmul(_rotationX, rotated);
		let projected2d = matmul(_projection, rotated);
		projected2d.mult(_scale);
		projectedPoints[i] = projected2d;
	}
	return projectedPoints
}