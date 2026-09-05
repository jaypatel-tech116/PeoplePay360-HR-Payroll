import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardView from "./views/DashboardView";
import ProfileView from "./views/ProfileView";
import ContractView from "./views/ContractView";
import ScheduleView from "./views/ScheduleView";
import AttendanceView from "./views/AttendanceView";
import LeavesView from "./views/LeavesView";
import PayslipsView from "./views/PayslipsView";
import "./EmployeePortal.css";

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Interactive Live State
  const [checkedIn, setCheckedIn] = useState(true);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [payslipModalData, setPayslipModalData] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    phone: "+91 9876543210",
    address: "123, Green Park, Bangalore, Karnataka 560001, India",
    emergencyContact: "+91 9876543211 (Spouse)",
  });
  const [leaveForm, setLeaveForm] = useState({
    type: "Annual Leave",
    fromDate: "2025-09-15",
    toDate: "2025-09-16",
    days: 2,
    reason: "Family function",
  });

  // Sync tab from URL query params (e.g. /employee?tab=attendance)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (
      tabParam &&
      ["dashboard", "profile", "contract", "schedule", "attendance", "leaves", "payslips"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/employee?tab=${tab}`, { replace: true });
  };

  const handleToggleCheckIn = () => {
    const nextState = !checkedIn;
    setCheckedIn(nextState);
    alert(nextState ? "⏱️ Clocked in at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "↪ Clocked out successfully.");
  };

  const handleSaveLeaveRequest = (e) => {
    e.preventDefault();
    alert("Leave request submitted successfully for approval!");
    setLeaveModalOpen(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert("Profile details updated successfully!");
    setEditProfileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="odoo-shell">
      {/* Left Odoo Plum Sidebar */}
      <aside className="odoo-sidebar">
        <div className="odoo-sidebar-brand">
          <span className="odoo-logo-text">odoo</span>
        </div>

        <ul className="odoo-sidebar-menu">
          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => handleTabChange("dashboard")}
            >
              <span className="odoo-nav-icon">🏠</span>
              <span>Dashboard</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => handleTabChange("profile")}
            >
              <span className="odoo-nav-icon">👤</span>
              <span>My Profile</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "contract" ? "active" : ""}`}
              onClick={() => handleTabChange("contract")}
            >
              <span className="odoo-nav-icon">📄</span>
              <span>My Contract</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "schedule" ? "active" : ""}`}
              onClick={() => handleTabChange("schedule")}
            >
              <span className="odoo-nav-icon">📅</span>
              <span>My Schedule</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => handleTabChange("attendance")}
            >
              <span className="odoo-nav-icon">⏱️</span>
              <span>My Attendance</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "leaves" ? "active" : ""}`}
              onClick={() => handleTabChange("leaves")}
            >
              <span className="odoo-nav-icon">🌴</span>
              <span>My Leaves</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "payslips" ? "active" : ""}`}
              onClick={() => handleTabChange("payslips")}
            >
              <span className="odoo-nav-icon">💳</span>
              <span>My Payslips</span>
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Canvas */}
      <div className="odoo-main">
        {/* Topbar Header */}
        <header className="odoo-topbar">
          <div className="odoo-topbar-left">
            <span className="odoo-topbar-appname">PeoplePay360</span>
          </div>

          <div className="odoo-topbar-right">
            <button
              type="button"
              className="odoo-bell-btn"
              title="Notifications"
              onClick={() => alert("No unread notifications.")}
            >
              🔔
            </button>

            <div
              className="odoo-user-dropdown"
              onClick={() => {
                if (window.confirm("Do you want to sign out?")) {
                  handleLogout();
                }
              }}
              title="Click to sign out"
            >
              <div className="odoo-avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
              </div>
              <div className="odoo-user-meta">
                <span className="odoo-user-fullname">
                  {user?.name || "Rahul Sharma"}
                </span>
                <span className="odoo-user-role-label">Employee</span>
              </div>
              <span className="odoo-caret">▼</span>
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <main className="odoo-body">
          {activeTab === "dashboard" && (
            <DashboardView
              onNavigate={handleTabChange}
              checkedIn={checkedIn}
              onToggleCheckIn={handleToggleCheckIn}
              onOpenLeaveModal={() => setLeaveModalOpen(true)}
              onViewPayslip={(period) => setPayslipModalData(period)}
            />
          )}

          {activeTab === "profile" && (
            <ProfileView onEditProfile={() => setEditProfileOpen(true)} />
          )}

          {activeTab === "contract" && <ContractView />}

          {activeTab === "schedule" && <ScheduleView />}

          {activeTab === "attendance" && (
            <AttendanceView
              checkedIn={checkedIn}
              onToggleCheckIn={handleToggleCheckIn}
            />
          )}

          {activeTab === "leaves" && (
            <LeavesView onOpenLeaveModal={() => setLeaveModalOpen(true)} />
          )}

          {activeTab === "payslips" && (
            <PayslipsView
              onViewPayslip={(period) => setPayslipModalData(period)}
            />
          )}
        </main>
      </div>

      {/* Leave Request Modal (Image 1) */}
      {leaveModalOpen && (
        <div className="odoo-modal-backdrop" onClick={() => setLeaveModalOpen(false)}>
          <div className="odoo-modal-card" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid var(--odoo-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div className="odoo-leave-icon-box">✈</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#111827" }}>
                    Request Leave
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--odoo-text-muted)", marginTop: "2px" }}>
                    Submit a new leave request
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="odoo-modal-close"
                style={{ color: "#9ca3af", fontSize: "1.4rem" }}
                onClick={() => setLeaveModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLeaveRequest}>
              <div className="odoo-modal-body" style={{ padding: "24px", gap: "16px" }}>
                <div className="odoo-form-group">
                  <label className="odoo-form-label">
                    Leave Type <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    className="odoo-form-select"
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                    required
                  >
                    <option value="Annual Leave">📅 Annual Leave</option>
                    <option value="Sick Leave">📅 Sick Leave</option>
                    <option value="Casual Leave">📅 Casual Leave</option>
                    <option value="Unpaid Leave">📅 Unpaid Leave</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="odoo-form-group">
                    <label className="odoo-form-label">
                      From Date <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="odoo-form-input"
                      value={leaveForm.fromDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="odoo-form-group">
                    <label className="odoo-form-label">
                      To Date <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="odoo-form-input"
                      value={leaveForm.toDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Number of Days</label>
                  <input
                    type="text"
                    className="odoo-form-input"
                    value={leaveForm.days}
                    readOnly
                    style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
                  />
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">
                    Reason <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    className="odoo-form-textarea"
                    rows="3"
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    maxLength={500}
                    required
                  ></textarea>
                  <div className="odoo-char-count">{leaveForm.reason.length}/500</div>
                </div>

                {/* Info Banner */}
                <div className="odoo-leave-info-banner">
                  <span style={{ fontSize: "1.1rem" }}>ℹ</span>
                  <span>
                    Your leave balance for {leaveForm.type} is{" "}
                    <strong>{leaveForm.type === "Annual Leave" ? "9 days" : leaveForm.type === "Sick Leave" ? "10 days" : "6 days"}</strong>.
                  </span>
                </div>
              </div>

              <div className="odoo-modal-footer" style={{ padding: "16px 24px" }}>
                <button
                  type="button"
                  className="odoo-btn-secondary"
                  onClick={() => setLeaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="odoo-btn-primary">
                  ✈ Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {payslipModalData && (
        <div className="odoo-modal-backdrop" onClick={() => setPayslipModalData(null)}>
          <div className="odoo-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="odoo-modal-header">
              <h3 className="odoo-modal-title">📄 Payslip Breakdown - {payslipModalData}</h3>
              <button
                type="button"
                className="odoo-modal-close"
                onClick={() => setPayslipModalData(null)}
              >
                ✕
              </button>
            </div>

            <div className="odoo-modal-body" style={{ fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--odoo-border)", paddingBottom: "10px" }}>
                <div>
                  <strong>Rahul Sharma</strong> (EMP001)
                  <div style={{ color: "var(--odoo-text-muted)", fontSize: "0.75rem" }}>Software Developer • Engineering</div>
                </div>
                <div>
                  <span className="odoo-badge odoo-badge-green">Paid</span>
                </div>
              </div>

              <div>
                <strong style={{ display: "block", color: "var(--odoo-text-secondary)", marginBottom: "6px" }}>Earnings</strong>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Basic Salary</span>
                  <span>₹ 35,000.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>House Rent Allowance (HRA)</span>
                  <span>₹ 17,500.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Special Allowance</span>
                  <span>₹ 14,500.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px dashed var(--odoo-border)", paddingTop: "6px", marginTop: "6px" }}>
                  <span>Total Gross Earnings</span>
                  <span>₹ 67,000.00</span>
                </div>
              </div>

              <div>
                <strong style={{ display: "block", color: "var(--odoo-text-secondary)", marginBottom: "6px" }}>Deductions</strong>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Provident Fund (PF)</span>
                  <span>₹ 4,200.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Professional Tax (PT)</span>
                  <span>₹ 200.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Income Tax (TDS)</span>
                  <span>₹ 8,100.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px dashed var(--odoo-border)", paddingTop: "6px", marginTop: "6px" }}>
                  <span>Total Deductions</span>
                  <span style={{ color: "var(--odoo-badge-red-text)" }}>₹ 12,500.00</span>
                </div>
              </div>

              <div style={{ backgroundColor: "#f3ebf1", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "var(--odoo-plum-primary)" }}>Net Payout Disbursed</span>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--odoo-plum-primary)" }}>₹ 54,500.00</span>
              </div>
            </div>

            <div className="odoo-modal-footer">
              <button
                type="button"
                className="odoo-btn-secondary"
                onClick={() => setPayslipModalData(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="odoo-btn-primary"
                onClick={() => {
                  alert(`Downloading Payslip PDF for ${payslipModalData}...`);
                  setPayslipModalData(null);
                }}
              >
                ⬇ Download Official PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="odoo-modal-backdrop" onClick={() => setEditProfileOpen(false)}>
          <div className="odoo-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="odoo-modal-header">
              <h3 className="odoo-modal-title">✏️ Edit Personal Details</h3>
              <button
                type="button"
                className="odoo-modal-close"
                onClick={() => setEditProfileOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="odoo-modal-body">
                <div className="odoo-form-group">
                  <label className="odoo-form-label">Phone Number</label>
                  <input
                    type="text"
                    className="odoo-form-input"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Residential Address</label>
                  <textarea
                    className="odoo-form-textarea"
                    rows="3"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Emergency Contact</label>
                  <input
                    type="text"
                    className="odoo-form-input"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="odoo-modal-footer">
                <button
                  type="button"
                  className="odoo-btn-secondary"
                  onClick={() => setEditProfileOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="odoo-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
