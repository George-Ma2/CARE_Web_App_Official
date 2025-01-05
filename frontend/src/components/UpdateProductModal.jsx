import React, { useState, useEffect } from 'react';
import '../styles/UpdateProductModal.css';

const UpdateProductModal = ({ product, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState('Miscellaneous');
    const [expirationDate, setExpirationDate] = useState('');

    useEffect(() => {
        if (product) {
            setName(product.name);
            setQuantity(product.quantity);
            setCategory(product.category);
            setExpirationDate(product.expiration_date);
        }
    }, [product]);

    const handleSave = () => {
        if (quantity < 1) {
            alert("Enter a quantity more than 1.");
            return;
        }
        onSave({
            ...product,
            name,
            quantity,
            category,
            expiration_date: expirationDate,
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Update Product</h2>
                <form>
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
                            min="1"
                            required
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
                    <div>
                        <button type="button" onClick={handleSave}>Save Changes</button>
                        <button type="button" onClick={onClose}>Close</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProductModal;
