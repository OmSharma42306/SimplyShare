import Sender from './components/Sender';
import Receiver from './components/Receiver';
import { Routes,Route,useNavigate } from 'react-router-dom';
function App() {
  const navigate = useNavigate();
  return (
    
    <div>
       <button onClick={()=>{
        navigate("/sender")
      }}>Sender</button>
      
      <button onClick={()=>{
        navigate("/receiver");
      }}>Reciver</button>
      <Routes>
      <Route path='/sender' element={<Sender/>}></Route>
      <Route path='/receiver' element={<Receiver/>}></Route>
      </Routes>
      
     

    </div>
    
  )
}

export default App
