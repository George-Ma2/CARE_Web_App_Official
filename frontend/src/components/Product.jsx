// import { Navigate } from "react-router-dom";
// import api from "../api";
// import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
// import React, { useEffect, useState } from 'react';

// const ProductTable = () => {
//   // const [products, setProducts] = useState([]);

//   // useEffect(() => {
    
//   //   fetch('api/products/')
//   //     .then((response) => response.json())
//   //     .then((data) => setProducts(data))
//   //     .catch((error) => console.error('Error fetching product data:', error));
//   // }, []);
//   const [products, setProducts] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetch('http://127.0.0.1:8000/api/products/', {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`
//       }
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then((data) => setProducts(data))
//       .catch((err) => console.error('Error fetching product data:', err));
//   }, []);

//   return (
//     <div className="container mt-4">
//       <h2>Product Inventory</h2>
//       <table className="table table-striped table-bordered">
//         <thead>
//           <tr>
//             <th>Product ID</th>
//             <th>Product Name</th>
//             <th>Category</th>
//             <th>Qty on Hand</th>
//             <th>Qty Delivered</th>
//             <th>Qty on Change</th>
//             <th>Expiration Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {products.map((product) => (
//             <tr key={product.id}> 
//               <td>{product.id}</td>
//               <td>{product.name}</td>
//               <td>{product.category}</td>
//               <td>{product.qty_on_hand}</td>
//               <td>{product.qty_delivered}</td>
//               <td>{product.qty_on_change}</td>
//               <td>{product.exp_date}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ProductTable;


import React, { useEffect, useState } from "react";

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProducts, setNewProducts] = useState([
    { id: "", name: "", category: "", exp_date: "" },
  ]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [mode, setMode] = useState("manage");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => setError("Error fetching product data"));
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddProducts = (e) => {
    e.preventDefault(); // Prevent form submission
    const validProducts = newProducts.filter(
      (product) => product.id && product.name && product.category && product.exp_date
    );
    if (validProducts.length > 0) {
      fetch("http://127.0.0.1:8000/api/products/bulk/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(validProducts),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setProducts([...products, ...data]);
          setNewProducts([{ id: "", name: "", category: "", exp_date: "" }]);
        })
        .catch((err) => setError("Error adding products"));
    }
  };

  const handleDeleteProducts = () => {
    selectedProducts.forEach((id) => {
      fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          setProducts(products.filter((product) => product.id !== id));
        })
        .catch((err) => setError("Error deleting product"));
    });
  };

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((productId) => productId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleChangeProduct = (index, field, value) => {
    const updatedProducts = [...newProducts];
    updatedProducts[index][field] = value;
    setNewProducts(updatedProducts);
  };

  const addNewProductRow = () => {
    setNewProducts([...newProducts, { id: "", name: "", category: "", exp_date: "" }]);
  };

  const removeProductRow = (index) => {
    const updatedProducts = newProducts.filter((_, i) => i !== index);
    setNewProducts(updatedProducts);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2>Manage Products</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="navbar-nav">
          <button
            className={`nav-item nav-link ${mode === "manage" ? "active" : ""}`}
            onClick={() => setMode("manage")}
          >
            Manage Products
          </button>
          <button
            className={`nav-item nav-link ${mode === "add" ? "active" : ""}`}
            onClick={() => setMode("add")}
          >
            Add Product
          </button>
        </div>
      </nav>

      {/* Add Product Form (Table Format) */}
      {mode === "add" && (
        <div>
          <form onSubmit={handleAddProducts}>
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Expiration Date</th>
                    <th style={{ width: "50px" }}>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={addNewProductRow}
                      >
                        +
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {newProducts.map((product, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={product.id}
                          onChange={(e) =>
                            handleChangeProduct(index, "id", e.target.value)
                          }
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={product.name}
                          onChange={(e) =>
                            handleChangeProduct(index, "name", e.target.value)
                          }
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={product.category}
                          onChange={(e) =>
                            handleChangeProduct(index, "category", e.target.value)
                          }
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="form-control"
                          value={product.exp_date}
                          onChange={(e) =>
                            handleChangeProduct(index, "exp_date", e.target.value)
                          }
                          required
                        />
                      </td>
                      <td>
                        {/* Minus Button to Remove Row */}
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeProductRow(index)}
                        >
                          -
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row mb-3">
              <div className="col-md-12 text-right">
                <button type="submit" className="btn btn-primary">
                  Add Products
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Manage Products Table */}
      {mode === "manage" && (
        <>
          {/* Search Bar */}
          <div className="row mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search for a product..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            {/* Delete Selected Button */}
            <div className="col-md-6 text-right">
              <button
                className="btn btn-danger"
                onClick={handleDeleteProducts}
                disabled={selectedProducts.length === 0}
                style={{
                  position: "relative", // Positioned relative to the table
                  top: "0", 
                  right: "0",
                }}
              >
                Delete Selected Products
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        e.target.checked
                          ? setSelectedProducts(products.map((product) => product.id))
                          : setSelectedProducts([])
                      }
                      checked={selectedProducts.length === products.length}
                    />
                  </th>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Expiration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                        />
                      </td>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.exp_date}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteProducts(product.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No products available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductTable;

