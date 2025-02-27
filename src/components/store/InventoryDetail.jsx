import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import BackButton from "../BackButton";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import api from "../api";

const InventoryDetail = () => {
  const { inventoryId } = useParams();
  const { state } = useLocation();
  const [inventoryDetails, setInventoryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.get(
          `/store/assigned-inventory-details/${inventoryId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setInventoryDetails(response.data);
      } catch {
        setError("Error loading inventory details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [inventoryId]);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const productRows = inventoryDetails.products.flatMap((product) =>
    product.variants.flatMap((variant) =>
      variant.variantSizes.map((size) => ({
        category: product.category,
        subCategory: product.subCategory,
        gender: product.gender,
        fit: product.fit,
        productType: product.productType,
        styleCoat: size.styleCoat,
        color: variant.color,
        size: size.size,
        price: product.price,
        quantity: size.quantity,
      }))
    )
  );

  const totalPages = Math.ceil(productRows.length / rowsPerPage);

  return (
    <div className="main-content">
      <BackButton></BackButton>
      <Box p={3}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h4" component="h2">
              {state?.storeDetails.storeName}
            </Typography>
            <Typography variant="body1">
              <strong>ID:</strong>{" "}
              {state?.storeDetails.storeId ??
                inventoryDetails.storeDetails.storeId ??
                "N/A"}
              <br />
              <strong>Address:</strong> {state?.storeDetails.storeAddress},{" "}
              {state?.storeDetails.city}, {state?.storeDetails.pincode},{" "}
              {state?.storeDetails.state}
              <br />
              <strong>Contact:</strong> {state?.storeDetails.userName},{" "}
              {state?.storeDetails.phoneNo}, {state?.storeDetails.emailID}
            </Typography>
          </CardContent>
        </Card>
        <Paper style={{ marginTop: 24 }}>
          <Box p={2}>
            <Typography variant="h5">Inventory Details</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Sub Category</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Fit</TableCell>
                    <TableCell>Product Type</TableCell>
                    <TableCell>Style Coat</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.subCategory}</TableCell>
                        <TableCell>{row.gender}</TableCell>
                        <TableCell>{row.fit}</TableCell>
                        <TableCell>{row.productType}</TableCell>
                        <TableCell>{row.styleCoat}</TableCell>
                        <TableCell>{row.color}</TableCell>
                        <TableCell>{row.size}</TableCell>
                        <TableCell>${row.price.toFixed(2)}</TableCell>
                        <TableCell>{row.quantity}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Custom Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => handleChangePage(page - 1)}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Typography>
                Page {page + 1} of {totalPages}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => handleChangePage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </Box>
        </Paper>
      </Box>
    </div>
  );
};

export default InventoryDetail;
