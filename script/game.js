function setCookie(cname,cvalue,exdays) {
let d = new Date();
d.setTime(d.getTime() + (exdays*24*60*60*1000));
let expires = "expires=" + d.toGMTString();
document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
let name = cname + "=";
let decodedCookie = decodeURIComponent(document.cookie);
let ca = decodedCookie.split(';');
for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
    c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
    return c.substring(name.length, c.length);
    }
}
return "";
}

function doex(f, a, b, c, d){
    if(f)
        return f(a, b, c, d);
}

function randInt(min, max, n) {
    return Math.floor(n * (max - min) ) + min;
}

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

let app = new PIXI.Application();

let loader = PIXI.Loader.shared;
let resources = loader.resources;

let Rectangle = PIXI.Rectangle;
let Texture = PIXI.Texture;
let Sprite = PIXI.Sprite;
let Container = PIXI.Container;
let Graphics = PIXI.Graphics;
let PText = PIXI.Text;

PIXI.DisplayObject.prototype.addClickListener = function(callback){
    this.addListener("click", callback);
    this.addListener("tap", callback);
}

let screenW = window.innerWidth,
    screenH = window.innerHeight;

let useSpritesheet = false;

const cardW = 165,
    cardH = 255,
    cardMargin = 1;

const maxColors = 4;

const maxPlayerCards = 8;

let backTex;

let cardSpace = cardW/2;

let opCardScale = 0.7;
let opCardY = cardH/4*3;

let totalCardsW = maxPlayerCards * cardSpace + (cardW - cardSpace);

let cardOverY = -40;

let topAngleRange = 10;
function randomAngle(){
    return -topAngleRange + Math.random() * topAngleRange * 2;
}

let directionArrows = new Sprite();

let cardAnimDuration = 0.5;

let deckDrawDelay = 250;

let deckBtn = new Sprite();

let maxPlacedCards = 16;

let winFlashDuration = 1;

/////

let maxPlayers;
let playerIndex;

let nicknames;

let turnDirection;

let curTurn;

let myCardsParent = new Container();
myCardsParent.x = screenW/2;
myCardsParent.y = screenH - cardH/4;

let myCards = new Container();

myCardsParent.addChild(myCards);

let plusTwoChain;

let doingTaki;

let topCard;
let topColor;

let placedCards = new Container();

let opponentInds; // order of opponent's indices from the player's perspective (e.g. if there are 4 players and the playerIndex is 2, this will be [3, 0, 1])
let invOpponentInds; // the opposite of the above, key swapped with value

let inactivePlayers;
let inactiveCount;

let winCount;
let lastWin;
let winPlayers;

let disconnectedPlayers;

let winString;

let randGen;

let colorBlockImages = [];

let colors = [
    0xDA6039, // red
    0x7EB94F, // green
    0x43BAE5, // blue
    0xFDF16B  // yellow
];

let csSize = 100;
let csMargin = 20;

let csText = new PText("Choose a color:", {fontFamily : 'Arial', fontSize: 50, fill : 0xffffff, align : 'center'});
csText.x = screenW / 2 - csText.width / 2;
csText.y = 150;

let colorSelectContainer = new Container();

let csBtnContainer = new Container();
csBtnContainer.x = screenW/2;
csBtnContainer.y = screenH/2;
csBtnContainer.angle = 45;
colorSelectContainer.visible = false;

let blackOverlay = new Graphics();
blackOverlay.interactive = true;
blackOverlay.beginFill(0, 0.5)
.drawRect(0, 0, screenW, screenH)
.endFill();
blackOverlay.visible = false;

let btnRed = new Graphics();
btnRed.interactive = true;
btnRed.buttonMode = true;
btnRed.color = 0;
btnRed.beginFill(colors[0])
.drawRect(-csSize - csMargin / 2, -csSize - csMargin / 2, csSize, csSize)
.endFill();
btnRed.ax = -csSize; btnRed.ay = -csSize;

let btnYellow = new Graphics();
btnYellow.interactive = true;
btnYellow.buttonMode = true;
btnYellow.color = 3;
btnYellow.beginFill(colors[3])
.drawRect(csMargin / 2, -csSize - csMargin / 2, csSize, csSize)
.endFill();
btnYellow.ax = csSize; btnYellow.ay = -csSize;

let btnBlue = new Graphics();
btnBlue.interactive = true;
btnBlue.buttonMode = true;
btnBlue.color = 2;
btnBlue.beginFill(colors[2])
.drawRect(-csSize - csMargin / 2, csMargin / 2, csSize, csSize)
.endFill();
btnBlue.ax = -csSize; btnBlue.ay = csSize;

let btnGreen = new Graphics();
btnGreen.interactive = true;
btnGreen.buttonMode = true;
btnGreen.color = 1;
btnGreen.beginFill(colors[1])
.drawRect(csMargin / 2, csMargin / 2, csSize, csSize)
.endFill();
btnGreen.ax = csSize; btnGreen.ay = csSize;

//colorSelectContainer.addChild(blackOverlay);
colorSelectContainer.addChild(csBtnContainer);
colorSelectContainer.addChild(csText);

