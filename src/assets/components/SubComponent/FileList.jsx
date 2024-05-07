import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import '../styles/FileList.css'
import poub from '../img/delete.png'; 

const FileListContainer = styled.div`
  height: 500px;
  overflow-y: scroll;
  border: 1px solid #ccc;
  padding: 10px;
`;

const FileItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #e9e9e9;
    cursor: pointer;
  }
`;

const FileName = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const DeleteButton = styled.button`
  background-color: #ff4d4f;
  color: white;
  border: none !important;
  border-radius: 5px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #ff2a2d;
  }
`;
const FileList = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {

    const fetchFiles = async () => {
      try {
        const response = await fetch('http://localhost:3000/my-react-app/get-files'); 
        if (!response.ok) {
          throw new Error(`Error fetching files: ${response.statusText}`);
        }
        const fileNames = await response.json();
        setFiles(fileNames); 
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  const handleDeleteFile = async (index) => {
    try {
      const response = await fetch(`http://localhost:3000/my-react-app/delete/${index}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting file: ${response.statusText}`);
      }
      // Create a new array without the deleted file
      const updatedFiles = files.filter((_, i) => i !== index); 
    //const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
  };

  return (
    <div>
      <h2>File List</h2>
      <FileListContainer>
        {files.map((file, index) => (
          <FileItem key={index}>
            <FileName>{file}</FileName>
          <DeleteButton onClick={() => handleDeleteFile(index)}><img src={poub} alt="Poubelle" /></DeleteButton>
          </FileItem>
        ))}
      </FileListContainer>
    </div>
  );
};

export default FileList;