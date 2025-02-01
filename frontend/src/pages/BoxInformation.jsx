import "../styles/BoxInformation.css";
import "../styles/Box.css";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api"; 
import { useAppContext } from '../AppContext';


function BoxInformation() {
  const { setSelectedPackage } = useAppContext();
  const [reserve, setReserve] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState({
    packageDate: "", 
    pickupLocation: "",
    packageContents: "",
  });
  const [availablePackages, setAvailablePackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Box Information";
  }, []);

 
  
  const openModal = () => {
    setIsModalOpen(true); 
    fetchAvailablePackages(orderInfo.packageDate); 
  };

  const closeModal = () => {
    setIsModalOpen(false); 
  };

  const fetchAvailablePackages = async (createDate) => {
    createDate = null;
    try {
        console.log("Create date: ", createDate);
     
        if (!createDate) {
            const dateResponse = await api.get("/api/care-packages/oldest-package-date/");
            createDate = dateResponse.data.oldest_date;
            console.log("Create date:", createDate);
        }

        if (!createDate) {
            console.error("No valid create date found.");
            return; 
        }

    
        const formattedDate = new Date(createDate).toISOString().slice(0, 10);
        
      
        const response = await api.get(`/api/care-packages/same-create-date/?create_date=${formattedDate}`);
        console.log("Initial response:", response.data);
        console.log("Formatted date:", formattedDate);
     
        const filteredPackages = response.data.filter(pkg => pkg.quantity > 0); 
        console.log("Filtered packages:", filteredPackages);
        setAvailablePackages(filteredPackages); 
    } catch (error) {
        console.error("Error fetching available packages:", error.response?.data || error.message);
    }
};


const handlePackageSelect = (pkg) => {
  
  console.log("Package INFO:", pkg);

  setOrderInfo({
    packageDate: pkg.delivery_date,
    pickupLocation: pkg.pickup_location,
    packageContents: formatContents(pkg.contents || [])
  });
  console.log("Order:", orderInfo);
  setIsModalOpen(false);
  setReserve(pkg);
};



   
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

 

  function formatContents(contents) {
    if (contents.length === 0) return '';
    return contents.map(item => `${item.item_name}: ${item.quantity}`).join(', '); }
  


  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'auto'; 
    }
  }, [isModalOpen]);

  return (
    <div className="container">
      <header className="header">
        <img src="/care.png" alt="Care logo" className="top-left-img-bi" />
      </header>

      <nav className="navbar-bi">
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
                        style={{ resize: "none" }} 
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
                      <button
                        className="reserve-button"
                        onClick={() => {
                          setSelectedPackage(reserve); 
                          navigate('/userdash/ordercart'); 
                        }}
                      >
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
                   
                      const boxLabel = String.fromCharCode(65 + index);

                    
                      const colors = ['#F6C932', '#174bda', '#d90f13', '#FFD700', '#8A2BE2']; 

          
                      const buttonColor = colors[index % colors.length]; 

                      return (
                        <button
                          key={index}
                          onClick={() => handlePackageSelect(pkg)} 
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

      <div className="footer-bi">
        <div className="footer-content-bi">
        
          <div className="footer-column-bi">
            <img src="/care.png" alt="Care logo" className="care-logo" />
            <img src="/poli.png" alt="Polytechnic University of Puerto Rico logo" className="university-logo" />
            <p>© {new Date().getFullYear()} CARE</p>
            <p>Founded by Polytechnic University of Puerto Rico students</p>
          </div>

          <div className="footer-column-bi">
            <p className="highlight">A non-profit student organization providing support to students in need.</p>
            <p>To learn more about our initiatives or ask any questions, please visit our social media pages!</p>
          </div>
      
          <div className="footer-column-bi">
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