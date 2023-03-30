let _params = {
	colors: {
		background: [19, 20, 21],
		main: [255, 255, 255],
		debug: [255 * .6, 255 * .6, 255 * .6],
		yellow: [255, 186, 8],
	}
}

let _searchBarSVG

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— preload
function preload() {
	_searchBarSVG = loadImage('./assets/searchBar.svg');
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— setup
function setup() {
	const canvas = createCanvas(1080, 1080, P2D);
	// attach to the id
	canvas.parent('#video-canvas')

	// set global style
	strokeWeight(1)
	strokeCap(SQUARE)

}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— draw
function draw() {
	// background
	background(_params.colors.background)

	image(_searchBarSVG, 0, 0)
}

//——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————— Other functions