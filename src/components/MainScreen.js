import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import UploadModal from './UploadModal';
import './Sidebar.css';
import api from './api';
import EditModal from './EditModal';
import { useAuth } from '../context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DownloadModal from './DownloadModal';
const MainScreen = () => {
  const [activeTab, setActiveTab] = useState('HEAL');
  const [inventoryData, setInventoryData] = useState({
    HEAL: [],
    SHEILD: [],
    ELITE: [],
    TOGS: [],
    SPIRIT: [],
    WORK_WEAR_UNIFORMS: [],
  });
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const itemsPerPage = 10; // Items per page

  const tabs = ['HEAL', 'ELITE', 'TOGS'];
  const { userData } = useAuth();

  // Function to fetch products based on the activeTab
  const fetchProducts = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const apiUrl = `/dashboard/${activeTab}/getAllActiveProducts`;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const { products } = response.data;
      const formattedData = products.flatMap((product) =>
        product.variants.flatMap((variant) =>
          variant.sizes.map((size) => ({
            school: product.schoolName,
            schoolName: product.group,
            pCategory: product.category,
            sCategory: product.subCategory,
            gender: product.gender,
            fit: product.fit,
            pattern: product.pattern,
            productType: product.productType,
            sleeves: product.sleeves,
            cuff: product.cuff,
            pId: size.styleCoat,
            color: variant.color.name,
            size: size.size,
            price: product.price,
            quantity: size.quantity,
            fabric: product.fabric,
            styleCoat: size.styleCoat
          }))
        )
      );
      setInventoryData((prevState) => ({
        ...prevState,
        [activeTab]: formattedData,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Fetch products and reset pagination whenever activeTab changes
  useEffect(() => {
    setCurrentPage(1);
    fetchProducts();
  }, [activeTab, fetchProducts]);

  // Handle product editing
  const handleEdit = async (updatedItem) => {
    const { schoolName: group, pId: styleCoat, quantity: newQuantity, price: newPrice } = updatedItem;
    const token = localStorage.getItem('authToken');

    try {
      setLoading(true);
      await api.patch(
        '/dashboard/updateVariant',
        { group, styleCoat, newQuantity, newPrice },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setInventoryData((prevState) => ({
        ...prevState,
        [activeTab]: prevState[activeTab].map((item) =>
          item.pId === updatedItem.pId ? updatedItem : item
        ),
      }));

      setEditModalVisible(false);
      setCurrentEditItem(null);
      toast.success('Item Edited successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product. Please try again later.');
      toast.error('Failed to update product. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle product deletion
  const handleDelete = async (index) => {
    const itemToDelete = inventoryData[activeTab][index];
    const { schoolName: group, pId: styleCoat } = itemToDelete;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      await api.delete('/dashboard/removeVariant', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { group, styleCoat },
      });

      setInventoryData((prevState) => ({
        ...prevState,
        [activeTab]: prevState[activeTab].filter((_, i) => i !== index),
      }));
      toast.success('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting product variant:', error);
      setError('Failed to delete product variant. Please try again later.');
      toast.error('Failed to delete item. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setCurrentEditItem(item);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setCurrentEditItem(null);
  };

  // Calculate pagination
  const totalItems = inventoryData[activeTab]?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const displayedItems = inventoryData[activeTab]?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="main-content">
      <header className="d-flex justify-content-between align-items-center my-3">
        <h2 className="mb-0">Welcome Back, {userData.name}</h2>
        <div>
          <button
            className="btn btn-outline-primary me-2"
            data-bs-toggle="modal"
            data-bs-target="#uploadModal"
          >
            Upload Inventory
          </button>
          {activeTab === 'TOGS' && (<button className="btn btn-outline-primary me-2"
            data-bs-toggle="modal"
            data-bs-target="#downloadModal">
            Download Inventory
          </button>)}
        </div>
      </header>
      <p className="text-muted">Here is the information about all your inventories</p>
      <div className="mb-3 tab-scroll">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-light'} me-3 mb-3`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <div className="table-responsive">
            <InventoryTable
              data={displayedItems}
              handleEditClick={openEditModal}
              handleDelete={handleDelete}
              activeTab={activeTab}
            />
          </div>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
      {currentEditItem && (
        <EditModal
          show={editModalVisible}
          handleClose={closeEditModal}
          handleSave={handleEdit}
          item={currentEditItem}
        />
      )}
      <UploadModal
        activeTab={activeTab}
        setInventoryData={setInventoryData}
        inventoryData={inventoryData}
      />
      {/* Conditionally render DownloadModal based on activeTab */}
      {activeTab === 'TOGS' && (


        <DownloadModal activeTab={activeTab} />

      )}
      <ToastContainer />
    </div>
  );
};


// InventoryTable Component
const InventoryTable = ({ data, handleEditClick, handleDelete, activeTab }) => {
  console.log(activeTab)
  return (
    <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {activeTab === 'TOGS' ? (
              <>
                <TableCell>School Name</TableCell>
                <TableCell>Sub Category</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Fit</TableCell>
                <TableCell>Product Type</TableCell>
                <TableCell>StyleCoat</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Actions</TableCell>
              </>
            ) : (
              <>
                <TableCell>Categories</TableCell>
                <TableCell>Sub Category</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Fit</TableCell>
                <TableCell>Product Type</TableCell>
                {/* <TableCell>Fabric</TableCell> */}
                <TableCell>StyleCoat</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Actions</TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} align="center">
                No Data Available
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index} hover>
                {activeTab === 'TOGS' ? (
                  <>
                    <TableCell>{item.school}</TableCell>
                    <TableCell>{item.sCategory}</TableCell>
                    <TableCell>{item.gender}</TableCell>
                    <TableCell>{item.fit}</TableCell>
                    <TableCell>{item.productType}</TableCell>
                    <TableCell>{item.styleCoat}</TableCell>
                    <TableCell>{item.color}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{item.pCategory}</TableCell>
                    <TableCell>{item.sCategory}</TableCell>
                    <TableCell>{item.gender}</TableCell>
                    <TableCell>{item.fit}</TableCell>
                    <TableCell>{item.productType}</TableCell>
                    {/* <TableCell>{item.fabric}</TableCell> */}
                    <TableCell>{item.styleCoat}</TableCell>
                    <TableCell>{item.color}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};


// Pagination Component
const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const pagesToShow = 5; // Number of page buttons to show
  const halfPagesToShow = Math.floor(pagesToShow / 2);

  // Calculate start and end page numbers
  let startPage = Math.max(1, currentPage - halfPagesToShow);
  let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

  // Adjust start page if the end page exceeds total pages
  if (endPage - startPage + 1 < pagesToShow) {
    startPage = Math.max(1, endPage - pagesToShow + 1);
  }

  return (
    <Box display="flex" justifyContent="center" my={3}>
      {/* Show "First" button if needed */}
      {startPage > 1 && (
        <>
          <button
            className="btn me-2 btn-light"
            onClick={() => onPageChange(1)}
          >
            First
          </button>
          {startPage > 2 && <span className="btn me-2 btn-light disabled">...</span>}
        </>
      )}

      {/* Show previous page button */}
      {currentPage > 1 && (
        <button
          className="btn me-2 btn-light"
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
      )}

      {/* Render the range of pages */}
      {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
        <button
          key={startPage + index}
          className={`btn me-2 ${currentPage === startPage + index ? 'btn-primary' : 'btn-light'}`}
          onClick={() => onPageChange(startPage + index)}
        >
          {startPage + index}
        </button>
      ))}

      {/* Show next page button */}
      {currentPage < totalPages && (
        <button
          className="btn me-2 btn-light"
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      )}

      {/* Show "Last" button if needed */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="btn me-2 btn-light disabled">...</span>}
          <button
            className="btn me-2 btn-light"
            onClick={() => onPageChange(totalPages)}
          >
            Last
          </button>
        </>
      )}
    </Box>
  );
};

export default MainScreen;
