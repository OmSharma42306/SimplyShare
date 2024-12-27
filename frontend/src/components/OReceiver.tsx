import { useEffect, useState } from "react"
import { Download, Loader2 } from 'lucide-react';

export default function Receiver() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'joinSession' }));
        }

        setSocket(socket);

    }, []);

    async function fileReciver() {
        
        if (!socket) {
            return;
        }
        console.log("i am in receiver")
        setIsConnecting(true);
        const pc = new RTCPeerConnection();
        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                try{
                await pc.setRemoteDescription(message.sdp);
                const answer = await pc.createAnswer();
                console.log("answer",answer);
                await pc.setLocalDescription(answer);
                socket?.send(JSON.stringify({ type: 'createAnswer', sdp: pc.localDescription }));
                }catch(error){
                    console.error("Error Handling Offer",error);
                }
                
            }else if (message.type === 'iceCandidate'){
                try{
                    await pc.addIceCandidate(message.candidate);
                }catch(error){
                    console.error("Error adding Ice Candidate ",error);
                }
                
            }
        }




        pc.onicecandidate = (event) => {
            console.log("i am inside the onicecandidate!", event);
            if (event.candidate) {
                socket?.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }))
            }
        }

        // handling incomming data channel.
        const receivedChunks: BlobPart[] | undefined = [];
        pc.ondatachannel = (event) => {
            const dataChannel = event.channel;
            console.log("Data Channel Received!");
            // handle events on the data Channel.
            dataChannel.onopen = () => console.log("Data Channel opened!");
            dataChannel.onmessage = (event) => {
                console.log("Message Received! on Data Channel", event.data);
                if (event.data === "EOF") {
                    console.log("File Transfer Complete.");
                    const blob = new Blob(receivedChunks);
                    const url = URL.createObjectURL(blob);
                    // trigger file download.
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "received_file";
                    a.click();

                } else {
                    receivedChunks.push(event.data);
                }
            }

        }




    }


    return (
        // <div>
        // hi , i  am from receiver.
        
        // <button onClick={fileReciver}>Receive file</button>
        // </div>
        <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Receive Files
        </h1>

        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12">
            <Download className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Click the button below to start receiving files
            </p>
          </div>

          <button
            onClick={fileReciver}
            disabled={isConnecting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white
              ${isConnecting
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
              } transition-colors flex items-center justify-center space-x-2`}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Receive File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  

    
    );
}