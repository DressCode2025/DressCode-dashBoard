import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api";
import StoreForm from "./StoreForm"; // Import StoreForm component

const CreateStorePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const token = localStorage.getItem("authToken");

  const fetchStores = async () => {
    setLoading(true); // Show spinner while fetching data
    try {
      const response = await api.get("/store/store-names", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStores(response.data.StoreNameAndIds);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false); // Hide spinner after data is fetched
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCardClick = (storeId) => {
    navigate(`/store-details/${storeId}`);
  };

  return (
    <div className="main-content">
      <div className="container mt-4">
        <Button variant="primary" onClick={handleShow} className="mb-4">
          Create Store
        </Button>

        <StoreForm
          showModal={showModal}
          handleClose={handleClose}
          fetchStores={fetchStores} // Pass fetchStores as prop to update store list
        />

        {loading ? ( // Show spinner while loading
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : stores.length > 0 ? ( // If stores are available, display them
          <Row xs={1} md={2} className="g-4" style={{ cursor: "pointer" }}>
            {stores.map((store, index) => (
              <Col key={index}>
                <Card
                  className="h-100 cursor-pointer"
                  onClick={() => handleCardClick(store.storeId)}
                >
                  <Card.Body>
                    <Card.Title>{store.storeName}</Card.Title>
                    <Card.Text>
                      <strong>ID:</strong> {store.storeId}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          // Message if no stores found
          <div className="text-center">
            <p>No stores available. Create one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateStorePage;
