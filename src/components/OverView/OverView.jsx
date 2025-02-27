import api from "../api";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../../context/AuthContext";
import { Tabs, Tab } from "react-bootstrap";
import {
  FaMoneyBillAlt,
  FaBoxOpen,
  FaClipboardList,
  FaFileInvoice,
} from "react-icons/fa"; // Icons for overview cards
import OnlineOrderOverViewComp from "./OnlineOrderOverview";
import StoreBillsOverview from "./StoreBillsOverview";

const cardStyle = {
  height: "auto", // Set a fixed height for uniformity
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  padding: "20px",
  borderRadius: "15px", // Rounded corners
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
  transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth hover effect
};

const OverView = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { userData } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    // Fetch the data from the API with authorization token
    api
      .get("/dashboard/getOverview", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setOverviewData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching data");
        setLoading(false);
      });

    // Update the current date and time every second
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger text-center mt-5">
        <h4>{error}</h4>
      </div>
    );
  }

  const renderCardContent = (key) => {
    const role = userData.role;

    // Icons for each card
    const icons = {
      ELITE: (
        <FaMoneyBillAlt
          size={40}
          className="mb-3"
          style={{ color: "#20248A", marginLeft: "10px" }}
        />
      ),
      HEAL: (
        <FaBoxOpen
          size={40}
          className="mb-3"
          style={{ color: "#20248A", marginLeft: "10px" }}
        />
      ),
      TOGS: (
        <FaClipboardList
          size={40}
          className="mb-3"
          style={{ color: "#20248A", marginLeft: "10px" }}
        />
      ),
      total: (
        <FaFileInvoice
          size={40}
          className="mb-3"
          style={{ color: "#20248A", marginLeft: "10px" }}
        />
      ),
    };

    return (
      <>
        {icons[key]} {/* Render the icon */}
        {role === "SUPER ADMIN" && (
          <>
            <h5 className="card-title mb-2">
              Amount: ₹{overviewData?.[key]?.amount || 0}
            </h5>
            <p className="card-text mb-1">
              Quantity: {overviewData?.[key]?.quantity || 0}
            </p>
          </>
        )}
        {(role === "PRODUCT MANAGER" || role === "INVENTORY MANAGER") && (
          <p className="card-text mb-1">
            Quantity: {overviewData?.[key]?.quantity || 0}
          </p>
        )}
        {["SUPER ADMIN", "PRODUCT MANAGER", "INVENTORY MANAGER"].includes(
          role
        ) && (
          <>
            <p className="card-text mb-0">
              Online Orders: {overviewData?.[key]?.onlineOrders || 0}
            </p>
            <p className="card-text mb-0">
              Canceled Orders: {overviewData?.[key]?.canceledOrders}
            </p>
            {/* {overviewData?.[key]?.offlineOrders > 0 && ( */}
            <p className="card-text mb-0">
              Offline Orders: {overviewData?.[key]?.offlineOrders}
            </p>
            {/* )} */}
            <p className="card-text mb-0">
              Total Orders:{" "}
              {(overviewData?.[key]?.onlineOrders || 0) -
                (overviewData?.[key]?.canceledOrders || 0) +
                (overviewData?.[key]?.offlineOrders > 0
                  ? overviewData?.[key]?.offlineOrders
                  : 0)}
            </p>
          </>
        )}
        {role === "CUSTOMER CARE" && (
          <p className="card-text mb-0">
            Online Orders: {overviewData?.[key]?.onlineOrders || 0}
          </p>
        )}
      </>
    );
  };

  return (
    <div className="d-flex flex-column vh-100">
      {/* User Info on Top Right */}
      <div className="d-flex justify-content-end align-items-start p-3">
        <div className="text-end">
          <h5 className="text-truncate">{userData.name}</h5>
          <p className="mb-0">Role: {userData.role}</p>
          <p className="mb-0">
            {currentDateTime.toLocaleDateString()}{" "}
            {currentDateTime.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Overview Dashboard */}
      <div className="d-flex justify-content-center align-items-center flex-grow-1 main-content">
        <div className="container">
          <div className="row mb-4">
            <div className="col-12 text-center">
              <h1
                className="display-4 fw-bold "
                style={{
                  backgroundColor: "#fff",
                  color: "#20248A",
                  padding: "10px",
                  borderRadius: "15px",
                }}
              >
                Overview Dashboard
              </h1>
            </div>
          </div>
          <div className="row g-3 justify-content-center">
            {["ELITE", "HEAL", "TOGS", "total"].map((key) => (
              <div
                key={key}
                className="col-12 col-md-6 col-lg-4 col-xl-3"
                whileHover={{ scale: 1.05 }} // Add hover animation
              >
                <div
                  className="card bg-light text-dark mb-3 shadow-lg"
                  style={cardStyle}
                >
                  <div
                    className="card-header text-white fw-bold"
                    style={{ backgroundColor: "#20248A" }}
                  >
                    {key.toUpperCase()}
                  </div>
                  <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    {renderCardContent(key)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs for Admin */}
          {userData.role === "SUPER ADMIN" && (
            <div className="row mt-4">
              <div className="col-12">
                <div className="bg-white p-3 rounded shadow-sm">
                  <Tabs
                    defaultActiveKey="orders"
                    id="admin-tabs"
                    className="mb-3 justify-content-center"
                  >
                    <Tab
                      eventKey="orders"
                      title={
                        <span className="fw-bold text-primary">Orders</span>
                      }
                    >
                      <div className="">
                        <OnlineOrderOverViewComp />
                      </div>
                    </Tab>
                    <Tab
                      eventKey="storeBills"
                      title={
                        <span className="fw-bold text-primary">
                          Store Bills
                        </span>
                      }
                    >
                      <div className="">
                        <StoreBillsOverview />
                      </div>
                    </Tab>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverView;
