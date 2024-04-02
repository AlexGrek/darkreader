// src/pages/HomePage.tsx
import React from 'react';
import FileList from '../components/FileList';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the Text File Viewer</h1>
      <FileList />
    </div>
  );
};

export default HomePage;