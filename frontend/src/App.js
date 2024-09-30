import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import ChatPage from './Pages/ChatPage';
import ChatProvider from './Context/ChatProvider';
import { ChakraProvider } from '@chakra-ui/react';
function App() {
  return (
    <div className="App">
      <ChakraProvider>
        <BrowserRouter>
          <ChatProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chats" element={<ChatPage />} />
            </Routes>
          </ChatProvider>
        </BrowserRouter>
      </ChakraProvider>
    </div>
  );
}

export default App;
