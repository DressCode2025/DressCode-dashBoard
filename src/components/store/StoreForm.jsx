import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../api";
const StoreForm = ({ showModal, handleClose, fetchStores }) => {
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [emailID, setEmailID] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for spinner

  const token = localStorage.getItem("authToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner

    try {
      await api.post(
        "/store/create-store",
        {
          storeName,
          storeAddress,
          city,
          pincode,
          state,
          commissionPercentage: parseInt(commissionPercentage, 10),
          userName,
          phoneNo,
          emailID,
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchStores(); // Fetch updated store list
      handleClose(); // Close modal
    } catch (error) {
      console.error("Error creating store:", error);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Store</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="storeName" className="mb-3">
            <Form.Label>Store Name</Form.Label>
            <Form.Control
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="storeAddress" className="mb-3">
            <Form.Label>Store Address</Form.Label>
            <Form.Control
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="city" className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="pincode" className="mb-3">
            <Form.Label>Pincode</Form.Label>
            <Form.Control
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="state" className="mb-3">
            <Form.Label>State</Form.Label>
            <Form.Control
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="commissionPercentage" className="mb-3">
            <Form.Label>Commission Percentage</Form.Label>
            <Form.Control
              type="number"
              value={commissionPercentage}
              onChange={(e) => setCommissionPercentage(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="userName" className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="phoneNo" className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="emailID" className="mb-3">
            <Form.Label>Email ID</Form.Label>
            <Form.Control
              type="email"
              value={emailID}
              onChange={(e) => setEmailID(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="password" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Create Store"
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default StoreForm;
