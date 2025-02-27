import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
} from "@mui/material";
import api from "../api";

const DeletedBills = () => {
  const [deletedBills, setDeletedBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Default rows per page
  const [selectedTab, setSelectedTab] = useState(0); // State for tab selection
  const [stores, setStores] = useState([]); // State to hold store names and IDs
  const [selectedStoreId, setSelectedStoreId] = useState(""); // State for selected store ID
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeletedBills = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.get("/store/get-all-deleted-bills", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeletedBills(response.data.deletedBills);
      } catch (error) {
        console.error("Error fetching deleted bills", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStoreNames = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.get("/store/store-names", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStores(response.data.StoreNameAndIds);
      } catch (error) {
        console.error("Error fetching store names", error);
      }
    };

    fetchDeletedBills();
    fetchStoreNames();
  }, []);

  const handleRowClick = (billId) => navigate(`/deleted-bills/${billId}`);

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setPage((prev) =>
      Math.min(prev + 1, Math.ceil(filteredBills.length / rowsPerPage) - 1)
    );
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(0); // Reset page when changing tabs
  };

  const handleStoreSelect = (event) => {
    setSelectedStoreId(event.target.value);
    setPage(0); // Reset page when changing store
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <CircularProgress />
      </div>
    );
  }

  // Filter bills based on the selected tab and store ID
  const statusOptions = ["PENDING", "REJECTED", "APPROVED"];
  const filteredBills = deletedBills.filter(
    (bill) =>
      bill.deleteReqStatus === statusOptions[selectedTab] &&
      (selectedStoreId === "" || bill.storeId === selectedStoreId) // Filter by store ID
  );

  const paginatedBills = filteredBills.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="main-content">
      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Deleted Bills
        </Typography>

        {/* Tabs for filtering bill statuses */}
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
        >
          {statusOptions.map((status, index) => (
            <Tab key={index} label={status} />
          ))}
        </Tabs>

        {/* Store filter selection */}
        <TextField
          select
          label="Select Store"
          value={selectedStoreId}
          onChange={handleStoreSelect}
          variant="outlined"
          fullWidth
          sx={{ mt: 2, mb: 2 }}
        >
          <MenuItem value="">All Stores</MenuItem>
          {stores.map((store) => (
            <MenuItem key={store.storeId} value={store.storeId}>
              {store.storeName}
            </MenuItem>
          ))}
        </TextField>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bill ID</TableCell>
                <TableCell>Date of Bill</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Discount (%)</TableCell>
                <TableCell>Price After Discount</TableCell>
                <TableCell>Store Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1">No Data Available</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBills.map((bill) => (
                  <TableRow
                    key={bill.billId}
                    hover
                    onClick={() => handleRowClick(bill.billId)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>{bill.billId}</TableCell>
                    <TableCell>
                      {new Date(bill.dateOfBill).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{bill.TotalAmount}</TableCell>
                    <TableCell>{bill.discountPercentage}</TableCell>
                    <TableCell>{bill.priceAfterDiscount}</TableCell>
                    <TableCell>{bill.storeName}</TableCell>
                  </TableRow>
                ))
              )}
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
            onClick={handlePreviousPage}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Typography>
            Page {page + 1} of {Math.ceil(filteredBills.length / rowsPerPage)}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleNextPage}
            disabled={page >= Math.ceil(filteredBills.length / rowsPerPage) - 1}
          >
            Next
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default DeletedBills;
