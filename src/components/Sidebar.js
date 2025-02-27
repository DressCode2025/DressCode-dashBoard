import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import Images from './Images/Logo.svg';
import arrow from './Images/arrow.svg';
import {
  overview,
  inventory,
  uploadedHistory,
  storeCreation,
  raisedRequests,
  onlineOrders,
  qoute,
  assignedInventory,
  editBills,
  deletedBills,
  logout,
  handburger,
  discountCodes,
} from './icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logoutFunction, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutFunction();
    navigate('/login');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Define default nav items for all roles
  const allRolesNavItems = [

  ];

  // Define nav items for SUPER ADMIN
  const superAdminNavItems = [
    ...allRolesNavItems,
    { name: 'Overview', icon: overview, path: '/overview' },
    { name: 'Inventory', icon: inventory, path: '/inventory' },
    { name: 'Uploaded History', icon: uploadedHistory, path: '/uploaded-history' },
    { name: 'Store Bills', icon: editBills, path: '/store-bills' },
    { name: 'Store Creation', icon: storeCreation, path: '/store-creation' },
    { name: 'Raised Inventory Requests', icon: raisedRequests, path: '/raised-inventory' },
    { name: 'Online Orders', icon: onlineOrders, path: '/online-orders' },
    { name: 'Cancel Orders', icon: onlineOrders, path: '/cancel-orders' },
    { name: 'Coupons', icon: discountCodes, path: '/coupon' },
    { name: 'Quote', icon: qoute, path: '/Qoute' },
    { name: 'Assigned Inventory', icon: assignedInventory, path: '/assigned-inventory' },
    { name: 'Requested Edit Bills', icon: editBills, path: '/req-edit-bills' },
    { name: 'Deleted Bills', icon: deletedBills, path: '/deleted-bills' },
    { name: 'Contact Form Data', icon: inventory, path: '/form-data' },

  ];

  // Define nav items for PRODUCT MANAGER
  const productManagerNavItems = [
    ...allRolesNavItems,
    { name: 'Overview', icon: overview, path: '/overview' },
    { name: 'Inventory', icon: inventory, path: '/inventory' },
    { name: 'Raised Inventory Requests', icon: raisedRequests, path: '/raised-inventory' },
    { name: 'Assigned Inventory', icon: assignedInventory, path: '/assigned-inventory' },
    { name: 'Store Creation', icon: storeCreation, path: '/store-creation' },
    { name: 'Online Orders', icon: onlineOrders, path: '/online-orders' },
    { name: 'Cancel Orders', icon: onlineOrders, path: '/cancel-orders' },

  ];
  // Define nav items for Inventory MANAGER
  const inventoryManagerNavItems = [
    ...allRolesNavItems,
    { name: 'Overview', icon: overview, path: '/overview' },
    { name: 'Inventory', icon: inventory, path: '/inventory' },
    { name: 'Raised Inventory Requests', icon: raisedRequests, path: '/raised-inventory' },
    { name: 'Assigned Inventory', icon: assignedInventory, path: '/assigned-inventory' },
    { name: 'Store Creation', icon: storeCreation, path: '/store-creation' },
    { name: 'Online Orders', icon: onlineOrders, path: '/online-orders' },
    { name: 'Cancel Orders', icon: onlineOrders, path: '/cancel-orders' },

  ];

  // Define nav items for CUSTOMER CARE
  const customerCareNavItems = [
    ...allRolesNavItems,
    { name: 'Overview', icon: overview, path: '/overview' },
    { name: 'Online Orders', icon: onlineOrders, path: '/online-orders' },
    { name: 'Cancel Orders', icon: onlineOrders, path: '/cancel-orders' },
    { name: 'Qoute', icon: qoute, path: '/Qoute' },
  ];

  // Determine which set of nav items to use based on user role
  let navItems = [];
  if (userData?.role === 'SUPER ADMIN') {
    navItems = superAdminNavItems;
  } else if (userData?.role === 'PRODUCT MANAGER') {
    navItems = productManagerNavItems;
  } else if (userData?.role === 'INVENTORY MANAGER') {
    navItems = inventoryManagerNavItems;
  } else if (userData?.role === 'CUSTOMER CARE') {
    navItems = customerCareNavItems;
  }
  else {
    navItems = allRolesNavItems; // Default case, if no role or role doesn't match
  }

  return (
    <div>
      <button className="hamburger-menu" onClick={toggleSidebar}>
        <img src={handburger} alt="Open Menu" className="hamburger-icon" />
      </button>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar" onClick={toggleSidebar}>
          <img src={arrow} alt="Collapse" className="arrowClose" width="200" height="30" />
        </button>
        <div className="sidebar-header">
          <button className="shrink-sidebar" onClick={toggleSidebar}>
            <img src={arrow} alt="Shrink" className="arrowShrink" width="16" height="16" />
          </button>
          <div className="sidebar-logo">
            <img src={Images} alt="Logo" className="Logopng" />
          </div>
        </div>
        <nav className="nav flex-column">
          {navItems.map((item) => (
            <Link
              key={item.name}
              className={`nav-link d-flex align-items-center ${location.pathname === item.path ? 'active' : ''}`}
              to={item.path}
              onClick={toggleSidebar}
            >
              <img src={item.icon} alt={item.name} className="me-2 icon" />
              {item.name}
            </Link>
          ))}
          <button className="nav-link mt-auto d-flex align-items-center" href="#" onClick={handleLogout}>
            <img src={logout} alt="Logout" className="me-2 icon" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
