var qs = require("./qs.js");
var player = require("./player.js");
var config = require("./config.js").configurationData;
var fs = require("fs");
const WebSocket = require("ws");
const wss = new WebSocket.Server({port:3000}, ()=>{
    console.log("server started")
})

wss.on("connection", (ws)=>{
    console.log("new connection")
    ws.on("message", (data)=>{
        qs.CheckMessage(data, ws);
    })
})

wss.on("listening", ()=>{
    console.log("listening at port 3000")
})

//setInterval(SendGlobalRoomData, 30);

//-------------------------------------------
var GLOBAL_ROOM = {};

var GlobalIslandData = {
    seed: parseInt(Math.random() * 9999999),
    islandSize: 10
}

qs.On("login", (tag, user)=>{
    if(player.PlayerExists(tag)){
        qs.SetUser(tag, user)
        user.Send("login", player.PlayerData(tag))
    }else{
        user.Send("getPlayerName", player.NewTag())
    }
})

qs.On("setPlayerName", (data, user)=>{
    const {tag, newName} = JSON.parse(data)
    //console.log(tag)
    var playerData = player.SetPlayerData(tag, {
        tag: tag + "",
        name: newName + ""
    })
    qs.SetUser(tag, user)
    user.Send("login", playerData)
})

qs.On("getGlobalIslandData", (data, user)=>{
    user.Send("globalIslandData", GlobalIslandData)
})

qs.On("joinGlobal", (tag, user)=>{
    GLOBAL_ROOM[tag] = {
        tag: tag + "",

        positionX: 0.00,
        positionY: 200.00,
        positionZ: 0.00,

        rotationX: 0.00,
        rotationY: 0.00,
        rotationZ: 0.00,

        animation: 0
    }
})

qs.On("updateCharacterData", (data, user)=>{
    const {tag, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, animation} = JSON.parse(data);
    GLOBAL_ROOM[tag] = {
        tag: tag + "",
        positionX: positionX,
        positionY: positionY,
        positionZ: positionZ,
        rotationX: rotationX,
        rotationY: rotationY,
        rotationZ: rotationZ,
        animation: animation
    }
    //SendGlobalRoomData()
    for(i in GLOBAL_ROOM){
        if(i != tag){
            qs.SendToUser(i, "globalRoomSync", GLOBAL_ROOM[tag]);
        }        
    }
})

function SendGlobalRoomData() {
    for(i in GLOBAL_ROOM){
        for(j in GLOBAL_ROOM){
            if(i != j){
                qs.SendToUser(i, "globalRoomSync", GLOBAL_ROOM[j]);
            }            
        }
    }
}
//fs.writeFileSync(player.PathToPlayerData("SSSS"), "kjsakjdsakjl")