import React, { useState, useEffect } from 'react';
import { getFileContentOr401 } from '../utils/api';
import LoginPopup from './LoginPopup';
import { Link } from 'react-router-dom';
import './TextViewer.css'
import { renderText } from '../utils/renderText';

interface TextViewerProps {
  fileName: string;
  catalog: string;
  nextPage: string | null;
  prevPage: string | null;
}

const TextViewer: React.FC<TextViewerProps> = ({ fileName, catalog, nextPage, prevPage }) => {
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
      return <Link to={`/text/${catalog}/${entry}`}>{entry.replace("_", " ").replace(".txt", "")}</Link>
    }
    return null;
  }

  const renderBottom = () => {
    if (nextPage) {
      const entry = nextPage;
      return <footer className='footer-text'>Next: <Link to={`/text/${catalog}/${entry}`}>{entry.replace("_", " ").replace(".txt", "")}</Link></footer>
    }
    return null;
  }

  return (
    <div className='text-viewer-main'>
      <LoginPopup isOpen={authPopupVisible} onClose={loggedIn} />
      <div>
        <h2>{fileName}</h2>
        {renderTop()}
        <article className='story-text'>{renderText(fileContent)}</article>
        {renderBottom()}
      </div>
    </div>
  );
};

export default TextViewer;