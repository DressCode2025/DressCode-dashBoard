import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../BackButton";
import {
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
  Pagination,
} from "@mui/material";
import api from "../../api";
import "./RaisedInventoryDetail.css";
const RaisedInventoryDetail = () => {
  const { raisedInventoryId } = useParams();
  const [inventoryDetails, setInventoryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("APPROVED");
  const [filteredItems, setFilteredItems] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventoryDetails = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await api.get(
          `/store/raised-inventory-details/${raisedInventoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setInventoryDetails(response.data);
        setFilteredItems(response.data); // show all data when no filtter required
        setTotalItems(
          response.data.products.reduce(
            (acc, product) =>
              acc +
              product.variants.reduce(
                (acc, variant) => acc + variant.variantSizes.length,
                0
              ),
            0
          )
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching raised inventory details:", error);
        setLoading(false);
      }
    };

    fetchInventoryDetails();
  }, [raisedInventoryId]);

  // filtter products on selection of status
  useEffect(() => {
    const filterProducts = () => {
      const filteredProducts = inventoryDetails.products
        .map((product) => {
          const filteredVariants = product.variants
            .map((variant) => {
              const filteredSizes = variant.variantSizes.filter((size) => {
                if (selectedStatus === "APPROVED") {
                  return size.isApproved;
                }

                if (selectedStatus === "NOT APPROVED") {
                  return !size.isApproved;
                }

                if (selectedStatus === "APPROVED AND RECEIVED") {
                  return size.isApproved && size.isReceived;
                }

                if (selectedStatus === "APPROVED AND NOT RECEIVED") {
                  return size.isApproved && !size.isReceived;
                }
              });
              return {
                ...variant,
                variantSizes: filteredSizes,
              };
            })
            .filter((variant) => variant.variantSizes.length > 0); // Only include variants that have sizes left

          return {
            ...product,
            variants: filteredVariants,
          };
        })
        .filter((product) => product.variants.length > 0); // Only include products that have variants left
      setFilteredItems({
        ...inventoryDetails,
        products: filteredProducts,
      });
    };

    if (inventoryDetails?.Status === "DRAFT") {
      filterProducts();
      setCurrentPage(1);
    }
  }, [selectedStatus, inventoryDetails]);

  const handleAccept = async () => {
    setUpdating(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await api.patch(
        `/store/approve-inventory-request/${raisedInventoryId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setInventoryDetails((prev) => ({ ...prev, Status: "Accepted" }));
      setMessage(response.data.message || "Inventory accepted.");
      setTimeout(() => navigate("/raised-inventory"), 2000);
    } catch (error) {
      console.error("Error accepting raised inventory:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    setUpdating(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await api.patch(
        `/store/reject-inventory-request/${raisedInventoryId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setInventoryDetails((prev) => ({ ...prev, Status: "Rejected" }));
      setMessage(response.data.message || "Inventory rejected.");
      setTimeout(() => navigate("/raised-inventory"), 2000);
    } catch (error) {
      console.error("Error rejecting raised inventory:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatus = (status) => {
    setSelectedStatus(status);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!inventoryDetails) {
    return <Typography>No details available for this inventory.</Typography>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems?.products?.flatMap((product) =>
    product.variants.flatMap((variant) =>
      variant.variantSizes
        .slice(indexOfFirstItem, indexOfLastItem)
        .map((sizeDetail, idx) => ({
          ...sizeDetail,
          productType: product.productType,
          group: product.group,
          category: product.category,
          subCategory: product.subCategory,
          gender: product.gender,
          material: product.material,
          price: product.price,
          color: variant.color,
          id: `${sizeDetail.sku + indexOfFirstItem + idx + 1}`, // Generate ID for each row
        }))
    )
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="main-content">
      <BackButton></BackButton>
      <div className="raised-inventory-details ">
        <Typography variant="h4">
          Raised Inventory Details - {inventoryDetails.storeName}
        </Typography>
        <Typography>Status: {inventoryDetails.Status}</Typography>
        <Typography>
          Total Amount Raised: {inventoryDetails.totalAmountRaised}
        </Typography>
        <Typography>
          Approved Date: {inventoryDetails.approvedDate || "N/A"}
        </Typography>
        <Typography>
          Received Date: {inventoryDetails.receivedDate || "N/A"}
        </Typography>
        <Typography>
          Rejected Date: {inventoryDetails.rejectedDate || "N/A"}
        </Typography>

        <div className="actions mb-3">
          {inventoryDetails.Status !== "APPROVED" &&
            inventoryDetails.Status !== "REJECTED" &&
            inventoryDetails.Status !== "RECEIVED" && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleAccept}
                  disabled={updating || inventoryDetails.Status === "Accepted"}
                >
                  {updating ? "Processing..." : "Accept"}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleReject}
                  disabled={updating || inventoryDetails.Status === "Rejected"}
                  style={{ marginLeft: "8px" }}
                >
                  {updating ? "Processing..." : "Reject"}
                </Button>
              </>
            )}
          {message && <Alert severity="success">{message}</Alert>}
        </div>

        {inventoryDetails?.Status === "DRAFT" && (
          <div className="mb-3">
            {[
              "APPROVED",
              "NOT APPROVED",
              "APPROVED AND RECEIVED",
              "APPROVED AND NOT RECEIVED",
            ].map((status) => (
              <button
                key={status}
                className={`btn btn-outline-primary me-2 ${selectedStatus === status ? "active" : ""
                  }`}
                onClick={() => handleStatus(status)}
              >
                {status
                  .split(" ")
                  .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                  .join(" ")}
              </button>
            ))}
          </div>
        )}

        <Typography variant="h6">Products</Typography>
        <TableContainer
          component={Paper}
          style={{ maxHeight: "700px", overflow: "auto" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Product Type</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Sub-Category</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Quantity in Warehouse</TableCell>
                <TableCell>Style Code</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Approved</TableCell>
                <TableCell>Received</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((sizeDetail) => (
                  <TableRow key={sizeDetail.id}>
                    <TableCell>{sizeDetail.productType}</TableCell>
                    <TableCell>{sizeDetail.group}</TableCell>
                    <TableCell>{sizeDetail.category}</TableCell>
                    <TableCell>{sizeDetail.subCategory}</TableCell>
                    <TableCell>{sizeDetail.gender}</TableCell>
                    <TableCell>{sizeDetail.material}</TableCell>
                    <TableCell>₹{sizeDetail.price}</TableCell>
                    <TableCell>{sizeDetail.color}</TableCell>
                    <TableCell>{sizeDetail.size}</TableCell>
                    <TableCell>{sizeDetail.quantity}</TableCell>
                    <TableCell>{sizeDetail.quantityInWarehouse}</TableCell>
                    <TableCell>{sizeDetail.styleCoat}</TableCell>
                    <TableCell>{sizeDetail.sku}</TableCell>
                    <TableCell>
                      {sizeDetail.isApproved ? (
                        <i
                          className="bi bi-check-circle"
                          style={{ color: "green" }}
                        ></i>
                      ) : (
                        <i
                          className="bi bi-x-circle"
                          style={{ color: "red" }}
                        ></i>
                      )}
                    </TableCell>
                    <TableCell>
                      {sizeDetail.isReceived ? (
                        <i
                          className="bi bi-check-circle"
                          style={{ color: "green" }}
                        ></i>
                      ) : (
                        <i
                          className="bi bi-x-circle"
                          style={{ color: "red" }}
                        ></i>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={15}>No products available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(event, value) => setCurrentPage(value)}
          color="primary"
          style={{ marginTop: "16px" }}
        />
      </div>
    </div>
  );
};

export default RaisedInventoryDetail;