csBtnContainer.addChild(btnRed);
csBtnContainer.addChild(btnYellow);
csBtnContainer.addChild(btnBlue);
csBtnContainer.addChild(btnGreen);

btnRed.addClickListener(colorSelectClick);
btnYellow.addClickListener(colorSelectClick);
btnBlue.addClickListener(colorSelectClick);
btnGreen.addClickListener(colorSelectClick);

let csDuration = 0.5;

function blackOverlayIn(){
    blackOverlay.visible = true;
    addTween(blackOverlay, "alpha", 0, 1, csDuration, easeQuad.Out);
}
function blackOverlayOut(){
    addTween(blackOverlay, "alpha", 1, 0, csDuration, easeQuad.In)
    .onFinish = function(){
        blackOverlay.visible = false;
    }
}

function chooseColorEnter(){
    colorSelectContainer.visible = true;
    for(let i=0; i<csBtnContainer.children.length; i++){
        let btn = csBtnContainer.children[i];
        addTween(btn, "x", btn.ax, 0, csDuration, easeQuad.Out);
        addTween(btn, "y", btn.ay, 0, csDuration, easeQuad.Out);
    }
    addTween(colorSelectContainer, "alpha", 0, 1, csDuration, easeQuad.Out);
    blackOverlayIn();
}
function chooseColorExit(){
    for(let i=0; i<csBtnContainer.children.length; i++){
        let btn = csBtnContainer.children[i];
        addTween(btn, "x", 0, btn.ax, csDuration, easeQuad.In);
        addTween(btn, "y", 0, btn.ay, csDuration, easeQuad.In);
    }
    addTween(colorSelectContainer, "alpha", 1, 0, csDuration, easeQuad.In)
    .onFinish = function(){
        colorSelectContainer.visible = false;
    }
    blackOverlayOut();
}

/////

let endTurnBtn = new Container();
endTurnBtn.interactive = true;
endTurnBtn.buttonMode = true;

{
    let text = new PText("End Turn", {fontFamily : 'Arial', fontSize: 40, fill : 0, align : 'center'});

    let gfx = new Graphics();
    gfx.beginFill(0xffffff)
    .drawRoundedRect(0, 0, text.width + 10, text.height + 10, 10)
    .endFill();

    endTurnBtn.addChild(gfx);

    text.x = endTurnBtn.width/2 - text.width/2;
    text.y = endTurnBtn.height/2 - text.height/2;
    endTurnBtn.addChild(text);
}

endTurnBtn.x = screenW/2 - endTurnBtn.width/2;
endTurnBtn.y = screenH - cardH - endTurnBtn.height;

endTurnBtn.addClickListener(endTurnBtnClick);

/////

let plusTwoBubble = new Container();
plusTwoBubble.x = screenW/2 + cardW/2 + 20;
plusTwoBubble.y = screenH/2 - cardH/2;

let plusTwoText = new PText("+99", {fontFamily : 'Arial', fontSize: 35, fill : 0, align : 'center'});

{
    let gfx = new Graphics();
    gfx.beginFill(0xffffff)
    .drawRoundedRect(0, 0, plusTwoText.width + 5, plusTwoText.height + 5, 5)
    .endFill();

    plusTwoBubble.addChild(gfx);

    plusTwoText.x = plusTwoBubble.width/2 - plusTwoText.width/2;
    plusTwoText.y = plusTwoBubble.height/2 - plusTwoText.height/2;
    plusTwoBubble.addChild(plusTwoText);
}

/////

let nicknamesContainer = new Container();

let gameContainer = new Container();

let opponentContainers = new Container();

let opCardsLeft = new Container();
opCardsLeft.y = screenH/2;
opCardsLeft.angle = 90;
opCardsLeft.scale.x = opCardScale;
opCardsLeft.scale.y = opCardScale;

let opCardsRight = new Container();
opCardsRight.x = screenW;
opCardsRight.y = screenH/2;
opCardsRight.angle = -90;
opCardsRight.scale.x = opCardScale;
opCardsRight.scale.y = opCardScale;

let opCardsUp = new Container();
opCardsUp.x = screenW/2;
opCardsUp.angle = 180;
opCardsUp.scale.x = opCardScale;
opCardsUp.scale.y = opCardScale;

let playerViews = { // key is how many players in the game, it gives the order of every container from the player's perspective
    2: [opCardsUp],
    3: [opCardsLeft, opCardsRight],
    4: [opCardsLeft, opCardsUp, opCardsRight]
};

let allOpContainers = [opCardsLeft, opCardsRight, opCardsUp];

let selfTurnIndicator = new Sprite();

let turnIndicators = []; // both the opponent's indicators and the player's are here, ordered by their index

let cardContainers = []; // both the opponent's cards and the player's are here, ordered by their index

//TODO add more for corners

let indicatorColorDuration = 0.25;

let activeCardsY = -40;

let stopBobDuration = 0.3;

let unavailTint = 0xbbbbbb;
let winTint = 0xFFD800;

let ordinals = ["1st", "2nd", "3rd", "4th"];

/////

