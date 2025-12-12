import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUser();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles.length > 0 && user) {
        const hasRequiredRole = requiredRoles.some(role =>
            user.roles && user.roles.includes(role)
        );

        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;