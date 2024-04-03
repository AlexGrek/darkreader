import React from 'react';
import { IoCreateOutline } from "react-icons/io5";
import { getAccessLevelOrStatusCode } from '../utils/api';
import LoginPopup from './LoginPopup';
import Creator from './Creator';
import { Link } from 'react-router-dom';
import { RiHome2Line } from "react-icons/ri";

const CreatePage: React.FC = () => {
  const [loggedIn, setLoggedIn] = React.useState<boolean>(false);

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
      <h1 className='header-text'>Create</h1>
      <p><IoCreateOutline />  Write your own story.</p>
      {loggedIn && <Creator/>}
      <LoginPopup data={"mode"} message={"create story"} isOpen={!loggedIn} onClose={() => updateLogin()} />
    </div>
  );
};

export default CreatePage;