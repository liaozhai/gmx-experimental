const _self = self;

onmessage = function(evt:MessageEvent) {
    const {data: {coords, canvas}} = evt;        
        console.log('dataManager', evt.data);
    // const gl = canvas.getContext("webgl");
    const items = [];        
    function chkVersion () {
        console.log('chkVersion', items);
        _self && _self.postMessage({
            cmd: 'chkVersion',
            res: 'done'
        });
    }
    requestAnimationFrame(chkVersion);     
};

