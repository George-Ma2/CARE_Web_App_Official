import React, { useEffect, useState } from "react";
import api from "../api";
import ReactECharts from "echarts-for-react";
import "../styles/Dashboard.css";

const InventoryDashboard = () => {
    const [products, setProducts] = useState([]);
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);
    const [lowInventoryProducts, setLowInventoryProducts] = useState([]);
    const [latestPackage, setLatestPackage] = useState(null);
    const [orders, setOrders] = useState({ total_orders: 0, latest_order: null });  // Adjusted orders state structure
    const [totalPackages, setTotalPackages] = useState(0); // New state to hold the total sum of packages
    const [nearestDelivery, setNearestDelivery] = useState(null);
    const [orderStatus, setOrderStatus] = useState([]);

    //Fetch order status
    // const fetchOrderStatus = async () => {
    //     try {
    //         const response = await api.get("api/orderhistory/${studentId}/status/");
    //          setOrderStatus(response.data); // Set order status in state
    //     } catch (err) {
    //         console.error("Error fetching order status:", err);
    //         setError(err.message);
    //     }
    //     };
    const handleCheckboxChange = async (studentId, currentStatus) => {
        try {
            // Update status based on current status or toggle it
            const newStatus = currentStatus === "Picked Up" ? "Ordered" : "Picked Up";
            
            const response = await api.patch(`api/orderhistory/${studentId}/status/`, {
                status: newStatus,
            });
    
            // Optimistically update the state
            setOrderStatus(prevStatus => 
                prevStatus.map(order =>
                    order.student_id === studentId
                        ? { ...order, status: newStatus }
                        : order
                )
            );
    
            console.log("Status updated successfully", response.data);
        } catch (err) {
            console.error("Error updating order status:", err);
            setError(err.message);
        }
    };

    // Fetch products data
    const fetchDashboardData = async () => {
        try {
            const response = await api.get("api/dashboard/");
            const { category_summary, latest_package, nearest_delivery } = response.data;
            setProducts(category_summary);  // Set inventory category summary data
            setLatestPackage(latest_package);  // Set latest care package data
            setNearestDelivery(nearest_delivery);
            console.log("Delivery:", nearestDelivery);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message);
        }
    };

    // Fetch students data
    const fetchStudents = async () => {
        try {
            const response = await api.get("api/students/");
            setStudents(response.data.students); // Update the state with student data
        } catch (err) {
            console.error("Error fetching students:", err);
            setError(err.message);
        }
    };

    // Fetch order history
    const fetchOrderHistory = async () => {
        try {
            const response = await api.get("api/orderhistory/");
            const { total_orders, latest_order } = response.data; // Destructure total_orders and latest_order
            setOrders({ total_orders, latest_order }); // Set orders state as an object
            console.log("Order History:", response.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.message);
        }
    };

    const fetchTotalPackages = async () => {
        try {
            let response = await api.get("api/total-packages/"); // Use let instead of const
            setTotalPackages(response.data.total_quantity); // Update state with total quantity
        } catch (err) {
            console.error("Error fetching packages data:", err);
            setError(err.message);
        }
    };
    
    
    useEffect(() => {
        fetchDashboardData();
        fetchStudents();
        fetchOrderHistory();
        fetchTotalPackages();
        //fetchOrderStatus(); 
        handleCheckboxChange
    }, []); // Run all fetches on component load

    // Set low inventory based on student count
    useEffect(() => {
        if (products.length > 0 && students.length > 0) {
            const requiredQuantity = students.length;
            const lowInventory = products.filter(
                (product) => product.total_quantity < requiredQuantity
            );
            setLowInventoryProducts(lowInventory);
        }
        console.log("Latest package:", latestPackage);
    }, [products, students]);

    // Get chart options for the product distribution
    const getChartOptions = () => {
        return {
            tooltip: { trigger: "item" },
            legend: { top: "5%", left: "center" },
            series: [
                {
                    name: "Product Type",
                    type: "pie",
                    radius: ["40%", "70%"],
                    avoidLabelOverlap: true,
                    itemStyle: { borderRadius: 10, borderColor: "#feff", borderWidth: 2 },
                    label: { show: true, formatter: "{b}: {c}" },
                    labelLine: { show: true },
                    data: products.map((product) => ({
                        value: product.total_quantity,
                        name: product.category,
                    })),
                },
            ],
        };
    };
    const orderCount = orders.total_orders;  // Access the total number of orders
    const latestOrder = orders.latest_order;  // Access the latest order details
    
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Inventory Dashboard</h2>
            {/* Grid Row for Chart and Student Validation */}
            <div className="row g-4">
                <div className="col-lg-6">
                    <div className="card shadow-sm p-4">
                        <h5 className="card-title">Product Distribution</h5>
                        <div className="card-body">
                            {products.length > 0 ? (
                                <ReactECharts option={getChartOptions()} style={{ height: 300, width: "100%" }} />
                            ) : (
                                <p>No data available</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card shadow-sm p-4">
                    <h5 className="card-title">Student Handout Validation</h5>
                        <div className="card-body">
                        {students.length > 0 ? (
                            <ul className="list-group">
                                {students.map((student) => {
                                    const studentOrderStatus = orderStatus.find(
                                        (order) => order.student_id === student.id
                                    );
                                    return (
                                        <li key={student.id} className="list-group-item d-flex align-items-center justify-content-between">
                                            <div>
                                                <strong>{student.first_name} {student.last_name}</strong>
                                                <br />
                                                <small>
                                                    Status:{" "}
                                                    {studentOrderStatus ? studentOrderStatus.status : "No orders yet"}
                                                </small>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={studentOrderStatus?.status === "Picked Up"}
                                                onChange={() => handleCheckboxChange(student.id, studentOrderStatus?.status)}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p>No students assigned to packages</p>
                        )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Cards Section */}
            <div className="row g-4 mt-4">
                <div className="col-lg-4">
                    <div className="card text-center shadow-sm p-4">
                        <h5 className="card-title">Order Log</h5>
                        <div className="card-body">
                            <h2 className="display-6">{orders.total_orders}</h2>
                            <p className="card-text">Total Orders</p>
                            <p className="card-text">
                                Latest Order: {orders.latest_order ? `${latestOrder.order_date}` : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-4">
                    <div className="card text-center shadow-sm p-4">
                        <h5 className="card-title">Packages Available</h5>
                        <div className="card-body">
                            <h2 className="display-6">{totalPackages ? totalPackages: 0}</h2>
                            <p className="card-text">Latest Package: {latestPackage?.name || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card text-center shadow-sm p-4">
                        <h5 className="card-title">Students Registered</h5>
                        <div className="card-body">
                            <h2 className="display-6">{students.length}</h2>
                            <p className="text-muted">Total students in the system</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card text-center shadow-sm p-4">
                        <h5 className="card-title">Delivery</h5>
                        <div className="card-body">
                            <h2 className="display-6">{nearestDelivery ? nearestDelivery : 'N/A'}</h2>
                            <p className="text-muted">Upcoming delivery date</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mt-4">
                <div className="col-lg-12">
                    <div className="card shadow-sm p-4">
                        <h5 className="card-title text-center">Low Inventory Alert</h5>
                        <div className="card-body">
                            {lowInventoryProducts.length > 0 ? (
                                <ul className="list-group">
                                    {lowInventoryProducts.map((product) => (
                                        <li key={product.id} className="list-group-item">
                                            {product.category} is low on stock with {product.total_quantity} item(s) remaining.
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-success">All products are sufficiently stocked.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryDashboard;
