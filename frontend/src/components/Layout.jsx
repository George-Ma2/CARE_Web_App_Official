import "../styles/Layout.css";
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminNavbar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Function to determine active button styles
  const isActive = (path) => location.pathname === path ? 'btn btn-primary' : 'btn btn-outline-secondary';

  return (
    <div className="container full-height">
      <header className="header">
        <img src="/care.png" alt="Care logo" className="top-left-img" />
      </header>

      <nav className="navbar">
        <form className="form-inline">
          <button
            className={isActive('/admin/dashboard')}
            type="button"
            onClick={() => navigate('/admin/dashboard')}
          >
            Dashboard
          </button>
          <button
            className={isActive('/admin/inventory')}
            type="button"
            onClick={() => navigate('/admin/inventory')}
          >
            Inventory
          </button>
          <button
            className={isActive('/admin/care-package')}
            type="button"
            onClick={() => navigate('/admin/care-package')}
          >
            Box Creation
          </button>
          {/* Add more buttons as needed */}
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
