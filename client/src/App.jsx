import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Loader from "./components/Loader";

// 5 Stakeholder Dashboards
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import HrManagerDashboard from "./pages/hr-manager/HrManagerDashboard";
import PayrollManagerDashboard from "./pages/payroll-manager/PayrollManagerDashboard";
import PayrollUserDashboard from "./pages/payroll-user/PayrollUserDashboard";

import "./App.css";

/**
 * Smart role-based router that redirects users to their designated portal
 */
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Connecting to PeoplePay360..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleDestinations = {
    ADMIN: "/admin",
    EMPLOYEE: "/employee",
    HR_MANAGER: "/hr-manager",
    PAYROLL_MANAGER: "/payroll-manager",
    HR_PAYROLL_MANAGER: "/payroll-manager",
    PAYROLL_USER: "/payroll-user",
    HR_PAYROLL_USER: "/payroll-user",
  };

  const target = roleDestinations[user.role] || "/employee";
  return <Navigate to={target} replace />;
};

/**
 * Conditional Header wrapper: Hides public navbar on full-screen portal dashboards
 */
const NavigationWrapper = () => {
  const location = useLocation();
  const isPortal = [
    "/admin",
    "/employee",
    "/hr-manager",
    "/payroll-manager",
    "/payroll-user",
    "/login",
    "/register",
  ].some((path) => location.pathname.startsWith(path));

  if (isPortal) return null;
  return <Navbar />;
};

/**
 * Main Application Component with 5 Stakeholder Routes
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-root">
          <NavigationWrapper />
          <div className="app-content">
            <Routes>
              {/* Home & Dashboard role dispatchers */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/dashboard" element={<HomeRedirect />} />
              <Route path="/hr" element={<Navigate to="/hr-manager" replace />} />

              {/* Public Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* 1. Admin Portal */}
              <Route
                path="/admin"
                element={
                  <RoleRoute allowedRoles={["ADMIN"]}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />

              {/* 2. Employee Portal */}
              <Route
                path="/employee"
                element={
                  <RoleRoute allowedRoles={["EMPLOYEE", "ADMIN"]}>
                    <EmployeeDashboard />
                  </RoleRoute>
                }
              />

              {/* 3. HR Manager Portal */}
              <Route
                path="/hr-manager"
                element={
                  <RoleRoute allowedRoles={["HR_MANAGER", "ADMIN"]}>
                    <HrManagerDashboard />
                  </RoleRoute>
                }
              />

              {/* 4. HR Payroll Manager Portal */}
              <Route
                path="/payroll-manager"
                element={
                  <RoleRoute allowedRoles={["PAYROLL_MANAGER", "HR_PAYROLL_MANAGER", "ADMIN"]}>
                    <PayrollManagerDashboard />
                  </RoleRoute>
                }
              />

              {/* 5. HR Payroll User (Operator) Portal */}
              <Route
                path="/payroll-user"
                element={
                  <RoleRoute allowedRoles={["PAYROLL_USER", "HR_PAYROLL_USER", "ADMIN"]}>
                    <PayrollUserDashboard />
                  </RoleRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
