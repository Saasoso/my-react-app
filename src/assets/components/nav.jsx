
import React, { useState } from 'react';
import './styles/nav.css'
function Nav() {
  const [selectedOption, setSelectedOption] = useState('openai');

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue); 
    sendToServer(selectedValue); 
  };

  const sendToServer = () => {
    fetch('http://localhost:3000/my-react-app/select', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ selectedOption })
    })
    .then(response => response.json())
    .then(data => {
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <div className="nav">
      <select className="select-box" onChange={handleChange}>
        <option value="basic">Open Ai</option>
        <option value="openai">Basic</option>
      </select>
    </div>
  );
}

export default Nav;
