import "../styles/Calendar.css";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import api from '../api';


function Calendar() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);  // To store all orders

  useEffect(() => {
    document.title = 'Calendar';
  


      const fetchPackages = async () => {
        try {
          // Fetch all packages
          const response = await api.get('/api/package/');
          const packages = response.data;
          console.log('Fetched packages:', packages);
      
          // Fetch the user's order history
          const orderResponse = await api.get('/api/user/order-history/');
          const userOrders = orderResponse.data.orders || []; // Default to empty array if no orders
          console.log('User orders:', userOrders);
      
          // Create a map of user orders by package ID for quick lookup
          const userOrdersMap = new Map(
            userOrders.map(order => [order.package_id, order.order_number])
          );
      
          // Map package delivery dates to FullCalendar event format
          const eventList = packages
            .filter(pkg => pkg.quantity > 0 || userOrdersMap.has(pkg.id)) // Include only available packages or user-registered ones
            .map(pkg => {
              const orderNumber = userOrdersMap.get(pkg.id); // Get the order number if it exists
              const isUserOrder = Boolean(orderNumber); // Check if the user has registered for this package
      
              return {
                title: isUserOrder ? `Order #${orderNumber}` : 'Order Pickup Day!',
                date: pkg.delivery_date,
                color: isUserOrder ? '#ac3fca' : '#28A745', // Use blue for user-specific orders, green for others
              };
            });
      
          console.log('Event list:', eventList);
      
          // Set the events in state
          setEvents(eventList);
        } catch (error) {
          console.error('Error fetching package details or user order history:', error.response || error.message);
        }
      };
      


  fetchPackages();
}, []);

const handleLogout = () => {
  localStorage.clear();
  navigate('/login');
};

  return (
    <div className="container">
      <header className="header">
        <img src="/care.png" alt="Care logo" className="top-left-img-calendar" />
      </header>

      <nav className="navbar-calendar">
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

      <div className="footer-calendar">
        <div className="footer-content-calendar">
          <div className="footer-column-calendar">
            <img src="/care.png" alt="Care logo" className="care-logo" />
            <img src="/poli.png" alt="Polytechnic University of Puerto Rico logo" className="university-logo" />
            <p>© {new Date().getFullYear()} CARE</p>
            <p>Founded by Polytechnic University of Puerto Rico students</p>
          </div>

          <div className="footer-column-calendar">
            <p className="highlight">A non-profit student organization providing support to students in need.</p>
            <p>To learn more about our initiatives or ask any questions, please visit our social media pages!</p>
          </div>
  
          <div className="footer-column-calendar">
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

export default Calendar;