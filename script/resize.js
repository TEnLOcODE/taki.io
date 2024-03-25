let scale = 1;

let objPositions = [
	{
		obj: myCardsParent,
		x: (w, h) => w/2,
		y: (w, h) => h - cardH/4
	},
	{
		obj: csText,
		x: (w, h) => w / 2 - csText.width / 2
	},
	{
		obj: csBtnContainer,
		x: (w, h) => w/2,
		y: (w, h) => h/2
	},
	{
		obj: endTurnBtn,
		x: (w, h) => w/2 - endTurnBtn.width/2,
		y: (w, h) => h - cardH - endTurnBtn.height
	},
	{
		obj: plusTwoBubble,
		x: (w, h) => w/2 + cardW/2 + 20,
		y: (w, h) => h/2 - cardH/2
	},
	{
		obj: opCardsLeft,
		y: (w, h) =>  h/2,
	},
	{
		obj: opCardsRight,
		x: (w, h) => w,
		y: (w, h) => h/2
	},
	{
		obj: opCardsUp,
		x: (w, h) => w/2
	},
	{
		obj: directionArrows,
		x: (w, h) => w/2,
		y: (w, h) => h/2
	},
	{
		obj: deckBtn,
		x: (w, h) => w/2 + cardW * 2,
		y: (w, h) => h/2
	},
	{
		obj: selfTurnIndicator,
		x: (w, h) => w/2,
		y: (w, h) => h
	},
	{
		obj: gameOverContainer,
		x: (w, h) => w/2,
		y: (w, h) => h/2
	},


	{
		obj: menuContainer,
		x: (w, h) => w/2
	},
	{
		obj: quickWaitingContainer,
		x: (w, h) => w/2
	},
	{
		obj: friendWaitingContainer,
		x: (w, h) => w/2
	}
];

function onResize(e){
	screenW = window.innerWidth / scale;
	screenH = window.innerHeight / scale;

	app.stage.scale.x = scale;
	app.stage.scale.y = scale;

	app.renderer.resize(window.innerWidth, window.innerHeight);

	objPositions.forEach(thing => {
		if(thing.x)
			thing.obj.x = thing.x(screenW, screenH);
		if(thing.y)
			thing.obj.y = thing.y(screenW, screenH);
	});

	bgCanvas.width = screenW;
	bgCanvas.height = screenH;
	paintCanvas(bgCanvas);
	background.texture = Texture.from(bgCanvas);
	background.width = screenW;
	background.height = screenH;

	blackOverlay.width = screenW;
	blackOverlay.height = screenH;

	placedCards.children.forEach(spr => {
		spr.x = screenW/2;
		spr.y = screenH/2;
	});

	nicknamesContainer.children.forEach(spr => {
		let pos = spr.view.toGlobal({x: 0, y: -cardH/2});
		spr.x = pos.x / scale;
		spr.y = pos.y / scale;
	});
}

window.addEventListener("resize", onResize);