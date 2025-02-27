import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Timeline from "./Timeline"; // Import the Timeline component
import api from "../api";
import BackButton from "../BackButton";
import { Spinner, Card, Container, Row, Col } from "react-bootstrap";

const TrackingPage = () => {
  const { awbCod } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = process.env.REACT_APP_SHIPROCKET_TOKEN;

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const response = await api.get(`/dashboard/track/awb/${awbCod}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTrackingData(response.data.tracking_data);
      } catch (error) {
        console.error("Error fetching tracking data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [awbCod, token]);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div className="main-content py-4">
      <Container>
        <BackButton />
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title className="text-primary">
              Tracking Information
            </Card.Title>
            <Row>
              <Col md={6}>
                <p>
                  <strong>Status:</strong> {trackingData.track_status}
                </p>
                <p>
                  <strong>Shipment Status:</strong>{" "}
                  {trackingData.shipment_status}
                </p>
                <p>
                  <strong>Current Status:</strong>{" "}
                  {trackingData.shipment_track[0]?.current_status || "N/A"}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Courier Name:</strong>{" "}
                  {trackingData.shipment_track[0]?.courier_name || "N/A"}
                </p>
                <p>
                  <strong>Tracking URL:</strong>{" "}
                  <a
                    href={trackingData.track_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Track here
                  </a>
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title className="text-secondary">
              Tracking Activities
            </Card.Title>
            {trackingData.shipment_track_activities &&
            trackingData.shipment_track_activities.length > 0 ? (
              <Timeline activities={trackingData.shipment_track_activities} />
            ) : (
              <p>No tracking activities available.</p>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default TrackingPage;