let gameOverContainer = new Container();
{
    let gfx = new Graphics();
    gfx.beginFill(0x00CBFF)
    .drawRoundedRect(0, 0, 600, 580, 20)
    .endFill();
    gameOverContainer.addChild(gfx);

    let topText = new PText("Game Over", {fontFamily : 'Arial', fontSize: 55, fill : 0});
    topText.x = gameOverContainer.width/2 - topText.width/2;
    topText.y = 25;
    gameOverContainer.topText = topText;
    gameOverContainer.addChild(topText);

    let midMargin = 10;

    let midText = new PText("", {fontFamily : 'Arial', fontSize: 50, fill : 0, align : 'left', wordWrap: true, wordWrapWidth: gfx.width - midMargin*2});
    midText.x = midMargin;
    midText.y = topText.y + topText.height + 20;
    gameOverContainer.midText = midText;
    gameOverContainer.addChild(midText);
}

let exitButton = new Container();
exitButton.interactive = true;
exitButton.buttonMode = true;
{
    let margin = 50;
    let padding = 20;

    let text = new PText("Exit", {fontFamily : 'Arial', fontSize: 40, fill : 0});
    text.x = padding;
    text.y = padding;

    let gfx = new Graphics();
    gfx.beginFill(0xFF695E)
    .drawRoundedRect(0, 0, text.width + padding*2, text.height + padding*2, 5)
    .endFill()
    exitButton.addChild(gfx);

    exitButton.addChild(text);

    exitButton.x = gameOverContainer.width/2 - exitButton.width/2;
    exitButton.y = gameOverContainer.height - exitButton.height - margin;

    gameOverContainer.addChild(exitButton);
}
exitButton.addClickListener(backToMenu);

gameOverContainer.pivot.x = gameOverContainer.width/2;
gameOverContainer.pivot.y = gameOverContainer.height/2;

gameOverContainer.x = screenW/2;
gameOverContainer.y = screenH/2;

gameOverContainer.visible = false;

function gameOverIn(title, mid){
    blackOverlayIn();
    gameOverContainer.visible = true;
    addTween(gameOverContainer, "alpha", 0, 1, csDuration, easeQuad.Out);
    addTween(gameOverContainer.scale, "x", 0, 1, csDuration, easeQuad.Out);
    addTween(gameOverContainer.scale, "y", 0, 1, csDuration, easeQuad.Out);

    gameOverContainer.topText.text = title;
    gameOverContainer.topText.x = gameOverContainer.width/2 - gameOverContainer.topText.width/2;

    gameOverContainer.midText.text = mid;
}
function gameOverOut(){
    blackOverlayOut();
    addTween(gameOverContainer, "alpha", 1, 0, csDuration, easeQuad.In)
    .onFinish = function(){
        gameOverContainer.visible = false;
    }
    addTween(gameOverContainer.scale, "x", 1, 0, csDuration, easeQuad.In);
    addTween(gameOverContainer.scale, "y", 1, 0, csDuration, easeQuad.in);
}

/////

function colorMyCards(){
	myCards.children.forEach(spr => {
		let card = spr.card;
		addColorTween(spr, "tint", spr.tint, cardIsPlaceable(card) ? 0xffffff : unavailTint, 0.1);
	});
}

let lastTurn;

function incrementTurn(skipAnim=false){
    if(!skipAnim && winPlayers[lastTurn] == undefined){
        let cards = cardContainers[lastTurn];
        addTween(cards, "y", cards.y, 0, cardAnimDuration, easeQuad.InOut);
		addColorTween(turnIndicators[lastTurn], "tint", 0x00ff00, 0xffffff, indicatorColorDuration);
		
		if(lastTurn == playerIndex){
			myCards.children.forEach(spr => {
				addColorTween(spr, "tint", spr.tint, unavailTint, 0.1);
			});
		}
    }

    do{
        curTurn = (curTurn + turnDirection).mod(maxPlayers);
    }while(inactivePlayers[curTurn])

    if(!skipAnim){
        cards = cardContainers[curTurn];
        addTween(cards, "y", cards.y, activeCardsY, cardAnimDuration, easeQuad.InOut);
        addColorTween(turnIndicators[curTurn], "tint", 0xffffff, 0x00ff00, indicatorColorDuration);
		lastTurn = curTurn;
		
		if(curTurn == playerIndex){
			colorMyCards();
		}
    }
}

/////

