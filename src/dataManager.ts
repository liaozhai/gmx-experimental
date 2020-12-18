onmessage = function(evt:MessageEvent) {    
    console.log('dataManager', evt.data);
    // const gl = canvas.getContext("webgl");
    const items:any[] = [];
    function chkVersion () {
        console.log('chkVersion', items);
        self.postMessage({
            cmd: 'chkVersion',
            res: 'done'
        });
    }
    requestAnimationFrame(chkVersion);     
};