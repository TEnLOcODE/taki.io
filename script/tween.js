function lerp(a, b, t){
    return a + (b - a) * t;
}

function bytesToColor(color){
    return {
        r: color >> 16,
        g: color >> 8 & 0xff,
        b: color & 0xff
    };
}
function colorToBytes(color){
    return (color.r << 16) + (color.g << 8) + (color.b);
}

let dummy = x => { return x };

let tweens = {};

function tweenInit(){
    app.ticker.add(tweenLoop);
}

function addTween(obj, param, start, end, duration, ease=dummy){
    let id = Math.random();
    tweens[id] = {
        obj: obj,
        param: param,
        start: start,
        end: end,
        duration: duration,
        ease: ease,
        t: 0
    };
    return tweens[id];
}

function addColorTween(obj, param, start, end, duration, ease){
    let colorObj = bytesToColor(start);
    let endColorObj = bytesToColor(end);
    let someTween = addTween(colorObj, "r", colorObj.r, endColorObj.r, duration, ease);
    addTween(colorObj, "g", colorObj.g, endColorObj.g, duration, ease);
    addTween(colorObj, "b", colorObj.b, endColorObj.b, duration, ease)
    .update = function(){
        obj[param] = colorToBytes(colorObj);
    }
    return someTween; // just so onFinish could be added later
}

function tweenLoop(){
    let dt = app.ticker.deltaMS / 1000;
    for(id in tweens){
        let toDelete = false;
        let tween = tweens[id];
        tween.t += dt;
        if(tween.t >= tween.duration){
            tween.t = tween.duration;
            toDelete = true;
            if(tween.onFinish)
                tween.onFinish();
        }
        tween.obj[tween.param] = lerp(tween.start, tween.end, tween.ease(tween.t / tween.duration));
        if(tween.update)
            tween.update();
        if(toDelete){
            delete tweens[id]
        }
    }
}