/*
    onPlace - when anyone uses the card
    onSelfPlace - when the client uses the card
*/
let cardTypes = [
    {symbol: "1"}, {symbol: "3"}, {symbol: "4"}, {symbol: "5"}, {symbol: "6"}, {symbol: "7"}, {symbol: "8"}, {symbol: "9"},
    {
        symbol: "+2",
        onPlace: function(){
            plusTwoChain += 2;
            if(!plusTwoBubble.visible)
                addTween(plusTwoBubble, "alpha", 0, 1, 0.1);
            plusTwoBubble.visible = true;
            plusTwoText.text = "+" + plusTwoChain;
        }
    },
    {
        symbol: "plus",
        onSelfPlace: function(){
            return true;
        }
    },
    {
        symbol: "stop",
        onPlace: function(){
            lastTurn = curTurn;
            incrementTurn(true);
            let indicator = turnIndicators[curTurn];
            let cards = cardContainers[curTurn];
            addColorTween(indicator, "tint", 0xffffff, 0xff0000, stopBobDuration)
            .onFinish = function(){
                addColorTween(indicator, "tint", 0xff0000, 0xffffff, stopBobDuration)
            };
            addTween(cards, "y", 0, -activeCardsY, stopBobDuration, easeQuad.In)
            .onFinish = function(){
                addTween(cards, "y", -activeCardsY, 0, stopBobDuration, easeQuad.Out)
            };
        }
    },
    {
        symbol: "taki",
        onSelfPlace: function(){
            for(let i=0; i<myCards.children.length; i++){
                let card = myCards.children[i].card;
                if(cardColorPlaceable(card)){
                    doingTaki = true;
                    endTurnBtn.visible = true;
                    addTween(endTurnBtn, "alpha", 0, 1, 0.1);
                    return true;
                }
            }
        }
    },
    {
        symbol: "switch",
        onPlace: function(){
            turnDirection = -turnDirection;
            directionArrows.scale.x = turnDirection;
            addTween(directionArrows, "angle", -360 * turnDirection, 0, 1, easeQuad.Out);
        }
    },
    {
        symbol: "color",
        nocolor: true,
        onSelfPlace: function(){
            chooseColorEnter();
            return true;
        }
    },
    {
        symbol: "supertaki",
        nocolor: true,
        onSelfPlace: function(){
            chooseColorEnter();
            return true;
        }
    }
];

function cardFilename(card, color){
    if(card.nocolor){
        return "image/cards/card_" + card.symbol + ".png";
    }else{
        return "image/cards/card_" + card.symbol + "_" + color + ".png";
    }
}

loader
.add("image/direction arrows.png")
.add("image/deck.png")
.add("image/turnIndicator.png")

if(useSpritesheet){
    loader.add("image/cardSheet.png");
}else{
    for(let i=0; i<cardTypes.length; i++){
        let card = cardTypes[i];
        if(card.nocolor){
            loader.add(cardFilename(card));
        }else{
            for(let c=0; c<maxColors; c++){
                loader.add(cardFilename(card, c));
            }
        }
    }
    for(let c=0; c<maxColors; c++){
        loader.add("image/cards/card_onecolor_" + c + ".png");
    }
    loader.add("image/cards/card_back.png");
}

let cardIds = {};

let deck = [];

function cardColorPlaceable(card){
    return (card.nocolor) || card.color == (topCard.color === undefined ? topColor : topCard.color);
}

function cardIsPlaceable(card){
    if(doingTaki){
        return cardColorPlaceable(card);
    }else if(plusTwoChain > 0){
        return card.symbol == "+2";
    }else{
        return cardColorPlaceable(card) || card.symbol == topCard.symbol;
    }
}

function cardRect(x, y){
    return new Rectangle(x, y, cardW, cardH);
}

function newCardSprite(card){
    let spr = new Sprite(card.image);
    spr.anchor.set(0.5);
    spr.card = card;
    return spr;
}

function organizeCardPositions(opInd=playerIndex){
    let container = cardContainers[opInd];
    let totalW = container.children.length * cardSpace + (cardW - cardSpace);
    for(let i=0; i < container.children.length; i++){
        let card = container.children[i];
        addTween(card, "x", card.x, -totalW/2 + cardSpace * i + cardW/2, cardAnimDuration, easeQuad.InOut);
    }
    updateIndicatorWidth(opInd);
}

function setupMyCard(cardSpr){
    cardSpr.addListener("mouseover", () => {
        if(curTurn == playerIndex && cardIsPlaceable(cardSpr.card))
            addTween(cardSpr, "y", cardSpr.y, cardOverY, 0.2, easeQuad.Out);
    });
    cardSpr.addListener("mouseout", () => {
        if(curTurn == playerIndex && cardIsPlaceable(cardSpr.card))
            addTween(cardSpr, "y", cardSpr.y, 0, 0.2, easeQuad.Out);
    });
    cardSpr.addClickListener(onCardClick);
}

let colorFlashDuration = 0.5;

function setTopColor(color){
    let topCardSpr = placedCards.children[placedCards.children.length-1];
    if(topCard.symbol == "supertaki"){
        topCard = cardIds["taki " + color];
        topCardSpr.texture = topCard.image;
    }else{
        topColor = color;
        topCardSpr.texture = colorBlockImages[color];
	}
	let highlight = new Sprite(topCardSpr.texture);
	highlight.anchor.set(0.5);
	highlight.x = topCardSpr.x;
	highlight.y = topCardSpr.y;
	highlight.angle = topCardSpr.angle;
	placedCards.addChild(highlight);
	addTween(highlight.scale, "x", 1, 1.5, colorFlashDuration);
	addTween(highlight.scale, "y", 1, 1.5, colorFlashDuration);
	addTween(highlight, "alpha", 1, 0, colorFlashDuration)
	.onFinish = function(){
		placedCards.removeChild(highlight);
	}
}

