import "../styles/BoxInformation.css";
import "../styles/Box.css";
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BoxInformation() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Box Information';
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Function to fetch order details from the database
  const fetchOrderDetails = async () => {
    // Example API endpoint - replace with your actual backend endpoint
    const response = await fetch('/api/get-order-details');
    const data = await response.json();
    setOrderInfo({
      packageName: data.packageName,
      pickupLocation: data.pickupLocation,
    });
  };

  return (
    <div className="container">
      <header className="header">
        <img src="/care.png" alt="Care logo" className="top-left-img" />
      </header>

      <nav className="navbar">
        <form className="form-inline">
          <div className="left-content">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => navigate('/userdash/calendar')}
            >
              Calendar
            </button>

            <button
              className="btn btn-outline-success"
              type="button"
              onClick={() => navigate('/userdash/boxinfo')}
            >
              Box Information
            </button>

            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => navigate('/userdash/studentinfo')}
            >
              Student Info
            </button>
          </div>
          
          <button
            className="btn btn-logout-btn"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </form>
      </nav>

      <div className="student-dashboard">
        <main className="main-content">
          <div className="content-grid">
            <div className="content-column">
              <section className="box-section">
                <h2>Box Content</h2>
                <div id="logo">
                  <div className="box">
                    <div className="side front"></div>
                    <div className="side left"></div>
                    <div className="side back"></div>
                    <div className="side right"></div>
                    <div className="side bottom"></div>
                    <div className="flap front"></div>
                    <div className="flap back"></div>
                    <div className="flap left"></div>
                    <div className="flap right"></div>

                    {/* Update to use onClick for React */}
                    <button className="box-button" onClick={fetchOrderDetails}>
                      View Goodies!
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <div className="content-column">
              <div className="order-section">
                <div className="divider"></div>
                <form className="order-form">
                  <div className="order-summary">
                  <h3 className="summary-header">Package Details:</h3>
                    <div className="summary-content">
                      <label htmlFor="packageDate">Package Date:</label>
                      <input
                        type="text"
                        id="packageDate"
                        className="order-info"
                        placeholder = "12/21/2024"
                        value={""}
                        readOnly
                      />
                      <label htmlFor="pickupLocation">Pick-up Location:</label>
                      <input
                        type="text"
                        id="pickupLocation"
                        className="order-info"
                        placeholder = "Oficina CARE"
                        value={""}
                        readOnly
                      />

                      <label htmlFor="packageContents">Package Contents:</label>
                      <input
                        type="text"
                        id="packageContents"
                        className="order-info"
                        placeholder = "A list of products included within the package."
                        value={""}
                        readOnly
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


export default BoxInformation;

