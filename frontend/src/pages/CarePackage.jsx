import React, { useState, useEffect } from 'react';
import api from '../api';
import "../styles/CarePackage.css";

const CarePackagePage = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [carePackages, setCarePackages] = useState([]);
    const [carePackageDescription, setCarePackageDescription] = useState('');
    const [numPackages, setNumPackages] = useState(1);
    const [carePackageName, setCarePackageName] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Fetch inventory items when component mounts
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await api.get('api/inventory/');
                setInventoryItems(response.data);
            } catch (error) {
                console.error('Error fetching inventory items:', error);
            }
        };

        fetchInventory();
    }, []);

    // Handle item selection with quantity for each care package
    const handleAddItem = (itemId, quantity) => {
        setSelectedItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.inventory_item_id === itemId);
            if (existingItemIndex >= 0) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity = quantity;
                return updatedItems;
            } else {
                return [...prevItems, { inventory_item_id: itemId, quantity }];
            }
        });
    };

    // Handle care package creation with multiple items
    const handleCreateCarePackages = async () => {
        try {
            const response = await api.post('/api/care-packages/', {
                name: carePackageName,
                description: carePackageDescription,
                quantity: numPackages,
                items: selectedItems.map(item => ({
                    product: item.inventory_item_id,
                    quantity: item.quantity
                }))
            });
            setCarePackages(response.data);
            alert(`${numPackages} care packages created successfully!`);
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating care packages:', error);
            alert('Error creating care packages.');
        }
    };

    return (
        <div>
            <h1>Create Multiple Care Packages</h1>
            <button className="button-cp primary" onClick={() => setShowCreateModal(true)}>Create Care Packages</button>

            {/* Modal for creating care packages */}
            {showCreateModal && (
                <div className="modal-overlay-cp">
                    <div className="modal-cp">
                        <h2>Create Care Packages</h2>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group-cp">
                                <label htmlFor="carePackageName">Care Package Name</label>
                                <input
                                    type="text"
                                    id="carePackageName"
                                    placeholder="Enter care package name"
                                    value={carePackageName}
                                    onChange={(e) => setCarePackageName(e.target.value)}
                                />
                            </div>

                            <div className="form-group-cp">
                                <label htmlFor="carePackageDescription">Care Package Description</label> {/* Added description field */}
                                <textarea
                                    id="carePackageDescription"
                                    placeholder="Enter care package description"
                                    value={carePackageDescription}
                                    onChange={(e) => setCarePackageDescription(e.target.value)}  // Handle description input
                                />
                            </div>

                            <div className="form-group-cp">
                                <label htmlFor="numPackages">Number of Care Packages</label>
                                <input
                                    type="number"
                                    id="numPackages"
                                    min="1"
                                    value={numPackages}
                                    onChange={(e) => setNumPackages(Number(e.target.value))}
                                />
                            </div>

                            <h3>Select Products and Quantities</h3>
                            {inventoryItems.map((item) => (
                                <div key={item.id} className="form-group-cp">
                                    <label htmlFor={`item-${item.id}`}>{item.name}</label>
                                    <input
                                        type="number"
                                        id={`item-${item.id}`}
                                        placeholder="Quantity"
                                        min="1"
                                        onChange={(e) => handleAddItem(item.id, e.target.value)}
                                    />
                                </div>
                            ))}

                            <div className="form-buttons-cp">
                                <button className="button-cp cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button
                                    className="button-cp primary"
                                    onClick={handleCreateCarePackages}
                                >
                                    Create Care Packages
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Display created care packages */}
            <h2>Created Care Packages</h2>
            <table className="product-table-cp">
                <thead>
                    <tr>
                        <th>Care Package Name</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {carePackages.map((carePackage) => (
                        <tr key={carePackage.id}>
                            <td>{carePackage.name}</td>
                            <td>{new Date(carePackage.created_at).toLocaleString()}</td>
                            <td>
                                <button className="button-cp danger" onClick={() => console.log("Delete action")}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CarePackagePage;
