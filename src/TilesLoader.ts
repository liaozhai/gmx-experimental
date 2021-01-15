import Requests from './Requests';

const TILE_PREFIX = 'gmxAPI._vectorTileReceiver(';

export default function (pars:any) {
	pars = pars || {};
	if (!pars.signals) { pars.signals = {}; }
	if (!pars.vTiles) { pars.vTiles = {}; }
	
	// return new Promise((resolve) => {
		let tilesOrder = pars.tilesOrder,
			pb = pars.tiles,
			vTiles:any = {};
		for (let i = 0, len = pb.length; i < len; i += tilesOrder.length) {
			let arr = pb.slice(i, i + tilesOrder.length),
				tkey = arr.join('_'),
				tHash = tilesOrder.reduce((p, c, j) => { p[c] = arr[j]; return p; }, {});

			if (pars.vTiles[tkey]) {
				vTiles[tkey] = pars.vTiles[tkey];
			} else {
				vTiles[tkey] = {
					tHash: tHash,
					promise: Requests.getTileJson({
						url: '//' + pars.hostName + '/TileSender.ashx',
						options: Requests.chkSignal(tkey, pars.signals, {}),
						paramsArr: [tHash, {
							r: 'j',
							ModeKey: 'tile',
							LayerName: pars.id,
						}]
					}).then(json => {
						delete pars.signals[tkey];
						if (typeof(json) === 'string') {
							if (json.substr(0, TILE_PREFIX.length) === TILE_PREFIX) {
								json = json.replace(TILE_PREFIX, '');
								json = JSON.parse(json.substr(0, json.length -1));
							}
						}
						json.bounds = Requests.bounds([[json.bbox[0], json.bbox[1]], [json.bbox[2], json.bbox[3]]]);
						json.bounds1 = Requests.getTileBounds(json, 0);
						return json;
					})
					.catch(err => {
						console.warn('Bad vector tile:', tkey, err);
					})
				};
				if (pars.screen) {
					for (let skey in pars.screen) {
						const it = pars.screen[skey];
						if (Requests.isTileKeysIntersects(tHash, it.coords)) {
							it.vtkeys.push(tkey);
						}
					}
				}
			}
		}
		Object.keys(pars.signals).forEach(k => {
			if (!vTiles[k]) {
				pars.signals[k].abort();
				delete pars.signals[k];
			}
		});
		// pars.tilesPromise = tilesPromise;
		return vTiles;
		// return out;
		// Promise.all(arr).then((out) => {
			// resolve(out);
		// });
	// });
/*
*/
};