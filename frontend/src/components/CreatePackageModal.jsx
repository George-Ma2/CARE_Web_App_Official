import React, { useState, useEffect } from 'react';
import '../styles/CreatePackageModal.css';

const CreatePackageModal = ({
    inventoryItems = [],
    onClose,
    onSave,
    carePackage = null,
}) => {
    const [carePackageName, setCarePackageName] = useState('');
    const [carePackageDescription, setCarePackageDescription] = useState('');
    const [numPackages, setNumPackages] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [initialQuantity, setInitialQuantity] = useState(1);

    useEffect(() => {
        if (carePackage) {
            setCarePackageName(carePackage.name);
            setCarePackageDescription(carePackage.description);
            setNumPackages(carePackage.quantity);
            setSelectedItems(carePackage.items || []);
            setDeliveryDate(carePackage.deliveryDate || '');
            setInitialQuantity(carePackage.quantity);
        } else {
            setCarePackageName('');
            setCarePackageDescription('');
            setNumPackages(1);
            setSelectedItems([]);
            setDeliveryDate('');
            setInitialQuantity(1);
        }
    }, [carePackage]);

    const handleSave = () => {
        if (!carePackageName.trim()) {
            alert('Care Package Name is required.');
            return;
        }

        if (!carePackageDescription.trim()) {
            alert('Care Package Description is required.');
            return;
        }

        if (!selectedItems.length) {
            alert('Please add at least one item to the care package.');
            return;
        }

        if (numPackages < 1) {
            alert('Care package quantity must be at least 1.');
            return;
        }

        for (const item of selectedItems) {
            const inventoryItem = inventoryItems.find((inv) => inv.id === item.inventory_item_id);

            if (item.quantity < 0) {
                alert(`Quantity for ${inventoryItem.name} cannot be negative.`);
                return;
            }

            if ((item.quantity * numPackages) > inventoryItem.quantity) {
                alert(`Requested quantity for ${inventoryItem.name} exceeds available stock. Available: ${inventoryItem.quantity}, Requested: ${item.quantity * numPackages}.`);
                return;
            }
        }

        const carePackageData = {
            name: carePackageName,
            description: carePackageDescription,
            quantity: numPackages,
            initial_quantity: initialQuantity, // Automatically set
            items: selectedItems.map((item) => ({
                product_id: item.inventory_item_id,
                quantity: item.quantity * numPackages,
            })),
            delivery_date: deliveryDate,
        };

        onSave(carePackageData);
        console.log('Care package data:', carePackageData);
    };

    const handleAddItem = (itemId, quantity) => {
        setSelectedItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex((item) => item.inventory_item_id === itemId);
            if (existingItemIndex >= 0) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity = quantity;
                return updatedItems;
            } else {
                const newItem = { inventory_item_id: itemId, quantity: quantity };
                return [...prevItems, newItem];
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
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                setNumPackages(value);
                                setInitialQuantity(value); // Sync with initialQuantity
                            }}
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
