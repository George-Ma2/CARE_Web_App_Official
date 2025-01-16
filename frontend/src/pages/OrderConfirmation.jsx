import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function OrderConfirmation() {

  const navigate = useNavigate();


  useEffect(() => {
    document.title = "Order Confirmation";
  });

  

  return (
    <div className="container">
      <header className="header">
        <img src="/care.png" alt="Care logo" className="top-left-img" />
      </header>

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


export default OrderConfirmation;