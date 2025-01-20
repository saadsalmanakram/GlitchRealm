import { useState, useEffect } from "react";
import Header from './components/Header';  
import Footer from './components/Footer';
import ChatApp from './components/ChatApp';

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-sky-900 to-gray-800 text-white font-sans ${
        isLoaded ? "opacity-100" : "opacity-0"
      } transition-opacity duration-1000 ease-in-out`}>

      <Header /> 

      <main className="flex-grow">
        <ChatApp />
      </main>

      <Footer /> 
      
    </div>
  );
}

export default App;
