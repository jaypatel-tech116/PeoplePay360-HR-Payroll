import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

/**
 * Role-Based Access Control Route Guard
 * @param {string[]} allowedRoles - List of permitted roles for this route
 * @param {React.ReactNode} children
 */
const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Verifying role permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If roles are specified and user's role is not included
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Map user to their own role home
    const roleRoutes = {
      ADMIN: "/admin",
      EMPLOYEE: "/employee",
      HR_MANAGER: "/hr-manager",
      PAYROLL_MANAGER: "/payroll-manager",
      PAYROLL_USER: "/payroll-user",
    };
    const defaultDestination = roleRoutes[user.role] || "/login";
    return <Navigate to={defaultDestination} replace />;
  }

  return children;
};

export default RoleRoute;
