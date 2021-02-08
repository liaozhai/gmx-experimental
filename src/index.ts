import L, { Coords, GridLayerOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';
import Utils from './utils';
import CONST from './const';

const dataManager = new Worker("dataManager.js");

const CanvasLayer = L.Layer.extend({
	initialize: function (options) {
		L.setOptions(this, options);
	},

	onAdd: function (map) {
		if (!this._canvas) {
			this._div = L.DomUtil.create('div', 'leaflet-image-layer leaflet-zoom-animated', this.getPane());
			this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-overlay', this._div);
			this._canvas.style.zIndex = 1;
			this._setSize();
		}

		dataManager.postMessage({
			cmd: 'addLayer',
			id: this.options.layerId,
			dateBegin: this.options.dateBegin,
			dateEnd: this.options.dateEnd,
		}, []);
		this._rePaint();
	},

	_rePaint: function () {
		dataManager.postMessage({
			cmd: 'drawScreen',
			id: this.options.layerId,
			width: this._canvas.width,
			height: this._canvas.height,
		});
	},

	getEvents: function () {
		var events = {
			viewreset: this._onresize
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},

	_setSize: function () {
		let mapSize = this._map.getSize();
		let min = this._map.containerPointToLayerPoint(mapSize).round();
		let size = new L.Bounds(min, min.add(mapSize).round()).getSize();
		this._canvas.width = size.x;
		this._canvas.height = size.y;
	},
	rendered: function (bitmap) {
		L.DomUtil.setPosition(this._div, this._map._getMapPanePos().multiplyBy(-1));
		let ctx = this._canvas.getContext('2d');
		ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		ctx.drawImage(bitmap, 0, 0, this._canvas.width, this._canvas.height);
	},
	_animateZoom: function (e) {
        let map = this._map;
		L.DomUtil.setTransform(this._div,
		    map._latLngBoundsToNewLayerBounds(map.getBounds(), e.zoom, e.center).min,
			map.getZoomScale(e.zoom)
		);
	},

	_onresize: function () {
		let size = this._map.getSize();

		this._canvas.width = size.x; this._canvas.height = size.y;
		this._rePaint();
	}
});

const dateEnd = Math.floor(Date.now() / 1000);
const testLayer = new CanvasLayer({
	dateBegin: dateEnd - 24 * 60 * 60,
	dateEnd: dateEnd,
	layerId: '8EE2C7996800458AAF70BABB43321FA4'
	// layerId: 'F5CAD73AF25D46D2B3977847AEE33293'
});
const layersByID = {
	'8EE2C7996800458AAF70BABB43321FA4': testLayer
	// 'F5CAD73AF25D46D2B3977847AEE33293': testLayer
};

window.addEventListener('load', () => {
    const map = L.map(document.body);
    const moveend = () => {
		const zoom = map.getZoom();
		// const scale = map.scale(zoom);
		dataManager.postMessage({
			cmd: 'moveend',
			zoom: zoom,
			// scale: L.CRS.EPSG3857.scale(zoom),
			scale: 256 / (CONST.WORLDWIDTHFULL / Math.pow(2, zoom)),

			bbox: Utils.getNormalizeBounds(map.getBounds())
		});
	};

    map.setView([55.905, 37.66], 16);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	map
	.on('moveend', moveend);

	testLayer.addTo(map);
 

	dataManager.onmessage = (msg:MessageEvent) => {	
		 // console.log('Main dataManager', msg.data);
		const data = msg.data || {};
		const {cmd, layerId, tileKey} = data;
		switch(cmd) {
			case 'rendered':
				if (data.bitmap) {
					layersByID[layerId].rendered(data.bitmap);
				} else {
						var oGrayImg = new Image();
		oGrayImg.src = data.it;
		document.body.appendChild(oGrayImg);
				}
				break;
			case 'render':
				layersByID[layerId].tileReady(tileKey);
				break;
			case 'chkVersion':
				break;
			default:
				console.warn('Warning: Bad message from worker ', data);
				break;
		}

	};
 	moveend();


	// dataManager.postMessage({
		// cmd: 'addSource',
		// hostName: 'maps.kosmosnimki.ru',
		// apiKey: 'ZYK54KS7JV',

		// id: '8EE2C7996800458AAF70BABB43321FA4', // AISDaily
		// dateBegin: dateEnd - 24 * 60 * 60,
		// dateEnd: dateEnd
	// });
});
