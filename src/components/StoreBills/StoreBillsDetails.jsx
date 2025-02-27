import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";

const StoreBillsDetails = () => {
  const { billId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [billData, setBillData] = useState({});
  const [tableData, setTableData] = useState([]); // Table data state
  const [total, setTotal] = useState(0); // Total sum of subtotals
  const [discount, setDiscount] = useState(0); // Discount percentage
  const [finalTotal, setFinalTotal] = useState(0); // Total after discount
  const navigate = useNavigate();

  // Fetch bill details from the API
  const fetchBillData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const apiUrl = `/store/get-bill-details/${billId}`;

    try {
      setLoading(true);
      const response = await api.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data.result;
      setBillData(data);

      // Transform product data for the table
      const productData = data.products.flatMap((product) =>
        product.variants.flatMap((variant) =>
          variant.variantSizes.map((size) => ({
            productId: product.productId,
            variantId: variant.variantId,
            category: product.category,
            gender: product.gender,
            productType: product.productType,
            color: variant.color.name,
            size: size.size,
            styleCoat: size.styleCoat,
            price: product.price,
            billedQuantity: size.billedQuantity,
            quantityInStore: size.quantityInStore,
            subTotal: product.price * size.billedQuantity,
          }))
        )
      );
      setTableData(productData);
      setDiscount(data.discountPercentage);
    } catch (error) {
      console.error("Error fetching BillData:", error);
      setError("Failed to fetch BillData. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillData();
  }, []);

  // Calculate total and final total whenever tableData or discount changes
  useEffect(() => {
    const newTotal = tableData.reduce((acc, item) => acc + item.subTotal, 0);
    setTotal(newTotal);
  }, [tableData]);

  useEffect(() => {
    const discountedTotal = total - total * (discount / 100);
    setFinalTotal(discountedTotal);
  }, [total, discount]);

  // Handle downloading the invoice
  const handleDownloadInvoice = async () => {
    if (!billData || !billData.invoiceUrl) {
      console.error("No invoice URL available for download.");
      toast.error("No invoice available for download.");
      return;
    }

    const invoiceUrl = billData.invoiceUrl;
    const fileName = `${billData.invoiceNo}.pdf`;

    try {
      setLoading(true);
      const response = await fetch(invoiceUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      const blobUrl = window.URL.createObjectURL(blob);

      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
      console.log("Invoice downloaded successfully.");
      toast.success("Invoice downloaded successfully.");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error(`Error downloading invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  return (
    <>
      <div className="main-content">
        <header className="d-flex justify-content-between align-items-center my-3">
          <h2 className="mb-0">Welcome Back</h2>
        </header>
        <div className="table-responsive">
          <Box sx={{ padding: "20px" }}>
            <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
              <Typography variant="h4" component="h1">
                Particular Bill Details
              </Typography>
            </Box>

            {/* Bill Information Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                    <TableCell>Bill No</TableCell>
                    <TableCell>Date Of Bill</TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Customer Phone</TableCell>
                    <TableCell>Customer Email</TableCell>
                    <TableCell>Edit Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{billData?.billId ?? "N/A"}</TableCell>
                    <TableCell>
                      {billData?.dateOfBill
                        ? new Date(billData.dateOfBill).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {billData?.customer?.customerName ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      {billData?.customer?.customerPhone ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      {billData?.customer?.customerEmail ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      {billData?.editStatus ?? "Not Edited"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Product Details Table */}
            <TableContainer
              component={Paper}
              sx={{ maxHeight: "70vh", overflowY: "auto", marginTop: "20px" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Product ID</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Product Type</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>StyleCoat</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Quantity Available</TableCell>
                    <TableCell>Sub Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.productId}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.gender}</TableCell>
                      <TableCell>{row.productType}</TableCell>
                      <TableCell>{row.color}</TableCell>
                      <TableCell>{row.size}</TableCell>
                      <TableCell>{row.styleCoat}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell>{row.billedQuantity}</TableCell>
                      <TableCell>{row.quantityInStore}</TableCell>
                      <TableCell>{row.subTotal}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Total and Discount Section */}
            <Box sx={{ marginTop: "20px" }}>
              <Typography variant="h6">
                Actual Price: ₹{total.toFixed(2)}
              </Typography>
              <Typography variant="h6">
                Discount: {discount}% (₹{(total * (discount / 100)).toFixed(2)})
              </Typography>
              <Typography variant="h6">
                Final Price: ₹{finalTotal.toFixed(2)}
              </Typography>
            </Box>

            {/* Download Invoice Button */}
            <Box sx={{ marginTop: "20px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadInvoice}
                disabled={loading || !billData.invoiceUrl}
              >
                {loading ? "Downloading..." : "Download Invoice"}
              </Button>
            </Box>
          </Box>
        </div>
      </div>
    </>
  );
};

export default StoreBillsDetails;
