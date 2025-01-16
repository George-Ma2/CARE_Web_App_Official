import React, { useState, useEffect } from 'react';
import '../styles/CreatePackageModal.css';

const CreatePackageModal = ({
    inventoryItems = [], // Default to empty array if undefined
    onClose,
    onSave,
    carePackage = null, // Receiving carePackage prop for editing
}) => {
    // Initialize state for care package creation or update
    const [carePackageName, setCarePackageName] = useState('');
    const [carePackageDescription, setCarePackageDescription] = useState('');
    const [numPackages, setNumPackages] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [deliveryDate, setDeliveryDate] = useState('');

    // If carePackage prop is provided (i.e., editing mode), populate fields
    useEffect(() => {
        if (carePackage) {
            setCarePackageName(carePackage.name);
            setCarePackageDescription(carePackage.description);
            setNumPackages(carePackage.quantity);
            setSelectedItems(carePackage.items || []);
            setDeliveryDate(carePackage.deliveryDate || '');
        } else {
            setCarePackageName('');
            setCarePackageDescription('');
            setNumPackages(1);
            setSelectedItems([]);
            setDeliveryDate('')
        }
    }, [carePackage]);

    const handleSave = () => {
        if (!carePackageName.trim()) {
            alert('Care Package Name is required.');
            return;
        }
        if (!selectedItems.length) {
            alert('Please add at least one item to the care package.');
            return;
        }

        onSave({
            name: carePackageName,
            description: carePackageDescription,
            quantity: numPackages,
            items: selectedItems.map((item) => ({
                product_id: item.inventory_item_id,
                quantity: item.quantity,
            })),
            delivery_date: deliveryDate,
        });
    };

    const handleAddItem = (itemId, quantity) => {
        const item = inventoryItems.find((item) => item.id === itemId);
        const totalRequestedQuantity = quantity * numPackages;

        if (totalRequestedQuantity > item.quantity) {
            alert(`Requested quantity for all packages exceeds available stock for ${item.name}`);
            return;
        }

        setSelectedItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex((item) => item.inventory_item_id === itemId);
            if (existingItemIndex >= 0) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity = totalRequestedQuantity;
                return updatedItems;
            } else {
                return [...prevItems, { inventory_item_id: itemId, quantity: totalRequestedQuantity }];
            }
        });
    };

    return (
        <div className="modal-overlay-create">
            <div className="modal-content-create">
                <h2>{carePackage ? 'Update' : 'Create'} Care Package</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <label>
                        Care Package Name:
                        <input
                            type="text"
                            value={carePackageName}
                            onChange={(e) => setCarePackageName(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Description:
                        <textarea
                            value={carePackageDescription}
                            onChange={(e) => setCarePackageDescription(e.target.value)}
                            placeholder="Enter description"
                        />
                    </label>
                    <label>
                        Delivery Date:
                        <input
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Quantity:
                        <input
                            type="number"
                            value={numPackages}
                            onChange={(e) => setNumPackages(Math.max(Number(e.target.value), 1))}
                            min="1"
                            required
                        />
                    </label>
                    <h3>Select Products and Quantities</h3>
                    {inventoryItems.map((item) => (
                        <div key={item.id} className={`form-group ${item.quantity === 0 ? 'out-of-stock' : ''}`}>
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
                    <div className="form-buttons-create">
                        <button type="button" className="save-button" onClick={handleSave}>
                            Save
                        </button>
                        <button type="button" className="close-button" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePackageModal;
