var fs = require("fs");
var config = require("./config.js").configurationData;

exports.PlayerExists = (tag)=>{
    if(tag != ""){
        return fs.existsSync(this.PathToPlayerData(tag))
    }
}

exports.PlayerData = (tag)=>{
    if(this.PlayerExists(tag)){
        return JSON.parse(fs.readFileSync(this.PathToPlayerData(tag), "utf8"));
    }else{
        return this.DefaultPlayerData()
    }
}

exports.DefaultPlayerData = ()=>{
    return config.playerDataTemplate;
}

exports.SetPlayerData = (tag, data)=>{
    var nPlayerData = {};
    var playerData = {};
    if(this.PlayerExists(tag)){
        playerData = this.PlayerData(tag);
    }else{
        playerData = this.DefaultPlayerData();
    }
    nPlayerData = {...playerData, ...data};
    console.log("__PLAYER TAG: " + tag);
    fs.writeFileSync(this.PathToPlayerData(tag), JSON.stringify(nPlayerData))
    return nPlayerData;
}

exports.NewTag = ()=>{
    var newTag = this.BuildTag();
    for(i=0; i<9999999; i++){
        if(this.PlayerExists(newTag)){
            continue;
        }else{
            break;
        }
    }
    console.log("new tag: " + newTag);
    return newTag;
}

exports.BuildTag = ()=>{
    var chars = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    var result = "";
    for(i=0;i<config.playerTagLength;i++){
        var index =  Math.random() * 25;
        result += chars[parseInt(index)]
    }
    return result;
}

exports.PathToPlayerData = (tag)=>{
    return config.playerDataPath + tag + ".json"
}