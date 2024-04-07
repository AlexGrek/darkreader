import React, { useState, useEffect } from 'react';
import { getFileContentOr401 } from '../utils/api';
import LoginPopup from './LoginPopup';
import { Link } from 'react-router-dom';
import './TextViewer.css'
import { renderText } from '../utils/renderText';
import { GrNext, GrPrevious } from "react-icons/gr";
import { toChapterName } from '../utils/filenames';

interface TextViewerProps {
  fileName: string;
  catalog: string;
  nextPage: string | null;
  prevPage: string | null;
  fontSize: number;
}

const TextViewer: React.FC<TextViewerProps> = ({ fileName, catalog, nextPage, prevPage, fontSize }) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [authPopupVisible, setAuthPopupVisible] = useState<boolean>(false);

  const updateText = () => {
    const fetchFileContent = async () => {
      try {
        const content = await getFileContentOr401(catalog, fileName);
        if (content === "401") {
          setAuthPopupVisible(true)
        }
        setFileContent(content);
      } catch (error) {
        console.error(`Error fetching file content for ${fileName}:`, error);
      }
    };

    fetchFileContent();
  }

  useEffect(() => {
    updateText()
  }, [fileName]);

  const loggedIn = () => {
    setAuthPopupVisible(false);
    updateText()
  }

  const renderTop = () => {
    if (prevPage) {
      const entry = prevPage;
      return <span className='top-bar-text align-flex-center'><GrPrevious /><Link to={`/text/${catalog}/${entry}`}>{toChapterName(entry)}</Link></span>
    }
    return null;
  }

  const renderBottom = () => {
    if (nextPage) {
      const entry = nextPage;
      return <footer className='footer-text align-flex-center'><GrNext /> <Link to={`/text/${catalog}/${entry}`}>{toChapterName(entry)}</Link></footer>
    }
    return null;
  }

  return (
    <div className='text-viewer-main'>
      <LoginPopup isOpen={authPopupVisible} onClose={loggedIn} />
      <div className='text-viewer-container'>
        <h2>{toChapterName(fileName)}</h2>
        {renderTop()}
        <article className='story-text' style={{ fontSize: `${fontSize}pt` }}>{renderText(fileContent)}</article>
        {renderBottom()}
      </div>
    </div>
  );
};

export default TextViewer;