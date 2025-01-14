import React, { useEffect, useState } from "react";
import api from "../api";
import ReactECharts from 'echarts-for-react';
import "../styles/Dashboard.css";

const InventoryDashboard = () => {
    const [products, setProducts] = useState([]);
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);
    const fetchProducts = async () => {
        try {
            const response = await api.get("api/dashboard/");
            setProducts(response.data);
        } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        } 
    };
        useEffect(() => {
        fetchProducts();
    }, []);
    const getChartOptions = () => {
        return {
            tooltip: {
                trigger: 'item',
            },
            legend: {
                top: '5%',
                left: 'center',
            },
            series: [
                {
                    name: 'Product Type',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#feff',
                        borderWidth: 2,
                    },
                    label: {
                        show: true,
                        formatter: '{b}: {c}',
                    },
                    labelLine: {
                        show: true,
                    },
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
    <h2>Inventory Dashboard</h2>
    <div className="row">
        {/* Chart Section */}
        <div className="col-md-6 mb-3">
            <div className="chart-container p-3 border rounded">
                {products.length > 0 ? (
                    <ReactECharts option={getChartOptions()} style={{ height: 300, width: '100%' }} />
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </div>

        {/* Student List */}
        <div className="col-md-6 mb-3">
            <div className="students-card p-3 border rounded">
                <h3>Students Handout Box</h3>
                {students.length > 0 ? (
                    <ul className="list-unstyled">
                        {students.map((student) => (
                            <li key={student.id}>
                                {student.name} - {student.package_name}
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
    );
};

export default InventoryDashboard;
