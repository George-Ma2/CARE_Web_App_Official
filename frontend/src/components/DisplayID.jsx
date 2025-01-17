import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // Ensure this is correctly configured
import "../styles/StudentInfo.css";

function DisplayID() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Student Information";
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch the current user's profile directly
        const response = await api.get("api/profile");
        // Assuming response.data contains the logged-in user's information
        console.log("Current User Data:", response.data);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          navigate("/login"); // Redirect on unauthorized
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>No user data found.</p>;
  }

  // Check if profile exists and has photo_id
  const hasPhoto = userData.profile && userData.profile.photo_base64;


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
              onClick={() => navigate("/userdash/calendar")}
            >
              Calendar
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => navigate("/userdash/boxinfo")}
            >
              Box Information
            </button>
            <button
              className="btn btn-outline-success"
              type="button"
              onClick={() => navigate("/userdash/studentinfo")}
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
              <section className="id-section">
                <h2>Student ID</h2>
                <h1>Welcome, {userData.first_name}</h1>
                {hasPhoto ? (
                  <img
                    src={`data:image/jpeg;base64,${userData.profile.photo_base64}`}
                    alt="User Photo ID"
                    style={{
                      width: "450px",
                      height: "auto",
                      marginTop: "10px",
                      marginRight: "100px",
                      borderRadius: "30px",
                      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.3)",
                      border: "5px solid #004092",
                    }}
                  />
                ) : (
                  <h4>No photo uploaded.</h4>
                )}
              </section>
            </div>

            <div className="content-column">
              <div className="order-section">
                
                <form className="order-form">
                  <div className="order-summary">
                    <h3 className="summary-header">Order History:</h3>
                    <div className="summary-content">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="packageDate">Package Date:</label>
                          <input
                            type="text"
                            id="packageDate"
                            className="order-info"
                            placeholder="12/21/2024"
                            readOnly
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="orderPickUp">Order Picked Up:</label>
                          <input
                            type="text"
                            id="orderPickUp"
                            className="order-info"
                            placeholder="Yes/No"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
      <div class="footer">
  <div class="footer-content">
  
    <div class="footer-column">
      <img src="/care.png" alt="Care logo" class="care-logo" />
      <img src="/poli.png" alt="Polytechnic University of Puerto Rico logo" class="university-logo" />
      <p>© {new Date().getFullYear()} CARE</p>
      <p>Founded by Polytechnic University of Puerto Rico students</p>
    </div>

    <div class="footer-column">
      <p class="highlight">A non-profit student organization providing support to students in need.</p>
      <p>To learn more about our initiatives or ask any questions, please visit our social media pages!</p>
    </div>
 
    <div class="footer-column">
      <h2>Follow Us</h2>
      <ul class="social-links">
        
        <li><a href="https://www.instagram.com/care_pupr/" target="_blank">Instagram</a></li>
        <li><a href="https://www.linkedin.com/company/care-centro-de-apoyo-y-recursos-para-estudiantes/?viewAsMember=true" target="_blank">LinkedIn</a></li>
      </ul>
    </div>
  </div>
</div>

    </div>
    
  );
}

export default DisplayID;