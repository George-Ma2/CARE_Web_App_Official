import { jwtDecode } from "jwt-decode";

import "../styles/StudentInfo.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // Ensure this is correctly configured
import { ACCESS_TOKEN } from "../constants";

function DisplayID() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Student Information";
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN); // Retrieve the token
        if (!token) {
          console.error("No token found in localStorage");
          navigate('/login');
          return;
        }

        // Decode the token to get the user information (e.g., username or ID)
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        const user_id = decodedToken.user_id; // Assuming your token includes user_id
        console.log("Logged-in User ID:", user_id);

        // Fetch all users
        const response = await api.get("api/profile/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("All Users Data:", response.data);

        // Find the currently logged-in user from the list
        const currentUser = response.data.find(user => user.id === user_id);
        if (!currentUser) {
          console.error("Current user not found in the list of users");
          return;
        }

        setUserData(currentUser);
      } catch (error) {
        console.error("Error fetching user data:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          navigate('/login'); // Redirect on unauthorized
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>No user data found.</p>;
  }

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
                <h2>Student ID</h2>
                <h1>Welcome, {userData.username}</h1>
                  {userData.profile.photo_id ? (
                  <img
                    src={userData.profile.photo_id}
                    alt="User Photo ID"
                    style={{
                      width: "500px",
                      height: "auto",
                      marginTop: "10px",
                      marginRight: "100px",
                      borderRadius: "30px", // Increases rounding of the corners
                      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.3)", // Makes the shadow more noticeable
                      border: "5px solid #004092" // Adds a thick blue border
                    }}
                  />
                ) : (
                  <p>No photo uploaded.</p>
                )}
              </section>
            </div>

            <div className="content-column">
              <div className="order-section">
                <div className="divider"></div>
                <form className="order-form">
                  <div className="order-summary">
                    <h3 className="summary-header">Order History:</h3>
                    <div className="summary-content">
                      <p className="package-info">1x CARE Weekly Box FREE</p>
                      <p className="pickup-location">Pick-up @ IDEA Center</p>
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

export default DisplayID;