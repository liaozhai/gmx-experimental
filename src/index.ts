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
	setTileReady: function (key:string) {
		const tile = this.getTile(key);
		this._tileReady(tile.coords, undefined, tile.el);
	},
	drawTile: function(coords:Coords, tile:HTMLCanvasElement) {
		const canvas = tile.transferControlToOffscreen();	
		this._worker.postMessage({
			cmd: 'drawTestTile',
			coords,
			canvas,
		}, [canvas]);
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
  
});

const dataManager = new Worker("dataManager.js");

dataManager.onmessage = (msg:MessageEvent) => {	
	console.log('Main dataManager', msg.data);
};
dataManager.postMessage({
	cmd: 'addLayer',
	hostName: 'maps.kosmosnimki.ru/',
	id: '8EE2C7996800458AAF70BABB43321FA4', // AISDaily
});