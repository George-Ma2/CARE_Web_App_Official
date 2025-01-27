import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; 
import "../styles/StudentInfo.css";

function DisplayID() {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [photoId, setPhotoId] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Student Information";
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
       
        const profileResponse = await api.get("api/profile/");
        setUserData(profileResponse.data);

       
        const orderResponse = await api.get("api/user/order-history/");
        if (orderResponse.data.orders && orderResponse.data.orders.length > 0) {
          setOrders(orderResponse.data.orders); 
        } else {
          setOrders([]); 
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoId(file);
      setPreview(URL.createObjectURL(file));
      console.log("photo_id", file);
    }
  };

  const handleSubmitPhoto = async () => {
    const formData = new FormData();
    formData.append("photo_id", photoId); 

 
    for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
    }

    
    try {
       
        const response = await api.patch("api/profile/update/", formData);

        console.log("Response:", response.data);
        alert("Photo uploaded successfully!");

      
        setUserData({ ...userData, profile: { ...userData.profile, photo_base64: response.data.photo_id } });
    } catch (error) {
        console.error("Error uploading photo:", error);
        alert("There was an error uploading your photo.");
    }
};


  

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>No user data found.</p>;
  }

  
  const hasPhoto = userData.profile && userData.profile.photo_base64;
  return (
    <div className="container">
      <header className="header">
        <img src="/care.png" alt="Care logo" className="top-left-img-si" />
      </header>
  
      <nav className="navbar-si">
        <form className="form-inline">
          <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/userdash/calendar")}>
            Calendar
          </button>
          <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/userdash/boxinfo")}>
            Box Information
          </button>
          <button className="btn btn-outline-success" type="button" onClick={() => navigate("/userdash/studentinfo")}>
            Student Info
          </button>
          <button className="btn btn-outline-secondary" type="button" onClick={() => navigate('/userdash/ordercart')}>
            View Cart
          </button>
          <button className="btn btn-logout-btn" type="button" onClick={handleLogout}>
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
                <h1>Welcome, {userData.first_name || "Guest"}</h1>
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
                  <div>
                    <h4>No photo uploaded.</h4>
                  </div>
                )}
              </section>
            </div>
  
            <div className="content-column">
              <div className="order-section">
                {orders.length > 0 ? (
                  <div className="order-table-container">
                    <table className="order-table">
                      <thead>
                        <tr>
                          <th colSpan="3" className="order-header">Order History</th>
                        </tr>
                        <tr>
                          <th>Ordered On</th>
                          <th>Scheduled Pickup Date</th>
                          <th>Order Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => (
                          <tr key={index}>
                            <td>{order.order_date}</td>
                            <td>{order.delivery_date}</td>
                            <td>{order.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="order-table-container2">
                    <table className="order-table2">
                      <thead>
                        <tr>
                          <th className="order-header" colSpan="1">Order History</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>No order history found. Try placing an order!</td>
                        </tr>
              
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
  
      <div className="footer-si">
        <div className="footer-content-si">
          <div className="footer-column-si">
            <img src="/care.png" alt="Care logo" className="care-logo" />
            <img src="/poli.png" alt="Polytechnic University of Puerto Rico logo" className="university-logo" />
            <p>© {new Date().getFullYear()} CARE</p>
            <p>Founded by Polytechnic University of Puerto Rico students</p>
          </div>
  
          <div className="footer-column-si">
            <p className="highlight">
              A non-profit student organization providing support to students in need.
            </p>
            <p>
              To learn more about our initiatives or ask any questions, please visit our social
              media pages!
            </p>
          </div>
  
          <div className="footer-column-si">
            <h2>Follow Us</h2>
            <ul className="social-links">
              <li>
                <a href="https://www.instagram.com/care_pupr/" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/company/care-centro-de-apoyo-y-recursos-para-estudiantes/?viewAsMember=true" target="_blank" rel="noopener noreferrer">
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
