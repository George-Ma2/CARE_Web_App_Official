import api from '../api';

// Add a new product to the backend
export const addProduct = async (product) => {
    try {
        const response = await api.post('api/inventory/', product);
        return response.data; // Return the newly created product
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
};

export const updateProductQuantity = async (productId, quantity) => {
    try {
        const response = await api.patch(`api/inventory/update_quantity/${productId}/`, { quantity });
        return response.data;
    } catch (error) {
        throw new Error('Error updating product quantity: ' + error.message);
    }
};

// Delete a product from the backend
export const deleteProduct = async (id) => {
    try {
        await api.delete(`api/inventory/${id}/`);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};
