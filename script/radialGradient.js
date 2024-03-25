function paintCanvas(canvas){
    let ctx = canvas.getContext('2d');
    
    let maxDim = Math.max(canvas.width, canvas.height);
    let maxWidth = maxDim == canvas.width;
    
    if(maxWidth){
        ctx.setTransform(1, 0, 0, canvas.height / canvas.width, 0, 0);
    }else{
        ctx.setTransform(canvas.width / canvas.height, 0, 0, 1, 0, 0);
    }
    
    let halfDim = maxDim / 2;
    
    let grd = ctx.createRadialGradient(halfDim, halfDim, 0, halfDim, halfDim, halfDim);
    
    grd.addColorStop(0, 'rgb(38, 218, 255)');
    grd.addColorStop(1, 'rgb(35, 94, 255)');
    
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, maxDim, maxDim);
}

let bgCanvas = document.createElement("canvas");
bgCanvas.width = window.innerWidth;
bgCanvas.height = window.innerHeight;

paintCanvas(bgCanvas);