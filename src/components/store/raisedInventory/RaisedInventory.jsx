import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import api from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";

const RaisedInventory = () => {
  const [inventoryRequests, setInventoryRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(5);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const navigate = useNavigate(); // Initialize navigate

  const fetchRaisedInventoryRequests = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await api.get("/store/raised-inventory-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.raisedInventoryReqs) {
        setInventoryRequests(response.data.raisedInventoryReqs);
        setFilteredRequests(response.data.raisedInventoryReqs); // Initially display all requests
      } else {
        setInventoryRequests([]);
        setFilteredRequests([]);
      }
    } catch (err) {
      setError("Failed to fetch raised inventory requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaisedInventoryRequests();
  }, []);

  const filterRequestsByStatus = (status) => {
    setSelectedStatus(status);
    if (status === "All") {
      setFilteredRequests(inventoryRequests);
    } else {
      const filtered = inventoryRequests.filter(
        (request) => request.status === status
      );
      setFilteredRequests(filtered);
    }
    setCurrentPage(1); // Reset to the first page when filtering
  };

  // Handle navigation to the detailed page when a row is clicked
  const handleRowClick = (raisedInventoryId) => {
    navigate(`/raised-inventory/${raisedInventoryId}`);
  };

  // Get current requests for pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-3" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="container mt-4">
        <h2 className="mb-4">Raised Inventory Requests</h2>

        {/* Status Filter */}
        <div className="mb-3">
          {["All", "PENDING", "APPROVED", "REJECTED", "RECEIVED", "DRAFT"].map(
            (status) => (
              <button
                key={status}
                className={`btn btn-outline-primary me-2 ${
                  selectedStatus === status ? "active" : ""
                }`}
                onClick={() => filterRequestsByStatus(status)}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            )
          )}
        </div>

        {filteredRequests.length > 0 ? (
          <>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Status</th>
                  <th scope="col">Received Date</th>
                </tr>
              </thead>
              <tbody>
                {currentRequests.map((request) => (
                  <tr
                    key={request.raisedInventoryId}
                    onClick={() => handleRowClick(request.raisedInventoryId)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{request.raisedInventoryId}</td>
                    <td>{request.status}</td>
                    <td>
                      {request.receivedDate
                        ? new Date(request.receivedDate).toLocaleDateString()
                        : "..."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <nav>
              <ul className="pagination justify-content-center">
                {Array.from({
                  length: Math.ceil(filteredRequests.length / requestsPerPage),
                }).map((_, idx) => (
                  <li
                    key={idx}
                    className={`page-item ${
                      currentPage === idx + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      onClick={() => paginate(idx + 1)}
                      className="page-link"
                    >
                      {idx + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        ) : (
          <div className="alert alert-warning" role="alert">
            No raised inventory requests found.
          </div>
        )}
      </div>
    </div>
  );
};

export default RaisedInventory;
