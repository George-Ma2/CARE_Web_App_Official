import React, { useState, useEffect } from "react";
import "./BoxCreation.css";

const BoxCreation = () => {
  // State for inventory and selected products
  const [inventory, setInventory] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fetch inventory from API
  useEffect(() => {
    fetch("/api/inventory") // Replace with your inventory endpoint
      .then((res) => res.json())
      .then((data) => {
        setInventory(data.products); // Expecting { products: [...] } from API
      });
  }, []);

  // Handle adding a product to the box
  const handleAddToBox = (product) => {
    const exists = selectedProducts.find((item) => item.id === product.id);
    if (!exists) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  // Handle removing a product from the box
  const handleRemoveFromBox = (productId) => {
    setSelectedProducts(selectedProducts.filter((item) => item.id !== productId));
  };

  // Handle submitting the box
  const handleSubmitBox = () => {
    const boxData = selectedProducts.map((product) => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity, // Optional if specific quantities are required
    }));

    // Send box data to backend
    fetch("/api/create-box", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: boxData }),
    })
      .then((res) => res.json())
      .then((response) => {
        alert("Box created successfully!");
        setSelectedProducts([]); // Clear the box after submission
      })
      .catch((error) => {
        console.error("Error creating box:", error);
      });
  };

  return (
    <div className="box-creation">
      <h1>Box Creation</h1>

      {/* Inventory Table */}
      <div className="box-creation-section inventory">
        <h2>Available Products</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Qty on Hand</th>
              <th>Expiration Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.qty_on_hand}</td>
                <td>{product.exp_date}</td>
                <td>
                  <button onClick={() => handleAddToBox(product)}>Add to Box</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Products */}
      <div className="box-creation-section selected-products">
        <h2>Selected Products for Box</h2>
        {selectedProducts.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Qty on Hand</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.qty_on_hand}</td>
                  <td>
                    <button onClick={() => handleRemoveFromBox(product.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No products added to the box yet.</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="box-creation-section submit-box">
        <button onClick={handleSubmitBox} disabled={selectedProducts.length === 0}>
          Submit Box
        </button>
      </div>
    </div>
  );
};

export default BoxCreation;
