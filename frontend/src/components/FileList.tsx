import React, { useState, useEffect, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Catalog, CatalogMap, getFileList } from '../utils/api';
import './FileList.css'

const FileList: React.FC = () => {
  const [files, setFiles] = useState<CatalogMap>({});

  useEffect(() => {
    const fetchFileList = async () => {
      try {
        const fileList = await getFileList();
        setFiles(fileList);
      } catch (error) {
        console.error('Error fetching file list:', error);
      }
    };

    fetchFileList();
  }, []);

  const renderEntry = (key: string, catalog: Catalog) => {
    return <div className='file-list-entry'>
      <Link to={`/text/${key}/${catalog.files[0]}`}>{catalog.prettyName}</Link>
      <p className='file-list-entry-descr'>{catalog.description}</p>
      <div className='file-list-entry-bottom'>
        <p className='file-list-tags'>Tags: {catalog.tags}</p>
        <p className='file-list-pages'>Pages: {catalog.pages}</p>
        <p className='file-list-chapters'>Chapters: {catalog.files.length}</p>
      </div>
    </div>
  }

  const renderEntries = () => {
    let items: ReactNode[] = []
    for (const [key, catalog] of Object.entries(files)) {
      items.push(renderEntry(key, catalog))
    }
    return items
  }

  return (
    <div>
      <h2>Catalog List</h2>
      <div>
        {renderEntries()}
      </div>
    </div>
  );
};

export default FileList;