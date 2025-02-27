import React, { useState, useEffect } from "react";
import { Table, Form, Spinner, Alert, Card, Pagination } from "react-bootstrap";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";

const StoreBills = () => {
  const [bills, setBills] = useState([]); // Ensure bills is always an array
  const [storeNames, setStoreNames] = useState([]); // Ensure storeNames is always an array
  const [selectedStore, setSelectedStore] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page

  // Fetch bills from the API
  const fetchBills = async () => {
    try {
      const response = await api.get(`/store/get-bills`);
      // Ensure the response data is an array and extract the `Bills` key
      const billsData = Array.isArray(response.data.Bills)
        ? response.data.Bills
        : [];
      setBills(billsData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch bills");
      setLoading(false);
    }
  };

  // Fetch store names from the API
  const fetchStoreNames = async () => {
    try {
      const response = await api.get(`/store/store-names`);
      // Ensure the response data is an array
      setStoreNames(
        Array.isArray(response.data.StoreNameAndIds)
          ? response.data.StoreNameAndIds
          : []
      );
    } catch (err) {
      setError("Failed to fetch store names");
    }
  };

  useEffect(() => {
    fetchBills();
    fetchStoreNames();
  }, []);

  // Handle row click to navigate to the bill detail page
  const handleRowClick = (billId) => {
    navigate(`/store-bills-details/${billId}`);
  };

  // Filter bills by selected store
  const filteredBills = selectedStore
    ? bills.filter((bill) => bill.storeId === selectedStore)
    : bills;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="main-content">
      <h2>Store Bills</h2>
      <Form.Group className="mb-3">
        <Form.Label>Filter by Store</Form.Label>
        <Form.Control
          as="select"
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
        >
          <option value="">All Stores</option>
          {storeNames.map((store) => (
            <option key={store.storeId} value={store.storeId}>
              {store.storeName}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      {filteredBills.length === 0 ? (
        <Card>
          <Card.Body>
            <Card.Text className="text-center">No bills found.</Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Date of Bill</th>
                <th>Total Amount</th>
                <th>Discount Percentage</th>
                <th>Price After Discount</th>
                <th>Store Name</th>
              </tr>
            </thead>
            <tbody>
              {currentBills.map((bill) => (
                <tr
                  key={bill.billId}
                  onClick={() => handleRowClick(bill.billId)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{bill.billId}</td>
                  <td>{new Date(bill.dateOfBill).toLocaleString()}</td>
                  <td>₹ {bill.TotalAmount}</td>
                  <td>{bill.discountPercentage}%</td>
                  <td>₹ {bill.priceAfterDiscount}</td>
                  <td>{bill.storeName}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          <Pagination>
            {Array.from({
              length: Math.ceil(filteredBills.length / itemsPerPage),
            }).map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}
    </div>
  );
};

export default StoreBills;
