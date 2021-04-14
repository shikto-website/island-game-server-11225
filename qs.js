var functions = {};
var users = {};
var userID = {};

exports.On = (triggerName, callBack)=> {
    functions[triggerName] = callBack;
}

exports.CheckMessage = async (message, ws, userID)=>{
    var msgJSON = JSON.parse(message);
    console.log("CHECK: " + message);
    var head = msgJSON.head;
    var body = msgJSON.body;
    if(functions[head]){
        functions[head](body, {
            Send: async (head, data)=>{
                this.Send(head, data, ws)
            },
            userID: userID
        });
        console.log("CALLED: " + head + " : " + body);
    }
}

exports.Send = async (h, b, recepient)=>{
    var dataPack = {
        head: h,
        body: (typeof b == "object") ? JSON.stringify(b) : (b + "")
    }
    recepient.send(JSON.stringify(dataPack));
    console.log("SEND: " + h + " : " + JSON.stringify(dataPack));
}

exports.SendToUser = async (tag, head, body)=>{
    if(users[tag]){
        users[tag].Send(head, body);
    }    
}

exports.SetUser = async (tag, handle)=>{
    users[tag] = handle;
}

exports.GetUserTag = (handle)=>{
    for(i in users){
        if(handle.userID == users[i].userID){
            return i;
        }
    }
}

exports.RemoveUser = (tag)=>{
    if(users[tag]){
        users[tag] = undefined;
    }
}

exports.NewID = ()=>{
    return Date.now() + (Math.random() * 100000000)
}

exports.EvaluateOn = (head, body, user)=>{
    var func = functions[head]
    if(func){
        func(body, user)
    }
}
