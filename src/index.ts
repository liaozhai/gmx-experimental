import L, { Coords } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';

const CanvasLayer = L.GridLayer.extend({
    createTile: function(coords:Coords) {		
		let tile = L.DomUtil.create('canvas', 'leaflet-tile') as HTMLCanvasElement;		
		
		const {x, y} = this.getTileSize();
        tile.width = x;
		tile.height = y;

		drawTestTile(coords, tile);
		
        return tile;
	},
	getTile: function (key:string) {
		return this._tiles[key];
	},
	setTileReady: function (key:string) {
		const tile = this.getTile(key);
		this._tileReady(tile.coords, undefined, tile.el);
	}
});

const testLayer = new CanvasLayer();

window.addEventListener('load', () => {
    const map = L.map(document.body);
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


