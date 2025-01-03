import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";


function Cart({ selectedPackage }) {
  const navigate = useNavigate();
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    document.title = "Cart";
    console.log("selectedPackage:", selectedPackage);
    // Load the selected package into the cart
    if (selectedPackage) {
      setCartItems([
        {
          name: selectedPackage.name,
          quantity: 1,
        },
      ]);
    }
  }, [selectedPackage]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleTermsChange = (event) => {
    setIsTermsAccepted(event.target.checked);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = quantity;
    setCartItems(updatedCart);
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
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    onChange={(e) =>
                      handleQuantityChange(index, parseInt(e.target.value, 10))
                    }
                    className="quantity-input"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="terms-section">
          <h2>Terms and Conditions</h2>
          <p>
            By completing this order, you agree to the terms and conditions
            outlined in our policy.
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
            onClick={() => navigate("/userdash")}
          >
            Continue Shopping
          </button>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!isTermsAccepted}
            onClick={() => alert("Order completed!")}
          >
            Complete Order
          </button>
        </div>
      </main>
    </div>
  );
}

export default Cart;
