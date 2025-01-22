import "../styles/BoxInformation.css";
import "../styles/Box.css";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api"; // Ensure this is correctly configured
import { useAppContext } from '../AppContext';


function BoxInformation() {
  const { setSelectedPackage } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState({
    packageDate: "", // Initialize packageDate
    pickupLocation: "",
    packageContents: "",
  });
  const [availablePackages, setAvailablePackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Box Information";
  }, []);

 
  
  const openModal = () => {
    setIsModalOpen(true); // Open the modal
    fetchAvailablePackages(orderInfo.packageDate); // Pass the issue date to fetch available packages
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  const fetchAvailablePackages = async (createDate) => {
    createDate = null;
    try {
        console.log("Create date: ", createDate);
        // If createDate is not provided, fetch the oldest package date from the backend
        if (!createDate) {
            const dateResponse = await api.get("/api/care-packages/oldest-package-date/");
            createDate = dateResponse.data.oldest_date;
            console.log("Create date:", createDate);
        }

        if (!createDate) {
            console.error("No valid create date found.");
            return; // Stop execution if no date is available
        }

        // Extract only the date portion
        const formattedDate = new Date(createDate).toISOString().slice(0, 10);
        
        // Fetch available packages for the given date
        const response = await api.get(`/api/care-packages/same-create-date/?create_date=${formattedDate}`);
        console.log("Initial response:", response.data);

        // Filter out packages with quantity 0
        const filteredPackages = response.data.filter(pkg => pkg.quantity > 0); 
        console.log("Filtered packages:", filteredPackages);
        setAvailablePackages(filteredPackages); // Update state with the filtered response data
    } catch (error) {
        console.error("Error fetching available packages:", error.response?.data || error.message);
    }
};


const handlePackageSelect = (pkg) => {
  setSelectedPackage(pkg);
  console.log("Package INFO:", pkg);

  setOrderInfo({
    packageDate: pkg.delivery_date,
    pickupLocation: pkg.pickup_location,
    packageContents: formatContents(pkg.contents || [])
  });
  console.log("Order:", orderInfo);
  setIsModalOpen(false);
};



   
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

 

  function formatContents(contents) {
    if (contents.length === 0) return ''; // Handle empty array
    return contents.map(item => `${item.item_name}: ${item.quantity}`).join(', '); // Join item names and quantities
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
            <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => navigate('/userdash/ordercart')}
          >
            View Cart
          </button>
        
          
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
            
              <div className="order-section">
             
                <form className="order-form">
                  <div className="order-summary">
                    <h3 className="summary-header">Package Details:</h3>
                    <div className="summary-content">
                      <div className="form-row">

                        <div className="form-group">                       
                          <label class="pickupLocation" htmlFor="pickupLocation">Pickup Location:</label>
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
                      <div className="form-row">                       
                      <div className="form-group">
                          <label htmlFor="deliveryDate">Order Pickup Day:</label>
                          <input
                            type="text"
                            id="deliveryDate"
                            className="order-date-textarea"
                            value={orderInfo.packageDate}
                            readOnly
                          />
                        </div>
                        </div>  
                    </div>
                  </div>
                  
                  <button className="reserve-button" onClick={() => navigate('/userdash/ordercart')}>
                    Reserve My Box
                  </button>
                </form>
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
                {availablePackages.length > 0 ? (
                    availablePackages.map((pkg, index) => {
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
                    })
                  ) : (
                    <p>No packages available at this time.</p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
        <div className="footer">
  <div className="footer-content">
  
    <div className="footer-column">
      <img src="/care.png" alt="Care logo" className="care-logo" />
      <img src="/poli.png" alt="Polytechnic University of Puerto Rico logo" className="university-logo" />
      <p>© {new Date().getFullYear()} CARE</p>
      <p>Founded by Polytechnic University of Puerto Rico students</p>
    </div>

    <div className="footer-column">
      <p className="highlight">A non-profit student organization providing support to students in need.</p>
      <p>To learn more about our initiatives or ask any questions, please visit our social media pages!</p>
    </div>
 
    <div className="footer-column">
      <h2>Follow Us</h2>
      <ul className="social-links">
        
        <li><a href="https://www.instagram.com/care_pupr/profilecard/?igsh=d3pqdXZra3cwcmEz" target="_blank">Instagram</a></li>
        <li><a href="https://www.linkedin.com/company/care-centro-de-apoyo-y-recursos-para-estudiantes/?viewAsMember=true" target="_blank">LinkedIn</a></li>
      </ul>
    </div>
  </div>
</div>
    </div>



  );
}

export default BoxInformation;