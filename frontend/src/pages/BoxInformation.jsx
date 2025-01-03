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
  const [availablePackages, setAvailablePackages] = useState([]); // Store available packages
  const [selectedPackage, setSelectedPackage] = useState(null); // Store the selected package
  const [isModalOpen, setIsModalOpen] = useState(false); // Manage modal visibility

  useEffect(() => {
    document.title = 'Box Information';
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get("api/package"); // Fetch a single package detail
      const { issue_date, pickup_location, contents } = response.data;
      setOrderInfo({
        packageDate: issue_date,
        pickupLocation: pickup_location,
        packageContents: formatContents(contents),
      });
      fetchAvailablePackages(issue_date); // Fetch packages with the same issue date
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

  const fetchAvailablePackages = async (issueDate) => {
    try {
      const response = await api.get(`api/packages/same-issue-date/?issue_date=${issueDate}`); 
      setAvailablePackages(response.data); // Set the available packages
    } catch (error) {
      console.error("Error fetching available packages:", error.response?.data || error.message);
    }
  };

  const handlePackageSelect = (pkg) => {
    // Update the orderInfo with the selected package details
    console.log("Package details:", pkg);
    setOrderInfo({
      packageDate: pkg.issue_date, // Assuming the package has these fields
      pickupLocation: pkg.pickup_location,
      packageContents: formatContents(pkg.contents)
    });

    // Close the modal after selection
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const openModal = () => {
    setIsModalOpen(true); // Open the modal
    fetchAvailablePackages(orderInfo.packageDate); // Pass the issue date to fetch available packages
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

  // Disable background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'; // Disable background scroll
    } else {
      document.body.style.overflow = 'auto'; // Re-enable background scroll
    }
  }, [isModalOpen]);

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
                       // rows={Math.max(3, orderInfo.packageContents.split(', ').length)} // Dynamically adjusts rows
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
      {isModalOpen && (
        <div className="modal fade show" id="exampleModalCenter" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">Available Packages</h5>
              </div>
              <div className="modal-body">
                <p>Click on a button to select a box and see what it contains!</p>
                <div className="package-list">
                  {availablePackages.map((pkg, index) => {
                    // Generate the letter (A, B, C, ...) based on the index
                    const boxLabel = String.fromCharCode(65 + index); // 65 is the ASCII code for 'A'

                    // Define an array of colors to be used for the buttons
                    const colors = ['#F6C932', '#174bda', '#d90f13', '#FFD700', '#8A2BE2']; // Example colors

                    // Assign a color based on the index
                    const buttonColor = colors[index % colors.length]; // Modulo ensures it loops through the colors if there are more boxes than colors

                    return (
                      <button
                        key={index}
                        onClick={() => handlePackageSelect(pkg)} // Close modal and update order info
                        className="package-button"
                        style={{ backgroundColor: buttonColor }}
                      >
                        <strong>Box {boxLabel}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoxInformation;
