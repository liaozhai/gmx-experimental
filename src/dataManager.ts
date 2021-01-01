import CONST from './const';
import Requests from './Requests';
import load_tiles from './TilesLoader';
import Renderer from './renderer2d';

const hosts:any = {};
let bbox:any = null;
let zoom = 3;
let scale = 1;

let intervalID:any;
let timeoutID:any;

const utils = {
	now: function() {
		if (timeoutID) { clearTimeout(timeoutID); }
		timeoutID = setTimeout(chkVersion, 0);
    },

    stop: function() {
		// console.log('stop:', intervalID, CONST.DELAY);
        if (intervalID) { clearInterval(intervalID); }
        intervalID = null;
    },

    start: function(msec:number ) {
		// console.log('start:', intervalID, msec);
        utils.stop();
        intervalID = setInterval(chkVersion, msec || CONST.DELAY);
    },
	addSource: (attr:any) => {
		let id = attr.id || attr.layerId;
		if (id) {
			let hostName = attr.hostName || CONST.HOST;
			if (!hosts[hostName]) {
				hosts[hostName] = {ids: {}, signals: {}};
				if (attr.apiKey) {
					hosts[hostName].apiKeyPromise = Requests.getJson({
						url: '//' + hostName + '/ApiKey.ashx',
						paramsArr: [Requests.COMPARS, {
							Key: attr.apiKey
						}]
					}).then((json:any) => {
						// console.log('/ApiKey.ashx', json);
						let res = json.res;
						if (res.Status === 'ok' && res.Result) {
							hosts[hostName].Key = res.Result.Key;
							return hosts[hostName].Key;
						}
					});
				}

			}
			hosts[hostName].ids[id] = attr;
			if (!intervalID) { utils.start(0); }
			utils.now();
		} else {
			console.warn('Warning: Specify source `id` and `hostName`', attr);
		}
    },
	removeSource: (attr:any) => {
		attr = attr || {};

		let id = attr.id;
		if (id) {
			let hostName = attr.hostName || CONST.HOST;
			if (hosts[hostName]) {
				let pt = hosts[hostName].ids[id];
	console.log('signals:', pt.signals, pt);
				if (pt.signals) {
					Object.values(pt.signals).forEach((it:any) => {
						it.abort();
					});
				}
				delete hosts[hostName].ids[id];
				if (Object.keys(hosts[hostName].ids).length === 0) { delete hosts[hostName]; }
				if (Object.keys(hosts).length === 0) { utils.stop(); }
			}
		} else {
			console.warn('Warning: Specify layer id and hostName', attr);
		}
    },
    getTileAttributes: function(prop:any) {
        let tileAttributeIndexes:any = {};
        let tileAttributeTypes:any = {};
        if (prop.attributes) {
            let attrs = prop.attributes,
                attrTypes = prop.attrTypes || null;
            if (prop.identityField) { tileAttributeIndexes[prop.identityField] = 0; }
            for (let a = 0; a < attrs.length; a++) {
                let key = attrs[a];
                tileAttributeIndexes[key] = a + 1;
                tileAttributeTypes[key] = attrTypes ? attrTypes[a] : 'string';
            }
        }
        return {
            tileAttributeTypes: tileAttributeTypes,
            tileAttributeIndexes: tileAttributeIndexes
        };
    },
	chkHost: (hostName:string) => {
		const hostLayers = hosts[hostName];
		const ids = hostLayers.ids;
		const arr = [];

		for (let name in ids) {
			let pt = ids[name];
			let	pars:any = { Name: name, Version: 'v' in pt ? pt.v : -1 };
			if (pt.dateBegin) {
				pars.dateBegin = pt.dateBegin;
			}
			if (pt.dateEnd) {
				pars.dateEnd = pt.dateEnd;
			}
			arr.push(pars);
		}

		return Requests.getJson({
			url: '//' + hostName + CONST.SCRIPTS.CheckVersion,
			options: Requests.chkSignal('chkVersion', hostLayers.signals, undefined),
			paramsArr: [Requests.COMPARS, {
				layers: JSON.stringify(arr),
				bboxes: JSON.stringify(bbox || [CONST.WORLDBBOX]),
				// generalizedTiles: false,
				zoom: zoom
			}]
		}).then(json => {
			delete hostLayers.signals.chkVersion;
			return json;
		})
		.catch(err => {
			console.error(err);
			// resolve('');
		});
	},
};

