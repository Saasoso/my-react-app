import './styles/Storage.css'
import { useState } from 'react';
import FileList from './SubComponent/FileList.jsx'
import clip from './img/clip.png'; 
import axios from 'axios';

function Storage() {
  const [file, setFile] = useState(null); 

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    setFile(file);
  
    const fileName = file.name;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
  
    try {
      const response = await fetch('http://localhost:3000/my-react-app/upload', {
        method: 'POST',
        body: formData
      });
  
      if (response.ok) {
        console.log('File uploaded successfully');
        // You can update the state or perform additional actions here
      } else {
        console.error('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <FileList/>
      <input type="file" id="fileInput" accept=".txt,.pdf" onChange={handleUploadFile} style={{ display: 'none' }}/>
<button className="btn" onClick={() => document.getElementById('fileInput').click()}>
  <img src={clip} alt="Upload" />
</button>
       </div>
  );
}

export default Storage
