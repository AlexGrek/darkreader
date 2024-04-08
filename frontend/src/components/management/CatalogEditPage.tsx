// src/pages/CatalogEditPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { Catalog, getCatalog, sendPostWithPayload } from '../../utils/api';
import { Link } from 'react-router-dom';
import { RiHome2Line } from "react-icons/ri";
import { toChapterName } from '../../utils/filenames';
import '../TextPage.css'
import MetadataEditor, { Metadata } from './MetadataEditor';
import { RiSettings6Line } from "react-icons/ri";

const DEFAULT_FONT_SIZE = 15;

const CatalogEditPage: React.FC = () => {
  const { catalog } = useParams<{ catalog: string }>();
  const [catalogData, setCatalogData] = useState<Catalog | null>(null);
  const [errTxt, setErrTxt] = useState<string>("");
  const [etext, setEText] = useState<string>('');

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
        console.error(`Error fetching file content for ${catalog}:`, error);
      }
    };

    fetchFileContent();
  }

  useEffect(() => {
    updateCatalog()
  }, [catalog])

  const renderMenu = () => {
    const dynamic = renderMenuEntries();
    const menuItems = [
      <Link className='sidebar-return-button align-flex-center' to={'/'}><RiHome2Line /> Home</Link>,
      <Link className='sidebar-return-button align-flex-center' to={'/manage'}><RiSettings6Line /> Manage</Link>,
      <div className='sidebar-data-menu-container'>
        <p>Choose a file to edit text</p>
        {dynamic}
      </div>]
    return menuItems
  }

  const renderMenuEntries = () => {
    if (catalogData == null) {
      return <p className='top-sidebar-item'>Loading...</p>
    } else {
      return <ul className='top-sidebar-item'>{catalogData.files.map((entry, i) => {
        return <li><Link to={`/edit/${catalog}/${entry}`} key={i}>{toChapterName(entry)}</Link></li>
      })}
      </ul>
    }
  }

  const navigate = useNavigate();

  let metadata: Metadata = {
    tags: [], description: '', protected: false, hidden: false, unpublished: false
  }

  if (catalogData != undefined)
    metadata = {
      tags: catalogData.tags, description: catalogData.description, protected: catalogData.protected,
      hidden: catalogData.hidden, unpublished: catalogData.unpublished
    }

  const editorContent = (
    <div>
      <h3>Metadata</h3>
      <MetadataEditor initialMetadata={metadata} onSave={async (data) => {
        const result = await sendPostWithPayload("editmeta", {"catalog": catalog, ...data})
      if (result) {
          navigate("/manage")
          setEText("")
      } else {
          setEText("Error, story not published")
      }
      }
      } />
    </div>
  )

  return (
    <div>
      <p>{errTxt}</p>
      <Sidebar menu={renderMenu()}>
        <div>
          <p>{etext}</p>
          {editorContent}
        </div>

      </Sidebar>

    </div>
  );
};

export default CatalogEditPage;