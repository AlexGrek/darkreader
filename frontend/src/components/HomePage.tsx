// src/pages/HomePage.tsx
import React from 'react';
import FileList from '../components/FileList';
import Logo from './Logo';

const HomePage: React.FC = () => {
  return (
    <div>
      <Logo/>
      <h1 className='header-text'>Fetish texts</h1>
      <h2 className='header-text'>by Alex</h2>
      <FileList />
    </div>
  );
};

export default HomePage;