import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./EmployeePage.css";

/**
 * Employee Portal Page
 * Displays title "Employee" and ONLY the employee's personal info.
 */
const EmployeePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="emp-page-container">
      <div className="emp-card">
        <h1 className="emp-title">Employee</h1>

        <div className="emp-info-list">
          <div className="emp-info-row">
            <span className="emp-info-label">Name</span>
            <span className="emp-info-value">{user?.full_name || "Employee One"}</span>
          </div>

          <div className="emp-info-row">
            <span className="emp-info-label">Email</span>
            <span className="emp-info-value">{user?.email}</span>
          </div>

          <div className="emp-info-row">
            <span className="emp-info-label">Role</span>
            <span className="emp-info-value">{user?.role}</span>
          </div>

          <div className="emp-info-row">
            <span className="emp-info-label">Employee ID</span>
            <span className="emp-info-value">#{user?.employee_id}</span>
          </div>

          <div className="emp-info-row">
            <span className="emp-info-label">Employee Code</span>
            <span className="emp-info-value">{user?.employee_code}</span>
          </div>

          <div className="emp-info-row">
            <span className="emp-info-label">User ID</span>
            <span className="emp-info-value emp-id-code">{user?.id}</span>
          </div>
        </div>

        <button type="button" onClick={handleLogout} className="emp-btn-logout">
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default EmployeePage;
