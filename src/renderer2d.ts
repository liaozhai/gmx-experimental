const Renderer = {
	render: (options:any, coords:Array<number>) => {
		if (options.graphics) {
			Renderer.renderGL(options, coords);
		} else {
			Renderer.render2d(options, coords);
		}
	},
	renderGL: (options:any, coords:Array<number>) => {
		const {scale, graphics, bounds} = options;        
						// ctx.transform(scale, 0, 0, -scale, -bounds.min.x * scale, bounds.max.y * scale);

		const x = (coords[0] - bounds.min.x) * scale;
		const y = (bounds.max.y - coords[1]) * scale;
		graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
		graphics.beginFill(0xDE3249, 1);
		graphics.drawCircle(x, y, 50);
		graphics.endFill();
		
		return true;
	},
	render2d: (options:any, coords:Array<number>) => {
		const {scale, canvas} = options;        
		const ctx = canvas.getContext("2d");

		ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.fillStyle = 'red';
		// ctx.moveTo(coords[0], coords[1]);
		ctx.arc(coords[0], coords[1], 14 / (2 * scale), 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
		return true;
	},
	render2dEmpty: (options:any) => {
		const {coords, canvas} = options;        
		// const gl = canvas.getContext("webgl");
		const {x, y, z} = coords;
		const tileKey = [x,y,z].join(':');
		const ctx = canvas.getContext("2d");
		function render() {
			// ... some drawing using the gl context ...
			//requestAnimationFrame(render);
			ctx.beginPath();
			ctx.strokeStyle = 'black';
			ctx.rect(0, 0, 255, 255);
			ctx.moveTo(0, 0);
			ctx.lineTo(255, 255);
			ctx.moveTo(255, 0);
			ctx.lineTo(0, 255);
			ctx.stroke();

			ctx.beginPath();
			ctx.strokeStyle = 'red';
			ctx.arc(128, 128, 128, 0, Math.PI * 2, false);
			// ctx.stroke();        
			ctx.font = '25px serif';
			let textMetrics = ctx.measureText(tileKey);

			ctx.fillText(tileKey, 128 - textMetrics.width / 2, 100);
			ctx.stroke();

			// console.log('render', tileKey);
		}
		requestAnimationFrame(render);
		return true;
	}
};
export default Renderer;
