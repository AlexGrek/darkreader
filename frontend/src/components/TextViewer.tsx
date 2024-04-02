import React, { useState, useEffect } from 'react';
import { getFileContent } from '../utils/api';

interface TextViewerProps {
  fileName: string;
}

const TextViewer: React.FC<TextViewerProps> = ({ fileName }) => {
  const [fileContent, setFileContent] = useState<string>('');

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const content = await getFileContent(fileName);
        setFileContent(content);
      } catch (error) {
        console.error(`Error fetching file content for ${fileName}:`, error);
      }
    };

    fetchFileContent();
  }, [fileName]);

  return (
    <div>
      <h2>{fileName}</h2>
      <pre>{fileContent}</pre>
    </div>
  );
};

export default TextViewer;