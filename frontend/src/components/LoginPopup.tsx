import React, { useState } from 'react';
import './LoginPopup.css'
import { login } from '../utils/api';
import { Link } from 'react-router-dom';
import { HiLockClosed } from "react-icons/hi2";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [wrong, setWrong] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await login(password);
    setWrong(!success);
    setPassword('');
    if (success)
        onClose();
  };

  return isOpen ? (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Protected text</h2>
        <p><HiLockClosed /> Please enter password to read</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
          <button type="submit">Login</button>
        </form>
        <Link to={`/`} onClick={onClose}>Cancel</Link>
      </div>
    </div>
  ) : null;
};

export default LoginPopup;