import { useEffect, useState } from "react"


export default function Receiver () {
    const [socket,setSocket] = useState<WebSocket | null > (null);
    
    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");

        socket.onopen = () =>{
            socket.send(JSON.stringify({type : 'receiver'}));
        }
        
        setSocket(socket);

    },[]);

    async function fileReciver(){
        if(!socket){
            return;
        }

        const pc = new RTCPeerConnection();
        
        const answer = await pc.createAnswer();
        pc.setLocalDescription(answer);
        socket?.send(JSON.stringify({type:'createAnswer',sdp:pc.localDescription}));


        pc.onicecandidate = (event) =>{
            console.log("i am inside the onicecandidate!",event);
            if(event.candidate){
                socket?.send(JSON.stringify({type : 'iceCandidate',candidate: event.candidate}))
            }
        }
        
        



    }


return <div>
        hi , i  am from receiver.
        <button onClick={fileReciver}>Receive file</button>
        
    </div>
}