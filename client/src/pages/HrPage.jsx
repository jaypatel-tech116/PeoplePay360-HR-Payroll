import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HrPage.css";

/**
 * HR Portal Page
 * Displays title "HR" and ONLY the HR user's personal info.
 */
const HrPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="hr-page-container">
      <div className="hr-card">
        <h1 className="hr-title">HR</h1>

        <div className="hr-info-list">
          <div className="hr-info-row">
            <span className="hr-info-label">Name</span>
            <span className="hr-info-value">{user?.full_name || "HR Manager"}</span>
          </div>

          <div className="hr-info-row">
            <span className="hr-info-label">Email</span>
            <span className="hr-info-value">{user?.email}</span>
          </div>

          <div className="hr-info-row">
            <span className="hr-info-label">Role</span>
            <span className="hr-info-value">{user?.role}</span>
          </div>

          <div className="hr-info-row">
            <span className="hr-info-label">Employee ID</span>
            <span className="hr-info-value">#{user?.employee_id}</span>
          </div>

          <div className="hr-info-row">
            <span className="hr-info-label">Employee Code</span>
            <span className="hr-info-value">{user?.employee_code}</span>
          </div>

          <div className="hr-info-row">
            <span className="hr-info-label">User ID</span>
            <span className="hr-info-value hr-id-code">{user?.id}</span>
          </div>
        </div>

        <button type="button" onClick={handleLogout} className="hr-btn-logout">
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default HrPage;
