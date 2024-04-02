import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFileList } from '../utils/api';

const FileList: React.FC = () => {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchFileList = async () => {
      try {
        const fileList = await getFileList();
        setFiles(fileList);
      } catch (error) {
        console.error('Error fetching file list:', error);
      }
    };

    fetchFileList();
  }, []);

  return (
    <div>
      <h2>File List</h2>
      <ul>
        {files.map((file) => (
          <li key={file}>
            <Link to={`/text/${file}`}>{file}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;