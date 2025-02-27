import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import BackButton from "../BackButton"
import { saveAs } from "file-saver";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Pagination,
  Box,
} from "@mui/material";

const UploadProducts = () => {
  const { uploadId } = useParams(); // Retrieve the uploadId from the URL
  const [historyDetails, setHistoryDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]); // To store the products for the current page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false); // State for downloading
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const productsPerPage = 10; // Number of products per page

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    api
      .get(`/dashboard/uploadedHistory/${uploadId}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setHistoryDetails(response.data.historyDetails);
        setProducts(response.data.products);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });
  }, [uploadId]);

  // Update displayedProducts when the products array or currentPage changes
  useEffect(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    setDisplayedProducts(
      products.slice(indexOfFirstProduct, indexOfLastProduct)
    );
  }, [products, currentPage]);

  const handleDownloadBarcode = async () => {
    setDownloading(true); // Start loading

    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(
        `/dashboard/${uploadId}/generateBarcodes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Ensure the response type is set to blob for binary data
        }
      );

      if (!response.headers["content-type"]) {
        throw new Error("Content-Type header is missing");
      }

      const extension = "xlsx"; // Default to 'xlsx' for Excel files
      const filename = `${uploadId}.${extension}`; // Use the inferred extension
      saveAs(response.data, filename);
    } catch (error) {
      console.error("Error downloading barcode:", error);
      setError("Failed to download barcode. Please try again later.");
    } finally {
      setDownloading(false); // Stop loading
    }
  };

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="main-content">
      <BackButton></BackButton>
      <h2>Products for Upload ID: {uploadId}</h2>

      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <CircularProgress />
        </div>
      ) : error ? (
        <div className="alert alert-danger mt-3">{error}</div>
      ) : (
        <>
          {historyDetails && (
            <div className="row mb-4">
              {/* Upload Details Section */}
              <div className="col-md-8">
                <h4>Upload Details</h4>
                <p>
                  <strong>Uploaded ID:</strong> {historyDetails.uploadedId}
                </p>
                <p>
                  <strong>Uploaded Date:</strong>{" "}
                  {new Date(historyDetails.uploadedDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Total Amount of Upload:</strong>{" "}
                  {historyDetails.totalAmountOfUploaded.toLocaleString()}
                </p>
              </div>

              {/* Barcode Button Section */}
              <div className="col-md-4 d-flex align-items-center">
                <Button
                  onClick={handleDownloadBarcode}
                  variant="contained"
                  color="primary"
                  disabled={downloading} // Disable button while downloading
                >
                  {downloading ? (
                    <>
                      <CircularProgress size={20} />
                      &nbsp;Downloading...
                    </>
                  ) : (
                    "Download Barcode"
                  )}
                </Button>
              </div>
            </div>
          )}

          <TableContainer
            component={Paper}
            className="table-responsive"
            sx={{ maxHeight: "68vh", overflowY: "auto" }}
          >
            <Table
              stickyHeader
              sx={{
                backgroundColor: "#f8f8f8",
                // maxHeight: 500,
                // overflowY: "auto", // Light grey background for table
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#e0e0e0", // Grey background for header
                      zIndex: 1,
                    }}
                  >
                    No
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#e0e0e0",
                      zIndex: 1,
                    }}
                  >
                    Product ID
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#e0e0e0",
                      zIndex: 1,
                    }}
                  >
                    Product Group
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#e0e0e0",
                      zIndex: 1,
                    }}
                  >
                    Category
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#e0e0e0",
                      zIndex: 1,
                    }}
                  >
                    Sub-Category
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#e0e0e0",
                      zIndex: 1,
                    }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#e0e0e0",
                      zIndex: 1,
                    }}
                  >
                    Price
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#e0e0e0",
                      zIndex: 1,
                    }}
                  >
                    Variants
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedProducts.map((product, index) => {
                  const uniqueId = `${currentPage}-${index + 1}`; // Unique ID based on page and index
                  return (
                    <TableRow key={uniqueId} style={{ cursor: "pointer" }}>
                      <TableCell>
                        {(currentPage - 1) * productsPerPage + index + 1}
                      </TableCell>
                      <TableCell>{product.productId}</TableCell>
                      <TableCell>{product.productDetails.group}</TableCell>
                      <TableCell>{product.productDetails.category}</TableCell>
                      <TableCell>
                        {product.productDetails.subCategory}
                      </TableCell>
                      <TableCell>
                        {product.productDetails.productType}
                      </TableCell>
                      <TableCell>
                        {product.productDetails.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {product.variants.map((variant) => (
                          <div key={variant._id}>
                            <strong>Color:</strong> {variant.color.name}{" "}
                            <span
                              style={{
                                backgroundColor: variant.color.hexcode,
                                width: "20px",
                                height: "20px",
                                display: "inline-block",
                              }}
                            ></span>
                            <ul>
                              {variant.variantSizes.map((size) => (
                                <li key={size._id}>
                                  <strong>Size:</strong> {size.size} -{" "}
                                  <strong>Quantity:</strong>{" "}
                                  {size.quantityOfUpload}
                                  <br />
                                  <strong>StyleCoat:</strong> {size.styleCoat}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </div>
  );
};

export default UploadProducts;
