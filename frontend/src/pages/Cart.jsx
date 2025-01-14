import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";
import { useAppContext } from '../AppContext';

function Cart() {
  const { selectedPackage } = useAppContext();
  const navigate = useNavigate();
  const [isTermsAccepted1, setIsTermsAccepted1] = useState(false);
  const [isTermsAccepted2, setIsTermsAccepted2] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    document.title = "Cart";
    console.log("selectedPackage:", selectedPackage);

    // Load the selected package into the cart
    if (selectedPackage) {
      setCartItems([
        {
          name: "Care Package",
          contents: selectedPackage.contents || ["Item 1", "Item 2", "Item 3"], // Replace with actual contents
        },
      ]);
    }
  }, [selectedPackage]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isOrderComplete = isTermsAccepted1 && isTermsAccepted2;

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
            className="btn btn-outline-success"
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

      <main className="cart-container">
        <h1 className="page-title">Your Cart</h1>

        <table className="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Contents</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>
                  <ul>
                    {item.contents.map((content, idx) => (
                      <li key={idx}>{content}</li>
                    ))}
                  </ul>
                </td>
                <td>1</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="terms-section">
          <h2>Terms and Conditions</h2>
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={isTermsAccepted1}
              onChange={(e) => setIsTermsAccepted1(e.target.checked)}
            />
            I will pick up the package within the date established. If I do not send prior notice, I accept I may not receive my reserved box.
          </label>
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={isTermsAccepted2}
              onChange={(e) => setIsTermsAccepted2(e.target.checked)}
            />
            I understand donations are limited, and certain items may not be available for my personal box once the order is received.
          </label>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate("/userdash")}
          >
            Continue Shopping
          </button>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!isOrderComplete}
            onClick={() => alert("Order completed!")}
          >
            Complete Order
          </button>
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

export default Cart;