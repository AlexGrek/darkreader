import React, { useState, ReactNode, useRef, useEffect } from 'react';
import './Sidebar.css';
import { useLocation } from 'react-router-dom';

interface SidebarProps {
  children: ReactNode;
  menu: ReactNode;
  lightMode?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ children, menu, lightMode }) => {
  const light = lightMode == undefined ? false : lightMode;

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const componentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (componentRef.current) {
      componentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const classWithLightMode = (clazz: string) => {
    return light ? `${clazz} light-mode` : clazz;
  }

  return (
    <div className="app-container">
      <div className={classWithLightMode("sidebar-container")}>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <div className={classWithLightMode(`sidebar ${isSidebarOpen ? 'open' : ''}`)}>
          <button className="sidebar-close" onClick={toggleSidebar}>
            &times;
          </button>
          {menu}
        </div>
      </div>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : 'hidden'}`} onClick={toggleSidebar}></div>
      <div ref={componentRef} className={classWithLightMode("content-container")}>{children}</div>
    </div>
  );
};

export default Sidebar;