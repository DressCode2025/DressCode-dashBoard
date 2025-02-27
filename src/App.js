import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Typography, Container, Button, Link, Box } from "@mui/material";
import Sidebar from './components/Sidebar';
// import InventoryTable from './components/InventoryTable';
import UploadHistory from './components/UploadHistory';
import Qoute from './components/Qoute';
import OrderDetails from './components/OrderDetails';
import QuoteOrderDetailsPage from './components/QuoteOrderDetailsPage';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import MainScreen from './components/MainScreen';
import RedirectIfAuthenticated from './components/Auth/RedirectIfAuthenticated';
import Order from './components/Orders/Order';
import UploadProducts from './components/uploadProducts/UploadProduct';
import TrackingPage from './components/Tracking/TrackingPage';
import OverView from './components/OverView/OverView';
import NotFoundPage from './NotFound';
import CancelOrder from './components/CancelOrder/CancelOrder';
import CancelOrderDetails from './components/CancelOrder/CancelOrderDetails';
import storeCreation from './components/store/Store-Creation';
import StoreDetail from './components/store/StoreDetail';
import InventoryDetail from './components/store/InventoryDetail';
import RaisedInventory from './components/store/raisedInventory/RaisedInventory';
import RaisedInventoryDetail from './components/store/raisedInventory/RaisedInventoryDetail';
import AssignedInventory from './components/store/AssignedInventory';
import ReqEditBills from './components/ReqEditBills/ReqEditBills';
import ReqEditBillsDetail from './components/ReqEditBills/ReqEditBillsDetail';
import DeletedBills from './components/DeletedBills/DeletedBills';
import DeletedBillsDetail from './components/DeletedBills/DeletedBillsDetail';

import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Coupon from './components/Coupon';
import StoreBills from './components/StoreBills/StoreBills';
import StoreBillsDetails from './components/StoreBills/StoreBillsDetails';
import ContactFormData from './components/ContactFormData';




