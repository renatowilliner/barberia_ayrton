import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ role }) => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = localStorage.getItem('token');

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        // Redirect non-admins to home if they try to access admin routes
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
