import React from "react";
import { Doughnut } from "react-chartjs-2";
// import "./Dashboard.css"; // 

const Board = () => {
  // Dummy data for the donut chart
  const productData = {
    labels: ["Food", "Hygiene Kits", "Stationery"],
    datasets: [
      {
        data: [30, 50, 20], // Replace with API data
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  // Dummy data
  const students = [
    { id: 1, name: "John Doe", boxesDelivered: 5 },
    { id: 2, name: "Jane Smith", boxesDelivered: 3 },
    { id: 3, name: "Carlos Vega", boxesDelivered: 7 },
  ];

  // Summary
  const totalBoxesDelivered = students.reduce((sum, student) => sum + student.boxesDelivered, 0);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Donut Chart Section */}
      <div className="dashboard-section chart-section">
        <h2>Product Distribution</h2>
        <Doughnut data={productData} />
      </div>

      {/* Student List Section */}
      <div className="dashboard-section student-list">
        <h2>Student List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Boxes Delivered</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.boxesDelivered}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="dashboard-section summary">
        <h2>Summary</h2>
        <p>Total Boxes Delivered: {totalBoxesDelivered}</p>
      </div>
    </div>
  );
};

export default Board;