function updateIndicatorWidth(index){
    let indicator = turnIndicators[index];
    let cards = cardContainers[index];
    addTween(indicator, "width", indicator.width, Math.max(indicator.origWidth, cards.children.length * cardSpace + (cardW - cardSpace) + cardSpace*4), cardAnimDuration, easeQuad.InOut);
}

function endTakiTurn(){
    doex(topCard.onPlace);
    let anotherTurn = doex(topCard.onSelfPlace);
    if(!anotherTurn)
        incrementTurn();
    doingTaki = false;
    return anotherTurn;
}

function onCardPlace(){
    if(placedCards.children.length > maxPlacedCards){
        let card = placedCards.removeChildAt(0).card;
        deck.splice(randInt(0, deck.length/4*3, randGen()), 0, card);
    }
}

let indicatorTex;

function gameSetup(){
    indicatorTex = loader.resources["image/turnIndicator.png"].texture;

    directionArrows.texture = loader.resources["image/direction arrows.png"].texture;
    directionArrows.x = screenW/2;
    directionArrows.y = screenH/2;
    directionArrows.anchor.set(0.5);
    directionArrows.alpha = 0.9;

    deckBtn.texture = loader.resources["image/deck.png"].texture;
    deckBtn.pivot.x = cardW/2;
    deckBtn.pivot.y = cardH/2;
    deckBtn.x = screenW/2 + cardW * 2;
    deckBtn.y = screenH/2;
    deckBtn.interactive = true;
    deckBtn.buttonMode = true;
    deckBtn.addClickListener(onDeckClick);

    let sheetTex;
    if(useSpritesheet)
        sheetTex = loader.resources["image/cardSheet.png"].texture;

    for(let i = 0; i < cardTypes.length; i++){
        let card = cardTypes[i];
        let dy = i * (cardH + cardMargin);
        if(!card.nocolor){
            card.images = [];
            for(let c = 0; c < maxColors; c++){
                let tex = useSpritesheet ? new Texture(sheetTex, cardRect(c * (cardW + cardMargin), dy)) : loader.resources[cardFilename(card, c)].texture;
                card.images.push(tex);
                let id = card.symbol + " " + c;
                cardIds[id] = {
                    symbol: card.symbol,
                    color: c,
                    id: id,
                    onPlace: card.onPlace,
                    onSelfPlace: card.onSelfPlace,
                    image: tex
                };
            }
        }else{
            card.image = useSpritesheet ? new Texture(sheetTex, cardRect(0, dy)) : loader.resources[cardFilename(card)].texture;
            let id = card.symbol;
            cardIds[id] = {
                symbol: card.symbol,
                nocolor: true,
                id: id,
                onPlace: card.onPlace,
                onSelfPlace: card.onSelfPlace,
                image: card.image
            };
        }
    }

    backTex = useSpritesheet ? new Texture(sheetTex, cardRect(0, cardTypes.length * (cardH + cardMargin))) : loader.resources["image/cards/card_back.png"].texture;

    for(let c=0; c<maxColors; c++){
        colorBlockImages.push(useSpritesheet ? new Texture(sheetTex, cardRect(c * (cardW + cardMargin), (cardTypes.length + 1) * (cardH + cardMargin))) : loader.resources["image/cards/card_onecolor_" + c +".png"].texture);
    }

    allOpContainers.forEach(opCont => {
        let indicator = new Sprite(indicatorTex);
        indicator.anchor.set(0.5, 1);
        indicator.origWidth = indicator.width;
        opCont.addChild(indicator);
        opCont.indicator = indicator;
        let cards = new Container();
        opCont.addChild(cards);
        opCont.cards = cards;
    });
    
    selfTurnIndicator.texture = indicatorTex;
    selfTurnIndicator.x = screenW/2;
    selfTurnIndicator.y = screenH;
    selfTurnIndicator.anchor.set(0.5, 1);
    selfTurnIndicator.origWidth = selfTurnIndicator.width;

    gameContainer.visible = false;

    gameContainer.addChild(deckBtn);
    gameContainer.addChild(directionArrows);

    gameContainer.addChild(selfTurnIndicator);
    gameContainer.addChild(myCardsParent);
    gameContainer.addChild(opponentContainers);
    gameContainer.addChild(placedCards);

    endTurnBtn.visible = false;
    gameContainer.addChild(endTurnBtn);

    plusTwoBubble.visible = false;
    gameContainer.addChild(plusTwoBubble);

    gameContainer.addChild(nicknamesContainer);

    gameContainer.addChild(blackOverlay);

    gameContainer.addChild(colorSelectContainer);

    gameContainer.addChild(gameOverContainer);

    app.stage.addChild(gameContainer);

    tweenInit();
    
    app.stage.addListener("rightclick", onRightClick);

    if(typeof onTurn != "function"){
        alert("uhh there's no onTurn function present");
        throw new Error("no onTurn function present");
    }

    console.log("finished setup");

    //initGame(Math.random(), 4, 0, []); // TODO delete this
}

function addToDeck(card){
    deck.splice(randInt(0, deck.length + 1, randGen()), 0, card);
}

