import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import BackButton from "../BackButton";

const CancelOrderDetails = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refundStatus, setRefundStatus] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState("");
  const [refundError, setRefundError] = useState("");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(
          `/dashboard/getOrderDetails/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrderDetails(response.data?.orderDetails);
        setRefundStatus(response.data?.orderDetails?.refund_payment_status);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError("Failed to load order details.");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token, refundSuccess]);

  const handleRefund = async () => {
    setProcessingRefund(true);
    setRefundSuccess("");
    setRefundError("");

    try {
      const response = await api.patch(
        `/dashboard/updateRefundStatus/${orderId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data.message === "Refund payment status updated successfully."
      ) {
        setRefundStatus("Refunded");
        setRefundSuccess("Refund has been processed successfully.");
      } else {
        setRefundError("Refund processing failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      setRefundError("Failed to process refund.");
    } finally {
      setProcessingRefund(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="alert alert-danger text-center">{error}</p>;
  }

  if (!orderDetails) {
    return <p className="text-center">No details found for this order.</p>;
  }

  return (
    <div className="main-content">

      <BackButton></BackButton>

      {/* Customer Information */}
      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <strong>Customer Information</strong>
          <div>
            <strong>Name:</strong> {orderDetails.userDetails.name}
          </div>
          <div>
            <strong>Email:</strong> {orderDetails.userDetails.email}
          </div>
          <div>
            <strong>Gender:</strong> {orderDetails.userDetails.gender}
          </div>
          <div>
            <strong>Phone Number:</strong>{" "}
            {orderDetails.userDetails.phoneNumber}
          </div>
        </div>
        <div className="col-12 col-md-6">
          <strong>Shipping Address</strong>
          <div>
            <strong>Name:</strong> {orderDetails.addressDetails.firstName}{" "}
            {orderDetails.addressDetails.lastName}
          </div>
          <div>
            <strong>Address:</strong> {orderDetails.addressDetails.address},{" "}
            {orderDetails.addressDetails.city},{" "}
            {orderDetails.addressDetails.state},{" "}
            {orderDetails.addressDetails.pinCode}
          </div>
          <div>
            <strong>Phone:</strong> {orderDetails.addressDetails.phone}
          </div>
          <div>
            <strong>Email:</strong> {orderDetails.addressDetails.email}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <h3 className="mb-3 text-center mt-5">Particular Order Details</h3>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date Of Order</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{orderDetails.orderId}</td>
              <td>{new Date(orderDetails.dateOfOrder).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover mt-3">
          <thead className="table-dark">
            <tr className="text-center">
              <th>Product Id</th>
              <th>Group</th>
              <th>Category</th>
              <th>Sub Category</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Logo Url</th>
              <th>Logo Position</th>
              <th>Price</th>
              <th>Color</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.products.map((product, index) => (
              <tr key={index}>
                <td className="text-center">{product.productId}</td>
                <td className="text-center">{product.group}</td>
                <td className="text-center">
                  {product.productDetails.category}
                </td>
                <td className="text-center">
                  {product.productDetails.subCategory}
                </td>
                <td className="text-center">
                  {product.productDetails.productType}
                </td>
                <td className="text-center">{product.quantityOrdered}</td>
                <td className="text-center">
                  {product.logoUrl ? (
                    <a
                      href={product.logoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                    >
                      <i className="bi bi-download"></i>
                    </a>
                  ) : (
                    <span>NA</span>
                  )}
                </td>
                <td className="text-center">
                  {product.logoPosition ? product.logoPosition : "NA"}
                </td>
                <td className="text-center">₹{product.price.toFixed(2)}</td>
                <td className="text-center">{product.color.name}</td>
                <td className="text-center">{product.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Summary */}
      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <strong>Discount :</strong> ₹{orderDetails.TotalDiscountAmount} <br />
          <strong>Date of Canceled:</strong>{" "}
          {new Date(orderDetails.dateOfCanceled).toLocaleDateString()} <br />
          <strong>Date of Return:</strong>{" "}
          {orderDetails.dateOfRefunded
            ? new Date(orderDetails.dateOfRefunded).toLocaleDateString()
            : "Not Assigned"}
        </div>
        <div className="col-12 col-md-6 text-md-end">
          <strong>Total Price:</strong> ₹{orderDetails.TotalPriceAfterDiscount}
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-12 text-md-end">
          <strong>Delivery Status:</strong> {orderDetails.deliveryStatus} <br />
          <strong>Refund Status:</strong> {refundStatus} <br />
        </div>
      </div>
      {/* Refund Button */}
      <div className="row mb-3">
        <div className="col-12 text-md-end">
          {processingRefund ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Processing refund...</span>
              </div>
            </div>
          ) : refundStatus === "Pending" ? (
            <button className="btn btn-primary" onClick={handleRefund}>
              Process Refund
            </button>
          ) : (
            <span className="text-danger">
              Already Refunded!/Refund Not Available!
            </span>
          )}
          {refundSuccess && (
            <div className="alert alert-success mt-3">{refundSuccess}</div>
          )}
          {refundError && (
            <div className="alert alert-danger mt-3">{refundError}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancelOrderDetails;
