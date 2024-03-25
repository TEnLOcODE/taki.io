//also responsible for socket and menus, called it "main" cause it's like the love2d version

let socket;

const maxNameLength = 16;

let friendUrl;

let joinId;

let waitingTextStyle = {fontFamily : 'Arial', fontSize: 50, fill : 0, align : 'center'};

let nickname = getCookie("nickname");

let menuContainer = new Container();
menuContainer.x = screenW/2;

const logoInDuration = 1.5;

let background;

let logo = new Sprite();
logo.y = 200;

let nameInput = new PIXI.TextInput({
    input: {
        fontSize: '36px',
        padding: '12px',
        width: '500px',
        color: '#26272E'
    },
    box: {
        default: {fill: 0xE8E9F3, rounded: 12, stroke: {color: 0xCBCEE0, width: 3}},
        focused: {fill: 0xE1E3EE, rounded: 12, stroke: {color: 0xABAFC6, width: 3}},
        disabled: {fill: 0xDBDBDB, rounded: 12}
    }
})

nameInput.placeholder = 'Enter your name'
nameInput.dy = 400;
nameInput.y = nameInput.dy;
nameInput.pivot.x = nameInput.width/2;
nameInput.pivot.y = nameInput.height/2;
nameInput.text = nickname;
menuContainer.addChild(nameInput);

let pInput = nameInput.text;

nameInput.addListener("input", function(e){
    if(e.length > maxNameLength){
        nameInput.text = pInput;
    }
    pInput = nameInput.text;
})

function nameFunc(){
    if(nameInput.text.length > 0){
        nickname = nameInput.text;
        socket.emit("nickname", nickname);
        setCookie("nickname", nickname, 60);
        return true;
    }else{
        addTween(nameInput, "y", nameInput.dy, nameInput.dy - 20, 0.1, easeQuad.Out)
        .onFinish = function(){
            addTween(nameInput, "y", nameInput.y, nameInput.dy, 0.1, easeQuad.In)
        }
    }
}

let menuBtnW = 300;
let menuBtnH = 200;
let menuBtnMargin = 20;
let menuBtnRound = 20;

let quickPlayBtn = new Container();
quickPlayBtn.interactive = true;
quickPlayBtn.buttonMode = true;
{
    let text = new PIXI.Text("Quick Play", {fontFamily : 'Arial', fontSize: 35, fill : 0, align : 'center', wordWrap: true, wordWrapWidth: menuBtnW})

    let gfx = new PIXI.Graphics();
    gfx.beginFill(0xB5FAFF)
    .drawRoundedRect(0, 0, menuBtnW, menuBtnH, menuBtnRound)
    .endFill();

    quickPlayBtn.addChild(gfx);

    text.x = quickPlayBtn.width/2 - text.width/2;
    text.y = quickPlayBtn.height/2 - text.height/2;

    quickPlayBtn.addChild(text);

    quickPlayBtn.gfx = gfx;
    quickPlayBtn.text = text;
}
quickPlayBtn.x = - quickPlayBtn.width - menuBtnMargin;
quickPlayBtn.y = nameInput.y + nameInput.height + 20;
quickPlayBtn.addClickListener(quickPlayClick);
menuContainer.addChild(quickPlayBtn);

let friendPlayBtn = new Container();
friendPlayBtn.interactive = true;
friendPlayBtn.buttonMode = true;
{
    let text = new PIXI.Text("Create Private Room", {fontFamily : 'Arial', fontSize: 35, fill : 0, align : 'center', wordWrap: true, wordWrapWidth: menuBtnW})

    let gfx = new PIXI.Graphics();
    gfx.beginFill(0xB57CFF)
    .drawRoundedRect(0, 0, menuBtnW, menuBtnH, menuBtnRound)
    .endFill();

    friendPlayBtn.addChild(gfx);

    text.x = friendPlayBtn.width/2 - text.width/2;
    text.y = friendPlayBtn.height/2 - text.height/2;

    friendPlayBtn.addChild(text);

    friendPlayBtn.gfx = gfx;
    friendPlayBtn.text = text;
}
friendPlayBtn.x = menuBtnMargin;
friendPlayBtn.y = quickPlayBtn.y;
friendPlayBtn.addClickListener(friendPlayClick);
menuContainer.addChild(friendPlayBtn);

let joinFriendBtn = new Container();
joinFriendBtn.interactive = true;
joinFriendBtn.buttonMode = true;
{
    let text = new PIXI.Text("Join Game", {fontFamily : 'Arial', fontSize: 35, fill : 0, align : 'center'})

    let gfx = new PIXI.Graphics();
    gfx.beginFill(0xB57CFF)
    .drawRoundedRect(0, 0, menuBtnW, menuBtnH, menuBtnRound)
    .endFill();

    joinFriendBtn.addChild(gfx);

    text.x = joinFriendBtn.width/2 - text.width/2;
    text.y = joinFriendBtn.height/2 - text.height/2;

    joinFriendBtn.addChild(text);

    joinFriendBtn.gfx = gfx;
    joinFriendBtn.text = text;
}
joinFriendBtn.x = -joinFriendBtn.width/2;
joinFriendBtn.y = quickPlayBtn.y;
joinFriendBtn.visible = false;
joinFriendBtn.addClickListener(friendJoinClick);
menuContainer.addChild(joinFriendBtn);

