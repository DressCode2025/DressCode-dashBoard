import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams } from "react-router-dom";
import BackButton from "../BackButton";
import {
  Button,
  TextField,
  CircularProgress,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Box,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { pdf } from "@react-pdf/renderer";
import Invoice from "../Invoice/Invoice";
import { saveAs } from "file-saver";
// import InvoiceForApprove from "../Invoice/Invoiceforapprove";
const ReqEditBillsDetail = () => {
  const { editBillReqId } = useParams();
  const [billDetails, setBillDetails] = useState(null);
  const [validateNote, setValidateNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBillDetails(); // Fetch bill details on mount
  }, [editBillReqId]);

  // Function to fetch bill details
  const fetchBillDetails = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await api.get(
        `/store/get-bill-edit-req-details/${editBillReqId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBillDetails(response.data.result);
    } catch (err) {
      setError("Failed to fetch bill details.");
    } finally {
      setLoading(false);
    }
  };

  const validateBillEditReq = async (isApproved) => {
    setValidationLoading(true);
    setError(null);

    const token = localStorage.getItem("authToken");
    try {
      const response = await api.patch(
        `/store/validate-bill-edit-req/?editBillReqId=${editBillReqId}&isApproved=${isApproved}`,
        { validateNote },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data.result;

      // Notify user based on approval status
      if (isApproved) {
        toast.success("Bill Edit Request validated successfully!");

        // Step 2: Generate the PDF only if the request is approved
        const invoiceBlob = await pdf(<Invoice data={result} />).toBlob();
        const invoiceUrl = URL.createObjectURL(invoiceBlob);

        // Create a download link for the invoice PDF
        const invoiceDownloadLink = document.createElement("a");
        invoiceDownloadLink.href = invoiceUrl;
        invoiceDownloadLink.download = `${result.invoiceNo}.pdf`;
        document.body.appendChild(invoiceDownloadLink);
        invoiceDownloadLink.click();
        document.body.removeChild(invoiceDownloadLink); // Clean up

        // Prepare FormData for PDF upload
        const pdfFormData = new FormData();
        pdfFormData.append("pdf", invoiceBlob, `${result.invoiceNo}edited.pdf`);
        pdfFormData.append("billId", result.billId); // Add billId to FormData
        pdfFormData.append("editBillReqId", editBillReqId); // Add editBillReqId to FormData
        // Step 3: Upload the PDF to S3
        const uploadResponse = await api.post(
          `/uploadToS3/updateInvoice`,
          pdfFormData,

          {
            headers: {
              Authorization: `Bearer ${token}`,
              // Do not set "Content-Type" for FormData; it's automatically handled by the browser
            },
          }
        );

        // Check for successful upload
        if (uploadResponse.status === 200) {
          console.log("PDF successfully uploaded.");
          toast.success("Invoice uploaded to S3 successfully!");
        } else {
          const errorResponse = uploadResponse.data; // Access error details
          console.error(
            `Failed to upload PDF! Status: ${uploadResponse.status}`
          );
          console.error("Error details:", errorResponse);
          toast.error(
            `Failed to upload PDF! Status: ${
              uploadResponse.status
            }: ${JSON.stringify(errorResponse)}`
          ); // Alert for upload error
        }
      } else {
        toast.warning("Bill Edit Request rejected.");
      }

      // Fetch updated bill details (regardless of approval status)
      await fetchBillDetails();
    } catch (error) {
      console.error("API error:", error);
      toast.error(`An error occurred: ${error.message}`); // Alert for general errors
    } finally {
      setValidationLoading(false); // Stop loading spinner
    }
  };
  // const downloadInvoice = async (result) => {
  //   try {
  //     // Step 1: Generate the PDF
  //     const invoiceBlob = await pdf(
  //       <InvoiceForApprove data={result} />
  //     ).toBlob();
  //     const invoiceUrl = URL.createObjectURL(invoiceBlob);

  //     // Step 2: Create a download link
  //     const invoiceDownloadLink = document.createElement("a");
  //     invoiceDownloadLink.href = invoiceUrl;
  //     invoiceDownloadLink.download = `${result.invoiceNo}.pdf`;
  //     document.body.appendChild(invoiceDownloadLink);
  //     invoiceDownloadLink.click();
  //     document.body.removeChild(invoiceDownloadLink); // Clean up

  //     toast.success("Invoice downloaded successfully!");
  //   } catch (error) {
  //     console.error("Download error:", error);
  //     toast.error(`Failed to download invoice: ${error.message}`);
  //   }
  // };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <CircularProgress />
      </div>
    );
  }

  if (!billDetails) {
    return <Alert severity="error">Unable to load Bill Details.</Alert>;
  }

  const { currentBill, requestedBillEdit } = billDetails;

  const handleDownloadInvoice = async (invoiceUrl, fileName) => {
    try {
      if (invoiceUrl) {
        const response = await fetch(invoiceUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch the invoice");
        }
        const blob = await response.blob();
        saveAs(blob, fileName); // Save the file with a provided name
      } else {
        alert("Invoice URL is missing");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download the invoice. Please try again.");
    }
  };

  return (
    <div className="main-content">
      <BackButton></BackButton>

      {currentBill.editStatus === "APPROVED" && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: { xs: "2rem", sm: "3rem", md: "4rem" }, // Responsive font size
            color: "rgba(0, 128, 0, 0.1)", // Green watermark for approved
            pointerEvents: "none",
            zIndex: 1000, // Ensure it is above other content
          }}
        >
          <Typography variant="h1">APPROVED!</Typography>
        </Box>
      )}
      {currentBill.editStatus === "REJECTED" && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: { xs: "2rem", sm: "3rem", md: "4rem" }, // Responsive font size
            color: "rgba(255, 0, 0, 0.1)", // Red watermark for rejected
            pointerEvents: "none",
            zIndex: 1000, // Ensure it is above other content
          }}
        >
          <Typography variant="h1">REJECTED!</Typography>
        </Box>
      )}
      <Grid container spacing={2} style={{ padding: "20px" }}>
        {/* Current Bill Section */}
        <Grid item xs={12}>
          <Paper style={{ padding: "20px", marginBottom: "20px" }}>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              Current Bill
            </Typography>
            <Typography variant="body1">
              Bill ID: <strong>{currentBill.billId}</strong>
            </Typography>
            <Typography variant="body1">
              Date of Bill: <strong>{currentBill.dateOfBill}</strong>
            </Typography>
            <Typography variant="body1">
              Store: <strong>{currentBill.storeId}</strong>
            </Typography>
            <Typography variant="body1">
              Customer Name:{" "}
              <strong>{currentBill.customer.customerName}</strong>
            </Typography>
            <Typography variant="body1">
              Customer Phone No:{" "}
              <strong>{currentBill.customer.customerPhone}</strong>
            </Typography>
            <Typography variant="body1">
              Customer Email:{" "}
              <strong>{currentBill.customer.customerEmail}</strong>
            </Typography>
            <Typography variant="body1">
              Discount %: <strong>{currentBill.discountPercentage}</strong>
            </Typography>
            <Typography variant="h6" style={{ marginTop: "10px" }}>
              Total Price: <strong>{currentBill.TotalAmount}</strong>
            </Typography>
            <Typography variant="h6">
              Price After Discount:{" "}
              <strong>{currentBill.priceAfterDiscount}</strong>
            </Typography>
            <TableContainer>
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
                    <TableCell sx={{ color: "#fff" }}>SyleCoat</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Quantity</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Price</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Sub Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentBill.products.map((product) =>
                    product.variants.map((variant) =>
                      variant.variantSizes.map((size) => (
                        <TableRow
                          key={`${product.productId}-${variant.color.name}-${size.size}`}
                        >
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.productId}</TableCell>
                          <TableCell>{product.productType}</TableCell>
                          <TableCell>{product.gender}</TableCell>
                          <TableCell>{product.pattern}</TableCell>
                          <TableCell>{variant.color.name}</TableCell>
                          <TableCell>{size.size}</TableCell>
                          <TableCell>{size.styleCoat}</TableCell>
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
            <Button
              onClick={() =>
                handleDownloadInvoice(
                  currentBill?.invoiceUrl, // URL for the current invoice
                  "current_invoice.pdf" // File name for the current invoice
                )
              }
              disabled={!currentBill?.invoiceUrl}
            >
              Download Current Invoice
            </Button>
          </Paper>
        </Grid>

        {/* Requested Bill Edit Section */}
        <Grid item xs={12}>
          <Paper style={{ padding: "20px", marginBottom: "20px" }}>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              Requested Bill Edit
            </Typography>
            <Typography variant="body1">
              Requested Bill ID: <strong>{editBillReqId}</strong>
            </Typography>
            <Typography variant="body1">
              Date of Bill: <strong>{requestedBillEdit.dateOfBill}</strong>
            </Typography>
            <Typography variant="body1">
              Date of Validated:{" "}
              <strong>{requestedBillEdit.dateOfValidate}</strong>
            </Typography>
            <Typography variant="body1">
              Store: <strong>{requestedBillEdit.storeId}</strong>
            </Typography>
            <Typography variant="body1">
              Customer Name:{" "}
              <strong>{requestedBillEdit.customer.customerName}</strong>
            </Typography>
            <Typography variant="body1">
              Customer Phone No:{" "}
              <strong>{requestedBillEdit.customer.customerPhone}</strong>
            </Typography>
            <Typography variant="body1">
              Customer Email:{" "}
              <strong>{requestedBillEdit.customer.customerEmail}</strong>
            </Typography>
            <Typography variant="body1">
              Discount %:{" "}
              <strong>{requestedBillEdit.discountPercentage}</strong>
            </Typography>
            <Typography variant="h6" style={{ marginTop: "10px" }}>
              Total Price: <strong>{requestedBillEdit.TotalAmount}</strong>
            </Typography>
            <Typography variant="h6">
              Price After Discount:{" "}
              <strong>{requestedBillEdit.priceAfterDiscount}</strong>
            </Typography>
            <TableContainer>
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
                    <TableCell sx={{ color: "#fff" }}>StyleCoat</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Quantity</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Price</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Sub Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requestedBillEdit.products.map((product) =>
                    product.variants.map((variant) =>
                      variant.variantSizes.map((size) => (
                        <TableRow
                          key={`${product.productId}-${variant.color.name}-${size.size}`}
                        >
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.productId}</TableCell>
                          <TableCell>{product.productType}</TableCell>
                          <TableCell>{product.gender}</TableCell>
                          <TableCell>{product.pattern}</TableCell>
                          <TableCell>{variant.color.name}</TableCell>
                          <TableCell>{size.size}</TableCell>
                          <TableCell>{size.styleCoat}</TableCell>
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
            <Button
              onClick={() =>
                handleDownloadInvoice(
                  requestedBillEdit?.approvedInvoiceUrl, // URL for the approved invoice
                  "approved_invoice.pdf" // File name for the approved invoice
                )
              }
              disabled={!requestedBillEdit?.approvedInvoiceUrl}
            >
              Download Approved Invoice
            </Button>
          </Paper>
        </Grid>

        {/* Only show Request Note if data is available */}
        {requestedBillEdit.reqNote && (
          <Grid item xs={12}>
            <Paper
              elevation={3}
              style={{ padding: "20px", marginBottom: "20px" }}
            >
              <Typography
                variant="h6"
                gutterBottom
                style={{ color: "#3f51b5" }}
              >
                Request Note
              </Typography>
              <Typography>{requestedBillEdit.reqNote}</Typography>
            </Paper>
          </Grid>
        )}

        {/* Only show Validated Note if data is available */}
        {requestedBillEdit.validateNote && (
          <Grid item xs={12}>
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Typography
                variant="h6"
                gutterBottom
                style={{ color: "#3f51b5" }}
              >
                Validated Note
              </Typography>
              <Typography>{requestedBillEdit.validateNote}</Typography>
            </Paper>
          </Grid>
        )}

        {/* Validation Section */}
        {currentBill.editStatus === "PENDING" && (
          <Grid item xs={12}>
            <Paper style={{ padding: "20px" }}>
              <Typography variant="h6">Validation</Typography>
              <TextField
                label="Enter validation note"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={validateNote}
                onChange={(e) => setValidateNote(e.target.value)}
                style={{ marginBottom: "20px" }}
                required
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => validateBillEditReq(true)}
                  disabled={validationLoading}
                >
                  Approve Request
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => validateBillEditReq(false)}
                  disabled={validationLoading}
                >
                  Reject Request
                </Button>
              </div>
              {validationLoading && (
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <CircularProgress />
                </div>
              )}
            </Paper>
          </Grid>
        )}
        {/* {currentBill.editStatus === "APPROVED" && (
          <button
            className="btn btn-primary"
            onClick={() => downloadInvoice(currentBill)}
          >
            Download Invoice
          </button>
        )} */}

        {/* Error Message */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
      </Grid>
      <ToastContainer />
    </div>
  );
};

export default ReqEditBillsDetail;
