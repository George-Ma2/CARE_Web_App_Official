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
    const [selectedCarePackage, setSelectedCarePackage] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Fetch inventory items when component mounts
    const fetchInventory = async () => {
        try {
            const response = await api.get('/api/inventory/');
            setInventoryItems(response.data);
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        }
    };

    // Fetch care packages when component mounts
    const fetchCarePackages = async () => {
        try {
            const response = await api.get('/api/care-packages/');
            setCarePackages(response.data);
        } catch (error) {
            console.error('Error fetching care packages:', error);
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchCarePackages();
    }, []);

    // Handle item selection with quantity for each care package
    const handleAddItem = (itemId, quantity) => {
        const item = inventoryItems.find(item => item.id === itemId);
        if (quantity > item.quantity) {
            alert(`Requested quantity exceeds available stock for ${item.name}`);
            return;
        }
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

    // Handle care package creation
    const handleCreateCarePackages = async () => {
        try {
            const response = await api.post('/api/care-packages/', {
                name: carePackageName,
                description: carePackageDescription,
                quantity: numPackages,
                items: selectedItems.map(item => ({
                    product_id: item.inventory_item_id,
                    quantity: item.quantity
                }))
            });
            setCarePackages(prevPackages => [...prevPackages, response.data]);
            alert(`${numPackages} care packages created successfully!`);
            setSelectedItems([]);
            setCarePackageName('');
            setCarePackageDescription('');
            setNumPackages(1);
            fetchInventory();
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating care packages:', error);
            alert('Failed to create care packages.');
        }
    };

    // Handle care package update
    const handleUpdateCarePackage = async () => {
        if (!selectedCarePackage) return;

        try {
            const response = await api.patch(`/api/care-packages/${selectedCarePackage.id}/`, {
                name: carePackageName,
                description: carePackageDescription,
                items: selectedItems.map(item => ({
                    product_id: item.inventory_item_id,
                    quantity: item.quantity
                }))
            });
            setCarePackages(prevPackages => prevPackages.map(pkg => 
                pkg.id === selectedCarePackage.id ? response.data : pkg
            ));
            alert(`Care package '${response.data.name}' updated successfully!`);
            setSelectedCarePackage(null);
            setSelectedItems([]);
            setCarePackageName('');
            setCarePackageDescription('');
        } catch (error) {
            console.error('Error updating care package:', error);
            alert('Failed to update care package.');
        }
    };

    return (
        <div>
            <h1>Manage Care Packages</h1>

            <button className="button-cp primary" onClick={() => setShowCreateModal(true)}>Create Care Package</button>

            {showCreateModal && (
                <div className="modal-overlay-cp">
                    <div className="modal-cp">
                        <h2>{selectedCarePackage ? 'Update Care Package' : 'Create Care Package'}</h2>
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
                                <label htmlFor="carePackageDescription">Care Package Description</label>
                                <textarea
                                    id="carePackageDescription"
                                    placeholder="Enter care package description"
                                    value={carePackageDescription}
                                    onChange={(e) => setCarePackageDescription(e.target.value)}
                                />
                            </div>

                            <h3>Select Products and Quantities</h3>
                            {inventoryItems.map((item) => (
                                <div key={item.id} className={`form-group-cp ${item.quantity === 0 ? 'out-of-stock' : ''}`}>
                                    <label htmlFor={`item-${item.id}`}>
                                        {item.name} ({item.quantity} available)
                                    </label>
                                    <input
                                        type="number"
                                        id={`item-${item.id}`}
                                        placeholder="Quantity"
                                        min="1"
                                        max={item.quantity}
                                        disabled={item.quantity === 0}
                                        onChange={(e) => handleAddItem(item.id, Number(e.target.value))}
                                    />
                                </div>
                            ))}

                            <div className="form-buttons-cp">
                                <button className="button-cp cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button
                                    className="button-cp primary"
                                    onClick={selectedCarePackage ? handleUpdateCarePackage : handleCreateCarePackages}
                                >
                                    {selectedCarePackage ? 'Update Care Package' : 'Create Care Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <h2>Existing Care Packages</h2>
            <table className="product-table-cp">
                <thead>
                    <tr>
                        <th>Care Package Name</th>
                        <th>Description</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {carePackages.map((carePackage) => (
                        <tr key={carePackage.id}>
                            <td>{carePackage.name}</td>
                            <td>{carePackage.description}</td>
                            <td>{new Date(carePackage.created_at).toLocaleString()}</td>
                            <td>
                                <button 
                                    className="button-cp edit" 
                                    onClick={() => {
                                        setSelectedCarePackage(carePackage);
                                        setCarePackageName(carePackage.name);
                                        setCarePackageDescription(carePackage.description);
                                        setSelectedItems(carePackage.items);
                                        setShowCreateModal(true);
                                    }}
                                >
                                    Edit
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
