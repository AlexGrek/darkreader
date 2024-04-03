// src/pages/TextPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TextViewer from '../components/TextViewer';
import Sidebar from './Sidebar';
import { Catalog, getCatalog } from '../utils/api';
import { Link } from 'react-router-dom';
import { RiHome2Line } from "react-icons/ri";
import { toChapterName } from '../utils/filenames';

const TextPage: React.FC = () => {
  const { fileName } = useParams<{ fileName: string }>();
  const { catalog } = useParams<{ catalog: string }>();
  const [catalogData, setCatalogData] = useState<Catalog | null>(null);
  const [errTxt, setErrTxt] = useState<string>("");

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
  }, [])

  const renderMenu = () => {
    const dynamic = renderMenuEntries();
    const menuItems = [
      <Link className='sidebar-return-button' to={'/'}><RiHome2Line /> Home</Link>,
      dynamic]
    return menuItems
  }

  const renderMenuEntries = () => {
    if (catalogData == null) {
      return <p>Loading...</p>
    } else {
      return <ul>{catalogData.files.map((entry, i) => {
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
        return catalogData.files[index+1]
      }
    }
    return null;
  }

  const genPrevPage = () => {
    if (catalogData != null) {
      // get index of current page
      const index = catalogData.files.indexOf(fileName || "")
      if (index > 0) {
        return catalogData.files[index-1]
      }
    }
    return null;
  }

  return (
    <div>
      <p>{errTxt}</p>
      <Sidebar menu={renderMenu()}>
        <TextViewer fileName={fileName || ""} catalog={catalog || ''} nextPage={genNextPage()} prevPage={genPrevPage()}/>
      </Sidebar>

    </div>
  );
};

export default TextPage;