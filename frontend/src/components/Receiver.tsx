import { useEffect, useState } from "react"

export default function Receiver(){
    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [isConnecting,setIsConnecting] = useState(false);
    const [sessionId,setSessionId] = useState<string>("");
    useEffect(()=>{
        const socket = new WebSocket ("ws://localhost:8080")
       
            socket.onopen = () =>{
                console.log("Web Socket Connected!");
            }
    
        
        
        setSocket(socket);

        return () =>{               // doubt.
            socket.close();
        }

    },[])
    const pc = new RTCPeerConnection();    
     
    
    
    function joinSession(){
        if(!socket || !sessionId) return;
        setIsConnecting(true);

        socket?.send(JSON.stringify({type : 'joinSession',sessionId}))

        socket.onmessage = async (event) =>{
            const message = JSON.parse(event.data);
            if(message.type === 'createOffer'){
                try{
                    await pc.setRemoteDescription(message.sdp);
                    const answer = await pc.createAnswer();
                    console.log("Answer created!")
                    await pc.setLocalDescription(answer);
                    console.log("Setlocaldescription completed")
                    socket.send(JSON.stringify({type:'createAnswer',sdp:pc.localDescription}));
                }catch(error){
                    socket.send(JSON.stringify({type : 'error',error}));
                }
            }else if(message.type === 'iceCandidate'){
                    await pc.addIceCandidate(message.candidate);
                    console.log("Icecandidate added!")
                
            }
        }

        pc.onicecandidate = (event) =>{
            if(event.candidate){
                console.log("ice candidate triggered!")
                socket?.send(JSON.stringify({type : 'iceCandidate',candidate:event.candidate}));
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