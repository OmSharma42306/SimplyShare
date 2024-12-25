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
        
    }


return <div>
        hi , i  am from receiver.
        
    </div>
}