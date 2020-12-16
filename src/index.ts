import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';

window.addEventListener('load', () => {
    let map = L.map(document.body);
    map.setView([55.764213, 37.617187], 13);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
    const testLayer = new CanvasLayer().addTo(map);

    // let controllers = new Map<string, Controller>();
    // controllers.set('default', new DefaultController('default'));
    // let views = new Map<string, View>();
    // views.set('default', new DefaultView('default'));
    // let app = new Application(['default'], controllers, views);    
    // app.start();    
});

const drawTestTile = function(coords, done, tile) {
	let offscreen = tile.transferControlToOffscreen();
	var worker = new Worker("offscreencanvas.js");


	worker.onmessage = (res) => {
		// let data = res.data;
		// console.log('1 onmessage _____________', data, res);
		done('', tile);

	};
	worker.postMessage({
		cmd: 'drawTestTile',
		coords: coords,
		canvas: offscreen
	}, [offscreen]);

};

const CanvasLayer = L.GridLayer.extend({
    createTile: function(coords, done) {
        let error;

        // create a <canvas> element for drawing
        let tile = L.DomUtil.create('canvas', 'leaflet-tile');

        // setup tile width and height according to the options
        let size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;

        // draw something asynchronously and pass the tile to the done() callback
        drawTestTile(coords, done, tile);

        return tile;
    }
});
