// src/pages/TextPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TextViewer from '../components/TextViewer';
import Sidebar from './Sidebar';
import { Catalog, getCatalog } from '../utils/api';
import { Link } from 'react-router-dom';
import { RiHome2Line } from "react-icons/ri";
import { toChapterName } from '../utils/filenames';
import { RiFontSize2 } from "react-icons/ri";
import { FaMinus, FaPlus } from "react-icons/fa";
import './TextPage.css'

const DEFAULT_FONT_SIZE = 15;

const TextPage: React.FC = () => {
  const { fileName } = useParams<{ fileName: string }>();
  const { catalog } = useParams<{ catalog: string }>();
  const [catalogData, setCatalogData] = useState<Catalog | null>(null);
  const [errTxt, setErrTxt] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(() => {
    const savedSize = localStorage.getItem('fontSize');
    return savedSize ? parseInt(savedSize, 10) : DEFAULT_FONT_SIZE;
  });

  const handleSetFontSize = (size: number) => {
    let newSize = size;
    if (size > 80) {
      newSize = 80;
    }
    if (size < 6) {
      newSize = 6;
    }
    setFontSize(newSize)
    localStorage.setItem('fontSize', newSize.toString());
  }

  const updateCatalog = () => {
    const fetchFileContent = async () => {
      try {
        const content = await getCatalog(catalog || "");
        if (
          typeof content === 'object' &&
          !Array.isArray(content) &&
          content !== null) {
          setCatalogData(content);
        } else {
          setErrTxt(JSON.stringify(content))
        }
      } catch (error) {
        console.error(`Error fetching file content for ${fileName}:`, error);
      }
    };

    fetchFileContent();
  }

  useEffect(() => {
    updateCatalog()
  }, [fileName, catalog])

  const renderMenu = () => {
    const dynamic = renderMenuEntries();
    const menuItems = [
      <Link className='sidebar-return-button' to={'/'}><RiHome2Line /> Home</Link>,
      <div className='sidebar-data-menu-container'>{dynamic}{renderFontControlPanel()}</div>]
    return menuItems
  }

  const renderFontControlPanel = () => {
    return <div className='font-control-panel-main'>
      <div className='font-control-panel-editor'>
        <p className='font-control-panel-editor-header'><RiFontSize2 /></p>
        <button onClick={() => handleSetFontSize(fontSize - 1)}><FaMinus /></button>
        {fontSize}
        <button onClick={() => handleSetFontSize(fontSize + 1)}><FaPlus /></button>
      </div>
    </div>
  }

  const renderMenuEntries = () => {
    if (catalogData == null) {
      return <p className='top-sidebar-item'>Loading...</p>
    } else {
      return <ul className='top-sidebar-item'>{catalogData.files.map((entry, i) => {
        return <li className={entry == fileName ? "sidebar-entry-chosen" : ""}><Link to={`/text/${catalog}/${entry}`} key={i}>{toChapterName(entry)}</Link></li>
      })}
      </ul>
    }
  }

  const genNextPage = () => {
    if (catalogData != null) {
      // get index of current page
      const index = catalogData.files.indexOf(fileName || "")
      if (index >= 0 && index < catalogData.files.length - 1) {
        return catalogData.files[index + 1]
      }
    }
    return null;
  }

  const genPrevPage = () => {
    if (catalogData != null) {
      // get index of current page
      const index = catalogData.files.indexOf(fileName || "")
      if (index > 0) {
        return catalogData.files[index - 1]
      }
    }
    return null;
  }

  return (
    <div>
      <p>{errTxt}</p>
      <Sidebar menu={renderMenu()}>
        <TextViewer fileName={fileName || ""} catalog={catalog || ''}
          nextPage={genNextPage()}
          fontSize={fontSize}
          prevPage={genPrevPage()} />
      </Sidebar>

    </div>
  );
};

export default TextPage;