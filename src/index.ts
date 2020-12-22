import L, { Coords, GridLayerOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';
import Utils from './utils';

const dataManager = new Worker("dataManager.js");

const CanvasLayer = L.GridLayer.extend({
	options: {
		layerId: ''
	},
	initialize: function(options:GridLayerOptions) {
		L.setOptions(this, options);
		// this._worker = new Worker("renderer.js");
		// this._worker.onmessage = (msg:MessageEvent) => {	
			// const {tileKey} = msg.data;		
			// const {coords, el} = this.getTile(tileKey);	
			// this._tileReady(coords, undefined, el);
		// };
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
	drawTile: function(coords:Coords, tile:HTMLCanvasElement) {
		const canvas = tile.transferControlToOffscreen();	
		dataManager.postMessage({
			cmd: 'drawTile',
			id: this.options.layerId,
			coords,
			canvas,
		}, [canvas]);
	},
	onAdd: function (map) {
        L.GridLayer.prototype.onAdd.call(this, map);
		dataManager.postMessage({
			cmd: 'addLayer',
			id: this.options.layerId,
			dateBegin: this.options.dateBegin,
			dateEnd: this.options.dateEnd,
		}, []);
	}
});

const dateEnd = Math.floor(Date.now() / 1000);
const testLayer = new CanvasLayer({
	dateBegin: dateEnd - 24 * 60 * 60,
	dateEnd: dateEnd,
	layerId: '8EE2C7996800458AAF70BABB43321FA4'
});

window.addEventListener('load', () => {
    const map = L.map(document.body);
    const moveend = () => {
		dataManager.postMessage({
			cmd: 'moveend',
			zoom: map.getZoom(),
			bbox: Utils.getNormalizeBounds(map.getBounds())
		});
	};
    map.setView([55.764213, 37.617187], 13);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	map
	.on('moveend', moveend);

	moveend();
	testLayer.addTo(map);
  

	dataManager.onmessage = (msg:MessageEvent) => {	
		console.log('Main dataManager', msg.data);
	};


	// dataManager.postMessage({
		// cmd: 'addSource',
		// hostName: 'maps.kosmosnimki.ru',
		// apiKey: 'ZYK54KS7JV',

		// id: '8EE2C7996800458AAF70BABB43321FA4', // AISDaily
		// dateBegin: dateEnd - 24 * 60 * 60,
		// dateEnd: dateEnd
	// });
});
