import Sender from './components/Sender';
import Receiver from './components/Receiver';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { Routes,Route } from 'react-router-dom';
import { useState } from 'react';
function App() {
  
  const [darkMode,setDarkMode] = useState(false);
  return (
    
    <div  className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
       
      <Routes>
        <Route path='/' element={<Home darkMode={darkMode}/>}></Route>
      <Route path='/sender' element={<Sender/>}></Route>
      <Route path='/receiver' element={<Receiver/>}></Route>
      </Routes>
      
     

    </div>
    
  )
}

export default App
