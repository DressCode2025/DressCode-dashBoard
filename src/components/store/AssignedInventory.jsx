import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api";

const AssignedInventory = () => {
  const [assignedInventories, setAssignedInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storeDetails, setStoreDetails] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedInventories = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await api.get("/store/assigned-inventories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const inventories = response.data.assignedInventories;

        // Extract the storeId from the inventories if needed
        const storeIds = inventories.map((inv) => inv.storeId);

        // Fetch store details only if storeId is available
        if (storeIds.length > 0) {
          await fetchStoreDetails(storeIds[0]); // Assuming you want details for the first storeId
        }

        setAssignedInventories(inventories);
        setLoading(false);
      } catch (err) {
        setError("Error fetching assigned inventories");
        setLoading(false);
      }
    };

    const fetchStoreDetails = async (storeId) => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await api.get(`/store/get-storeDetails/${storeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStoreDetails(response.data.data); // Assuming response structure
      } catch (err) {
        setError("Error fetching store details");
      }
    };

    fetchAssignedInventories();
  }, []);

  const handleRowClick = (inventoryId, storeId) => {
    navigate(`/inventory-details/${inventoryId}`, {
      state: { storeDetails, storeId },
    });
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setPage((prev) =>
      Math.min(
        prev + 1,
        Math.ceil(assignedInventories.length / rowsPerPage) - 1
      )
    );
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

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Calculate the displayed inventories based on the current page
  const displayedInventories = assignedInventories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="main-content">
      <div className="assigned-inventory">
        <Typography variant="h4" gutterBottom>
          Assigned Inventories
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Assigned Inventory ID</TableCell>
                <TableCell>Assigned Date</TableCell>
                <TableCell>Received Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Amount Assigned</TableCell>
                <TableCell>Store Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedInventories.length > 0 ? (
                displayedInventories.map((inventory) => (
                  <TableRow
                    key={inventory.assignedInventoryId}
                    onClick={() =>
                      handleRowClick(
                        inventory.assignedInventoryId,
                        inventory.storeId
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>{inventory.assignedInventoryId}</TableCell>
                    <TableCell>
                      {new Date(inventory.assignedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(inventory.receivedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{inventory.status}</TableCell>
                    <TableCell>₹{inventory.totalAmountOfAssigned}</TableCell>
                    <TableCell>{inventory.storeName}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    No assigned inventories available.
                  </TableCell>
                </TableRow>
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
            Page {page + 1} of{" "}
            {Math.ceil(assignedInventories.length / rowsPerPage)}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleNextPage}
            disabled={
              page >= Math.ceil(assignedInventories.length / rowsPerPage) - 1
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignedInventory;
