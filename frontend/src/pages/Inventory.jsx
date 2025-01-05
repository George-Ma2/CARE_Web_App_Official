import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import { addProduct, deleteProduct,updateProduct, updateProductQuantity } from '../components/ProductService';
import UpdateProductModal from '../components/UpdateProductModal';
import api from '../api';
import "../styles/Inventory.css"

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
        try {
        const response = await api.get('api/inventory/');
        setProducts(response.data);
        } catch (error) {
        console.error('Error fetching products:', error);
        }
    };

        fetchProducts();
    }, []);

    const handleAddProduct = async (newProduct) => {
        try {
            // Check if the product already exists in the table with the same name, category, and expiration date
            const existingProduct = products.find(
                (product) =>
                    product.name === newProduct.name &&
                    product.category === newProduct.category &&
                    product.expiration_date === newProduct.expiration_date
            );

            if (existingProduct) {
                // Increment the quantity of the existing product
                const updatedProduct = { ...existingProduct, quantity: parseInt(existingProduct.quantity) + parseInt(newProduct.quantity) };
                
                // Update the backend (update the product's quantity)
                await updateProductQuantity(updatedProduct.id, updatedProduct.quantity);

                // Update the product list on the front-end
                setProducts(products.map((product) =>
                    product.id === existingProduct.id ? updatedProduct : product
                ));
            } else {
                // If no duplicate found, add the new product
                const addedProduct = await addProduct(newProduct);
                setProducts([...products, addedProduct]);
            }
        } catch (error) {
            console.error('Error adding or updating product:', error);
        }
    };

    // Handle deleting a product
    const handleDeleteProduct = async (id) => {
        try {
        await deleteProduct(id); // Delete the product from the backend
        setProducts(products.filter((product) => product.id !== id)); // Remove the product from the list
        } catch (error) {
        console.error('Error deleting product:', error);
        }
    };

    const handleUpdateProduct = async (updatedProduct) => {
        try {
            const response = await updateProduct(updatedProduct.id, updatedProduct);
            console.log(response.data)
            setProducts(products.map((product) =>
                product.id === updatedProduct.id ? response.data : product
            ));
            setShowUpdateModal(false);
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const openUpdateModal = (product) => {
        setSelectedProduct(product);
        setShowUpdateModal(true);
    };

    const closeUpdateModal = () => {
        setSelectedProduct(null);
        setShowUpdateModal(false);
    };

    return (
        <div>
            <h1>Inventory Management</h1>
            <ProductForm onSubmit={handleAddProduct} />
            <h2>Product List</h2>
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Category</th>
                        <th>Expiration Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.quantity}</td>
                            <td>{product.category}</td>
                            <td>{product.expiration_date}</td>
                            <td>
                                <button className="update-btn" onClick={() => openUpdateModal(product)}>Update</button>
                                <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showUpdateModal && (
                <UpdateProductModal
                    product={selectedProduct}
                    onClose={closeUpdateModal}
                    onSave={handleUpdateProduct}
                />
            )}
        </div>        
    );
};

export default Inventory;