const chkVersion = () => {
    // console.log('dataManager chkVersion', hosts);
	for (let host in hosts) {
		utils.chkHost(host).then((json:any) => {
			if (json.error) {
				// console.warn('chkVersion:', json);
			} else {
				let hostLayers = hosts[host];
				let	ids = hostLayers.ids;
				let	res:any = json.res;
				if (res.Status === 'ok' && res.Result) {
					res.Result.forEach((it:any) => {
						let pt = ids[it.name];
						let	props = it.properties;
						if (props) {
							pt.v = props.LayerVersion;
							pt.properties = props;
							pt.geometry = it.geometry;
							if (!pt.tileAttributeIndexes) {
								pt = Object.assign(pt, utils.getTileAttributes(props));
							}
						}
						pt.hostName = host;
						pt.tiles = it.tiles;
						// pt.tiles = it.tiles.slice(0, 12);
						pt.tilesOrder = it.tilesOrder;
						pt.tilesPromise = load_tiles(pt);
						let event = new Event('tilesLoaded', {bubbles: true}); // (2)
						event.detail = pt;
						dispatchEvent(event);
					});
				} else if (res.Status === 'error') {
					console.warn('Error: ', res);
				}
			}
		});
	}
	self.postMessage({
		cmd: 'chkVersion',
		now: Date.now(),
		res: 'done'
	});
};

const repaintScreenTiles = (vt:any, pt:any, clearFlag:boolean) => {
	let done = false;
	if(pt.screen) {
		Object.keys(pt.screen).forEach(tileKey => {
			let st = pt.screen[tileKey];
			if (st.coords.z === zoom) {
				st.scale = scale;
				let delta = 14 / scale;
				let bounds = st.bounds;
				const ctx = st.canvas.getContext("2d");
				ctx.resetTransform();
				ctx.transform(scale, 0, 0, -scale, -bounds.min.x * scale, bounds.max.y * scale);

				if(vt.bounds.intersectsWithDelta(bounds, delta)) {
					vt.values.forEach(it => {
						const coords = it[it.length - 1].coordinates;
						if (bounds.containsWithDelta(coords, delta)) {
							Renderer.render2d(st, coords);
							done = true;
						}
					});
				}
			// } else if (clearFlag) {
				// delete pt.screen[tileKey];
			}
		});
	}
	return done;
};

const recheckVectorTiles = (pt:any, clearFlag:boolean) => {
	let done = false;
	if(pt.tilesPromise) {
		Promise.all(Object.values(pt.tilesPromise)).then((res) => {
			res.forEach(vt => {
				done = repaintScreenTiles(vt, pt, clearFlag);
			});
		});
	}
	if(!done) {
		// Renderer.render2dEmpty(st);
	}
	// self.postMessage({
		// tileKey,
		// layerId: pt.id,
		// cmd: 'render',
		// res: 'done'
	// });
};

const redrawScreen = (clearFlag:boolean) => {
	for (let host in hosts) {
		let hostLayers = hosts[host];
		let	ids = hostLayers.ids;
		for (let id in ids) {
			let pt = ids[id];
			recheckVectorTiles(pt, clearFlag);
		}
	}
};

addEventListener('tilesLoaded', redrawScreen);

onmessage = function(evt:MessageEvent) {    
    // console.log('dataManager', evt.data);
	const data = evt.data || {};
	const {cmd} = data;
	// let worker: Worker;
	switch(cmd) {
		case 'addSource':
			utils.addSource(data);
			break;
		case 'addLayer':
			data.worker = new Worker("renderer.js");
			utils.addSource(data);			
			break;
		case 'drawTile':
			let id = data.id;
			const {x, y, z} = data.coords;
			const tileKey = [x,y,z].join(':');

			if (id) {
				let hostName = data.hostName || CONST.HOST;
				if (hosts[hostName]) {
					let it = hosts[hostName].ids[id];
					if (!it.screen) { it.screen = {}; }
					let bounds = Requests.getTileBounds(data.coords, 0);
					it.screen[tileKey] = {
						bounds: bounds,
						coords: data.coords,
						canvas: data.canvas
					};
				}
			}
			break;
		case 'moveend':
			//console.log('moveend', data);
			zoom = data.zoom;
			scale = data.scale;
			bbox = data.bbox;
			redrawScreen(true);
			break;
		default:
			console.warn('Warning: Bad command ', data);
			break;
	}

    requestAnimationFrame(chkVersion);     
};
