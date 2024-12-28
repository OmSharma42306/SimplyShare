import { WebSocketServer,WebSocket } from "ws";

const wss = new WebSocketServer({port:8080});

let senderSocket : null | WebSocket = null;
let receiverSocket : null | WebSocket = null;
const sessions = new Map<string,{sender : WebSocket | null , receiver: WebSocket | null}>();
wss.on('connection',function connect(ws){
    ws.on('error',console.error);

    ws.on('message',function message(data:any){
        const message = JSON.parse(data);
        if(message.type === 'createSession'){
            const sessionId = generateUniqueId();
            sessions.set(sessionId,{sender:ws,receiver:null});
            console.log("session Created !",sessionId);
            ws.send(JSON.stringify({type : 'sessionCreated',sessionId}));
        }else if(message.type === 'joinSession'){
            const sessionId = message.sessionId;
            const session = sessions.get(sessionId);
            if(session){
                session.receiver = ws;
                console.log("Receiver Joined!",session);
                session.sender?.send(JSON.stringify({type:'sessionJoined'}));
            }else{
                ws.send(JSON.stringify({type : 'Error',message : "Session ID Is Wrong!"}));
            }
        // }else if(message.type === 'createOffer'){
        //     // if (ws != senderSocket){
        //     //     return ;
        //     // }

        //     sessions?.send(JSON.stringify({type:'createOffer',sdp:message.sdp}));
        // }else if(message.type === 'createAnswer'){
        //     if (ws != receiverSocket){
        //         return ;
        //     }
        //     senderSocket?.send(JSON.stringify({type:'createAnswer',sdp:message.sdp}));
        // }else if(message.type === 'iceCandidate'){
        //     if (ws === senderSocket){
        //         receiverSocket?.send(JSON.stringify({type:'iceCandidate',candidate:message.candidate}));
        //     }else if(ws === receiverSocket){
        //         senderSocket?.send(JSON.stringify({type : 'iceCandidate',candidate:message.candidate}));
        //     }

        }else if(message.type === 'createOffer'){
            const session = getSessionBySocket(ws);
            if(session?.receiver){
                session.receiver.send(JSON.stringify({type:'createOffer',sdp:message.sdp}))
            }
        }else if(message.type === 'createAnswer'){
            const session = getSessionBySocket(ws);
            if(session?.sender){
                session.sender.send(JSON.stringify({type:'createAnswer',sdp:message.sdp}))
            }
        }else if(message.type === 'iceCandidate'){
            const session = getSessionBySocket(ws);
            if(ws === session?.sender){
                session.receiver?.send(JSON.stringify({type:'iceCandidate',candidate:message.candidate}))
            }else if(ws === session?.receiver){
                session.sender?.send(JSON.stringify({type:'iceCandidate',candidate:message.candidate}));
             }
        }else if(message.type === 'error'){
            ws.send(JSON.stringify({type:'error',msg:"Error"}))
        }



    });
    ws.send("Web Socket Working!");

})

function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}

function getSessionBySocket(ws : WebSocket){
    for (const [sessionId,session] of sessions.entries()){
        if(session.sender === ws || session.receiver === ws){
            return session;
        }
    }
    return null;
}