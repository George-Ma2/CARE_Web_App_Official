import React, { useState, useEffect } from 'react';
import api from '../api';
import "../styles/CarePackage.css";
import CreatePackageModal from '../components/CreatePackageModal';

const CarePackagePage = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [carePackages, setCarePackages] = useState([]);
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


    const handleSaveCarePackage = async (packageData) => {
        try {
            if (selectedCarePackage) {
                // Update existing care package!!! Falta crear este url y su funcionalidad!
                const response = await api.patch(`/api/care-packages/${selectedCarePackage.id}/`, packageData);
                setCarePackages(prevPackages =>
                    prevPackages.map(pkg => (pkg.id === selectedCarePackage.id ? response.data : pkg))
                );
                alert(`Care package '${response.data.name}' updated successfully!`);
            } else {
                // Create new care package
                const response = await api.post('/api/care-packages/', packageData);
                setCarePackages(prevPackages => [...prevPackages, response.data]);
                alert(`${packageData.quantity} care package(s) created successfully!`);
            }

            await fetchInventory();
            
            setShowCreateModal(false);
            setSelectedCarePackage(null);
        } catch (error) {
            console.error('Error saving care package:', error);
            alert('Failed to save care package.');
        }
    };

    return (
        <div>
            <h1>Manage Care Packages</h1>
            <button
                className="button-cp primary"
                onClick={() => {
                    setShowCreateModal(true);
                    setSelectedCarePackage(null); // Ensure no package is selected
                }}
            >
                Create Care Package
            </button>

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

            {showCreateModal && (
                <CreatePackageModal
                    inventoryItems={inventoryItems}
                    carePackage={selectedCarePackage} // Pass selected package for editing
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleSaveCarePackage}
                />
            )}
        </div>
    );
};

export default CarePackagePage;
