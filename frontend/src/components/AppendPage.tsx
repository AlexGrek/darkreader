import React from 'react';
import { IoCreateOutline } from "react-icons/io5";
import { getAccessLevelOrStatusCode } from '../utils/api';
import LoginPopup from './LoginPopup';
import { Link, useParams } from 'react-router-dom';
import { RiHome2Line } from "react-icons/ri";
import Appender from './Appender';
import { toChapterName } from '../utils/filenames';

const AppendPage: React.FC = () => {
  const [loggedIn, setLoggedIn] = React.useState<boolean>(false);
  const { catalog } = useParams<{ catalog: string }>();

  const fetchLogin = async () => {
    try {
      const content = await getAccessLevelOrStatusCode();
      if (
        typeof content === 'object' &&
        !Array.isArray(content) &&
        content !== null) {
        setLoggedIn(content.level === "contributor" || content.level === "master")
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
      <h1 className='header-text'>Continue story</h1>
      <p><IoCreateOutline />  {toChapterName(catalog || "")}</p>
      {loggedIn && <Appender catalog={catalog || ""}/>}
      <LoginPopup data={"mode"} message={"add story"} isOpen={!loggedIn} onClose={() => updateLogin()} />
    </div>
  );
};

export default AppendPage;