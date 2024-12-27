import { useEffect, useState } from "react"

export default function Sender (){
    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [isConnecting,setIsConnecting] = useState(false);
    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");
        socket.onopen = () =>{
            socket?.send(JSON.stringify({type : 'createSession'}));
        }

        socket.onmessage = (event) =>{
            const message = JSON.parse(event.data);
            let sessionId;
            console.log("keerti")
            if(message.type === 'sessionCreated'){
                sessionId = message.sessionId;
                console.log("SessionCreated ",sessionId);
            }else if(message.type === 'createAnswer'){
                pc.setRemoteDescription(message.sdp);
                console.log("setted remote descriptions")
            }else if(message.type === 'iceCandidate'){
                pc.addIceCandidate(message.candidate);
                console.log("Ice Candiadate added")
            }
        }

        setSocket(socket);
    },[])

    const pc = new RTCPeerConnection();

   async function startSendingFile () {
    // add socket null handling must!
    if(!socket) return;
    setIsConnecting(true);
    console.log("i am in")
    
    // this would only work for video and audio may be onnegotiationneeded.
    // pc.onnegotiationneeded = async () =>{
    //     console.log("onnegotiated")
    //     const offer = await pc.createOffer();
    //     console.log("offer created!",offer);
    //     await pc.setLocalDescription(offer);
    //     socket.send(JSON.stringify({type : 'createOffer',sdp : pc.localDescription}))
    // }
    
    const offer = await pc.createOffer();
        console.log("offer created!",offer);
        await pc.setLocalDescription(offer);
        socket.send(JSON.stringify({type : 'createOffer',sdp : pc.localDescription}))
    
    
    pc.onicecandidate = (event ) =>{
        if(event.candidate){
            console.log("Icecandidate triggered!")
            socket.send(JSON.stringify({type:'iceCandidate',candidate:event.candidate}));
        }
    }

    




   }   

   
    
        
    

    return <div>
        hi i am sender.
        <br />
        <button onClick={startSendingFile}>Start Sending File.</button>
 
    </div>
}