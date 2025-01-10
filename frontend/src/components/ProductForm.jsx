import React, { useState, useEffect } from 'react';
import { addProduct } from './ProductService';

const ProductForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('Miscellaneous');  // Default category
  const [expirationDate, setExpirationDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity <= 0) {
      alert('Enter a quantity more than 1');
      return;
  }
    const newProduct = {
      name,
      quantity,
      category,
      expiration_date: expirationDate, // Send the expiration date as "expiration_date"
    };
    onSubmit(newProduct);
    setName('');
    setQuantity('');
    setCategory('Miscellaneous');  // Reset the category to default
    setExpirationDate('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Product Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label>
        Quantity:
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          min="1"

        />
      </label>
      <label>
        Category:
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="Rice and Pasta">Rice and Pasta</option>
          <option value="Processed Proteins">Processed Proteins</option>
          <option value="Canned Food">Canned Food</option>
          <option value="Drinks and Desserts">Drinks and Desserts</option>
          <option value="Miscellaneous">Miscellaneous</option>
        </select>
      </label>
      <label>
        Expiration Date:
        <input
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          required
        />
      </label>
      <button type="submit">Add Product</button>
    </form>
  );
};

export default ProductForm;