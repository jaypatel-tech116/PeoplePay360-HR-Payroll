import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getEmployeeDashboard,
  getEmployeeAttendance,
  punchAttendance,
  submitLeaveRequest,
  getPayslipDetails,
} from "../../api/employee.api";
import DashboardView from "./views/DashboardView";
import ProfileView from "./views/ProfileView";
import ContractView from "./views/ContractView";
import ScheduleView from "./views/ScheduleView";
import LeavesView from "./views/LeavesView";
import PayslipsView from "./views/PayslipsView";
import "./EmployeePortal.css";

const cleanName = (name) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
    return parts[0];
  }
  return name;
};

const getInitials = (name) => {
  const cleaned = cleanName(name);
  if (!cleaned) return "EM";
  const parts = cleaned.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
};

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Interactive Live State
  const [checkedIn, setCheckedIn] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [payslipModalData, setPayslipModalData] = useState(null);
  const [payslipModalContent, setPayslipModalContent] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);

  // Themed modal state (replaces all alert/confirm)
  const [themedModal, setThemedModal] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // Leave form state for dashboard modal
  const [leaveForm, setLeaveForm] = useState({
    type: "Annual Leave",
    fromDate: "",
    toDate: "",
    days: 1,
    reason: "",
  });

  // Calculate days when fromDate or toDate changes
  useEffect(() => {
    if (leaveForm.fromDate && leaveForm.toDate) {
      const start = new Date(leaveForm.fromDate);
      const end = new Date(leaveForm.toDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
        setLeaveForm((prev) => ({ ...prev, days: diffDays }));
      }
    }
  }, [leaveForm.fromDate, leaveForm.toDate]);

  // Sync tab from URL query params - removed "attendance" from valid tabs
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (
      tabParam &&
      ["dashboard", "profile", "contract", "schedule", "leaves", "payslips"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Load live employee punch state & profile
  const loadLiveState = useCallback(async () => {
    try {
      const attData = await getEmployeeAttendance();
      if (attData?.data?.checkedIn !== undefined) {
        setCheckedIn(attData.data.checkedIn);
      }
      const dashData = await getEmployeeDashboard();
      if (dashData?.data?.employee) {
        setEmployeeInfo(dashData.data.employee);
      }
    } catch (err) {
      console.warn("Could not load employee status:", err);
    }
  }, []);

  useEffect(() => {
    loadLiveState();
  }, [loadLiveState, refreshKey]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/employee?tab=${tab}`, { replace: true });
  };

  const handleToggleCheckIn = async (customPayload) => {
    try {
      const payload =
        customPayload && typeof customPayload === "object" && customPayload.action
          ? { action: customPayload.action }
          : {};
      const res = await punchAttendance(payload);
      if (res?.data?.checkedIn !== undefined) {
        setCheckedIn(res.data.checkedIn);
      }
      setThemedModal({
        type: "success",
        title: res.data.checkedIn ? "Checked In! ⏱️" : "Checked Out! ↪",
        message: res?.message || (res.data.checkedIn ? "You have clocked in successfully." : "You have clocked out successfully."),
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Attendance punch failed:", err);
      setThemedModal({
        type: "error",
        title: "Attendance Error",
        message: err.response?.data?.message || "Failed to update attendance punch.",
      });
    }
  };

  const handleSaveLeaveRequest = async (e) => {
    e.preventDefault();
    try {
      await submitLeaveRequest(leaveForm);
      setLeaveModalOpen(false);
      setThemedModal({
        type: "success",
        title: "Leave Submitted!",
        message: "Your leave request has been submitted for approval.",
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Leave request error:", err);
      setThemedModal({
        type: "error",
        title: "Submission Failed",
        message: err.response?.data?.message || "Failed to submit leave request.",
      });
    }
  };

  const handleOpenPayslipModal = async (periodOrId) => {
    setPayslipModalData(periodOrId);
    try {
      const res = await getPayslipDetails(periodOrId);
      if (res?.data?.payslip) {
        setPayslipModalContent(res.data.payslip);
      }
    } catch (err) {
      console.warn("Failed to load itemized payslip breakdown:", err);
    }
  };

  const handlePayslipDownload = () => {
    if (payslipModalContent) {
      // Trigger print which will use the PayslipsView print container
      setPayslipModalData(null);
      handleTabChange("payslips");
    }
  };

  const handleLogout = async () => {
    setLogoutConfirm(false);
    await logout();
    navigate("/login");
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".odoo-sidebar-user-container")) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  const displayName = cleanName(employeeInfo?.fullName || user?.name || "Rahul Sharma");
  const displayInitials = employeeInfo?.initials && employeeInfo.initials.length <= 2 && employeeInfo.initials[0].toLowerCase() !== employeeInfo.initials[1]?.toLowerCase()
    ? employeeInfo.initials
    : getInitials(displayName);

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
              <span>Dashboard</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => handleTabChange("profile")}
            >
              <span>My Profile</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "contract" ? "active" : ""}`}
              onClick={() => handleTabChange("contract")}
            >
              <span>My Contract</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "schedule" ? "active" : ""}`}
              onClick={() => handleTabChange("schedule")}
            >
              <span>My Schedule</span>
            </button>
          </li>

          {/* Attendance tab removed - merged into Schedule */}

          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "leaves" ? "active" : ""}`}
              onClick={() => handleTabChange("leaves")}
            >
              <span>My Leaves</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`odoo-nav-item ${activeTab === "payslips" ? "active" : ""}`}
              onClick={() => handleTabChange("payslips")}
            >
              <span>My Payslips</span>
            </button>
          </li>
        </ul>

        {/* User Profile Pill at Bottom-Left */}
        <div className="odoo-sidebar-footer">
          <div className="odoo-sidebar-user-container">
            <div
              className="odoo-user-dropdown odoo-sidebar-user-pill"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              title={displayName}
            >
              <div className="odoo-avatar-circle">
                {displayInitials}
              </div>
              <div className="odoo-user-meta">
                <span className="odoo-user-fullname">
                  {displayName}
                </span>
                <span className="odoo-user-role-label">Employee</span>
              </div>
              <span className="odoo-caret">▼</span>
            </div>

            {isProfileMenuOpen && (
              <div className="odoo-sidebar-profile-dropdown">
                <div className="odoo-profile-dropdown-header">
                  <div className="odoo-profile-dropdown-name">
                    {displayName}
                  </div>
                  <div className="odoo-profile-dropdown-email">
                    {employeeInfo?.email || user?.email || "employee@company.com"}
                  </div>
                </div>
                <button
                  type="button"
                  className="odoo-profile-dropdown-item"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    handleTabChange("profile");
                  }}
                >
                  My Profile
                </button>
                <button
                  type="button"
                  className="odoo-profile-dropdown-item logout"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setLogoutConfirm(true);
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Canvas */}
      <div className="odoo-main">
        {/* Topbar Header */}
        <header className="odoo-topbar">
          <div className="odoo-topbar-left">
            <span className="odoo-topbar-appname">PeoplePay360</span>
          </div>

          <div className="odoo-topbar-right">
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
              refreshKey={refreshKey}
            />
          )}

          {activeTab === "profile" && (
            <ProfileView refreshKey={refreshKey} />
          )}

          {activeTab === "contract" && <ContractView refreshKey={refreshKey} />}

          {activeTab === "schedule" && (
            <ScheduleView
              checkedIn={checkedIn}
              onToggleCheckIn={handleToggleCheckIn}
              refreshKey={refreshKey}
            />
          )}

          {activeTab === "leaves" && (
            <LeavesView refreshKey={refreshKey} />
          )}

          {activeTab === "payslips" && (
            <PayslipsView
              onViewPayslip={handleOpenPayslipModal}
              refreshKey={refreshKey}
            />
          )}
        </main>
      </div>

      {/* Leave Request Modal (from Dashboard) */}
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
              <button type="button" className="odoo-modal-close" style={{ color: "#9ca3af", fontSize: "1.4rem" }} onClick={() => setLeaveModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveLeaveRequest}>
              <div className="odoo-modal-body" style={{ padding: "24px", gap: "16px" }}>
                <div className="odoo-form-group">
                  <label className="odoo-form-label">Leave Type <span style={{ color: "#ef4444" }}>*</span></label>
                  <select className="odoo-form-select" value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })} required>
                    <option value="Annual Leave">📅 Annual Leave</option>
                    <option value="Sick Leave">📅 Sick Leave</option>
                    <option value="Casual Leave">📅 Casual Leave</option>
                    <option value="Unpaid Leave">📅 Unpaid Leave</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="odoo-form-group">
                    <label className="odoo-form-label">From Date <span style={{ color: "#ef4444" }}>*</span></label>
                    <input type="date" className="odoo-form-input" value={leaveForm.fromDate} onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} required />
                  </div>
                  <div className="odoo-form-group">
                    <label className="odoo-form-label">To Date <span style={{ color: "#ef4444" }}>*</span></label>
                    <input type="date" className="odoo-form-input" value={leaveForm.toDate} onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })} required />
                  </div>
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Number of Days</label>
                  <input type="text" className="odoo-form-input" value={leaveForm.days} readOnly style={{ backgroundColor: "#f3f4f6", color: "#374151" }} />
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Reason <span style={{ color: "#ef4444" }}>*</span></label>
                  <textarea className="odoo-form-textarea" rows="3" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} maxLength={500} required></textarea>
                  <div className="odoo-char-count">{leaveForm.reason.length}/500</div>
                </div>
              </div>

              <div className="odoo-modal-footer" style={{ padding: "16px 24px" }}>
                <button type="button" className="odoo-btn-secondary" onClick={() => setLeaveModalOpen(false)}>Cancel</button>
                <button type="submit" className="odoo-btn-primary">✈ Submit Request</button>
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
              <h3 className="odoo-modal-title">📄 Payslip Breakdown</h3>
              <button type="button" className="odoo-modal-close" onClick={() => setPayslipModalData(null)}>✕</button>
            </div>

            <div className="odoo-modal-body" style={{ fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--odoo-border)", paddingBottom: "10px" }}>
                <div>
                  <strong>{cleanName(payslipModalContent?.employeeName || employeeInfo?.fullName || "Employee")}</strong> ({payslipModalContent?.employeeCode || employeeInfo?.employeeCode || "EMP001"})
                  <div style={{ color: "var(--odoo-text-muted)", fontSize: "0.75rem" }}>
                    {payslipModalContent?.designation || employeeInfo?.jobPosition || "Software Developer"} • {payslipModalContent?.department || employeeInfo?.department || "Engineering"}
                  </div>
                </div>
                <div>
                  <span className={`odoo-badge ${payslipModalContent?.paymentStatus === "Paid" ? "odoo-badge-green" : "odoo-badge-orange"}`}>
                    {payslipModalContent?.paymentStatus || "Paid"}
                  </span>
                </div>
              </div>

              <div>
                <strong style={{ display: "block", color: "var(--odoo-text-secondary)", marginBottom: "6px" }}>Earnings</strong>
                {payslipModalContent?.earnings && payslipModalContent.earnings.length > 0 ? (
                  payslipModalContent.earnings.map((earn, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>{earn.name}</span>
                      <span>{earn.amount}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>Basic Salary</span><span>₹ 30,000.00</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>HRA</span><span>₹ 12,000.00</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>Special Allowance</span><span>₹ 5,000.00</span></div>
                  </>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px dashed var(--odoo-border)", paddingTop: "6px", marginTop: "6px" }}>
                  <span>Total Gross</span>
                  <span>{payslipModalContent?.grossAmount || "₹ 51,000.00"}</span>
                </div>
              </div>

              <div>
                <strong style={{ display: "block", color: "var(--odoo-text-secondary)", marginBottom: "6px" }}>Deductions</strong>
                {payslipModalContent?.deductions && payslipModalContent.deductions.length > 0 ? (
                  payslipModalContent.deductions.map((ded, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>{ded.name}</span>
                      <span style={{ color: "var(--odoo-badge-red-text)" }}>{ded.amount}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>PF</span><span>₹ 3,600.00</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>PT</span><span>₹ 200.00</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>TDS</span><span>₹ 1,500.00</span></div>
                  </>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px dashed var(--odoo-border)", paddingTop: "6px", marginTop: "6px" }}>
                  <span>Total Deductions</span>
                  <span style={{ color: "var(--odoo-badge-red-text)" }}>{payslipModalContent?.deductionAmount || "₹ 5,300.00"}</span>
                </div>
              </div>

              <div style={{ backgroundColor: "#f3ebf1", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "var(--odoo-plum-primary)" }}>Net Payout</span>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--odoo-plum-primary)" }}>{payslipModalContent?.netAmount || "₹ 45,700.00"}</span>
              </div>
            </div>

            <div className="odoo-modal-footer">
              <button type="button" className="odoo-btn-secondary" onClick={() => setPayslipModalData(null)}>Close</button>
              <button type="button" className="odoo-btn-primary" onClick={handlePayslipDownload}>⬇ Download PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Themed Modal (replaces all browser alert/confirm) */}
      {themedModal && (
        <div className="themed-modal-backdrop" onClick={() => setThemedModal(null)}>
          <div className="themed-modal" onClick={(e) => e.stopPropagation()}>
            <div className="themed-modal-body">
              <div className={`themed-modal-icon ${themedModal.type}`}>
                {themedModal.type === "success" ? "✓" : themedModal.type === "warning" ? "⚠" : "✕"}
              </div>
              <div className="themed-modal-title">{themedModal.title}</div>
              <div className="themed-modal-message">{themedModal.message}</div>
            </div>
            <div className="themed-modal-actions">
              <button className="odoo-btn-primary" onClick={() => setThemedModal(null)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal (replaces window.confirm) */}
      {logoutConfirm && (
        <div className="themed-modal-backdrop" onClick={() => setLogoutConfirm(false)}>
          <div className="themed-modal" onClick={(e) => e.stopPropagation()}>
            <div className="themed-modal-body">
              <div className="themed-modal-icon warning">⚠</div>
              <div className="themed-modal-title">Sign Out</div>
              <div className="themed-modal-message">Are you sure you want to sign out of PeoplePay360?</div>
            </div>
            <div className="themed-modal-actions">
              <button className="odoo-btn-secondary" onClick={() => setLogoutConfirm(false)}>Cancel</button>
              <button className="odoo-btn-primary" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
