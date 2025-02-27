import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Button, Alert, Pagination } from "react-bootstrap";
import api from "../api"; // Import the API instance
import Header from "../Header";
import { useAuth } from "../../context/AuthContext";
const CancelOrder = () => {
  const [activeTab, setActiveTab] = useState("cancelled"); // Default tab is 'cancelled'
  const [orders, setOrders] = useState([]); // Ensure it's initialized as an empty array
  const [loading, setLoading] = useState(false); // For showing spinner
  const [error, setError] = useState(null); // For error handling
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(1); // Total pages available
  const ordersPerPage = 10; // Number of orders per page
  const navigate = useNavigate(); // Updated to useNavigate for routing
  const token = localStorage.getItem("authToken"); // Retrieve the token from local storage
  const { userData } = useAuth();
  useEffect(() => {
    const fetchOrders = async () => {
      const apiUrl =
        activeTab === "cancelled"
          ? "/dashboard/getCanceledOrders"
          : "/dashboard/getRefundedOrders";

      setLoading(true); // Show loading spinner
      setError(null); // Reset error before fetching

      try {
        const response = await api.get(
          `${apiUrl}?page=${currentPage}&limit=${ordersPerPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
        );

        console.log("API Response:", response.data); // Log the full response for debugging

        // Handle data based on the active tab
        setOrders(response.data.orders || []); // Adjust based on your actual API response
        setTotalPages(response.data.totalPages || 1); // Update total pages based on the response
      } catch (error) {
        setError("Error fetching orders. Please try again.");
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false); // Hide loading spinner
      }
    };

    fetchOrders();
  }, [activeTab, currentPage, token]); // Run effect when activeTab, currentPage, or token changes

  // Handle order click and navigate to detail page
  const handleOrderClick = (orderId) => {
    navigate(`/cancel-details/${orderId}`); // Navigate to the detailed page
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); // Update the current page
  };

  return (
    <div className="main-content">
      <div className="container mt-4">
        <Header userName={userData.name} />
        <h1 className="mb-4">Cancelled Orders & Refunded Orders</h1>

        <div className="mb-3">
          <Button
            variant={activeTab === "cancelled" ? "primary" : "secondary"}
            onClick={() => setActiveTab("cancelled")}
            className="me-2"
          >
            Cancelled Orders
          </Button>
          <Button
            variant={activeTab === "refunded" ? "primary" : "secondary"}
            onClick={() => setActiveTab("refunded")}
          >
            Refunded Orders
          </Button>
        </div>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          <div>
            {orders.length > 0 ? (
              <div>
                <ul className="list-group">
                  {orders.map((order, index) => (
                    <li
                      key={index} // Use index temporarily if orderId is problematic
                      className="list-group-item list-group-item-action"
                      onClick={() => handleOrderClick(order.orderId)}
                    >
                      <p>
                        <strong>Order ID:</strong> {order.orderId}
                      </p>
                      <p>
                        <strong>Date of Order:</strong>{" "}
                        {new Date(order.dateOfOrder).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* Pagination Controls */}
                <div className="mt-3">
                  <Pagination>
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                    {[...Array(totalPages).keys()].map((pageNumber) => (
                      <Pagination.Item
                        key={pageNumber + 1}
                        active={pageNumber + 1 === currentPage}
                        onClick={() => handlePageChange(pageNumber + 1)}
                      >
                        {pageNumber + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              </div>
            ) : (
              <Alert variant="info">No orders found.</Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelOrder;
