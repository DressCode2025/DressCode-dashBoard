import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from './api';

import { useNavigate } from 'react-router-dom';  // Import useNavigate hook
import 'bootstrap/dist/css/bootstrap.min.css';

const UploadHistory = () => {
  const { userData } = useAuth();
  const [uploadHistoryData, setUploadHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Items per page
  const navigate = useNavigate();  // Initialize useNavigate

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    api
      .get("/dashboard/uploadHistories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const fetchedData = response.data.data;
        setUploadHistoryData(fetchedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching upload history:", error);
        setLoading(false);
      });
  }, []);

  // Calculate paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = uploadHistoryData.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Determine total pages
  const totalPages = Math.ceil(uploadHistoryData.length / itemsPerPage);

  const handleRowClick = (uploadId) => {
    navigate(`/upload-history/${uploadId}/products`);
  };

  return (
    <div className="main-content">
      <header className="d-flex justify-content-between align-items-center my-3">
        <h2 className="mb-0">Welcome Back, {userData.name}</h2>
      </header>
      <p className="text-muted">Here is the information about all your uploaded inventory</p>
      <h2>Upload Inventory History List</h2>

      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>No</th>
                <th>Upload ID</th>
                <th>Date of Upload</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((upload, index) => (
                <tr key={upload.uploadedId} onClick={() => handleRowClick(upload.uploadedId)} style={{ cursor: "pointer" }}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{upload.uploadedId}</td>
                  <td>{new Date(upload.uploadedDate).toLocaleDateString()}</td>
                  <td>{upload.totalAmountOfUploaded.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <nav>
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
                    className="page-link"
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
  );
};

export default UploadHistory;

