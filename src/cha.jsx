import React, { useState, useRef, useEffect } from 'react';
import { ChatOpenAI } from "@langchain/openai";

const chatModel = new ChatOpenAI({
  apiKey: "YOUR_API_KEY",
  model: "gpt-3.5-turbo",
  temperature: 0.5,
});

const Chatbot = () => {
  const [messages, setMessages] = useState([]); // Array to store chat history
  const [userInput, setUserInput] = useState(''); // User input text
  const chatRef = useRef(null); // Ref for scrolling the chat interface
  const [file, setFile] = useState(null); // State to store uploaded file

  const handleUserInput = (e) => setUserInput(e.target.value);

  const processAndSend = async () => {
    if (!userInput && !file) {
      return; // Handle empty input and no file case
    }
    if (userInput.trim() !== '') { // Handle text input
      setMessages((prevMessages) => [...prevMessages, { type: 'user', message: userInput }]);
      setUserInput(''); // Clear input field after sending

      // Simulate AI processing (replace with actual LLM interaction)
      const response = "AI Response to User Input"; // Replace with your logic
      setMessages((prevMessages) => [...prevMessages, { type: 'ai', message: response }]);
      scrollToBottom();
    }

    if (file) { // Handle file upload (simple text file example)
      const allowedExtensions = ['.txt']; // Allowed file extensions
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        console.error('Error: Invalid file type. Only text files (.txt) are allowed.');
        setFile(null);
        return; // Handle invalid file type
      }

      const reader = new FileReader();
      reader.readAsText(file);

      reader.onload = async (event) => {
        const content = event.target.result;
         const response = await chatModel.generateText({
          prompt: "Process the uploaded text content:",
          input: content,
          max_length: 100, // adjust as needed
          temperature: 0.7, // adjust as needed
        });
        setMessages((prevMessages) => [...prevMessages, { type: 'ai', message: response.data.text }]);
        setFile(null); // Clear file state after processing
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setFile(null); // Clear file state on error
      };
    }
  };
  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom initially
  }, [messages]); // Re-scroll whenever messages change

  const handleFileLoad = (event) => {
    setFile(event.target.files[0])

  };

  return (
    <div className="chatbot-container">
      <div className="chat-interface" ref={chatRef}>
        {messages.map((message, index) => (
          <div key={index} className={`chat-bubble ${message.type}`}>
            {message.message}
          </div>
        ))}
      </div>
      <div className="input-bar">
        <input
          type="file"
          accept=".txt,.pdf" // Specify allowed file types
          onChange={handleFileLoad}
        />
        <input
          type="text"
          value={userInput}
          onChange={handleUserInput}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default cha;