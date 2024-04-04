// src/pages/HomePage.tsx
import React, { useState } from 'react';
import FileList from '../components/FileList';
import Logo from './Logo';
import { Link } from 'react-router-dom';
import './HomePage.css'
import { FaGithub } from "react-icons/fa6";

const HomePage: React.FC = () => {
  const [appendMode, setAppendMode] = useState<boolean>(false)

  return (
    <div>
      <Logo/>
      <h1 className='header-text'>Fetish texts</h1>
      <h2 className='header-text'>by Alex</h2>
      <FileList appendMode={appendMode}/>
      <footer className='home-footer'>
        <Link className='home-footer-button' to='/create'>Create</Link>|
        <a className='home-footer-button' href='#' onClick={() => setAppendMode(!appendMode)}>Append</a>|
        <a className='home-footer-button' href='#' onClick={() => setAppendMode(!appendMode)}>Manage</a>|
        <a className='home-footer-button' href="https://github.com/AlexGrek/darkreader"><FaGithub /></a>
      </footer>
    </div>
  );
};

export default HomePage;