let quickWaitingContainer = new Container();
quickWaitingContainer.x = screenW/2;
quickWaitingContainer.visible = false;

{
    let waitingText = new PText("Waiting for players...", waitingTextStyle);
    waitingText.x = -waitingText.width/2;
    waitingText.y = 200;
    quickWaitingContainer.addChild(waitingText);
}

let friendWaitingContainer = new Container();
friendWaitingContainer.x = screenW/2;
friendWaitingContainer.visible = false;

let frwaitingText = new PText("Share this link with your friends:", waitingTextStyle);
frwaitingText.x = -frwaitingText.width/2;
frwaitingText.y = 100;

friendWaitingContainer.addChild(frwaitingText);

let urlText = new PIXI.TextInput({
    input: {
    fontSize: (waitingTextStyle.fontSize - 5) + "px",
    padding: '5px',
    width: '500px',
    color: 'black'
    },
    box: {fill: 0xffffff, stroke: {color: 0, width: 2}}
});
urlText.x = -urlText.width/2;
urlText.y = frwaitingText.y + frwaitingText.height + 20;
urlText.visible = false;
//urlText.disabled = true;
urlText.addListener("input", () => {urlText.text = friendUrl});

friendWaitingContainer.addChild(urlText);

let copyBtn = new Container();
{
    let text = new PText("Copy", {fontFamily : 'Arial', fontSize: waitingTextStyle.fontSize - 10, fill : 0, align : 'center'});

    let gfx = new Graphics();
    gfx.beginFill(0x54FFBA)
    .drawRoundedRect(0, 0, text.width + 20, text.height + 20, 10)
    .endFill();

    copyBtn.addChild(gfx);

    text.x = gfx.width/2 - text.width/2;
    text.y = gfx.height/2 - text.height/2;

    copyBtn.addChild(text);
}
copyBtn.x = urlText.x + urlText.width + 10;
copyBtn.y = urlText.y + urlText.height/2 - copyBtn.height/2;
copyBtn.interactive = true;
copyBtn.buttonMode = true;
copyBtn.visible = false;
copyBtn.addClickListener(() => {copyToClipboard(friendUrl)})

friendWaitingContainer.addChild(copyBtn);

let playerIconContainer = new Container();
{
    let text = new PText("Players:", waitingTextStyle);
    text.x = -text.width/2;
    text.y = urlText.y + urlText.height + 30;

    friendWaitingContainer.addChild(text);

    playerIconContainer.y = text.y + text.height + 20;
}

let playerIconSize = 200;

friendWaitingContainer.addChild(playerIconContainer);

let playerIconGfx = new Graphics();
playerIconGfx.beginFill(0xffffff)
.drawRoundedRect(0, 0, playerIconSize, playerIconSize, 10)
.endFill()
let playerIconGeometry = playerIconGfx.geometry;

let roomPlayers = [];

let disabledAlpha = 0.5;

let friendStartBtn = new Container();
{
    let text = new PText("Start Game", {fontFamily : 'Arial', fontSize: waitingTextStyle.fontSize - 10, fill : 0, align : 'center'});

    let gfx = new Graphics();
    gfx.beginFill(0x54DD27)
    .drawRoundedRect(0, 0, text.width + 20, text.height + 60, 20)
    .endFill();

    friendStartBtn.addChild(gfx);

    text.x = gfx.width/2 - text.width/2;
    text.y = gfx.height/2 - text.height/2;

    friendStartBtn.addChild(text);
}
friendStartBtn.x = -friendStartBtn.width/2;
friendStartBtn.y = playerIconContainer.y + playerIconGfx.height + 50;
friendStartBtn.interactive = true;
friendStartBtn.buttonMode = true;
friendStartBtn.visible = false;
friendStartBtn.addClickListener(() => {
    if(friendStartBtn.alpha == 1){
        socket.emit("startGame");
        containerOut(friendWaitingContainer);
        friendStartBtn.alpha = disabledAlpha;
    }
});

friendWaitingContainer.addChild(friendStartBtn);

function onTurn(data){
    socket.emit("playerTurn", data);
}

function containerIn(container, fy=200){
    container.visible = true;
    addTween(container, "y", fy, 0, logoInDuration, easeQuad.Out);
    addTween(container, "alpha", 0, 1, logoInDuration, easeQuad.Out);
}
function containerOut(container, ty=-200){
    addTween(container, "y", 0, ty, logoInDuration/2, easeQuad.In);
    addTween(container, "alpha", 1, 0, logoInDuration/2, easeQuad.In)
    .onFinish = function(){
        container.visible = false;
    }
}

