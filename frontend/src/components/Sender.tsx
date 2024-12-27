import { useEffect, useState } from "react"

export default function Sender (){
    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [isConnecting,setIsConnecting] = useState(false);
    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");
        socket.onopen = () =>{
            socket?.send(JSON.stringify({type : 'createSession'}));
        }
        setSocket(socket);
    },[])

   async function startSendingFile () {
    // add socket null handling must!
    if(!socket) return;
    setIsConnecting(true);
    socket.onmessage = (event) =>{
        const message = JSON.parse(event.data);
        let sessionId; 
        if (message.type === 'sessionCreated'){
            sessionId = message.sessionId;
        }else if(message.type === 'createAnswer'){
            pc.setRemoteDescription(message.sdp);
        }
        console.log("session ID to share to user : ",sessionId);
    }

    // after this let's create a webrtc peer connection

    const pc = new RTCPeerConnection();
    
    pc.onnegotiationneeded = async () =>{
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.send(JSON.stringify({type : 'createOffer',sdp : pc.localDescription}))
    }
    

    




   }   

   
    
        
    

    return <div>
        hi i am sender.
        <br />
        <button onClick={startSendingFile}>Start Sending File.</button>
 
    </div>
}