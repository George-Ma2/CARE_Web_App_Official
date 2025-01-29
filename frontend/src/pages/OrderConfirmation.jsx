import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrderConfirmation.css";
import api from "../api"; 

function OrderConfirmation() {
  const [userData, setUserData] = useState(null);
  const [orderData, setOrderData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Order Confirmation";

    const fetchOrderConfirmationData = async () => {
      try {

        const profileResponse = await api.get("api/profile/");
        setUserData(profileResponse.data);
        console.log("User:", profileResponse.data);


        const orderResponse = await api.get("api/order-receipt/");  
        console.log("Order Data:", orderResponse.data);

        if (orderResponse.data) {
          setOrderData(orderResponse.data);
        } else {
          setOrderData(null);
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

    fetchOrderConfirmationData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (

      <div className="container">
      <header className="header">
        <img src="/care.png" alt="Care logo" className="top-left-img-oc" />
      </header>

      <nav className="navbar-oc">
        <form className="form-inline">
        
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => navigate('/userdash/calendar')}
          >
            Calendar
          </button>
          <button
            className="btn btn-outline-secondary"
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
            onClick={handleLogout}>
            Logout
          </button>
        </form>
      </nav>

      <div className="receipt-container">
        <h2>Order Confirmation</h2>
        {userData ? (
          <div className="user-info">
            <h3>Your Information</h3>
            <p>
              <strong>Name:</strong> {userData.first_name} {userData.last_name}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
          </div>
        ) : (
          <div className="user-info">
            <p>Unable to load user information.</p>
          </div>
        )}

        {orderData ? (
          <div className="order-details">
            <h3>Order Summary</h3>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Pickup Location</th>
                  <th>Contents</th>
                  <th>Pickup Date</th>
                  <th>Quantity</th>
                  <th>Ordered on</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{orderData.order_details.status}</td>
                  <td>{orderData.package_description}</td>
                  <td>{orderData.product_names.join(", ")}</td>
                  <td>{orderData.delivery_date}</td>
                  <td>1</td>
                  <td>{formatDate(orderData.order_details.order_date)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="order-details">
            <p>Unable to load order details.</p>
          </div>
        )}

        <div className="order-total">
          <h3>Total Amount</h3>
          <p>Free</p>
        </div>
      </div>

      <div className="footer-oc">
        <div className="footer-content-oc">
          <div className="footer-column-oc">
            <img src="/care.png" alt="Care logo" className="care-logo" />
            <img src="/poli.png" alt="Polytechnic University of Puerto Rico logo" className="university-logo" />
            <p>© {new Date().getFullYear()} CARE</p>
            <p>Founded by Polytechnic University of Puerto Rico students</p>
          </div>

          <div className="footer-column-oc">
            <p className="highlight">A non-profit student organization providing support to students in need.</p>
            <p>To learn more about our initiatives or ask any questions, please visit our social media pages!</p>
          </div>
  
          <div className="footer-column-oc">
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

export default OrderConfirmation;
