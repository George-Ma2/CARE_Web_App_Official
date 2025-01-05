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

    </div>
  );
}

export default Calendar;