function quickPlayClick(){
    if(nameFunc()){
        containerOut(menuContainer);
        containerIn(quickWaitingContainer);
        socket.emit("quickGame");
    }
}
function friendPlayClick(){
    if(nameFunc()){
        containerOut(menuContainer);
        containerIn(friendWaitingContainer);
        socket.emit("friendGame");
        urlText.visible = false;
        copyBtn.visible = false;
        friendStartBtn.visible = true;
        friendStartBtn.alpha = disabledAlpha;
    }
}

function friendJoinClick(){
    if(nameFunc()){
        containerOut(menuContainer);
        socket.emit("joinRoom", joinId);
        joinFriendBtn.visible = false;
    }
}

let playerIconStyle = {fontFamily : 'Arial', fontSize: 40, fill : 0, align: "center"};

let playerIconMargin = 10;

function newPlayerIcon(name){
    let playerIcon = new Container();
    let gfx = new Graphics(playerIconGeometry);
    playerIcon.addChild(gfx);
    let text = new PText(name, playerIconStyle)
    text.x = playerIcon.width/2 - text.width/2;
    text.y = playerIcon.height/2 - text.height/2;
    playerIcon.addChild(text);
    return playerIcon;
}

function backToMenu(){
    containerOut(gameContainer);
    containerIn(menuContainer);
    socket.emit("exit");
    joinFriendBtn.visible = false;
    quickPlayBtn.visible = true;
    friendPlayBtn.visible = true;
}

function setup(){
    background = new Sprite(Texture.from(bgCanvas));
    app.stage.addChild(background);

    logo.texture = loader.resources["image/logo.png"].texture;
    logo.anchor.set(0.5);

    menuContainer.addChild(logo);

    app.stage.addChild(menuContainer);

    app.stage.addChild(quickWaitingContainer);

    app.stage.addChild(friendWaitingContainer);

    containerIn(menuContainer, -200);

    if(location.search[0] == "?"){
        quickPlayBtn.visible = false;
        friendPlayBtn.visible = false;
        joinFriendBtn.visible = true;
        joinId = location.search.substr(1);
    }

    gameSetup();
}

$(document).ready(function () {
    socket = io();

    socket.on("gameStart", info => {
        initGame(info.seed, info.players, info.index, info.nicknames);
        containerOut(friendWaitingContainer.visible ? friendWaitingContainer : quickWaitingContainer);
        containerIn(gameContainer);
    });

    socket.on("turn", data => {
        playerTurn(data);
    });

    socket.on("roomId", id => {
        friendUrl = location.host + "/?" + id;
        if(!friendUrl.startsWith("http://")){
            friendUrl = "http://" + friendUrl;
        }
        urlText.visible = true;
        urlText.text = friendUrl;
        copyBtn.visible = true;

        playerIconContainer.removeChildren();

        let playerIcon = newPlayerIcon(nickname + "\n(you)");
        
        playerIconContainer.addChild(playerIcon);
        playerIconContainer.x = -playerIconContainer.width/2;
        
        roomPlayers = [nickname];

        playerIndex = 0;
    });

    socket.on("join", nicks => {
        roomPlayers = nicks;
        roomPlayers.push(nickname);
        playerIndex = roomPlayers.length - 1;
        playerIconContainer.removeChildren();
        for(let i=0; i<roomPlayers.length; i++){
            let playerIcon = newPlayerIcon(roomPlayers[i] + (i == playerIndex ? "\n(you)" : ""));
            playerIcon.x = i * (playerIconSize + playerIconMargin);
            playerIconContainer.addChild(playerIcon);
        }
        playerIconContainer.x = -playerIconContainer.width/2;
        containerIn(friendWaitingContainer);
        urlText.text = location.href;
        urlText.visible = true;
        copyBtn.visible = true;
    });

    socket.on("playerJoin", name => {
        roomPlayers.push(name);

        let playerIcon = newPlayerIcon(name);
        playerIcon.x = (roomPlayers.length - 1) * (playerIconSize + playerIconMargin);

        playerIconContainer.addChild(playerIcon);
        playerIconContainer.x = -playerIconContainer.width/2;

        if(playerIndex == 0){
            friendStartBtn.alpha = 1;
        }
    });

    socket.on("playerDisconnect", index => {
        if(gameContainer.visible){
            onPlayerDisconnect(index);
        }else if(friendWaitingContainer.visible){
            roomPlayers.splice(index, 1);
            playerIconContainer.removeChildAt(index);
            for(let i=index; i<roomPlayers.length; i++){
                playerIconContainer.children[i].x = i * (playerIconSize + playerIconMargin);
            }
            playerIconContainer.x = -playerIconContainer.width/2;
            if(playerIndex > index){
                playerIndex--;
            }
            if(playerIndex == 0){
                friendStartBtn.visible = true;
                friendStartBtn.alpha = roomPlayers.length <= 1 ? disabledAlpha : 1;
            }
        }
    });

    socket.on("joinFail", reason => {
        
    });

    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);

    app.renderer.view.setAttribute("oncontextmenu", "onRightClick(); return false;")

    loader.add("image/logo.png")
    .load(setup);

    nameInput.focus();
});
