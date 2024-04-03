import React, { useState, useEffect, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Catalog, CatalogMap, getFileList } from '../utils/api';

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
    return <div>
      <Link to={`/text/${key}/${catalog.files[0]}`}>{catalog.prettyName}</Link>
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
      <ul>
        {renderEntries()}
      </ul>
    </div>
  );
};

export default FileList;