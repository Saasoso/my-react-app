import './Chat.css'
import React, { useState, useRef, useEffect } from 'react';
import sehmImage from './img/right-arrow.png'; 

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [output, setFileOutput] = useState('');
  const chatRef = useRef(null);
  const [file, setFile] = useState();

  const handleUserInput = (e) => {setUserInput(e.target.value);};

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(); 
  }, [messages]);

  const sendMessage = async () => {
    if (userInput.trim() !== '') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'user', message: userInput },
      ]);
      setUserInput('');
        const processResponse = await fetch('http://localhost:3000/my-react-app/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userInput }),
        });

        if (processResponse.ok) {
          const { output } = await processResponse.json();
          console.log('Output:', output);
          setFileOutput(output);
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: 'ai', message: output },
          ]);
        } else {
          console.error('Error processing file');
        }
    }
  };


  return (
    <div className="chatbot-container">
      <div className="chat-interface" ref={chatRef}>
        {messages.map((message, index) => (
          <div key={index} className={`chat-bubble ${message.type}`}>
            {message.message}
            {message.type === 'user' && <span className="typing-effect"></span>}
          </div>
        ))}
      </div>
      <div className="input-bar">
        <input
          type="text"
          value={userInput}
          onChange={handleUserInput}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}><img src={sehmImage} alt="Send" /></button>
      </div>
    </div>
  );
};

export default Chat;