function initGame(seed, players, playerInd, nicks){ // call this when a game starts
    randGen = new Math.seedrandom(seed);

    maxPlayers = players;
    playerIndex = playerInd;
    nicknames = nicks;
    opponentInds = [];
    invOpponentInds = {};
    curTurn = 0;
    lastTurn = 0;
    turnDirection = 1;
    doingTaki = false;
    plusTwoChain = 0;
    turnIndicators = [];
    cardContainers = [];
    inactivePlayers = {};
    inactiveCount = 0;
    winCount = 0;
    lastWin = 0;
    winPlayers = {};
    disconnectedPlayers = {};
    winString = "";

    myCards.removeChildren();
    opponentContainers.removeChildren();
    placedCards.removeChildren();
    nicknamesContainer.removeChildren();

    blackOverlay.visible = false;
    gameOverContainer.visible = false;

    deck = [];
    for(id in cardIds){
        let card = cardIds[id];
        for(let i=0; i<2; i++) // the deck has two of every card
            addToDeck(card);
    }

    let lastAfter = 0;

    for(let i=0; i < maxPlayers; i++){
        for(let j=0; j < maxPlayerCards; j++){
            let card = deck.pop();
            if(i == playerInd){
                //player's cards generated here
                let cardSprite = newCardSprite(card);
                cardSprite.x = -totalCardsW/2 + cardSpace * j + cardW/2;
                cardSprite.interactive = true;
                cardSprite.buttonMode = true;
                setupMyCard(cardSprite);
                myCards.addChild(cardSprite);
            }
        }
        if(i != playerInd){
            if(i < playerInd){
                //this player is before us
                opponentInds.push(i);
            }else{
                //this player is after us
                opponentInds.splice(lastAfter, 0, i);
                lastAfter++;
            }
        }
    }

    cardContainers[playerInd] = myCards;
    myCards.y = playerInd == 0 ? activeCardsY : 0;

    for(let i=0; i < opponentInds.length; i++){
        let ind = opponentInds[i]; // i is the drawing order, ind is the index of the player we're generating
        invOpponentInds[ind] = i;
        let view = playerViews[maxPlayers][i];
        view.cards.removeChildren();

        view.indicator.tint = ind == 0 ? 0x00ff00 : 0xffffff;
        
        turnIndicators[ind] = view.indicator;

        cardContainers[ind] = view.cards;

        for(let j=0; j < maxPlayerCards; j++){
            let card = new Sprite(backTex);
            card.anchor.set(0.5);
            card.x = -totalCardsW/2 + j*cardSpace + cardW/2;
            view.cards.addChild(card);
        }
        opponentContainers.addChild(view);

        /////

        let name = nicknames[ind];

        let nameContainer = new Container();

        let text = new PText(name, {fontFamily : 'Arial', fontSize: 25, fill : 0, align : 'center'});
        nameContainer.text = text;

        let gfx = new Graphics();
        gfx.beginFill(0xffffff)
        .drawRoundedRect(0, 0, text.width + 10, text.height + 10)
        nameContainer.addChild(gfx);
        nameContainer.gfx = gfx;

        text.x = nameContainer.width/2 - text.width/2;
        text.y = nameContainer.height/2 - text.height/2;
        nameContainer.addChild(text);

        nameContainer.pivot.x = nameContainer.width/2;
        nameContainer.pivot.y = nameContainer.height/2;

        let pos = view.toGlobal({x: 0, y: -cardH/2});
        nameContainer.x = pos.x;
        nameContainer.y = pos.y;
        nameContainer.view = view;

        nicknamesContainer.addChild(nameContainer);
    }

    let tempInd = -1;
    do{
        tempInd++;
        topCard = deck[tempInd];
    }while(topCard.onPlace || topCard.onSelfPlace)
    deck.splice(tempInd, 1)

    let firstCard = newCardSprite(topCard);
    firstCard.card = topCard;
    firstCard.x = screenW/2;
    firstCard.y = screenH/2;
    firstCard.angle = randomAngle();
    placedCards.addChild(firstCard);

    if(playerInd == 0){
		selfTurnIndicator.tint = 0x00ff00;
		colorMyCards();
	}else{
        myCards.children.forEach(card => {
            card.tint = unavailTint;
        })
    }
    turnIndicators[playerInd] = selfTurnIndicator;

    gameContainer.visible = true;

    console.log("game init");
}

