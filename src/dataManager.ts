import Requests from './Requests';
// import TilesLoader from './TilesLoader';

const DELAY = 60000;
const HOST:string = 'maps.kosmosnimki.ru';
const SCRIPTS = {
	CheckVersion: '/Layer/CheckVersion.ashx'
};
const WORLDWIDTHFULL = 40075016.685578496;
const W = Math.floor(WORLDWIDTHFULL / 2);
const WORLDBBOX = [-W, -W, W, W];

const hosts:any = {};

let bbox:any = null;
let zoom = 3;

let intervalID:any;
let timeoutID:any;

const utils = {
	now: function() {
		if (timeoutID) { clearTimeout(timeoutID); }
		timeoutID = setTimeout(chkVersion, 0);
    },

    stop: function() {
		console.log('stop:', intervalID, DELAY);
        if (intervalID) { clearInterval(intervalID); }
        intervalID = null;
    },

    start: function(msec:number ) {
		console.log('start:', intervalID, msec);
        utils.stop();
        intervalID = setInterval(chkVersion, msec || DELAY);
    },
	addSource: (attr:any) => {
		let id = attr.id;
		if (id) {
			let hostName = attr.hostName || HOST;
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
			let hostName = attr.hostName || HOST;
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
			url: '//' + hostName + SCRIPTS.CheckVersion,
			options: Requests.chkSignal('chkVersion', hostLayers.signals, undefined),
			paramsArr: [Requests.COMPARS, {
				layers: JSON.stringify(arr),
				bboxes: JSON.stringify(bbox || [WORLDBBOX]),
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
	}
};

const chkVersion = () => {
    console.log('dataManager chkVersion', hosts);
	for (let host in hosts) {
		utils.chkHost(host).then((json:any) => {
			if (json.error) {
				console.warn('chkVersion:', json);
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
						pt.tilesOrder = it.tilesOrder;
						// pt.tilesPromise = 
						// TilesLoader.load(pt);
/*
						Promise.all(Object.values(pt.tilesPromise)).then((res) => {
							//self.postMessage({res: res, host: host, dmID: it.name, cmd: 'TilesData'});

				console.log('tilesPromise ___:', hosts, res);
							// _waitCheckObservers();
						});
*/
						// pt.tilesPromise.then(res => {
				// console.log('tilesPromise ___:', hosts, res);
						// });
				// console.log('chkVersion ___:', pt);
					});
					// resolve(res.Result.Key !== 'null' ? '' : res.Result.Key);
				// } else {
					// reject(json);
					// console.log('chkVersion key:', host, hosts);
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

onmessage = function(evt:MessageEvent) {    
    // console.log('dataManager', evt.data, Requests);
	const data = evt.data || {};
	const {cmd} = data;
	switch(cmd) {
		case 'addLayer':
			utils.addSource(data);
			break;
		default:
			console.warn('Warning: Bad command ', data);
			break;
	}

    requestAnimationFrame(chkVersion);     
};
