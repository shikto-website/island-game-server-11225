exports.DataPreset = {
    PlayerData: class {
        constructor({tag, name}){
            this.tag = tag || "#",
            this.name = name || "PLAYER"
        }
    },

    GameData: class {
        constructor({seed, lootSeed, mapSize}){
            this.seed = seed || 0
            this.lootSeed = lootSeed || 0
            this.mapSize = mapSize || 10
        }
    },
    
    GameRoom: class {
        constructor({tag, name, playerState, playerData, entityData}){
            this.tag = tag || "#"
            this.name = name || ""
            this.playerState = playerState || {}
            this.playerData = playerDataplayerData || {}
            this.entityData = entityData || {}
        }
    },

    LobbyRoom: class {
        constructor({tag, name, gameData, players}){
            this.tag = tag || "#"
            this.name = name || ""
            this.players = players || {}
        }

        AddPlayer(playerData){
            this.players[playerData.tag] = playerData;
        }

        RemovePlayer(playerTag){
            delete this.players[playerTag]
        }
    }
}