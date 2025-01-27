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
    const [orders, setOrders] = useState({ total_orders: 0, latest_order: null });  
    const [totalPackages, setTotalPackages] = useState(0); 
    const [nearestDelivery, setNearestDelivery] = useState([]);


    const fetchDashboardData = async () => {
        try {
            const response = await api.get("api/dashboard/");
            const { category_summary, nearest_delivery } = response.data;
            setProducts(category_summary);  
            setNearestDelivery(nearest_delivery);
            console.log("Delivery:", nearestDelivery);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message);
        }
    };

   
    const fetchStudents = async () => {
        try {
            const response = await api.get("api/students/");
            setStudents(response.data.students); 
        } catch (err) {
            console.error("Error fetching students:", err);
            setError(err.message);
        }
    };


    const fetchOrderHistory = async () => {
        try {
            const response = await api.get("api/orderhistory/");
            const { total_orders, latest_order } = response.data; 
            setOrders({ total_orders, latest_order }); 
            console.log("Order History:", response.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.message);
        }
    };

    const fetchTotalPackages = async () => {
        try {
            let response = await api.get("api/total-packages/"); 
            setTotalPackages(response.data.total_quantity); 
            setLatestPackage(response.data.latest_package);
            console.log("Latest package:", latestPackage);
            
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
    }, []); 

  
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


const getChartOptions = () => {
    return {
        tooltip: { trigger: "item" },
        legend: {
            top: "5%", 
            left: "center", 
            orient: "horizontal",
        },
        series: [
            {
                name: "Product Type",
                type: "pie",
                radius: ["30%", "60%"], 
                center: ["50%", "60%"], 
                avoidLabelOverlap: true,
                itemStyle: { borderRadius: 10, borderColor: "#feff", borderWidth: 2 },
                label: { show: false }, 
                labelLine: { show: false }, 
                data: products.map((product) => ({
                    value: product.total_quantity,
                    name: product.category,
                })),
            },
        ],
    };
};

  
    const latestOrder = orders.latest_order;  
    
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Inventory Dashboard</h2>

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
                                    {students.map((student) => (
                                        <li key={student.id} className="list-group-item d-flex align-items-center justify-content-between">
                                            <div>
                                                <strong>{student.first_name}</strong> <strong>{student.last_name}</strong><br />
                                                <small>Email: {student.email}</small>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                            />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No students assigned to packages</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

                     
            <div className="row g-4 mt-4">
                <div className="col-lg-4">
                    <div className="card text-center shadow-sm p-4">
                        <h5 className="card-title">Order Log</h5>
                        <div className="card-body">
                            <h2 className="display-6">{orders.total_orders}</h2>
                            <p className="card-text">Total Orders</p>
                            {orders.latest_order ? (
                            <ul className="list-unstyled">
                            <p className="card-text"><u>Most Recent Order:</u></p>
                            <li><strong>Order Date:</strong> {latestOrder.order_date}</li>
                            <li><strong>Client Name:</strong> {latestOrder.user_first_name} {latestOrder.user_last_name}</li>
                            </ul>
                        ) : (
                            <p className="card-text">Most Recent Order: N/A</p>
                        )}
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-4">
                    <div className="card text-center shadow-sm p-4">
                        <h5 className="card-title">Packages</h5>
                        <div className="card-body">
                        <h2 className="display-6">{totalPackages ? totalPackages : 0}</h2>
                        <p className="card-text">Total Packages</p>
                        {latestPackage ? (
                            <ul className="list-unstyled">
                            <p className="card-text"><u>Latest Package Created:</u></p>
                            <li><strong>Name:</strong> {latestPackage.name}</li>
                            <li><strong>Quantity:</strong> {latestPackage.quantity}</li>
                            <li><strong>Created At:</strong> {latestPackage.created_at}</li>
                            </ul>
                        ) : (
                            <p className="card-text">Latest Package Created: N/A</p>
                        )}
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
                        <h5 className="card-title">Hand-Out</h5>
                        <div className="card-body">
                            <h2 className="display-6">{nearestDelivery ? nearestDelivery.delivery_date : 'N/A'}</h2>
                            <p className="text-muted">Upcoming hand-out date</p>
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
