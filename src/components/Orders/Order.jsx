import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Header from "../Header";
import { useAuth } from "../../context/AuthContext";
import "./Order.css"; // Import CSS for sticky header

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Items per page
  const [selectedGroups, setSelectedGroups] = useState([]); // Array to store selected groups
  const { userData } = useAuth();
  const navigate = useNavigate();

  // Fetch orders based on selected groups
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    // Build the query parameter for groups
    const groupsQuery =
      selectedGroups.length > 0 ? `?groups=${selectedGroups.join(",")}` : "";

    setLoading(true);
    setError(null);

    api
      .get(`/dashboard/getOrders${groupsQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const fetchedOrders = response.data.orders;
        setOrders(fetchedOrders);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders. Please try again later.");
        setLoading(false);
      });
  }, [selectedGroups]); // Re-fetch orders when selectedGroups changes

  // Filter orders based on status
  useEffect(() => {
    setFilteredOrders(orders.filter((order) => order.status === status));
  }, [status, orders]);

  // Pagination calculations
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleRowClick = (orderId, status) => {
    navigate(`/order-details/${orderId}`, { state: { status } });
  };

  // Handle group selection/deselection
  const handleGroupChange = (group) => {
    if (selectedGroups.includes(group)) {
      // Deselect the group if already selected
      setSelectedGroups(selectedGroups.filter((g) => g !== group));
    } else {
      // Select the group if not already selected
      setSelectedGroups([...selectedGroups, group]);
    }
    setCurrentPage(1); // Reset to the first page when changing groups
  };

  return (
    <div className="main-content">
      <div className="container mt-4">
        <Header userName={userData.name} />
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button
              className={`btn me-2 ${
                status === "Pending" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setStatus("Pending")}
            >
              Pending
            </button>
            <button
              className={`btn ${
                status === "Assigned" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setStatus("Assigned")}
            >
              Assigned
            </button>
          </div>
          <div>
            {["HEAL", "ELITE", "TOGS"].map((group) => (
              <button
                key={group}
                className={`btn me-2 ${
                  selectedGroups.includes(group)
                    ? "btn-success"
                    : "btn-outline-success"
                }`}
                onClick={() => handleGroupChange(group)}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center">
            <p className="text-muted">
              No orders available for the selected filters.
            </p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="table table-bordered sticky-header">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Status</th>
                    <th>Date of Order</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      onClick={() =>
                        handleRowClick(order.orderId, order.status)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <td>{order.orderId}</td>
                      <td>
                        <span
                          className={`badge ${
                            order.status === "Pending"
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {new Date(order.dateOfOrder).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => (
                  <li key={index} className="page-item">
                    <button
                      className={`page-link ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </>
        )}
      </div>
    </div>
  );
};

export default Order;
