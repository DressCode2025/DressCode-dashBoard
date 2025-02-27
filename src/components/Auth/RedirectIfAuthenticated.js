import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
const RedirectIfAuthenticated = ({ element }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // Use a template literal for the redirect path
    const redirectTo = `${location.state?.from?.pathname || '/overview'}`;
    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />; // Redirect to a default page or dashboard
    }

    return element;
};

export default RedirectIfAuthenticated;
