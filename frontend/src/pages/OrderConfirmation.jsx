import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrderConfirmation.css";
import api from "../api"; // Ensure this is correctly configured

function OrderConfirmation() {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Order Confirmation";

    const fetchUserData = async () => {
      try {
        // Fetch the current user's profile
        const profileResponse = await api.get("api/profile/");
        setUserData(profileResponse.data);
        console.log("User:", profileResponse.data);


      // Fetch the order history
      const orderResponse = await api.get("api/user/order-history/");
      if (orderResponse.data.orders && orderResponse.data.orders.length > 0) {
        // Sort orders by date (assuming 'orderDate' or 'createdAt' is the date field)
        const sortedOrders = orderResponse.data.orders.sort(
          (a, b) => new Date(b.order_date) - new Date(a.order_date)
        );
        // Set only the most recent order
        setOrders([sortedOrders[0]]);
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
    return <div>Loading...</div>;
  }

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
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => navigate("/userdash/studentinfo")}
          >
            Student Info
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => navigate("/userdash/ordercart")}
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
            {orders.map((order, index) => (
                          <tr key={index}>
                            <td>{order.status}</td>
                            <td>{order.status}</td>
                            <td>{order.status}</td>
                            <td>{order.delivery_date}</td>
                            <td>{order.status}</td>
                            <td>{order.order_date}</td>
                          </tr>
                        ))}
            </tbody>
          </table>
        </div>
        <div className="order-total">
          <h3>Total Amount</h3>
          <p>Free</p>
        </div>
      </div>

      <div className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <img src="/care.png" alt="Care logo" className="care-logo" />
            <img
              src="/poli.png"
              alt="Polytechnic University of Puerto Rico logo"
              className="university-logo"
            />
            <p>© {new Date().getFullYear()} CARE</p>
            <p>Founded by Polytechnic University of Puerto Rico students</p>
          </div>
          <div className="footer-column">
            <p className="highlight">
              A non-profit student organization providing support to students in
              need.
            </p>
            <p>
              To learn more about our initiatives or ask any questions, please
              visit our social media pages!
            </p>
          </div>
          <div className="footer-column">
            <h2>Follow Us</h2>
            <ul className="social-links">
              <li>
                <a
                  href="https://www.instagram.com/care_pupr/profilecard/?igsh=d3pqdXZra3cwcmEz"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/care-centro-de-apoyo-y-recursos-para-estudiantes/?viewAsMember=true"
                  target="_blank"
                  rel="noreferrer"
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

export default OrderConfirmation;
