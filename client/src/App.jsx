import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeePage from "./pages/EmployeePage";
import HrPage from "./pages/HrPage";
import NotFound from "./pages/NotFound";
import Loader from "./components/Loader";
import "./App.css";

/**
 * Helper component that navigates authenticated users
 * to their respective role portal:
 * - EMPLOYEE -> /employee
 * - HR_MANAGER / ADMIN -> /hr
 */
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Connecting to PeoplePay360..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "EMPLOYEE") {
    return <Navigate to="/employee" replace />;
  }

  return <Navigate to="/hr" replace />;
};

/**
 * Root Application Component
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-root">
          <Navbar />
          <div className="app-content">
            <Routes>
              {/* Home and Dashboard redirect according to role */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/dashboard" element={<HomeRedirect />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Role-Specific Protected Portals */}
              <Route
                path="/employee"
                element={
                  <ProtectedRoute>
                    <EmployeePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr"
                element={
                  <ProtectedRoute>
                    <HrPage />
                  </ProtectedRoute>
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