const App = () => {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { isAuthenticated, userData } = useAuth();

  // Define routes available for "SUPER ADMIN"
  const superAdminRoutes = [
    { path: "/overview", element: <ProtectedRoute element={OverView} /> },
    { path: "/inventory", element: <ProtectedRoute element={MainScreen} /> },
    { path: "/uploaded-history", element: <ProtectedRoute element={UploadHistory} /> },
    { path: "/upload-history/:uploadId/products", element: <ProtectedRoute element={UploadProducts} /> },
    { path: "/store-bills", element: <ProtectedRoute element={StoreBills} /> },
    { path: "/store-bills-details/:billId", element: <ProtectedRoute element={StoreBillsDetails} /> },
    { path: "/qoute", element: <ProtectedRoute element={Qoute} /> },
    { path: "/quote/:quoteId", element: <ProtectedRoute element={QuoteOrderDetailsPage} /> },
    { path: "/online-orders", element: <ProtectedRoute element={Order} /> },
    { path: "/order-details/:orderId", element: <ProtectedRoute element={OrderDetails} /> },
    { path: "/cancel-orders", element: <ProtectedRoute element={CancelOrder} /> },
    { path: "/cancel-details/:orderId", element: <ProtectedRoute element={CancelOrderDetails} /> },
    { path: "/store-creation", element: <ProtectedRoute element={storeCreation} /> },
    { path: "/store-details/:storeId", element: <ProtectedRoute element={StoreDetail} /> },
    { path: "/inventory-details/:inventoryId", element: <ProtectedRoute element={InventoryDetail} /> },
    { path: "/raised-inventory", element: <ProtectedRoute element={RaisedInventory} /> },
    { path: "/raised-inventory/:raisedInventoryId", element: <ProtectedRoute element={RaisedInventoryDetail} /> },
    { path: "/assigned-inventory", element: <ProtectedRoute element={AssignedInventory} /> },
    { path: "/req-edit-bills", element: <ProtectedRoute element={ReqEditBills} /> },
    { path: "/req-edit-bills/:editBillReqId", element: <ProtectedRoute element={ReqEditBillsDetail} /> },
    { path: "/deleted-bills", element: <ProtectedRoute element={DeletedBills} /> },
    { path: "/deleted-bills/:billId", element: <ProtectedRoute element={DeletedBillsDetail} /> },
    { path: "/tracking/:awbCod", element: <ProtectedRoute element={TrackingPage} /> },
    { path: "/coupon", element: <ProtectedRoute element={Coupon} /> },
    { path: "/form-data", element: <ProtectedRoute element={ContactFormData} /> },




  ];
  // Define routes for PRODUCT MANAGER
  const productManagerRoutes = [
    { path: "/overview", element: <ProtectedRoute element={OverView} /> },
    { path: "/inventory", element: <ProtectedRoute element={MainScreen} /> },
    { path: "/online-orders", element: <ProtectedRoute element={Order} /> },
    { path: "/order-details/:orderId", element: <ProtectedRoute element={OrderDetails} /> },
    { path: "/cancel-orders", element: <ProtectedRoute element={CancelOrder} /> },
    { path: "/cancel-details/:orderId", element: <ProtectedRoute element={CancelOrderDetails} /> },
    { path: "/store-creation", element: <ProtectedRoute element={storeCreation} /> },
    { path: "/store-details/:storeId", element: <ProtectedRoute element={StoreDetail} /> },
    { path: "/raised-inventory", element: <ProtectedRoute element={RaisedInventory} /> },
    { path: "/raised-inventory/:raisedInventoryId", element: <ProtectedRoute element={RaisedInventoryDetail} /> },
    { path: "/assigned-inventory", element: <ProtectedRoute element={AssignedInventory} /> },
    { path: "/inventory-details/:inventoryId", element: <ProtectedRoute element={InventoryDetail} /> },
    { path: "/tracking/:awbCod", element: <ProtectedRoute element={TrackingPage} /> },
  ];
  // Define routes for Inventory MANAGER
  const inventoryManagerRoutes = [
    { path: "/overview", element: <ProtectedRoute element={OverView} /> },
    { path: "/inventory", element: <ProtectedRoute element={MainScreen} /> },
    { path: "/online-orders", element: <ProtectedRoute element={Order} /> },
    { path: "/order-details/:orderId", element: <ProtectedRoute element={OrderDetails} /> },
    { path: "/cancel-orders", element: <ProtectedRoute element={CancelOrder} /> },
    { path: "/cancel-details/:orderId", element: <ProtectedRoute element={CancelOrderDetails} /> },
    { path: "/store-creation", element: <ProtectedRoute element={storeCreation} /> },
    { path: "/store-details/:storeId", element: <ProtectedRoute element={StoreDetail} /> },
    { path: "/raised-inventory", element: <ProtectedRoute element={RaisedInventory} /> },
    { path: "/raised-inventory/:raisedInventoryId", element: <ProtectedRoute element={RaisedInventoryDetail} /> },
    { path: "/assigned-inventory", element: <ProtectedRoute element={AssignedInventory} /> },
    { path: "/inventory-details/:inventoryId", element: <ProtectedRoute element={InventoryDetail} /> },
    { path: "/tracking/:awbCod", element: <ProtectedRoute element={TrackingPage} /> },
  ];

  // Define routes for CUSTOMER CARE
  const customerCareRoutes = [
    { path: "/overview", element: <ProtectedRoute element={OverView} /> },
    { path: "/online-orders", element: <ProtectedRoute element={Order} /> },
    { path: "/order-details/:orderId", element: <ProtectedRoute element={OrderDetails} /> },
    { path: "/cancel-orders", element: <ProtectedRoute element={CancelOrder} /> },
    { path: "/cancel-details/:orderId", element: <ProtectedRoute element={CancelOrderDetails} /> },
    { path: "/qoute", element: <ProtectedRoute element={Qoute} /> },
    { path: "/quote/:quoteId", element: <ProtectedRoute element={QuoteOrderDetailsPage} /> },
    { path: "/tracking/:awbCod", element: <ProtectedRoute element={TrackingPage} /> },
  ];
  // Default routes for other roles or unauthenticated users
  const defaultRoutes = [{ path: "/", element: <EmptyScreen /> }];

  // Determine which routes to render based on user role
  const routesToRender =
    userData?.role === "SUPER ADMIN"
      ? superAdminRoutes
      : userData?.role === "PRODUCT MANAGER"
        ? productManagerRoutes
        : userData?.role === "CUSTOMER CARE"
          ? customerCareRoutes
          : userData?.role === "INVENTORY MANAGER"
            ? inventoryManagerRoutes
            : defaultRoutes;



  return (
    <div className="d-flex">
      {isAuthenticated && <Sidebar />}
      <div className="container-fluid" style={{ flex: 1 }}>


        <Routes>
          <Route
            path="/login"
            element={<RedirectIfAuthenticated element={<Login />} />}
          />
          <Route
            path="/"
            element={<ProtectedRoute element={OverView} />} />

          {routesToRender.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>

      </div>
    </div>
  );
};

const EmptyScreen = () => {
  const { isAuthenticated } = useAuth();
  return (

    <>

      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh", // Full viewport height
          textAlign: "center",
          padding: "2rem",
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 4 }}>
          <img src="/DressCode.svg" alt="Logo" width={150} />
        </Box>

        {/* Welcome Message */}
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to the Dashboard
        </Typography>

        {isAuthenticated ? (
          <Typography variant="body1">
            Select an option from the sidebar to get started.
          </Typography>
        ) : (
          <Link href="/login" underline="none">
            <Button variant="contained" color="primary">
              Login
            </Button>
          </Link>
        )}
      </Container>


      {/* <div className="main-content">
        <div className='maincontent'>
          <h1>Welcome to the Dashboard</h1>
          {isAuthenticated && (<p>Select an option from the sidebar to get started.</p>)}
          {!isAuthenticated && (<a href="/login">Login</a>)}
        </div>
      </div> */}
    </>
  );
};

export default App;
