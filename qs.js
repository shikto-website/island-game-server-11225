var functions = {};
var users = {};

exports.On = (triggerName, callBack)=> {
    functions[triggerName] = callBack;
}

exports.CheckMessage = (message, ws)=>{
    var msgJSON = JSON.parse(message);
    console.log("CHECK: " + message);
    var head = msgJSON.head;
    var body = msgJSON.body;
    if(functions[head]){
        functions[head](body, {
            Send:(head, data)=>{
                this.Send(head, data, ws)
            }
        });
        console.log("CALLED: " + head + " : " + body);
    }
}

exports.Send = (h, b, recepient)=>{
    var dataPack = {
        head: h,
        body: (typeof b == "object") ? JSON.stringify(b) : (b + "")
    }
    recepient.send(JSON.stringify(dataPack));
    console.log("SEND: " + h + " : " + JSON.stringify(dataPack));
}

exports.SendToUser = (tag, head, body)=>{
    if(users[tag]){
        users[tag].Send(head, body);
    }    
}

exports.SetUser = (tag, handle)=>{
    users[tag] = handle;
}

exports.RemoveUser = (tag)=>{
    if(users[tag]){
        users[tag] = undefined;
    }
}