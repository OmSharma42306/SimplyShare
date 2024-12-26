import { useEffect, useState } from "react"


export default function Receiver() {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'receiver' }));
        }

        setSocket(socket);

    }, []);

    async function fileReciver() {
        if (!socket) {
            return;
        }




        const pc = new RTCPeerConnection();
        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                pc.setRemoteDescription(message.sdp)
                const answer = await pc.createAnswer();
                pc.setLocalDescription(answer);
                socket?.send(JSON.stringify({ type: 'createAnswer', sdp: pc.localDescription }));
            }else if (message.type === 'iceCandidate'){
                await pc.addIceCandidate(message.candidate);
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
            
            // handle events on the data Channel.
            dataChannel.onopen = () => console.log("Data Channel opened!");
            dataChannel.onmessage = (event) => {
                console.log("Message Received!", event.data);
                if (event.data === "EOF") {
                    const blob = new Blob(receivedChunks);
                    const url = URL.createObjectURL(blob);
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


    return <div>
        hi , i  am from receiver.
        <button onClick={fileReciver}>Receive file</button>

    </div>
}