import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import { saveAs } from "file-saver"; // Import the file-saver library

const ReqEditBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Items per page
  const [downloading, setDownloading] = useState(false); // Loading state for download
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await api.get("/store/get-bill-edit-reqs", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setBills(response.data.Bills);
        } else {
          console.error("No auth token found.");
        }
      } catch (error) {
        console.error("Error fetching bill edit requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const handleRowClick = (editBillReqId) => {
    navigate(`/req-edit-bills/${editBillReqId}`);
  };

  const handleDownloadBillEditReqs = async () => {
    setDownloading(true); // Start loading

    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(`/store/download-bill-edit-reqs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Ensure the response type is set to blob for binary data
      });

      if (!response.headers["content-type"]) {
        throw new Error("Content-Type header is missing");
      }

      const extension = "xlsx"; // Default to 'xlsx' for Excel files
      const filename = `bill_edit_requests.${extension}`; // Construct a meaningful file name
      saveAs(response.data, filename);
    } catch (error) {
      console.error("Error downloading bill edit requests:", error);
    } finally {
      setDownloading(false); // Stop loading
    }
  };

  // Filter bills based on the active tab
  const filteredBills = bills.filter((bill) => {
    if (activeTab === "Approved") return bill.isApproved === true;
    if (activeTab === "Rejected") return bill.isApproved === false;
    return bill.isApproved === null;
  });

  // Calculate pagination
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedBills = filteredBills.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Container style={{ textAlign: "center", marginTop: "20px" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <div className="main-content">
      <Container>
        <Typography variant="h4" gutterBottom>
          Edit Bill Requests
        </Typography>

        {/* Export Button */}
        <div style={{ textAlign: "right", marginBottom: "20px" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadBillEditReqs}
            disabled={downloading}
          >
            {downloading ? "Exporting..." : "Export Data"}
          </Button>
        </div>

        {/* Tabs for filtering */}
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Pending" value="Pending" />
          <Tab label="Approved" value="Approved" />
          <Tab label="Rejected" value="Rejected" />
        </Tabs>

        {/* Table showing filtered bills */}
        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>Date of Bill</TableCell>
                <TableCell>Date of Edit Request</TableCell>
                <TableCell>Approval Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBills.map((bill) => (
                <TableRow
                  key={bill.editBillReqId}
                  onClick={() => handleRowClick(bill.editBillReqId)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>{bill.editBillReqId}</TableCell>
                  <TableCell>
                    {new Date(bill.dateOfBill).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(bill.dateOfBillEditReq).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {bill.isApproved === null
                      ? "Pending"
                      : bill.isApproved
                      ? "Approved"
                      : "Rejected"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Show message if no bills are available for the selected tab */}
        {filteredBills.length === 0 && (
          <Typography variant="body1" style={{ marginTop: "20px" }}>
            No {activeTab.toLowerCase()} requests found.
          </Typography>
        )}

        {/* Custom Pagination Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Typography>
            Page {page + 1} of {Math.ceil(filteredBills.length / rowsPerPage)}
          </Typography>
          <Button
            variant="outlined"
            onClick={() =>
              setPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(filteredBills.length / rowsPerPage) - 1
                )
              )
            }
            disabled={page >= Math.ceil(filteredBills.length / rowsPerPage) - 1}
          >
            Next
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default ReqEditBills;
