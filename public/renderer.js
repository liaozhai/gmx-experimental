(function () {
    'use strict';

    var _self = self instanceof Worker && self;

    onmessage = function onmessage(evt) {
      var _evt$data = evt.data,
          coords = _evt$data.coords,
          canvas = _evt$data.canvas; // const gl = canvas.getContext("webgl");

      var x = coords.x,
          y = coords.y,
          z = coords.z;
      var tileKey = [x, y, z].join(':');
      var ctx = canvas.getContext("2d");

      function render() {
        // ... some drawing using the gl context ...
        //requestAnimationFrame(render);
        ctx.beginPath();
        ctx.rect(0, 0, 255, 255);
        ctx.moveTo(0, 0);
        ctx.lineTo(255, 255);
        ctx.moveTo(255, 0);
        ctx.lineTo(0, 255);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.arc(128, 128, 128, 0, Math.PI * 2, false); // ctx.stroke();        

        ctx.font = '25px serif';
        var textMetrics = ctx.measureText(tileKey);
        ctx.fillText(tileKey, 128 - textMetrics.width / 2, 100);
        ctx.stroke(); // console.log('render', tileKey);

        _self && _self.postMessage({
          tileKey: tileKey,
          cmd: 'render',
          res: 'done'
        });
      }

      requestAnimationFrame(render);
    };

}());
//# sourceMappingURL=renderer.js.map
