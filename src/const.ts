const WORLDWIDTHFULL = 40075016.685578496;
const W = Math.floor(WORLDWIDTHFULL / 2);
export default {
	DELAY: 60000,
	HOST: 'maps.kosmosnimki.ru',
	SCRIPTS: {
		CheckVersion: '/Layer/CheckVersion.ashx'
	},
	WORLDWIDTHFULL: WORLDWIDTHFULL,
	W: W,
	WORLDBBOX: [-W, -W, W, W]
};
