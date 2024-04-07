import React, { useState, useEffect, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Catalog, CatalogMap, getFileList } from '../utils/api';
import './FileList.css'
import { HiOutlineLockClosed } from "react-icons/hi2";
import { RxFileText } from "react-icons/rx";
import { FaTags } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { BsFileEarmarkPlus } from "react-icons/bs";

interface FileListProps {
  appendMode: boolean;
}

const FileList: React.FC<FileListProps> = ({appendMode}) => {
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


  const renderTags = (tags: string[]) => {
    return tags.map((tag, i) => {
      return <span className='file-list-entry-tag' key={i}>{tag}</span>
    });
  }


  const renderEntry = (key: string, catalog: Catalog) => {
    const lock = catalog.protected ? <span className='file-entry-lock'><HiOutlineLockClosed /></span> : null;
    const edit = !appendMode ? null : <Link to={`/append/${key}`}>  <BsFileEarmarkPlus /></Link>;

    return <div className='file-list-entry' key={key}>
      <div className='file-entry-header'><Link to={`/text/${key}/${catalog.files[0]}`}>{catalog.prettyName}</Link>{lock}{edit}</div>
      <p className='file-list-entry-descr'>{catalog.description}</p>
      <div className='file-list-entry-bottom'>
        <p className='file-list-tags'><FaTags /> {renderTags(catalog.tags)}</p>
        <div className='file-list-entry-metedata'>
          <p className='file-list-pages align-flex-center'><RxFileText /> {catalog.pages}</p>
          <p className='file-list-chapters align-flex-center'><FaBookOpen /> {catalog.files.length}</p>
        </div>
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
      {renderEntries()}
    </div>
  );
};

export default FileList;