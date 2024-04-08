import React from 'react';
import { IoCreateOutline } from "react-icons/io5";
import { getAccessLevelOrStatusCode } from '../../utils/api';
import LoginPopup from '../LoginPopup';
import { Link, useParams } from 'react-router-dom';
import { RiHome2Line } from "react-icons/ri";
import { toChapterName } from '../../utils/filenames';
import TextEdit from './TextEdit';

const EditTextPage: React.FC = () => {
  const [loggedIn, setLoggedIn] = React.useState<boolean>(false);
  const { catalog } = useParams<{ catalog: string }>();
  const { file } = useParams<{ file: string }>();

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

  const updateLogin = async () => {
    await fetchLogin()
  }

  React.useEffect(() => {
    fetchLogin();
  })

  return (
    <div>
      <Link to='/'><RiHome2Line />   Return</Link>
      <h1 className='header-text'>Edit story</h1>
      <p><IoCreateOutline />  {toChapterName(catalog || "")}</p>
      {loggedIn && <TextEdit catalog={catalog || ""} file={file || ''}/>}
      <LoginPopup data={"mode"} message={"edit story"} isOpen={!loggedIn} onClose={() => updateLogin()} />
    </div>
  );
};

export default EditTextPage;