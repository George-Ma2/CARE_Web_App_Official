import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // Ensure this is correctly configured
import "../styles/StudentInfo.css";

function DisplayID() {
  const [userData, setUserData] = useState(null);
  const [orderDate, setOrderDate] = useState(null);
  const [status, setStatus] = useState(null);
  const [delivery_date, setDelivery] = useState(null);    
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);  // To store all orders

  const navigate = useNavigate();


  useEffect(() => {
    document.title = "Student Information";
  }, []);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch the current user's profile
        const profileResponse = await api.get("api/profile/");
        setUserData(profileResponse.data);
  
        // Fetch the order history
        const orderResponse = await api.get("api/user/order-history/");
        if (orderResponse.data.orders && orderResponse.data.orders.length > 0) {
          setOrders(orderResponse.data.orders); // Set all orders in state
        } else {
          setOrders([]); // If no orders found, set an empty array
        }
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          navigate("/login");
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
                <h1>Welcome, {userData.first_name ? userData.first_name : "Guest"}</h1>
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
                    {orders.length > 0 ? (
                      orders.map((order, index) => (
                        <div className="form-row" key={index}>
                          <div className="form-group">
                            <label htmlFor={`orderedOn-${index}`}>Ordered On:</label>
                            <input
                              type="text"
                              id={`orderedOn-${index}`}
                              className="order-info"
                              value={order.order_date}
                              readOnly
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`deliveryDate-${index}`}>
                              Scheduled Delivery Date:
                            </label>
                            <input
                              type="text"
                              id={`deliveryDate-${index}`}
                              className="order-info"
                              value={order.delivery_date}
                              readOnly
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`orderStatus-${index}`}>Order Picked Up:</label>
                            <input
                              type="text"
                              id={`orderStatus-${index}`}
                              className="order-info"
                              value={order.status}
                              readOnly
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No order history found</p>
                    )}
                  </div>


                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
      <div className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <img src="/care.png" alt="Care logo" className="care-logo" />
            <img src="/poli.png" alt="Polytechnic University of Puerto Rico logo" className="university-logo" />
            <p>© {new Date().getFullYear()} CARE</p>
            <p>Founded by Polytechnic University of Puerto Rico students</p>
          </div>

          <div className="footer-column">
            <p className="highlight">
              A non-profit student organization providing support to students in need.
            </p>
            <p>
              To learn more about our initiatives or ask any questions, please visit our social
              media pages!
            </p>
          </div>

          <div className="footer-column">
            <h2>Follow Us</h2>
            <ul className="social-links">
              <li>
                <a href="https://www.instagram.com/care_pupr/" target="_blank">
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/care-centro-de-apoyo-y-recursos-para-estudiantes/?viewAsMember=true"
                  target="_blank"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisplayID;