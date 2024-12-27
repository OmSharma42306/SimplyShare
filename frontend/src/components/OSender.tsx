import { useEffect, useState } from "react"
import { Upload, Loader2 } from 'lucide-react';

export default function Sender(){

    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [dataChannel,setDataChannel] = useState<RTCDataChannel | null>(null);
    const [file,setFile] = useState<File | null> (null);
    const [isConnecting,setIsConnecting] = useState(false);
    
    useEffect(()=>{
        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = () =>{
            socket.send(JSON.stringify({type:'createSession'}));
        }

        setSocket(socket);

    },[])


    async function startFileSending () {
        if(!socket || !file){
            return;
        }
        setIsConnecting(true);
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

         // no need to add this onnegotiationneeded() on receiver side , like this trigger would be triggered when sender change the sending 
        // diffrent data, like assume what i am telling  you that , i am sending an video to receiver side , so i am sending 
        // and exchanging first ice candidates , then i am video sharing started!. so think if i need to send after this audio,
        // then old icecandidates not work for audio, so i have to create a fresh iceCandidate for exchanging audio or new flow.
        // so it's depends on the sender what to send as ice candidates for diffrent media.
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


    return (
    <div className="max-w-4xl mx-auto px-4 py-12">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Send Files
      </h1>

      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12">
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files) {
                setFile(e.target.files[0]);
              }
            }}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              dark:file:bg-gray-700 dark:file:text-blue-400
              hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
          />
        </div>

        {file && (
          <div className="text-center text-gray-600 dark:text-gray-400">
            Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </div>
        )}

        <button
          onClick={startFileSending}
          disabled={!file || isConnecting}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white
            ${!file || isConnecting
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            } transition-colors flex items-center justify-center space-x-2`}
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Send File</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);
}