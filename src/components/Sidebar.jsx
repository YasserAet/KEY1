import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Project Navigator</h3>
      </div>
      
      <ul className="sidebar-menu">
        <li>
          <Link to="/" className="menu-item">
            <span className="icon">🏠</span>
            <span>360° Map</span>
          </Link>
        </li>
        <li>
          <Link to="/cyclorama" className="menu-item">
            <span className="icon">🔄</span>
            <span>Cyclorama</span>
          </Link>
        </li>
        <li>
          <Link to="/location" className="menu-item">
            <span className="icon">📍</span>
            <span>Location</span>
          </Link>
        </li>
        <li>
          <Link to="/projects" className="menu-item">
            <span className="icon">🏢</span>
            <span>Projects (3D Tower)</span>
          </Link>
        </li>
      </ul>
      
      <div className="sidebar-footer">
        <p>© 2023 Residential Tower</p>
      </div>
    </div>
  );
};

export default Sidebar;
