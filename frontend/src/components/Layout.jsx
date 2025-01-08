import React from 'react';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
      {/* <header className="header">
        <img src="/care.png" alt="Care logo" className="top-left-img" />
      </header> */}
        <div className="container">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => navigate('/admin/inventory')}
                >
                  Inventory
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => navigate('/admin/boxcreation')}
                >
                  Box Creation
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="container mt-4">{children}</div>
    </div>
  );
};

export default Layout;


