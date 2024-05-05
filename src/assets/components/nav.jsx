
import React, { useState } from 'react';
import './styles/nav.css'
function Nav() {
  const [selectedOption, setSelectedOption] = useState('basic');

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue); 
    sendToServer(selectedValue); 
  };

  const sendToServer = (selectedValue) => {
    fetch('http://localhost:3000/select', {
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
        <option value="openai">Open Ai</option>
        <option value="basic">Basic</option>
      </select>
    </div>
  );
}

export default Nav;
