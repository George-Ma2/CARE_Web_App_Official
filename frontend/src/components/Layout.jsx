import "../styles/Layout.css";
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="container full-height">
      <header className="header">
        <img src="/care.png" alt="Care logo" className="top-left-img" />
      </header>

      <nav className="navbar">
        <form className="form-inline">
          <button
            className="btn btn-outline-success"
            type="button"
            onClick={() => navigate('/admin/dashboard')}
          >
            Dashboard
          </button>
          <button
          
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => navigate('/admin/inventory')}
          >
            Inventory
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => navigate('/admin/care-package')}
          >
            Box Creation
          </button>
          {/* <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => navigate('/admin/care-package')}
          >
            Manage Users
          </button> */}
          <button
            className="btn btn-logout-btn"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </form>
      </nav>
      <div className="container mt-4">{children}</div>
    </div>
  );
};

export default AdminNavbar;
