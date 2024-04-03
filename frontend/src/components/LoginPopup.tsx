import React, { useState } from 'react';
import './LoginPopup.css'
import { login } from '../utils/api';

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
        <h2>Edit Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <button type="submit">Submit</button>
        </form>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  ) : null;
};

export default LoginPopup;