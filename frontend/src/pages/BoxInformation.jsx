import "../styles/BoxInformation.css";
import "../styles/Box.css";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api"; // Ensure this is correctly configured

function BoxInformation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState({
    packageDate: '',
    pickupLocation: '',
    packageContents: '',
  });

  useEffect(() => {
    document.title = 'Box Information';
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const [isModalOpen, setIsModalOpen] = useState(false); // Manage modal visibility

  const openModal = () => {
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  function formatContents(contents) {
    if (contents.length === 0) return ''; // Handle empty array
    if (contents.length === 1) return contents[0]; // Single item
    if (contents.length === 2) return contents.join(' and '); // Two items
    return `${contents.slice(0, -1).join(', ')}, and ${contents[contents.length - 1]}`; // Three or more items
  }
  
  const fetchOrderDetails = async () => {
  
    try {
      const response = await api.get("api/package");
      const { issue_date, pickup_location, contents } = response.data;
      setOrderInfo({
        packageDate: issue_date,
        pickupLocation: pickup_location,
        packageContents: formatContents(contents)
      });
    } catch (error) {
      console.error("Error fetching package details:", error.response?.data || error.message);
      setOrderInfo({
        packageDate: 'Error',
        pickupLocation: 'Error',
        packageContents: 'Error',
      });
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } 
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
                    <button onClick={openModal} className="box-button">
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
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="packageDate">Package Date:</label>
                          <input
                            type="text"
                            id="packageDate"
                            className="order-date-textarea"
                            value={orderInfo.packageDate}
                            readOnly
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="pickupLocation">Pick-up Location:</label>
                          <input
                            type="text"
                            id="pickupLocation"
                            className="pickup-location-textarea"
                            value={orderInfo.pickupLocation}
                            readOnly
                          />
                        </div>
                      </div>
                      <label htmlFor="packageContents">Package Contents:</label>
                      <textarea
                        id="packageContents"
                        className="package-contents-textarea"
                        value={orderInfo.packageContents}
                        readOnly
                        rows={Math.max(3, orderInfo.packageContents.split(', ').length)} // Dynamically adjusts rows
                        style={{ resize: "none" }} // Prevents manual resizing by the user
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
       
      {/* Modal */}
      <div className={`modal ${isModalOpen ? 'show' : ''}`}>
        <div className="modal-content">
          <h2>Package Details</h2>
          <p><strong>Package Date:</strong> {orderInfo.packageDate}</p>
          <p><strong>Pick-up Location:</strong> {orderInfo.pickupLocation}</p>
          <p><strong>Package Contents:</strong> {orderInfo.packageContents}</p>
          <button onClick={closeModal}>Close</button>
        </div>
      </div>
    </div>
  );
}
export default BoxInformation;