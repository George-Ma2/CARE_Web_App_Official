import "../styles/Calendar.css";
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

function Calendar() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Calendar';
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const events = [
    {
      title: '4th Package Drop!',
      date: '2024-12-19'
    },
    {
      title: 'Christmas!',
      date: '2024-12-25'
    }
  ];

  return (
    <div className="container">
      <header className="header">
        <img src="/care.png" alt="Care logo" className="top-left-img" />
      </header>

      <nav className="navbar">
        <form className="form-inline">
        
          <button
            className="btn btn-outline-success"
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

      <main className="main-content1">
      <section className="section">
        <h2>Calendar</h2>
        <p>Check out when and where our next drop will take place! Remember to reserve your package!</p>
        <p>- From CARE</p>
      </section>

      <div className="calendar">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
        />
      </div>
    </main>
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
        
        <li><a href="https://www.instagram.com/care_pupr/profilecard/?igsh=d3pqdXZra3cwcmEz" target="_blank">Instagram</a></li>
        <li><a href="https://www.linkedin.com/company/care-centro-de-apoyo-y-recursos-para-estudiantes/?viewAsMember=true" target="_blank">LinkedIn</a></li>
      </ul>
    </div>
  </div>
</div>


    </div>
  );
}

export default Calendar;