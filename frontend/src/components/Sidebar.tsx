import React, { useState, ReactNode } from 'react';
import './Sidebar.css';

interface SidebarProps {
  children: ReactNode;
  menu: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children, menu }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-container">
      <div className="sidebar-container">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <button className="sidebar-close" onClick={toggleSidebar}>
            &times;
          </button>
          {menu}
        </div>
      </div>
      <div className="content-container">{children}</div>
    </div>
  );
};

export default Sidebar;