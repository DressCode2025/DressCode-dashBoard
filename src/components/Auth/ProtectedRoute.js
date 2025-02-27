import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ element: Element }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login and pass the intended location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Element />;
};

export default ProtectedRoute;