function playerTurn(turn){
    let opCards = opponentContainers.children[invOpponentInds[turn.ind]].cards;
    if(turn.type == "placeCard"){
        let card = cardIds[turn.cardId];
        let cardSprite = opCards.children[0];
        let screenPos = {x: cardSprite.x, y: cardSprite.y};
        opCards.toGlobal(screenPos, screenPos);
        cardSprite.x = screenPos.x;
        cardSprite.y = screenPos.y;
        cardSprite.scale.x = opCardScale;
        cardSprite.scale.y = opCardScale;
        cardSprite.angle = opCards.parent.angle;
        cardSprite.card = card;
        addTween(cardSprite, "x", cardSprite.x, screenW/2, cardAnimDuration, easeQuad.InOut);
        addTween(cardSprite, "y", cardSprite.y, screenH/2, cardAnimDuration, easeQuad.InOut);
        addTween(cardSprite.scale, "x", cardSprite.scale.x, 0, cardAnimDuration/2, easeQuad.In)
        .onFinish = function(){
            cardSprite.texture = card.image;
            addTween(cardSprite.scale, "x", cardSprite.scale.x, 1, cardAnimDuration/2, easeQuad.Out)
        };
        addTween(cardSprite.scale, "y", cardSprite.scale.y, 1, cardAnimDuration, easeQuad.InOut);
        addTween(cardSprite, "angle", cardSprite.angle, randomAngle(), cardAnimDuration, easeQuad.InOut);
        opCards.removeChild(cardSprite);
        placedCards.addChild(cardSprite);
        ///
        topCard = card;
        organizeCardPositions(turn.ind);
        if(!turn.anotherTurn)
            doex(card.onPlace);
        
        onCardPlace();

        if(opCards.children.length == 0){
            let name = nicknamesContainer.children[invOpponentInds[turn.ind]];
            name.text.text += "\n(" + ordinals[lastWin] + " place)";
            name.text.x = name.gfx.width/2 - name.text.width/2;
            removePlayer(turn.ind, true);
        }
    }else if(turn.type == "draw"){
        for(let i=0; i < turn.amount; i++){
            deck.pop();
            setTimeout(function(){
                let sprite = new Sprite(backTex);
                sprite.anchor.set(0.5);
                let localPos = opCards.toLocal({x: deckBtn.x,  y: deckBtn.y});
                sprite.x = localPos.x;
                sprite.y = localPos.y;
                sprite.angle = -opCards.parent.angle;
                sprite.scale.x = 1/opCardScale;
                sprite.scale.y = 1/opCardScale;
                addTween(sprite.scale, "x", sprite.scale.x, 1, cardAnimDuration, easeQuad.InOut);
                addTween(sprite.scale, "y", sprite.scale.y, 1, cardAnimDuration, easeQuad.InOut);
                addTween(sprite, "angle", sprite.angle, 0, cardAnimDuration, easeQuad.InOut);
                addTween(sprite, "y", sprite.y, 0, cardAnimDuration, easeQuad.InOut);
                opCards.addChild(sprite);
                organizeCardPositions(turn.ind);
            }, deckDrawDelay*i);
        }
        plusTwoChain = 0;
        if(plusTwoBubble.visible){
            addTween(plusTwoBubble, "alpha", 1, 0, 0.1)
            .onFinish = function(){
                plusTwoBubble.visible = false;
            }
        }
    }else if(turn.type == "colorSelect"){
        setTopColor(turn.color);
    }else if(turn.type == "endTurn"){
        doex(topCard.onPlace);
    }
    
    if(!turn.anotherTurn){
        incrementTurn();
    }
}

function onCardClick(e){
    if(curTurn == playerIndex && cardIsPlaceable(e.target.card)){
        let screenPos = {x: e.target.x, y: e.target.y};
        myCards.toGlobal(screenPos, screenPos);
        let clickedCard = myCards.removeChild(e.target);
        clickedCard.x = screenPos.x;
        clickedCard.y = screenPos.y;
        addTween(clickedCard, "x", clickedCard.x, screenW/2, 0.5, easeQuad.InOut);
        addTween(clickedCard, "y", clickedCard.y, screenH/2, 0.5, easeQuad.InOut);
        addTween(clickedCard, "angle", clickedCard.angle, randomAngle(), 0.5, easeQuad.InOut)
        placedCards.addChild(clickedCard);
        clickedCard.interactive = false;
        clickedCard.buttonMode = false;
        clickedCard.removeAllListeners();
        organizeCardPositions();

        let card = clickedCard.card;
        let anotherTurn = false;
        if(doingTaki){
            for(let i=0; i<myCards.children.length; i++){
                let card = myCards.children[i].card;
                if(cardColorPlaceable(card)){
                    anotherTurn = true;
                    break;
                }
            }
            if(!anotherTurn){
                doingTaki = false;
                topCard = card;
                anotherTurn = endTakiTurn();
                addTween(endTurnBtn, "alpha", 1, 0, 0.1)
                .onFinish = function(){
                    endTurnBtn.visible = false;
                };
            }
        }else{
            doex(card.onPlace);
            anotherTurn = doex(card.onSelfPlace);
            if(!anotherTurn){
                incrementTurn();
            }
        }
		topCard = card;
		
		if(anotherTurn || curTurn == playerIndex){
			setTimeout(colorMyCards, 1);
		}

        onCardPlace();
        
        onTurn({
            ind: playerIndex,
            type: "placeCard",
            cardId: card.id,
            anotherTurn: anotherTurn
        });

        if(myCards.children.length == 0){
            removePlayer(playerIndex, true);
        }
    }
}

