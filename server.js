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
        var doingType = PLAYERDOING[playerTag].type;
        if(doingType == "lobby"){            
            qs.EvaluateOn("quitLobbyRoom", PLAYERDOING[playerTag].data + "," + playerTag, user)
        }else if(doingType == "game"){
            
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
    var data = JSON.stringify(Player.PlayerData(data));
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

qs.On("quitLobbyRoom", async(data, user)=>{
    var bData = data.split(",")
    var roomTag = bData[0]
    var playerTag = bData[1]
    var ROOM = LOBBYROOMS[roomTag]
    console.log(JSON.stringify(ROOM));
    if(ROOM.players[playerTag] && Object.keys(ROOM.players).length == 1){
        delete LOBBYROOMS[roomTag];
        return;
    }

    if(ROOM.players[playerTag].host == true){
        for(i in ROOM.players){
            if(i != playerTag){
                ROOM.players[i].host = true;
                qs.SendToUser(i, "beHost", "");
                break;
            }
        }
    }

    for(i in ROOM.players){
        qs.SendToUser(i, "notification", ROOM.players[playerTag].name + " has quit the room")
    }

    ROOM.RemovePlayer(playerTag)
    SendLobbyPlayersData(ROOM);
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
        
        for(i in ROOM.players){
            qs.SendToUser(i, "notification", Player.PlayerData(playerTag).name + "has Joined the room")
        }
        
        SendLobbyPlayersData(ROOM);    
    }else{
        user.Send("notification", "That room doesn't exist");
    }
})

qs.On("createLobbyRoom", (playerTag, user)=>{
    LOBBYROOMS[playerTag] = new DataPreset.LobbyRoom({
        tag: playerTag,
        name: Player.PlayerData(playerTag).name
    })
    LOBBYROOMS[playerTag].AddPlayer({
        tag: playerTag,
        name: Player.PlayerData(playerTag).name,
        host: true
    });
    user.Send("joinLobbyRoom", LOBBYROOMS[playerTag].tag + "," + LOBBYROOMS[playerTag].name);
    PLAYERDOING[playerTag] = {
        type: "lobby",
        data: playerTag
    }
    SendLobbyPlayersData(LOBBYROOMS[playerTag]);    
    user.Send("beHost", "");
})

qs.On("startGame", (data, user)=>{
    var bData = data.split(",")
    var roomTag = bData[0]
    var seed = bData[1]
    var size = bData[2]
    var ROOM = LOBBYROOMS[roomTag]
    if(ROOM){
        for(i in ROOM.players){
            PLAYERDOING[i] = {
                type: "game",
                data: roomTag
            }
            qs.SendToUser(i, "startGame", seed + "," + size)
        }
    }
    delete ROOM;
})

qs.On("updateCharacterData", (data, user)=>{
    var bData = data.split(",");
    var tag = bData[0];
    GAMEROOMS[tag] = data;
    var result = "";
    for(i in GAMEROOMS){
        if(i != tag){
            result += GAMEROOMS[i] + ";";
        }
    }
    user.Send("playerStateSync", result);
})

//---------------------------------------------
function SendLobbyPlayersData(ROOM) {
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
