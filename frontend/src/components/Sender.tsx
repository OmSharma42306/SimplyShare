import { useEffect, useState } from "react"

export default function Sender(){

    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [dataChannel,setDataChannel] = useState<RTCDataChannel | null>(null);
    const [file,setFile] = useState<File | null> (null);

    
    useEffect(()=>{
        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = () =>{
            socket.send(JSON.stringify({type:'sender'}));
        }

        setSocket(socket);

    },[])


    async function startFileSending () {
        if(!socket || !file){
            return;
        }

        const pc = new RTCPeerConnection();

        // create a data channel for file transfer.

        const channel = pc.createDataChannel("fileTransfer");
        setDataChannel(channel);

        channel.onopen = () =>{
            console.log("Channel is Open , File Transfer is Ready.");
            sendFile(file,channel);
            
        }

        pc.onicecandidate = (event) =>{
            console.log("i am in iceCandidate function",event);
            if(event.candidate){
                socket?.send(JSON.stringify({type:'iceCandidate',candidate:event.candidate}));
            }
        }

        pc.onnegotiationneeded = async () =>{
            console.log("On negotiatited.");
            const offer = await pc.createOffer(); // creating offer.
            console.log("Offer Created.",offer);
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({type:'createOffer',sdp : pc.localDescription}));
        }



        // caching the answer from the receiver.
        socket.onmessage = (event) =>{
            const data = JSON.parse(event.data);
            if(data.type === 'createAnswer'){
                pc.setRemoteDescription(data.sdp);
            }else if(data.type === 'iceCandidate'){
                // this iceCandidate is from receiver side.
                pc.addIceCandidate(data.candidate);
            }
        }

        function sendFile(file:File,channel:RTCDataChannel){
            const chunkSize = 16 * 1024;
            const fileReader = new FileReader();
            let offset = 0;

            fileReader.onload = () =>{
                if(fileReader.result){
                    channel.send(fileReader.result as ArrayBuffer);
                    offset += chunkSize;

                    if(offset < file.size){
                        readSlice(offset);
                    }else{
                        console.log("File Transfer Complete.");
                        channel.send("EOF");
                    }
                }
            };

            const readSlice = (o:number) =>{
                const slice = file.slice(o,o + chunkSize);
                fileReader.readAsArrayBuffer(slice);
            }
            readSlice(0);

        }

    }


    return <div>
        hi i am from sender.


        <input type="file" onChange={(e)=>{
            if(e.target.files){
                setFile(e.target.files[0])
            }
        }} />

        <button onClick={startFileSending}>Send File</button> 

    </div>
}