import L, { Coords, GridLayerOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';

const CanvasLayer = L.GridLayer.extend({
	initialize: function(name:string, options:GridLayerOptions) {

		options = L.Util.setOptions(this, options);	
		this._worker = new Worker("renderer.js");
		this._worker.onmessage = (msg:MessageEvent) => {	
			const {tileKey} = msg.data;		
			const {coords, el} = this.getTile(tileKey);	
			this._tileReady(coords, undefined, el);
		};
	},
    createTile: function(coords:Coords) {		
		let tile = L.DomUtil.create('canvas', 'leaflet-tile') as HTMLCanvasElement;				
		const {x, y} = this.getTileSize();
        tile.width = x;
		tile.height = y;

		this.drawTile(coords, tile);
		
        return tile;
	},
	getTile: function (key:string) {
		return this._tiles[key];
	},
<<<<<<< HEAD
	setFilter: function(fn:(item:any)=>boolean) {

	},
	drawTile: function(coords:Coords, tile:HTMLCanvasElement) {
		const canvas = tile.transferControlToOffscreen();	
		this._worker.postMessage({
			cmd: 'drawTestTile',
			coords,
			canvas,
		}, [canvas]);
	},
=======
	setTileReady: function (key:string) {
		const tile = this.getTile(key);
		this._tileReady(tile.coords, undefined, tile.el);
	}
>>>>>>> 35d70c10fd430b77e5d1e526817c813fb38641bf
});

const testLayer = new CanvasLayer();

const filter = new Worker('filter.js');
filter.postMessage({
	text: 'A > B'
});

window.addEventListener('load', () => {
    const map = L.map(document.body);
    map.setView([55.764213, 37.617187], 13);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	testLayer.addTo(map);
<<<<<<< HEAD

    // let controllers = new Map<string, Controller>();
    // controllers.set('default', new DefaultController('default'));
    // let views = new Map<string, View>();
    // views.set('default', new DefaultView('default'));
    // let app = new Application(['default'], controllers, views);    
    // app.start();    
});
=======
  
});

const worker = new Worker("renderer.js");

worker.onmessage = (msg:MessageEvent) => {	
	const {tileKey} = msg.data;		
	testLayer.setTileReady(tileKey);
};

const drawTestTile = function(coords:Coords, tile:HTMLCanvasElement) {
	const canvas = tile.transferControlToOffscreen();	
	worker.postMessage({
		cmd: 'drawTestTile',
		coords,
		canvas,
	}, [canvas]);
};

const dataManager = new Worker("dataManager.js");

dataManager.onmessage = (msg:MessageEvent) => {	
	console.log('Main dataManager', msg.data);
};
dataManager.postMessage({
	cmd: 'addLayer',
	hostName: 'maps.kosmosnimki.ru/',
	id: '8EE2C7996800458AAF70BABB43321FA4', // AISDaily
});


>>>>>>> 35d70c10fd430b77e5d1e526817c813fb38641bf
