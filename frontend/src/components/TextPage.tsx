// src/pages/TextPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import TextViewer from '../components/TextViewer';

const TextPage: React.FC = () => {
  const { fileName } = useParams<{ fileName: string }>();

  return (
    <div>
      <p>Displaying file "{fileName}"</p>
      <TextViewer fileName={fileName || ""} />
    </div>
  );
};

export default TextPage;