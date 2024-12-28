import { useEffect, useState } from "react"
import { Download,Loader2 } from "lucide-react";
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
    const pc = new RTCPeerConnection({iceServers: [{ urls: "stun:stun.l.google.com:19302" }],});    
    pc.onicecandidate = (event) =>{
        if(event.candidate){
            console.log("ice candidate triggered!")
            socket?.send(JSON.stringify({type : 'iceCandidate',candidate:event.candidate}));
        }
    }
    
    
    async function joinSession(){
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

        
    }

    pc.ondatachannel = (event) =>{
        const channel = event.channel;
        const receivedChunks : BlobPart[] = [];
        console.log("ondatachannel triggered!")
        let fileName = "receivedFile";
        let fileType = "application/octet-stream" ; // default mime type
        channel.onmessage = (event) =>{
            if(typeof event.data === "string"){
                try{
                    // check if message contains metadata;
                    const message = JSON.parse(event.data);
                    if(message.type === 'metadata'){
                        fileName = message.fileName;
                        fileType = message.fileType;
                        console.log("Received metadata:",{fileName,fileType})
                        return
                    }
                }catch(error){
                    console.error(error);
                }
            }




            if(event.data  === "EOF"){
                console.log("in the eof section")
                const blob = new Blob(receivedChunks);
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "received file";
                a.click();

            }else{
                receivedChunks.push(event.data);
                console.log("pushin received chunks")
            }
        }
    }

    

    return <div>
        hi i am receiver side.    
        <br />
        Enter Session ID Below :
        <br />
        <input type="text" placeholder="Enter Session Code" onChange={(e)=>{
            setSessionId(e.target.value);
        }}/>
        <br />
        <button onClick={joinSession} disabled={!sessionId || isConnecting} >{isConnecting ? "Connecting...:":"Join Session"}</button>
    </div>
}