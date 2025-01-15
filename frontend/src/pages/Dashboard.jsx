import React, { useEffect, useState } from "react";
import api from "../api";
import ReactECharts from "echarts-for-react";
import "../styles/Dashboard.css";

const InventoryDashboard = () => {
    const [products, setProducts] = useState([]);
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);
    const [lowInventoryProducts, setLowInventoryProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const response = await api.get("api/dashboard/");
            setProducts(response.data);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get("api/students/");
            setStudents(response.data);
        } catch (err) {
            console.error("Error fetching students:", err);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchStudents();
    }, []);

    useEffect(() => {
        if (products.length > 0 && students.length > 0) {
            const requiredQuantity = students.length;
            const lowInventory = products.filter(
                (product) => product.total_quantity < requiredQuantity
            );
            setLowInventoryProducts(lowInventory);
        }
    }, [products, students]);

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
                                    {students.map((student) => (
                                        <li key={student.id} className="list-group-item d-flex align-items-center justify-content-between">
                                            <div>
                                                <strong>{student.name}</strong> <br />
                                                <small>ID: {student.id}</small>
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
            {/* Additional Cards Section */}
            <div className="row g-4 mt-4">
                <div className="col-lg-4">
                    <div className="card text-center shadow-sm p-4">
                        <h5 className="card-title">Handouts Completed</h5>
                        <div className="card-body">
                            <h2 className="display-4">N/A</h2>
                            <p className="text-muted">Total packages handed out</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card text-center shadow-sm p-4">
                        <h5 className="card-title">Students Registered</h5>
                        <div className="card-body">
                            <h2 className="display-4">{students.length}</h2>
                            <p className="text-muted">Total students in the system</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card text-center shadow-sm p-4">
                        <h5 className="card-title">Last Scheduled Delivery</h5>
                        <div className="card-body">
                            <h2 className="display-6">N/A</h2>
                            <p className="text-muted">Last delivery date</p>
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
                                            {product.category} is low on stock with {product.total_quantity} items remaining.
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
