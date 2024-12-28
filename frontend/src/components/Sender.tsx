import { useEffect, useState } from "react"

export default function Sender (){
    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [isConnecting,setIsConnecting] = useState(false);
    const [dataChannel,setDataChannel] = useState<RTCDataChannel | null>(null);
    const [file,setFile] = useState<File | null>(null);
    const [sessionId,setSessionId] = useState("");
    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");
        socket.onopen = () =>{
            socket?.send(JSON.stringify({type : 'createSession'}));
        }

        

        setSocket(socket);
        return () =>{               // doubt.
            socket.close();
        }
    },[])

    const pc = new RTCPeerConnection( {iceServers: [{ urls: "stun:stun.l.google.com:19302" }],});

   async function startSendingFile () {
    // add socket null handling must!
    if(!socket || !file) return;
    setIsConnecting(true);
    console.log("i am in")

    // creating Channels
    const channel = await pc.createDataChannel("fileTransfer");
    console.log("Channel Created!")
    setDataChannel(channel);

    socket.onmessage = async (event) =>{
        const message = JSON.parse(event.data);
        let sessionId;
        console.log("keerti")
        if(message.type === 'sessionCreated'){
            sessionId = message.sessionId;
            setSessionId(sessionId)
            console.log("SessionCreated ",sessionId);
        }else if(message.type === 'createAnswer'){
            await pc.setRemoteDescription(message.sdp);
            console.log("setted remote descriptions")
        }else if(message.type === 'iceCandidate'){
            await pc.addIceCandidate(message.candidate);
            console.log("Ice Candiadate added")
        }
    }

    channel.onopen = () =>{
        sendFile(file,channel)
        console.log("sendFile triggered!")
    }

    
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
    };

    




   }   

   function sendFile(file : File,channel:RTCDataChannel){
    const chunkSize = 16*1024;
    const reader = new FileReader();
    let offset = 0;
    console.log("i am in sendfile function")
    channel.send(JSON.stringify({type : "metadata",fileName: file.name , fileType : file.type}))
    reader.onload = () =>{
        if(reader.result){
            channel.send(reader.result as ArrayBuffer);
            offset += chunkSize;
            if(offset<file.size){
                readSlice(offset);
                console.log("reading slice")
            }else{
                channel.send("EOF")
                console.log("channel sended eof")
            }
        }
    }
        const readSlice = (o: number) => {
        const slice = file?.slice(o , o+chunkSize)
        reader.readAsArrayBuffer(slice);
      };
      readSlice(0);
    };

 

    
    
        
    

    return <div>
        hi i am sender.
        <input type="file" onChange={(e)=>{
            if(e.target.files){
                setFile(e.target.files?.[0] || null)
            }
            
        }} />
        <br />
        <button onClick={startSendingFile} disabled={!file || isConnecting} >{isConnecting ? "Connceting":"send file"}</button>
        {sessionId && <p>Share this code with the receiver: {sessionId}</p>}
    </div>
}