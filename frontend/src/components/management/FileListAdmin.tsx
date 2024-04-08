import React, { useState, useEffect, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Catalog, CatalogMap, getAccessLevelOrStatusCode, getFileList } from '../../utils/api';
import '../FileList.css'
import { HiOutlineLockClosed } from "react-icons/hi2";
import { RxFileText } from "react-icons/rx";
import { FaTags } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { BsFileEarmarkPlus } from "react-icons/bs";
import LoginPopup from '../LoginPopup';
import { LuEyeOff } from "react-icons/lu";
import { LuEye } from "react-icons/lu";
import { VscGistSecret } from "react-icons/vsc";

interface FileListAdminProps {

}



const FileListAdmin: React.FC<FileListAdminProps> = ({ }) => {
  const [files, setFiles] = useState<CatalogMap>({});
  const [loggedIn, setLoggedIn] = React.useState<boolean>(false);
  

  const fetchLogin = async () => {
    try {
      const content = await getAccessLevelOrStatusCode();
      if (
        typeof content === 'object' &&
        !Array.isArray(content) &&
        content !== null) {
        setLoggedIn(content.level === "master")
      } else {
        setLoggedIn(false)
      }
    } catch (error) {
      console.error(`Error fetching logged in level`, error);
    }
  };

  const fetchFileListAdmin = async () => {
    try {
      const fileList = await getFileList();
      setFiles(fileList);
    } catch (error) {
      console.error('Error fetching file list:', error);
    }
  };

  const updateLogin = async () => {
    await fetchLogin()
    await fetchFileListAdmin()
  }

  useEffect(() => {
    fetchLogin();
    fetchFileListAdmin();
  }, []);


  const renderTags = (tags: string[]) => {
    return tags.map((tag, i) => {
      return <span className='file-list-entry-tag' key={i}>{tag}</span>
    });
  }


  const renderEntry = (key: string, catalog: Catalog) => {
    const lock = catalog.protected ? <span className='file-entry-lock'><HiOutlineLockClosed /></span> : null;
    const visible = catalog.hidden ? <LuEyeOff /> : <LuEye />;
    const unpub = catalog.unpublished ? <VscGistSecret /> : null;
    const append = <Link to={`/append/${key}`}>  <BsFileEarmarkPlus /></Link>;

    return <div className='file-list-entry' key={key}>
      <div className='file-entry-header admin'><Link to={`/edit/${key}`}>{catalog.prettyName}</Link>
        <span className='snap-right'>{lock}{visible}{unpub}{append}</span>
      </div>
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
      <h1>Management panel</h1>
      <div>{renderEntries()}</div>
      <LoginPopup data={"management panel"} message={"manage stuff"} isOpen={!loggedIn} onClose={() => updateLogin()} />
    </div>
  );
};

export default FileListAdmin;