import React, { useEffect, useState } from "react";
import api from "../api";
import ReactECharts from 'echarts-for-react';

const InventoryDashboard = () => {
    const [products, setProducts] = useState([]);
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
        <div>
            <h2>Inventory Dashboard</h2>
            {error && <p>Error: {error}</p>}
            {products.length > 0 ? (
                <ReactECharts option={getChartOptions()} style={{ height: 400, width: 400 }} />
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
};
export default InventoryDashboard;
