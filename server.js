var qs = require("./qs.js");
var Player = require("./player.js");
var Config = require("./config.js").configurationData;
var DataPreset = require("./data-preset.js").DataPreset;
const WebSocket = require("ws");
const wss = new WebSocket.Server({port:3000}, ()=>{
    console.log("server started")
})

wss.on("connection", (ws)=>{
    console.log("new connection")
    var userID = qs.NewID()
    ws.on("message", (data)=>{
        qs.CheckMessage(data, ws, userID);
    })
    ws.on("close", (ws)=>{
        qs.CheckMessage(JSON.stringify({
            head: "disconnect",
            body: ""
        }), ws, userID);
    })
})



wss.on("listening", ()=>{
    console.log("listening at port 3000")
})

//-------------------------------------------
var LOBBYROOMS = {};
var GAMEROOMS = {};
var PLAYERDOING = {};

qs.On("disconnect", (data, user)=>{
    var playerTag = qs.GetUserTag(user)
    console.log(playerTag);
    if(PLAYERDOING[playerTag]){
        if(PLAYERDOING[playerTag].type == "lobby"){
            LOBBYROOMS[PLAYERDOING[playerTag].data].RemovePlayer(playerTag);
            SendLobbyData(LOBBYROOMS[PLAYERDOING[playerTag].data]);
        }
    }
})

qs.On("login", (tag, user)=>{
    if(Player.PlayerExists(tag)){
        qs.SetUser(tag, user)
        user.Send("login", Player.PlayerData(tag))
    }else{
        user.Send("getPlayerName", Player.NewTag())
    }
})

qs.On("setPlayerName", (data, user)=>{
    const {tag, newName} = JSON.parse(data)
    var playerData = Player.SetPlayerData(tag, {
        tag: tag + "",
        name: newName + ""
    })
    qs.SetUser(tag, user)
    user.Send("login", playerData)
})

qs.On("playerData", async (data, user)=>{
    var data = JSON.stringify(player.PlayerData(data));
    user.Send("playerData", data);
})

qs.On("lobbyList", async(data, user)=>{
    var lobbyList = "";
    for(i in LOBBYROOMS){
        lobbyList += JSON.stringify({
            tag: i,
            name: LOBBYROOMS[i].name,
            playerCount: Object.keys(LOBBYROOMS[i].players).length
        }) + ";";
    }
    user.Send("lobbyList", lobbyList);
})

qs.On("joinLobbyRoom", (data, user)=>{
    var bData = data.split(",")
    var roomTag = bData[0]
    var playerTag = bData[1]
    var ROOM = LOBBYROOMS[roomTag]
    if(ROOM){
        ROOM.AddPlayer({
            tag: playerTag,
            name: Player.PlayerData(playerTag).name,
            host: false
        })

        PLAYERDOING[playerTag] = {
            type: "lobby",
            data: roomTag
        }
        user.Send("joinLobbyRoom", ROOM.tag + "," + ROOM.name);  
        SendLobbyData(ROOM);    
    }else{
        user.Send("noRoom", roomTag);
    }
})

function SendLobbyData(ROOM) {
    var playersDataRaw = "";
    for(i in ROOM.players){
        if(ROOM.players[i] != null){
            playersDataRaw += JSON.stringify(ROOM.players[i]) + ";";
        }
    }
    for(i in ROOM.players){
        qs.SendToUser(i, "lobbyRoomPlayersSync", playersDataRaw)
    } 
}

LOBBYROOMS.tag1 = new DataPreset.LobbyRoom({});
LOBBYROOMS.tag1.name = "SS"
LOBBYROOMS.tag2 = new DataPreset.LobbyRoom({});
LOBBYROOMS.tag2.name = "HH"
LOBBYROOMS.tag3 = new DataPreset.LobbyRoom({});
LOBBYROOMS.tag3.name = "RR"