import { useEffect, useState } from "react"

export default function Receiver(){
    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [isConnecting,setIsConnecting] = useState(false);
    const [sessionId,setSessionId] = useState<string>("");
    useEffect(()=>{
        const socket = new WebSocket ("ws://localhost:8080")
        if(sessionId){
            socket.onopen = () =>{
                socket.send(JSON.stringify({type:'joinSession',sessionId}))
            }
        }
        
        setSocket(socket);

    },[sessionId])
     function joinSession(){
        if(!socket) return;
        setIsConnecting(true);
        socket.onopen = () =>{
            socket.send(JSON.stringify({type:'joinSession',sessionId}));
        }   

        const pc = new RTCPeerConnection();    
        socket.onmessage = async (event) =>{
            const message = JSON.parse(event.data);
            if(message.type === 'createOffer'){
                try{
                    await pc.setRemoteDescription(message.sdp);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.send(JSON.stringify({type:'createAnswer',sdp:pc.localDescription}));
                }catch(error){
                    socket.send(JSON.stringify({type : 'error',error}));
                }
            }
        }
    }

    

    return <div>
        hi i am receiver side.    
        <br />
        Enter Session ID Below :
        <br />
        <input type="text" onChange={(e)=>{
            setSessionId(e.target.value);
        }}/>
        <br />
        <button onClick={joinSession}>Join Session</button>
    </div>
}