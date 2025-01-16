import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/CarePackage.css";
import CreatePackageModal from "../components/CreatePackageModal";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const CarePackagePage = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [carePackages, setCarePackages] = useState([]);
    const [selectedCarePackage, setSelectedCarePackage] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [events, setEvents] = useState([]); // State for calendar events

    // Fetch inventory items when component mounts
    const fetchInventory = async () => {
        try {
            const response = await api.get("/api/inventory/");
            setInventoryItems(response.data);
        } catch (error) {
            console.error("Error fetching inventory items:", error);
        }
    };

    // Fetch care packages when component mounts
    const fetchCarePackages = async () => {
        try {
            const response = await api.get("/api/care-packages/");
            setCarePackages(response.data);

            // Populate events based on care packages with delivery dates
            const carePackageEvents = response.data
                .filter((pkg) => pkg.deliveryDate)
                .map((pkg) => ({
                    title: pkg.name,
                    date: pkg.deliveryDate,
                }));
            setEvents(carePackageEvents);
        } catch (error) {
            console.error("Error fetching care packages:", error);
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchCarePackages();
    }, []);

    const handleSaveCarePackage = async (packageData) => {
        try {
            if (selectedCarePackage) {
                // Update existing care package
                const response = await api.patch(
                    `/api/care-packages/${selectedCarePackage.id}/`,
                    packageData
                );
                setCarePackages((prevPackages) =>
                    prevPackages.map((pkg) =>
                        pkg.id === selectedCarePackage.id ? response.data : pkg
                    )
                );
                alert(`Care package '${response.data.name}' updated successfully!`);
            } else {
                // Create new care package
                const response = await api.post("/api/care-packages/", packageData);
                setCarePackages((prevPackages) => [...prevPackages, response.data]);
                alert(`${packageData.quantity} care package(s) created successfully!`);
            }
            setShowCreateModal(false);
            setSelectedCarePackage(null);
        } catch (error) {
            console.error("Error saving care package:", error);
            alert("Failed to save care package.");
        }
    };
    
    const carePackageEvents = response.data
        .filter((pkg) => pkg.deliveryDate) // Ensures only packages with delivery dates are included
        .map((pkg) => ({
            title: pkg.name,
            date: pkg.deliveryDate, // Assuming `deliveryDate` is correctly named and formatted
    }));
        setEvents(carePackageEvents);

    const handleDateClick = async (arg) => {
        if (selectedCarePackage) {
            try {
                // Update care package with selected delivery date
                const updatedPackage = { ...selectedCarePackage, deliveryDate: arg.dateStr };
                const response = await api.patch(
                    `/api/care-packages/${selectedCarePackage.id}/`,
                    updatedPackage
                );

                setCarePackages((prevPackages) =>
                    prevPackages.map((pkg) =>
                        pkg.id === selectedCarePackage.id ? response.data : pkg
                    )
                );

                // Add the event to the calendar
                setEvents((prevEvents) => [
                    ...prevEvents,
                    {
                        title: response.data.name,
                        date: response.data.deliveryDate,
                    },
                ]);

                setSelectedCarePackage(null);
                alert(`Delivery date for '${response.data.name}' set to ${arg.dateStr}`);
            } catch (error) {
                console.error("Error updating care package:", error);
                alert("Failed to set delivery date.");
            }
        } else {
            alert("Please select a care package to assign a date.");
        }
    };
    return (
        <div>
            <h1 className="mb-4">Manage Care Packages</h1>
            <button
                className="btn btn-primary mb-4"
                onClick={() => {
                    setShowCreateModal(true);
                    setSelectedCarePackage(null); // Ensure no package is selected
                }}
            >
                Create Care Package
            </button>
            <h2 className="mb-4">Existing Care Packages</h2>
            <table className="table table-bordered">
                <thead className="thead-light">
                    <tr>
                        <th>Care Package Name</th>
                        <th>Description</th>
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
                                <button
                                    className="btn btn-warning btn-sm"
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
                <div className="modal-overlay">
                    <div className="modal-content">
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
                    dateClick={handleDateClick} // Allow user to click and assign a delivery date
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

// import React, { useState, useEffect } from 'react';
// import api from '../api';
// import "../styles/CarePackage.css";
// import CreatePackageModal from '../components/CreatePackageModal';
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";

// const CarePackagePage = () => {
//     const [inventoryItems, setInventoryItems] = useState([]);
//     const [carePackages, setCarePackages] = useState([]);
//     const [selectedCarePackage, setSelectedCarePackage] = useState(null);
//     const [showCreateModal, setShowCreateModal] = useState(false);

//     // Fetch inventory items when component mounts
//     const fetchInventory = async () => {
//         try {
//             const response = await api.get('/api/inventory/');
//             setInventoryItems(response.data);
//         } catch (error) {
//             console.error('Error fetching inventory items:', error);
//         }
//     };

//     // Fetch care packages when component mounts
//     const fetchCarePackages = async () => {
//         try {
//             const response = await api.get('/api/care-packages/');
//             setCarePackages(response.data);
//         } catch (error) {
//             console.error('Error fetching care packages:', error);
//         }
//     };

//     useEffect(() => {
//         fetchInventory();
//         fetchCarePackages();
//     }, []);


//     const handleSaveCarePackage = async (packageData) => {
//         try {
//             if (selectedCarePackage) {
//                 // Update existing care package!!! Falta crear este url y su funcionalidad!
//                 const response = await api.patch(/api/care-packages/${selectedCarePackage.id}/, packageData);
//                 setCarePackages(prevPackages =>
//                     prevPackages.map(pkg => (pkg.id === selectedCarePackage.id ? response.data : pkg))
//                 );
//                 alert(Care package '${response.data.name}' updated successfully!);
//             } else {
//                 // Create new care package
//                 const response = await api.post('/api/care-packages/', packageData);
//                 setCarePackages(prevPackages => [...prevPackages, response.data]);
//                 alert(${packageData.quantity} care package(s) created successfully!);
//             }
//             setShowCreateModal(false);
//             setSelectedCarePackage(null);
//         } catch (error) {
//             console.error('Error saving care package:', error);
//             alert('Failed to save care package.');
//         }
//     };

//     const handleDateClick = (arg) => {
//         // Add selected date to the selected care package
//         if (selectedCarePackage) {
//             const updatedPackage = { ...selectedCarePackage, deliveryDate: arg.dateStr };
//             handleSaveCarePackage(updatedPackage); // Save updated care package
//             setEvents((prev) => [
//                 ...prev,
//                 {
//                     title: selectedCarePackage.name,
//                     date: arg.dateStr,
//                 },
//             ]);
//             setSelectedCarePackage(null); // Clear selection
//             alert(Delivery date for ${selectedCarePackage.name} set to ${arg.dateStr});
//         } else {
//             alert("Please select a care package to assign a date.");
//         }
//     };

//     return (
//         <div>
//             <h1 className="mb-4">Manage Care Packages</h1>
//             <button
//                 className="btn btn-primary mb-4"
//                 onClick={() => {
//                     setShowCreateModal(true);
//                     setSelectedCarePackage(null); // Ensure no package is selected
//                 }}
//             >
//                 Create Care Package
//             </button>

//             <h2 className="mb-4">Existing Care Packages</h2>
//             <table className="table table-bordered">
//                 <thead className="thead-light">
//                     <tr>
//                         <th>Care Package Name</th>
//                         <th>Description</th>
//                         <th>Created At</th>
//                         <th>Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {carePackages.map((carePackage) => (
//                         <tr key={carePackage.id}>
//                             <td>{carePackage.name}</td>
//                             <td>{carePackage.description}</td>
//                             <td>{new Date(carePackage.created_at).toLocaleString()}</td>
//                             <td>
//                                 <button
//                                     className="btn btn-warning btn-sm"
//                                     onClick={() => {
//                                         setSelectedCarePackage(carePackage);
//                                         setShowCreateModal(true);
//                                     }}
//                                 >
//                                     Edit
//                                 </button>
//                                 <button
//                                     className="btn btn-success btn-sm ms-2"
//                                     onClick={() => {
//                                         setSelectedCarePackage(carePackage);
//                                         alert(Selected ${carePackage.name}. Now choose a date on the calendar.);
//                                     }}
//                                 >
//                                     Assign Delivery Date
//                                 </button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             {showCreateModal && (
//                 <CreatePackageModal
//                     inventoryItems={inventoryItems}
//                     carePackage={selectedCarePackage} // Pass selected package for editing
//                     onClose={() => setShowCreateModal(false)}
//                     onSave={handleSaveCarePackage}
//                 />
//             )}

//             <div className="mt-5">
//                 <h2>Delivery Calendar</h2>
//                 <FullCalendar
//                     plugins={[dayGridPlugin]}
//                     initialView="dayGridMonth"
//                     events={events}
//                     dateClick={handleDateClick} // Allow user to click and assign a delivery date
//                     height="auto"
//                     headerToolbar={{
//                         left: "prev,next today",
//                         center: "title",
//                         right: "dayGridMonth,dayGridWeek,dayGridDay",
//                     }}
//                     buttonText={{
//                         today: "Today",
//                         month: "Month",
//                         week: "Week",
//                         day: "Day",
//                     }}
//                 />
//             </div>
//         </div>
//     );
// };

// export default CarePackagePage;