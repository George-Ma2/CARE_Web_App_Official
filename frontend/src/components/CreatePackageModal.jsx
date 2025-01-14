import React, { useState, useEffect } from 'react';
import '../styles/CreatePackageModal.css';

const CreatePackageModal = ({
    inventoryItems = [], // Default to empty array if undefined
    onClose,
    onSave,
    initialName = '',
    initialDescription = '',
    initialQuantity = 1,
    initialSelectedItems = [],
}) => {
    // Initialize state directly from props
    const [carePackageName, setCarePackageName] = useState(initialName);
    const [carePackageDescription, setCarePackageDescription] = useState(initialDescription);
    const [numPackages, setNumPackages] = useState(initialQuantity);
    const [selectedItems, setSelectedItems] = useState(initialSelectedItems);

    // Optional: Only update state when props change
    useEffect(() => {
        if (initialName) setCarePackageName(initialName);
        if (initialDescription) setCarePackageDescription(initialDescription);
        //if (initialQuantity) setNumPackages(initialQuantity);
        //if (initialSelectedItems.length > 0) setSelectedItems(initialSelectedItems);
    }, [initialName, initialDescription]);

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
        });
    };
    const handleAddItem = (itemId, quantity) => {
        const item = inventoryItems.find(item => item.id === itemId);
        const totalRequestedQuantity = quantity * numPackages;
    
        if (totalRequestedQuantity > item.quantity) {
            alert(`Requested quantity for all packages exceeds available stock for ${item.name}`);
            return;
        }
    
        setSelectedItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.inventory_item_id === itemId);
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
                <h2>Create Care Package</h2>
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
                        Quantity:
                        <input
                            type="number"
                            value={numPackages}
                            onChange={(e) => setNumPackages(Math.max(Number(e.target.value), 1))} // Ensure it doesn't drop below 1
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



// {showCreateModal && (
//     <div className="modal-overlay-cp">
//         <div className="modal-cp">
//             <h2>{selectedCarePackage ? 'Update Care Package' : 'Create Care Package'}</h2>
//             <form onSubmit={(e) => e.preventDefault()}>
//                 <div className="form-group-cp">
//                     <label htmlFor="carePackageName">Care Package Name</label>
//                     <input
//                         type="text"
//                         id="carePackageName"
//                         placeholder="Enter care package name"
//                         value={carePackageName}
//                         onChange={(e) => setCarePackageName(e.target.value)}
//                     />
//                 </div>

//                 <div className="form-group-cp">
//                     <label htmlFor="carePackageDescription">Care Package Description</label>
//                     <textarea
//                         id="carePackageDescription"
//                         placeholder="Enter care package description"
//                         value={carePackageDescription}
//                         onChange={(e) => setCarePackageDescription(e.target.value)}
//                     />
//                 </div>

//                 <div className="form-group-cp">
//                     <label htmlFor="numPackages">Number of Care Packages</label>
//                     <input
//                         type="number"
//                         id="numPackages"
//                         placeholder="Enter number of care packages"
//                         min="1"
//                         value={numPackages}
//                         onChange={(e) => setNumPackages(Number(e.target.value))}
//                     />
//                 </div>

//                 <h3>Select Products and Quantities</h3>
//                 {inventoryItems.map((item) => (
//                     <div
//                         key={item.id}
//                         className={`form-group-cp ${item.quantity === 0 ? 'out-of-stock' : ''}`}
//                     >
//                         <label htmlFor={`item-${item.id}`}>
//                             {item.name} ({item.quantity} available)
//                         </label>
//                         <input
//                             type="number"
//                             id={`item-${item.id}`}
//                             placeholder="Quantity"
//                             min="1"
//                             max={item.quantity}
//                             disabled={item.quantity === 0}
//                             onChange={(e) => handleAddItem(item.id, Number(e.target.value))}
//                         />
//                     </div>
//                 ))}

//                 <div className="form-buttons-cp">
//                     <button
//                         className="button-cp cancel"
//                         onClick={() => setShowCreateModal(false)}
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         className="button-cp primary"
//                         onClick={selectedCarePackage ? handleUpdateCarePackage : handleCreateCarePackages}
//                     >
//                         {selectedCarePackage ? 'Update Care Package' : 'Create Care Package'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     </div>
// )}
