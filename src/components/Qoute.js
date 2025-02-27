import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import Layout from './Layout';
import { useAuth } from '../context/AuthContext';
import "./Qoute.css";
const QuoteOrderDetails = () => {
  const [quoteOrders, setQuoteOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const { userData } = useAuth();
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuoteOrders = async () => {
      try {
        const response = await api.get('/dashboard/getQuotes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setQuoteOrders(response.data);
      } catch (error) {
        console.error('Error fetching quote orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuoteOrders();
  }, [token]);

  // Pagination logic
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = quoteOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handleRowClick = (quoteID) => {
    navigate(`/quote/${quoteID}`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="sr-only"></span>
        </div>
      </div>
    );
  }

  return (
    <Layout userName={userData.name}>
      <h3 className="text-center mb-3">Quote Order Details</h3>
      {quoteOrders.length === 0 ? (
        <div className="text-center">
          <p>No quote orders available.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table table-striped sticky-header">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Quote ID</th>
                  <th>Date Of Quote</th>
                  <th>Client Name</th>
                  <th>Phone No</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <tr key={order.quoteID} onClick={() => handleRowClick(order.quoteID)} style={{ cursor: 'pointer' }}>
                    <td>{index + 1 + indexOfFirstOrder}</td>
                    <td>{order.quoteID}</td>
                    <td>{new Date(order.dateOfQuoteRecived).toLocaleDateString()}</td>
                    <td>{order.clientName}</td>
                    <td>{order.clientPhoneNo}</td>
                    <td>{order.clientEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav>
            <ul className="pagination justify-content-center">
              {[...Array(Math.ceil(quoteOrders.length / itemsPerPage)).keys()].map((pageNumber) => (
                <li key={pageNumber} className={`page-item ${currentPage === pageNumber + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(pageNumber + 1)}>
                    {pageNumber + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </Layout>
  );
};

export default QuoteOrderDetails;
