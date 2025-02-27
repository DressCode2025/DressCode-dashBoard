import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="display-1 text-danger">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="lead text-center">
        Oops! The page you are looking for does not exist.
      </p>
      {isAuthenticated && (
        <Link
          to="/overview"
          className="btn btn-primary mt-3"
          style={{ cursor: "pointer" }}
        >
          Go Back to Home
        </Link>
      )}
      {!isAuthenticated && (
        <Link
          to="/login"
          className="btn btn-primary mt-3"
          style={{ cursor: "pointer" }}
        >
          Go Back to Login Page
        </Link>
      )}
    </div>
  );
};

export default NotFoundPage;