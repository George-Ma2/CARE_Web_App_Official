import React, { useState, useEffect } from 'react';
import api from '../api';
import "../styles/CarePackage.css";
import CreatePackageModal from '../components/CreatePackageModal';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const CarePackagePage = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [carePackages, setCarePackages] = useState([]);
    const [selectedCarePackage, setSelectedCarePackage] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [events, setEvents] = useState([]);
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

    useEffect(() => {
  // Fetch packages from the backend
  const fetchPackages = async () => {
    try {
      const response = await api.get('/api/package/');
      const packages = response.data;

      // Map package delivery dates to FullCalendar event format
      const eventList = packages
     
      .map(pkg => ({
        title: 'Order Pickup Day!',
        date: pkg.delivery_date,
      }));
      setEvents(eventList);
    } catch (error) {
      console.error("Error fetching package details:", error);
    }
  };

  fetchPackages();
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

    const handleDeleteCarePackage = async (carePackageId) => {
        try {
            const response = await api.delete(`/api/care-packages/${carePackageId}/delete/`);
            
            // Remove the deleted care package from the state
            setCarePackages(prevPackages =>
                prevPackages.filter(pkg => pkg.id !== carePackageId)
            );
    
            alert("Care package deleted successfully!");
            await fetchInventory();
        } catch (error) {
            console.error('Error deleting care package:', error);
            alert('Failed to delete care package.');
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
                        <th>Pickup Time and Location</th>
                        <th>Created At</th>
                        <th>Delivery Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {carePackages.map((carePackage) => (
                        <tr key={carePackage.id}>
                            <td>{carePackage.name}</td>
                            <td>{carePackage.description}</td>
                            <td>{new Date(carePackage.created_at).toLocaleString()}</td>
                            <td>{carePackage.delivery_date}</td>
                            <td>
                                {/* <button
                                    className="button-cp edit"
                                    onClick={() => {
                                        setSelectedCarePackage(carePackage);
                                        setShowCreateModal(true);
                                    }}
                                >
                                    Update
                                </button> */}
                                <button
                                    className="button-cp delete"
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this care package?")) {
                                            handleDeleteCarePackage(carePackage.id);
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showCreateModal && (
                <div className="modal-overlay-cp">
                    <div className="modal-content-cp">
                        <CreatePackageModal
                            inventoryItems={inventoryItems}
                            carePackage={selectedCarePackage} // Pass selected package for editing
                            onClose={() => setShowCreateModal(false)}
                            onSave={handleSaveCarePackage}
                        />
                    </div>
                </div>
            )}

            <div className="mt-5">
                <h2>Delivery Calendar</h2>
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    //dateClick={handleDateClick} // Allow user to click and assign a delivery date
                    height="auto"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,dayGridWeek,dayGridDay",
                    }}
                    buttonText={{
                        today: "Today",
                        month: "Month",
                        week: "Week",
                        day: "Day",
                    }}
                />
            </div>
        </div>
    );
};

export default CarePackagePage;
