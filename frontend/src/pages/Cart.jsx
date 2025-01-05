import "../styles/Cart.css";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const navigate = useNavigate();
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  useEffect(() => {
    document.title = 'Cart';
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleTermsChange = (event) => {
    setIsTermsAccepted(event.target.checked);
  };

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
            className="btn btn-outline-success"
            type="button"
            onClick={() => navigate('/userdash/ordercart')}
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
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sample Product 1</td>
              <td>2</td>
              <td>$20.00</td>
              <td>$40.00</td>
            </tr>
            <tr>
              <td>Sample Product 2</td>
              <td>1</td>
              <td>$15.00</td>
              <td>$15.00</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="text-right">Total:</td>
              <td>$55.00</td>
            </tr>
          </tfoot>
        </table>

        <div className="terms-section">
          <h2>Terms and Conditions</h2>
          <p>
            By completing this order, you agree to the terms and conditions outlined
            in our policy, including payment, refunds, and product usage.
          </p>
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={isTermsAccepted}
              onChange={handleTermsChange}
            />
            I agree to the terms and conditions.
          </label>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate('/userdash')}
          >
            Continue Shopping
          </button>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!isTermsAccepted}
            onClick={() => alert('Order completed!')}
          >
            Complete Order
          </button>
        </div>
      </main>
    </div>
  );
}

export default Cart;
