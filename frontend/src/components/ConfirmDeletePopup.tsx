import './LoginPopup.css'
import React from 'react';
import { IoWarningOutline } from "react-icons/io5";

interface ConfirmDeletePopupProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    message?: string;
  }

  const ConfirmDeletePopup: React.FC<ConfirmDeletePopupProps> = ({ isOpen, onConfirm, onCancel, message }) => {
    const displayAction = message || "DELETE"
  
    return isOpen ? (
      <div className="popup-overlay">
        <div className="popup-container">
          <h2>Confirmation required</h2>
          <p><IoWarningOutline /> Confirm to <code>{displayAction}</code></p>
          <div className='flex-row center'>
            <button className='confirm-btn' onClick={onConfirm}>Confirm</button>
            <button className='cancel-btn' onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    ) : null;
  };

export default ConfirmDeletePopup;