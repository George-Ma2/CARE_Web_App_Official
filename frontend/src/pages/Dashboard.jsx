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
    const [orderedStudents, setOrderedStudents] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [checkedOrder, setCheckedOrder] = useState({});

    const handleCheckboxChange = async (orderId, currentStatus) => {
        try {
            const newStatus = currentStatus === "Picked Up" ? "Ordered" : "Picked Up";

            const response = await api.patch(`api/orderhistory/${orderId}/status/`, {
                status: newStatus,
            });

            console.log("Before update:", orderedStudents);
            setOrderedStudents((prevOrders) => [...prevOrders.map((entry) => ({
                ...entry,
                orders: entry.orders
                    .map((order) =>
                        order.id === orderId ? { ...order, status: newStatus } : order
                    )
                    .filter((order) => order.status === "Ordered"), 
            })).filter((entry) => entry.orders.length > 0)]);

            console.log("After update:", orderedStudents);
            console.log("Status updated successfully", response.data);
            closeConfirmModal();
        } catch (err) {
            console.error("Error updating order status:", err);
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

    
    const fetchUserOrders = async (userId) => {
        try {
            const response = await api.get(`api/user/order-history/?user_id=${userId}`);
            return response.data.orders || [];
        } catch (err) {
            console.error(`Error fetching orders for user ${userId}:`, err);
            return [];
        }
    };

    const fetchAllOrders = async () => {
        try {
            const ordersByStudent = await Promise.all(
                students.map(async (student) => {
                    const orders = await fetchUserOrders(student.id);
                    const filteredOrders = orders.filter((order) => order.status === "Ordered");
    
                    return filteredOrders.length > 0 ? { student, orders: filteredOrders } : null;
                })
            );
    
            setOrderedStudents([...ordersByStudent.filter(Boolean)]);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.message);
        }
    };
    
  
    useEffect(() => {
        if (students.length > 0) {
            fetchAllOrders();
        }
    }, [students]);
    

    const fetchDashboardData = async () => {
        try {
            const response = await api.get("api/dashboard/");
            const { category_summary, nearest_delivery } = response.data;
            setProducts(category_summary);  
            setNearestDelivery(nearest_delivery);

            console.log("Delivery:", nearest_delivery);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
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
        fetchUserOrders();
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

const openConfirmModal = (order, student) => {
    setSelectedOrder(order);
    setSelectedStudent(student);
    setShowConfirmModal(true);
 
};

const closeConfirmModal = () => {
    setSelectedOrder(null);
    setSelectedStudent(null);
    fetchAllOrders();
    setShowConfirmModal(false);
    setCheckedOrder({});

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
        <h5 className="card-title">Pending Orders</h5>
        <div className="card-body" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {orderedStudents.length > 0 ? (
                <ul className="list-group">
                    {orderedStudents.map(({ student, orders }) =>
                        orders.map((order) => (
                            <li key={order.order_number} className="list-group-item d-flex align-items-center justify-content-between">
                                <div>
                                    <strong>{student.first_name} {student.last_name}</strong>
                                    <br />
                                    <small><strong>Order Date:</strong> {order.order_date}</small>
                                    <br />
                                    <small><strong>Current Status:</strong> {order.status}</small>
                                </div>
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={!!checkedOrder[order.order_number]} 
                                    onChange={() => {
                                        setCheckedOrder((prev) => ({
                                            ...prev,
                                            [order.order_number]: !prev[order.order_number] 
                                        }));
                                        openConfirmModal(order, student);
                                    }}      
                                />
                            </li>
                        ))
                    )}
                </ul>
            ) : (
                <p>No pending orders</p>
            )}
        </div>
    </div>
</div>
                
      {/* Modal */}
      {showConfirmModal && (
        <div className="modal fade show" id="exampleModalCenter" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">Confirm Pickup</h5>
              </div>
              <div className="modal-body">
                <p>Confirm pickup for the selected order: </p>

                <div className="package-list">
             
                    {selectedOrder ? (
                                 <div>
                                <strong>{selectedStudent.first_name} {selectedStudent.last_name}</strong>
                                <br />
                                <small><strong>Order Date:</strong> {selectedOrder.order_date}</small>
                                 <br />
                                 <small><strong>Current Status:</strong> {selectedOrder.status}</small>
                                </div>

                    ): (
                    <p>No order selected.</p>
                  ) }
                </div>
              </div>

              <div className="modal-footer">
              <button style={{ backgroundColor: "green", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px" }}
                          onClick={() => handleCheckboxChange(selectedOrder.order_number, selectedOrder.status)} >
                          <strong>Confirm Pickup</strong>
                        </button>
                      
                <button type="button" className="btn btn-secondary" onClick={closeConfirmModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
