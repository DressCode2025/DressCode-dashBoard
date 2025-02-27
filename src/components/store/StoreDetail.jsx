import React, { useEffect, useState } from "react";
import {
  Table,
  Spinner,
  Alert,
  Card,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import BackButton from "../BackButton";
import { toast } from "react-toastify";
const StoreDetail = () => {
  const { storeId } = useParams(); // Extract storeId from the URL
  const [storeDetails, setStoreDetails] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true); // Combined loading state
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editableDetails, setEditableDetails] = useState({});
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [csvFile, setCsvFile] = useState(null); // State to store the CSV file
  const [uploading, setUploading] = useState(false); // State to track file upload
  const [uploadError, setUploadError] = useState(null); // State for upload error
  const navigate = useNavigate(); // Use navigate to change the route
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const token = localStorage.getItem("authToken");
  const [bills, setBills] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  // Fetch store details and inventory concurrently
  const fetchData = async () => {
    try {
      const [storeResponse, inventoryResponse] = await Promise.all([
        api.get(`/store/get-storeDetails/${storeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/store/assigned-inventories/${storeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setStoreDetails(storeResponse.data.data);
      setInventory(inventoryResponse.data.assignedInventories);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data. Please try again.");
      setLoading(false);
    }
  };

  //bills fetch
  const fetchBills = async () => {
    try {
      const response = await api.get(`/store/get-bills/${storeId}`);
      setBills(response.data.Bills);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch bills. Please try again.");
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    fetchBills();
  }, [storeId]);

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };
  const filteredBills = bills.filter((bill) => {
    if (filterStatus === "null") {
      return bill.editStatus === null; // Match bills with null editStatus
    }
    return filterStatus ? bill.editStatus === filterStatus : true;
  });

  // Handle row click to navigate to the inventory detail page
  const handleRowClick = (inventoryId) => {
    navigate(`/inventory-details/${inventoryId}`, { state: { storeDetails } }); // Pass the inventory ID to the details page
  };

  // Open and close the edit modal
  const handleOpenEditModal = () => {
    const flattenedDetails = {
      ...storeDetails,
      commissionPercentage:
        storeDetails.storeOverview?.commissionPercentage || "",
    };
    setEditableDetails(flattenedDetails); // Pre-fill modal fields
    setShowEditModal(true);
    console.log(flattenedDetails); // Log the flattened details for debugging
  };
  const handleCloseEditModal = () => setShowEditModal(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };
  // Check if there are any changes to the store details
  const hasChanges = Object.keys(editableDetails).some((key) => {
    // Check for nested storeOverview field (commissionPercentage)
    if (key === "commissionPercentage") {
      return editableDetails[key] !== storeDetails.storeOverview[key];
    }
    // For other fields, compare directly with storeDetails
    return editableDetails[key] !== storeDetails[key];
  });

  // Handle form submission for editing store details
  const handleUpdateDetails = async () => {
    try {
      setUpdating(true);

      // Check if there are any changes to the store details
      const hasChanges = Object.keys(editableDetails).some((key) => {
        // Check for commissionPercentage directly
        if (key === "commissionPercentage") {
          return editableDetails[key] !== storeDetails.storeOverview[key];
        }
        // For other fields, compare directly with storeDetails
        return editableDetails[key] !== storeDetails[key];
      });

      if (!hasChanges) {
        toast.error("No changes to update.");
        return;
      }

      // Prepare the updated fields
      const updatedFields = Object.keys(editableDetails).reduce((acc, key) => {
        if (key === "commissionPercentage") {
          // Include commissionPercentage directly in the payload
          if (editableDetails[key] !== storeDetails.storeOverview[key]) {
            acc[key] = editableDetails[key];
          }
        } else if (editableDetails[key] !== storeDetails[key]) {
          acc[key] = editableDetails[key];
        }
        return acc;
      }, {});

      // Send updated fields to the API
      await api.patch(`/store/update-store/${storeId}`, updatedFields, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Store details updated successfully!");
      fetchData(); // Refresh the data
      handleCloseEditModal();
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      toast.error("Error updating store details. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setCsvFile(null); // Reset file input when modal closes
    setUploadError(null); // Reset upload error when modal closes
  };

  // Handle modal open
  const handleOpenModal = () => setShowModal(true);

  // Handle file change
  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      setUploading(true);
      setUploadError(null); // Reset any previous errors
      const response = await api.post(
        `/store/assign-inventory/${storeId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Inventory assigned successfully!");
      handleCloseModal();
      fetchData(); // Refresh the data after upload
    } catch (err) {
      setUploadError("Error uploading inventory. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "100vh" }}
          >
            <Spinner animation="border" size="lg" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            <BackButton></BackButton>
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Card.Title className="text-primary mb-3">
                  {storeDetails?.storeName}
                </Card.Title>
                <Card.Text>
                  <div className="mb-2">
                    <strong>ID:</strong> {storeDetails?.storeOverview.storeId}
                  </div>
                  <div className="mb-2">
                    <strong>Total Billed Amount:</strong>{" "}
                    <span className="text-success">
                      {storeDetails?.storeOverview.totalBilledAmount}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Active Bill Count:</strong>{" "}
                    <span className="badge bg-info text-dark">
                      {storeDetails?.storeOverview.activeBillCount}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Deleted Bill Count:</strong>{" "}
                    <span className="badge bg-warning text-dark">
                      {storeDetails?.storeOverview.deletedBillCount}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Address:</strong> {storeDetails?.storeAddress},{" "}
                    {storeDetails?.city}, {storeDetails?.pincode},{" "}
                    {storeDetails?.state}
                  </div>
                  <div className="mb-3">
                    <strong>Contact:</strong> {storeDetails?.userName},{" "}
                    <span className="text-muted">{storeDetails?.phoneNo}</span>,{" "}
                    <span className="text-muted">{storeDetails?.emailID}</span>
                  </div>
                  <Form.Group controlId="password">
                    <Form.Label>
                      <strong>Password:</strong>
                    </Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={storeDetails?.password}
                        readOnly
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <EyeSlash /> : <Eye />}
                      </Button>
                    </div>
                  </Form.Group>
                </Card.Text>
              </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Card.Title className="text-secondary mb-3">
                  Store Overview
                </Card.Title>
                <Card.Text>
                  <div className="mb-2">
                    <strong>Commission Percentage:</strong>{" "}
                    <span className="text-primary">
                      {storeDetails?.storeOverview.commissionPercentage}%
                    </span>
                  </div>
                  <div>
                    <strong>Commission Earned:</strong>{" "}
                    <span className="text-success">
                      {storeDetails?.storeOverview.commissionEarned}
                    </span>
                  </div>
                </Card.Text>
              </Card.Body>
            </Card>
            {/* <Button variant="secondary" onClick={handleOpenEditModal}>
              Edit Details
            </Button> */}
            <h4 className="mt-4">Assigned Inventory</h4>
            <Button
              variant="primary"
              onClick={handleOpenModal}
              className="mt-3"
            >
              Assign Inventory
            </Button>

            {inventory.length === 0 ? (
              <Alert variant="info" className="mt-3">
                No inventory assigned to this store.
              </Alert>
            ) : (
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    <th>Inventory ID</th>
                    <th>Assigned Date</th>
                    <th>Received Date</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr
                      key={item.assignedInventoryId}
                      onClick={() => handleRowClick(item.assignedInventoryId)} // Click event to navigate
                      style={{ cursor: "pointer" }} // Indicate that row is clickable
                    >
                      <td>{item.assignedInventoryId}</td>
                      <td>
                        {new Date(item.assignedDate).toLocaleDateString()}
                      </td>
                      <td>
                        {item.receivedDate
                          ? new Date(item.receivedDate).toLocaleDateString()
                          : "Not received"}
                      </td>
                      <td>{item.status}</td>
                      <td>{item.totalAmountOfAssigned}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <div className="container mt-4">
              <h4 className="mt-4">Bills</h4>
              <div className="mb-3">
                <label htmlFor="editStatusFilter" className="form-label">
                  Filter by Edit Status:
                </label>
                <select
                  id="editStatusFilter"
                  value={filterStatus}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED"> Rejected</option>
                  <option value="null">Not Edited</option>
                </select>
              </div>
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Bill ID</th>
                      <th>Total Amount</th>
                      <th>Discount (%)</th>
                      <th>Price After Discount</th>
                      <th>Edit Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
                      <tr key={bill._id}>
                        <td>{bill.billId}</td>
                        <td>{bill.TotalAmount}</td>
                        <td>{bill.discountPercentage}</td>
                        <td>{bill.priceAfterDiscount.toFixed(2)}</td>
                        <td>{bill.editStatus || "Not Edited"}</td>
                        <td>
                          {new Date(bill.dateOfBill).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {/* Edit Store Details Modal */}
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Store Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Store Name</Form.Label>
                <Form.Control
                  type="text"
                  name="storeName"
                  value={editableDetails.storeName || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="storeAddress"
                  value={editableDetails.storeAddress || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={editableDetails.city || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Pincode</Form.Label>
                <Form.Control
                  type="text"
                  name="pincode"
                  value={editableDetails.pincode || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={editableDetails.state || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Contact Name</Form.Label>
                <Form.Control
                  type="text"
                  name="userName"
                  value={editableDetails.userName || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phoneNo"
                  value={editableDetails.phoneNo || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="emailID"
                  value={editableDetails.emailID || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mt-3 position-relative">
                <Form.Label>Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPasswordForm ? "text" : "password"}
                    name="password"
                    value={editableDetails.password || ""}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                    }}
                  >
                    {showPasswordForm ? (
                      <i className="bi bi-eye-slash"></i> // Eye-slash icon when visible
                    ) : (
                      <i className="bi bi-eye"></i> // Eye icon when hidden
                    )}
                  </button>
                </div>
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Commission Percentage</Form.Label>
                <Form.Control
                  type="text"
                  name="commissionPercentage" // Must match the state key
                  value={editableDetails.commissionPercentage || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateDetails}
              disabled={updating || !hasChanges} // Disable if no changes
            >
              {updating ? (
                <>
                  <Spinner animation="border" size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal for Assign Inventory */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Assign Inventory</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Upload CSV File</Form.Label>
                <Form.Control
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={uploading} // Disable input during upload
                />
              </Form.Group>
            </Form>
            {uploadError && (
              <Alert variant="danger" className="mt-3">
                {uploadError}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={uploading}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Spinner animation="border" size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                "Assign Inventory"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default StoreDetail;
