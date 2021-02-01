import L, { Coords, GridLayerOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';
import Utils from './utils';
import CONST from './const';

const dataManager = new Worker("dataManager.js");

const CanvasLayer = L.Layer.extend({
	options: {
		padding: 0.1,
		projectionZoom: function (map) {return (map.getMaxZoom() + map.getMinZoom()) / 2;},
		shouldRedrawOnMove: function () {return true;},
	},

	initialize: function (drawCallback, pixiContainer, options) {
		L.setOptions(this, options);
		L.stamp(this);
		this._drawCallback = drawCallback;
		// this._pixiContainer = pixiContainer;
		// this._rendererOptions = {
			// transparent: true,
			// resolution: this.options.resolution,
			// antialias: true,
			// forceCanvas: this.options.forceCanvas,
			// preserveDrawingBuffer: this.options.preserveDrawingBuffer,
			// clearBeforeRender: this.options.clearBeforeRender
		// };
		// this._doubleBuffering = PIXI.utils.isWebGLSupported() && !this.options.forceCanvas &&
			// this.options.doubleBuffering;
	},
	onAdd: function (targetMap) {
		this._map = targetMap;
		if (!this._container) {
			var container = this._container = L.DomUtil.create('div', 'leaflet-pixi-overlay');
			container.style.position = 'absolute';
			// container.style.left = '-8px';
			this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-overlay', container);
			this.getPane().appendChild(this._container);
			// this._renderer = PIXI.autoDetectRenderer(this._rendererOptions);
			// setInteractionManager(
				// this._renderer.plugins.interaction,
				// this.options.destroyInteractionManager,
				// this.options.autoPreventDefault
			// );
			// container.appendChild(this._renderer.view);
			// if (this._zoomAnimated) {
				// L.DomUtil.addClass(container, 'leaflet-zoom-animated');
				// this._setContainerStyle();
			// }
			// if (this._doubleBuffering) {
				// this._auxRenderer = PIXI.autoDetectRenderer(this._rendererOptions);
				// setInteractionManager(
					// this._auxRenderer.plugins.interaction,
					// this.options.destroyInteractionManager,
					// this.options.autoPreventDefault
				// );
				// container.appendChild(this._auxRenderer.view);
				// this._renderer.view.style.position = 'absolute';
				// this._auxRenderer.view.style.position = 'absolute';
			// }
		}
		// this._addContainer();
		// this._setEvents();

		var map = this._map;
		this._initialZoom = this.options.projectionZoom(map);
		this._wgsOrigin = L.latLng([0, 0]);
		this._wgsInitialShift = map.project(this._wgsOrigin, this._initialZoom);
		this._mapInitialZoom = map.getZoom();
		var _layer = this;
		// map.on('resize', (e) => {
			// console.log('resize', e);
			// L.DomUtil.setTransform(this._container);
		// }, this);

		// this.utils = {
			// latLngToLayerPoint: function (latLng, zoom) {
				// zoom = (zoom === undefined) ? _layer._initialZoom : zoom;
				// var projectedPoint = map.project(L.latLng(latLng), zoom);
				// return projectedPoint;
			// },
			// layerPointToLatLng: function (point, zoom) {
				// zoom = (zoom === undefined) ? _layer._initialZoom : zoom;
				// var projectedPoint = L.point(point);
				// return map.unproject(projectedPoint, zoom);
			// },
			// getScale: function (zoom) {
				// if (zoom === undefined) return map.getZoomScale(map.getZoom(), _layer._initialZoom);
				// else return map.getZoomScale(zoom, _layer._initialZoom);
			// },
			// getRenderer: function () {
				// return _layer._renderer;
			// },
			// getContainer: function () {
				// return _layer._pixiContainer;
			// },
			// getMap: function () {
				// return _layer._map;
			// }
		// };
		this._update({type: 'add'});
	},

	onRemove: function () {
		L.DomUtil.remove(this._container);
	},

	getEvents: function () {
		var events = {
			zoom: this._onZoom,
			move: this._onMove,
			moveend: this._update
		};
		if (this._zoomAnimated) {
			events.zoomanim = this._onAnimZoom;
		}
		return events;
	},
	_onZoom: function () {
		this._updateTransform(this._map.getCenter(), this._map.getZoom());
	},

	_onAnimZoom: function (e) {
		this._updateTransform(e.center, e.zoom);
	},

	_onMove: function(e) {
		if (this.options.shouldRedrawOnMove(e)) {
			this._update(e);
		}
	},

	_updateTransform: function (center, zoom) {
		var scale = this._map.getZoomScale(zoom, this._zoom),
			viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
			currentCenterPoint = this._map.project(this._center, zoom),

			topLeftOffset = viewHalf.multiplyBy(-scale).add(currentCenterPoint)
				.subtract(this._map._getNewPixelOrigin(center, zoom));

		if (L.Browser.any3d) {
			L.DomUtil.setTransform(this._container, topLeftOffset, scale);
		} else {
			L.DomUtil.setPosition(this._container, topLeftOffset);
		}
	},

	_update: function (e) {
		if (this._map._animatingZoom && this._bounds) {return;}

		// Update pixel bounds of renderer container
		var mapSize = this._map.getSize(),
			min = this._map.containerPointToLayerPoint(mapSize).round();

		this._bounds = new L.Bounds(min, min.add(mapSize).round());
		this._center = this._map.getCenter();
		this._zoom = this._map.getZoom();
		var b = this._bounds;
		var container = this._container;
		var size = b.getSize();
		this._canvas.width = size.x;
		this._canvas.height = size.y;
		// отрисовка асинхронная - после нее выплняем код 
				// L.DomUtil.setTransform(container);
		L.DomUtil.setPosition(container, this._map._getMapPanePos().multiplyBy(-1));
		// let mapPos = this._map._getMapPanePos();
		// L.DomUtil.setPosition(container, {x: -mapPos.x, y: mapPos.y});

	},
});

const CanvasLayerOld = L.GridLayer.extend({
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
		tile.classList.add([coords.x, coords.y, coords.z].join(':'));

		this.drawTile(coords, tile);
		
        return tile;
	},
	getTile: function (key:string) {
		return this._tiles[key];
	},
	tileReady: function (key:string) {
		const tile = this.getTile(key);
		if (tile) {
			this._tileReady(tile.coords, undefined, tile.el);
		}
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
    map.setView([55.764213, 37.617187], 13);
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
