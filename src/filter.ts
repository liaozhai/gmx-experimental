const parse = (text:string) => {
    
};

onmessage = function(evt:MessageEvent) {
    const {data: {text, items}} = evt;
    console.log(text);
};
