import L, { Coords } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';

// const tile_key = (coords:Coords) => {
// 	const {x, y, z} = coords;
// 	return [x,y,z].join(':');
// };

// let done:L.DoneCallback;

const CanvasLayer = L.GridLayer.extend({
    createTile: function(coords:Coords, fn:L.DoneCallback) {				
		// done = fn;
        // create a <canvas> element for drawing
		let tile = L.DomUtil.create('canvas', 'leaflet-tile') as HTMLCanvasElement;		
		// tiles.set(tileKey, tile);
        // setup tile width and height according to the options
        let size = this.getTileSize();
        tile.width = size.x;
		tile.height = size.y;			

        // draw something asynchronously and pass the tile to the done() callback
        drawTestTile(coords, tile);

        return tile;
	},
	getTile: function (key:string) {
		return this._tiles[key];
	}
});

const testLayer = new CanvasLayer();

window.addEventListener('load', () => {
    let map = L.map(document.body);
    map.setView([55.764213, 37.617187], 13);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	testLayer.addTo(map);

    // let controllers = new Map<string, Controller>();
    // controllers.set('default', new DefaultController('default'));
    // let views = new Map<string, View>();
    // views.set('default', new DefaultView('default'));
    // let app = new Application(['default'], controllers, views);    
    // app.start();    
});

const worker = new Worker("renderer.js");

worker.onmessage = (msg:MessageEvent) => {	
	const {tileKey} = msg.data;		
	const tile = testLayer.getTile(tileKey);
	// done(undefined, el);
	testLayer._tileReady(tile.coords, undefined, tile.el);

};

const drawTestTile = function(coords:Coords, tile:HTMLCanvasElement) {
	let canvas = tile.transferControlToOffscreen();	
	worker.postMessage({
		cmd: 'drawTestTile',
		coords,
		canvas,
	}, [canvas]);
};


