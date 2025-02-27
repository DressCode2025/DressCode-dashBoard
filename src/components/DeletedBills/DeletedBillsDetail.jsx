import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Button,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import api from "../api"; // Your API setup
import Swal from "sweetalert2";
import BackButton from "../BackButton";

const DeletedBillsDetail = () => {
  const { billId } = useParams();
  const [billDetails, setBillDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.get(`/store/get-bill-details/${billId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBillDetails(response.data.result);
      } catch (error) {
        console.error("Error fetching bill details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillDetails();
  }, [billId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!billDetails) {
    return <Typography variant="h6">Bill details not found.</Typography>;
  }

  const {
    customer,
    products,
    TotalAmount,
    discountPercentage,
    priceAfterDiscount,
    modeOfPayment,
    dateOfBill,
    dateOfDeleteBillReq,
    dateOfDeletion,
    dateOfDeleteBillReqValidation,
    invoiceNo,
    deleteReqStatus,
    RequestedBillDeleteNote,
    storeId,
    ValidatedBillDeleteNote,
  } = billDetails;

  const handleDeleteRequest = async (storeId, billId, isApproved, navigate) => {
    const token = localStorage.getItem("authToken");
    if (!token) return; // Ensure token exists

    const apiUrl = `/store/validate-bill-delete-req/?storeId=${storeId}&billId=${billId}&isApproved=${isApproved}`;

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success me-3",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: true,
    });

    // Prompt the user to input a validation note
    const { value: note } = await Swal.fire({
      title: isApproved ? "Approve Deletion Note" : "Reject Deletion Note",
      input: "textarea",
      inputPlaceholder: "Enter your note here...",
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "You need to provide a reason!";
        }
      },
    });

    // If the user cancels or doesn't input a note, stop the execution
    if (!note) return;

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: `You are about to ${isApproved ? "approve" : "reject"
          } this deletion request!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, proceed!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.patch(
              apiUrl,
              {
                ValidatedBillDeleteNote: note, // Add the note to the request body
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            swalWithBootstrapButtons.fire({
              title: `${isApproved ? "Approved" : "Rejected"}!`,
              text: `The deletion request has been ${isApproved ? "approved" : "rejected"
                } successfully.`,
              icon: "success",
              showCancelButton: false,
              showConfirmButton: false,
              timer: 1000,
            });

            navigate(-1); // Go back to the previous page
          } catch (error) {
            console.error("Error processing request:", error);
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong! Please try again later.",
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire({
            title: "Cancelled",
            text: "The deletion request was not processed.",
            icon: "error",
            showConfirmButton: false,
            timer: 1000,
          });
        }
      });
  };
  return (
    <div className="main-content">

      <BackButton></BackButton>

      <Paper sx={{ mt: 4, p: 3 }}>
        {/* Header Information */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              <strong>Customer Name:</strong> {customer.customerName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              <strong>Customer Phone:</strong> {customer.customerPhone}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              <strong>Customer Email:</strong> {customer.customerEmail}
            </Typography>
          </Grid>
        </Grid>

        {/* Bill Information */}
        <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Particular Bill Details
          </Typography>
          <Divider />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <Typography variant="body2">Billing ID</Typography>
              <Typography variant="body1">#{invoiceNo}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">Date Of Bill</Typography>
              <Typography variant="body1">
                {new Date(dateOfBill).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                Date Of Delete Bill Request
              </Typography>
              <Typography variant="body1">
                {new Date(dateOfDeleteBillReq).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">Date Of Deletion</Typography>
              <Typography variant="body1">
                {dateOfDeleteBillReqValidation
                  ? new Date(dateOfDeleteBillReqValidation).toLocaleDateString()
                  : "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">Delete Request Status</Typography>
              <Typography variant="body1">{deleteReqStatus}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">Mode of Payment</Typography>
              <Typography variant="body1">{modeOfPayment}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Product Table */}
        <Typography variant="h6" sx={{ mt: 3 }}>
          Products
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 1 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#333" }}>
              <TableRow>
                <TableCell sx={{ color: "#fff" }}>Category</TableCell>
                <TableCell sx={{ color: "#fff" }}>Product ID</TableCell>
                <TableCell sx={{ color: "#fff" }}>Product Name</TableCell>
                <TableCell sx={{ color: "#fff" }}>Gender</TableCell>
                <TableCell sx={{ color: "#fff" }}>Pattern</TableCell>
                <TableCell sx={{ color: "#fff" }}>Color</TableCell>
                <TableCell sx={{ color: "#fff" }}>Size</TableCell>
                <TableCell sx={{ color: "#fff" }}>Quantity</TableCell>
                <TableCell sx={{ color: "#fff" }}>Price</TableCell>
                <TableCell sx={{ color: "#fff" }}>Sub Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) =>
                product.variants.map((variant) =>
                  variant.variantSizes.map((size) => (
                    <TableRow key={size._id}>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.productId}</TableCell>
                      <TableCell>{product.productType}</TableCell>
                      <TableCell>{product.gender}</TableCell>
                      <TableCell>{product.pattern}</TableCell>
                      <TableCell>{variant.color.name}</TableCell>
                      <TableCell>{size.size}</TableCell>
                      <TableCell>{size.billedQuantity}</TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>
                        ₹{size.billedQuantity * product.price}
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Price Details */}
        <Box sx={{ mt: 3, textAlign: "right" }}>
          <Typography variant="body1">
            <strong>Discount %:</strong> {discountPercentage}%
          </Typography>
          <Typography variant="body1">
            <strong>Total Price:</strong> ₹{TotalAmount}
          </Typography>
          <Typography variant="body1">
            <strong>Price After Discount:</strong> ₹{priceAfterDiscount}
          </Typography>
        </Box>
        <Typography>Note :- {RequestedBillDeleteNote}</Typography>
        {deleteReqStatus !== "PENDING" && (
          <Typography>Validation Note :- {ValidatedBillDeleteNote}</Typography>
        )}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          {/* Back Button */}
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back to Deleted Bills
          </Button>

          {/* Approve Delete Button */}
          <Button
            variant="contained"
            color="success"
            onClick={() => handleDeleteRequest(storeId, billId, true, navigate)}
            disabled={deleteReqStatus !== "PENDING"}
          >
            Approve Delete
          </Button>

          {/* Reject Button */}
          <Button
            variant="contained"
            color="error"
            onClick={() =>
              handleDeleteRequest(storeId, billId, false, navigate)
            }
            disabled={deleteReqStatus !== "PENDING"}
          >
            Reject
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default DeletedBillsDetail;
