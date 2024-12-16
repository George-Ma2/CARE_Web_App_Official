import "../styles/BoxInformation.css";
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


function BoxInformation() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Box Information';
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
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
            onClick={handleLogout}>
            Logout
          </button>
      
        </form>
      </nav>

      <div class="student-dashboard">
 
  
  <main class="main-content">
    <div class="content-grid">
      <div class="content-column">
        <section class="box-section">
          <h2>Box Content</h2>
          <div class="box-preview"></div>
        </section>
      </div>
      
      <div class="content-column">
        <div class="order-section">
          <div class="divider"></div>
          <form class="order-form">
            <div class="order-summary">
              <h3 class="summary-header">Order Summary:</h3>
              <div class="summary-content">
                <p class="package-info">1x CARE Weekly Box FREE</p>
                <p class="pickup-location">Pick-up @ IDEA Center</p>
                
                <div class="checkbox-group">
                  <input type="checkbox" id="pickup-agreement" class="checkbox" required />
                  <label for="pickup-agreement" class="checkbox-label">
                    By clicking, I ensure I will pick up the package within the date established. If I do not send prior notice, I accept I may not receive my reserved box. Certain exceptions may be made with prior notice.
                  </label>
                </div>
                
                <div class="checkbox-group">
                  <input type="checkbox" id="availability-agreement" class="checkbox" required />
                  <label for="availability-agreement" class="checkbox-label">
                    I also understand that donations are limited and boxes will be prepared on a rolling basis. Certain items may not be available for my personal box once the order is recieved.
                  </label>
                </div>
              </div>
            </div>
            <button type="submit" class="submit-button">Register my order!</button>
          </form>
        </div>
      </div>
    </div>
  </main>
</div>

    </div>
  );
}

export default BoxInformation;
