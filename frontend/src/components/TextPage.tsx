// src/pages/TextPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TextViewer from '../components/TextViewer';
import Sidebar from './Sidebar';
import { Catalog, getCatalog, getEpubFile } from '../utils/api';
import { Link } from 'react-router-dom';
import { RiHome2Line } from "react-icons/ri";
import { toChapterName } from '../utils/filenames';
import { RiFontSize2 } from "react-icons/ri";
import { FaMinus, FaMoon, FaPlus } from "react-icons/fa";
import './TextPage.css'
import { RxFontFamily } from "react-icons/rx";
import { IoArrowForwardSharp } from "react-icons/io5";
import { IoArrowBackSharp } from "react-icons/io5";
import { TbLamp2 } from "react-icons/tb";
import { ImSwitch } from "react-icons/im";

const DEFAULT_FONT_SIZE = 15;
const DEFAULT_FONT_NAME = "Storyteller";
const DEFAULT_FONT_FAMILY = "'Storyteller', serif";
const FONTS = {
  [DEFAULT_FONT_NAME]: DEFAULT_FONT_FAMILY,
  "Times": "'Times New Roman', serif",
  "Sans": "sans-serif"
}

const TextPage: React.FC = () => {
  const { fileName } = useParams<{ fileName: string }>();
  const { catalog } = useParams<{ catalog: string }>();
  const [catalogData, setCatalogData] = useState<Catalog | null>(null);
  const [errTxt, setErrTxt] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(() => {
    const savedSize = localStorage.getItem('fontSize');
    return savedSize ? parseInt(savedSize, 10) : DEFAULT_FONT_SIZE;
  });
  const [fontFamily, setFontFamily] = useState<string>(() => {
    const saved = localStorage.getItem('fontFamily');
    return saved ? saved : DEFAULT_FONT_NAME;
  });
  const [lightMode, setLightMode] = useState<boolean>(() => {
    const storedMode = localStorage.getItem("lightMode");
    return storedMode ? JSON.parse(storedMode) : false;
  });
  useEffect(() => {
    localStorage.setItem("lightMode", JSON.stringify(lightMode));
  }, [lightMode]);

  useEffect(() => {
    localStorage.setItem("fontFamily", fontFamily);
  }, [fontFamily]);

  const handleNextFont = () => {
    const fontsArray = Object.keys(FONTS);
    const currentIndex = fontsArray.indexOf(fontFamily);
    const nextIndex = (currentIndex + 1) % fontsArray.length;
    setFontFamily(fontsArray[nextIndex]);
  };

  const toggleLightMode = () => {
    setLightMode(prevMode => !prevMode);
  };

  const handlePrevFont = () => {
    const fontsArray = Object.keys(FONTS);
    const currentIndex = fontsArray.indexOf(fontFamily);
    const prevIndex = (currentIndex - 1 + fontsArray.length) % fontsArray.length;
    setFontFamily(fontsArray[prevIndex]);
  };

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

  const handleEpubClick = async () => {
    await getEpubFile(catalog || "");
  }


  useEffect(() => {
    updateCatalog()
  }, [fileName, catalog])

  const renderMenu = () => {
    const dynamic = renderMenuEntries();
    const menuItems = [
      <Link className='sidebar-return-button align-flex-center' to={'/'}><RiHome2Line /> Home</Link>,
      <button onClick={handleEpubClick}>Download epub</button>,
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
      <div className='font-control-panel-editor'>
        <p className='font-control-panel-editor-header'><RxFontFamily /></p>
        <button onClick={handlePrevFont}><IoArrowBackSharp /></button>
        {fontFamily}
        <button onClick={handleNextFont}><IoArrowForwardSharp /></button>
      </div>
      <div className='font-control-panel-editor'>
        <p className='font-control-panel-editor-header'><TbLamp2 /></p>
        <button onClick={toggleLightMode}>{lightMode ? <ImSwitch /> : <FaMoon />}</button>
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
      {errTxt && <p>{errTxt}</p>}
      <Sidebar menu={renderMenu()} lightMode={lightMode}>
        <TextViewer fileName={fileName || ""} catalog={catalog || ''}
          nextPage={genNextPage()}
          fontSize={fontSize}
          fontFamily={fontFamily}
          lightMode={lightMode}
          prevPage={genPrevPage()} />
      </Sidebar>

    </div>
  );
};

export default TextPage;