function onDeckClick(){
    if(curTurn == playerIndex && !doingTaki){
        let times = plusTwoChain > 0 ? plusTwoChain : 1;
        let pos = myCards.toLocal({x: deckBtn.x, y: deckBtn.y});
        for(let i=0; i<times; i++){
            setTimeout(function(){
                let card = deck.pop();

                let spr = new Sprite(backTex);
                spr.card = card;
                spr.anchor.set(0.5);
                spr.interactive = true;
                spr.buttonMode = true;
                setupMyCard(spr);
                myCards.addChild(spr);
                spr.x = pos.x;
                spr.y = pos.y;

                addTween(spr, "y", spr.y, 0, cardAnimDuration, easeQuad.InOut);
                addTween(spr.scale, "x", spr.scale.x, 0, cardAnimDuration/2, easeQuad.In)
                .onFinish = function(){
					spr.texture = card.image;
					setTimeout(function(){
						addColorTween(spr, "tint", 0xffffff, unavailTint, 0.1);
					}, 500);
                    addTween(spr.scale, "x", spr.scale.x, 1, cardAnimDuration/2, easeQuad.Out)
                };
                organizeCardPositions();
            }, deckDrawDelay * i);
        }
        plusTwoChain = 0;
        if(plusTwoBubble.visible){
            addTween(plusTwoBubble, "alpha", 1, 0, 0.1)
            .onFinish = function(){
                plusTwoBubble.visible = false;
            }
        }
        incrementTurn();
        
        onTurn({
            ind: playerIndex,
            type: "draw",
            amount: times
        });
    }
}

function colorSelectClick(e){
    let anotherTurn = false;
    setTopColor(e.target.color);
    chooseColorExit();
    if(topCard.symbol == "taki"){
        anotherTurn = topCard.onSelfPlace();
    }
    if(!anotherTurn){
        incrementTurn();
    }else{
		colorMyCards();
	}
    onTurn({
        ind: playerIndex,
        type: "colorSelect",
        color: e.target.color,
        anotherTurn: anotherTurn
    });
}

function endTurnBtnClick(){
    let anotherTurn = endTakiTurn();
    addTween(endTurnBtn, "alpha", 1, 0, 0.1)
    .onFinish = function(){
        endTurnBtn.visible = false;
    };
    onTurn({
        ind: playerIndex,
        type: "endTurn",
        anotherTurn: anotherTurn
    });
}

function removePlayer(index, isWin=false){
    if(!inactivePlayers[index]){
        inactivePlayers[index] = true;
        inactiveCount++;
        if(isWin){
            winString += ordinals[lastWin] + ": " + nicknames[index] + (index == playerIndex ? " (you)" : "") + "\n";

            winCount++;
            winPlayers[index] = lastWin;
            lastWin++;

            let indicator = turnIndicators[index];
            addColorTween(indicator, "tint", indicator.tint, winTint, 0.5);

            let parent = indicator.parent;

            let flash = new Sprite(indicatorTex);
            flash.anchor.set(0.5, 1);
            let pos = parent.toGlobal({x: indicator.x, y: indicator.y});
            flash.x = pos.x;
            flash.y = pos.y;
            flash.angle = parent.angle;
            flash.scale.x = parent.scale.x;
            flash.scale.y = parent.scale.y;
            flash.width = indicator.width;
            flash.tint = winTint;
            addTween(flash.scale, "x", flash.scale.x, 1.5, winFlashDuration);
            addTween(flash.scale, "y", flash.scale.y, 1.5, winFlashDuration);
            addTween(flash, "alpha", 1, 0, winFlashDuration)
            .onFinish = function(){
                gameContainer.removeChild(flash);
            }

            gameContainer.addChild(flash);
        }else{
            disconnectedPlayers[index] = true;
        }
        if(inactiveCount >= maxPlayers - 1 && !gameOverContainer.visible){
            /*if(winPlayers[playerIndex] == undefined){
                winPlayers[playerIndex] = lastWin;
                winString += ordinals[lastWin] + ": " + nickname + " (you)\n";
            }*/
            for(let i=0; i<maxPlayers; i++){
                if(winPlayers[i] == undefined && disconnectedPlayers[i] == undefined){
                    winPlayers[i] = lastWin;
                    winString += ordinals[lastWin] + ": " + nicknames[i] + (i == playerIndex ? " (you)" : "") + "\n";
                    break;
                }
            }
            Object.keys(disconnectedPlayers).forEach(index => {
                winString += "---: " + nicknames[index] + "\n";
            });
            setTimeout(gameOverIn, 1000, "Game Over", winCount > 0 ? winString : "All players have disconnected.");
        }else if(index == curTurn && winPlayers[index] == undefined){
            incrementTurn();
        }
    }
}

function onPlayerDisconnect(index){
    let indicator = turnIndicators[index];
    if(winPlayers[index] == undefined)
        addColorTween(indicator, "tint", indicator.tint, 0x999999, 0.2);
    let name = nicknamesContainer.children[invOpponentInds[index]];
    name.text.text += "\n(disconnected)";
    name.text.x = name.gfx.width/2 - name.text.width/2;

    removePlayer(index);
}

function backToMenu(){
    containerOut(gameContainer);
    containerIn(menuContainer);
    socket.emit("exit");
    joinFriendBtn.visible = false;
    quickPlayBtn.visible = true;
    friendPlayBtn.visible = true;
}

function onRightClick(){
	//playerTurn({ind: curTurn, type: aaaa ? "colorSelect" : "placeCard", cardId: "supertaki", color: randInt(0, maxColors, Math.random()), anotherTurn: !aaaa}); // TODO remove this
}

document.body.appendChild(app.view);
