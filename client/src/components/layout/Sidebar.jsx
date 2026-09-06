import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiGrid,
  FiUsers,
  FiSettings,
  FiShield,
  FiClock,
  FiCalendar,
  FiCreditCard,
  FiUser,
  FiBarChart2,
  FiCheckSquare,
  FiDollarSign,
  FiSliders,
  FiRotateCw,
  FiFileText,
  FiLogOut,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Badge from "../ui/Badge";
import "./Sidebar.css";

const ROLE_NAV_ITEMS = {
  ADMIN: {
    label: "Admin Portal",
    badgeVariant: "danger",
    basePath: "/admin",
    items: [
      { path: "/admin", label: "Overview", icon: <FiGrid /> },
      { path: "/admin?tab=users", label: "User Management", icon: <FiUsers /> },
      { path: "/admin?tab=settings", label: "Company Settings", icon: <FiSettings /> },
      { path: "/admin?tab=audits", label: "Security & Audits", icon: <FiShield /> },
    ],
  },
  EMPLOYEE: {
    label: "Employee Portal",
    badgeVariant: "info",
    basePath: "/employee",
    items: [
      { path: "/employee", label: "My Dashboard", icon: <FiGrid /> },
      { path: "/employee?tab=attendance", label: "My Attendance", icon: <FiClock /> },
      { path: "/employee?tab=leaves", label: "My Leaves", icon: <FiCalendar /> },
      { path: "/employee?tab=payslips", label: "My Payslips", icon: <FiCreditCard /> },
      { path: "/employee?tab=profile", label: "My Profile", icon: <FiUser /> },
    ],
  },
  HR_MANAGER: {
    label: "HR Manager",
    badgeVariant: "success",
    basePath: "/hr-manager",
    items: [
      { path: "/hr-manager", label: "HR Overview", icon: <FiBarChart2 /> },
      { path: "/hr-manager?tab=directory", label: "Employee Directory", icon: <FiUsers /> },
      { path: "/hr-manager?tab=attendance", label: "Daily Attendance", icon: <FiCalendar /> },
      { path: "/hr-manager?tab=approvals", label: "Leave Approvals", icon: <FiCheckSquare /> },
    ],
  },
  PAYROLL_MANAGER: {
    label: "Payroll Manager",
    badgeVariant: "warning",
    basePath: "/payroll-manager",
    items: [
      { path: "/payroll-manager", label: "Payroll Overview", icon: <FiDollarSign /> },
      { path: "/payroll-manager?tab=structures", label: "Salary Structures", icon: <FiSliders /> },
      { path: "/payroll-manager?tab=runs", label: "Monthly Runs", icon: <FiRotateCw /> },
      { path: "/payroll-manager?tab=payouts", label: "Final Approvals", icon: <FiCheckSquare /> },
    ],
  },
  PAYROLL_USER: {
    label: "Payroll Operator",
    badgeVariant: "primary",
    basePath: "/payroll-user",
    items: [
      { path: "/payroll-user", label: "Operations Hub", icon: <FiFileText /> },
      { path: "/payroll-user?tab=timesheets", label: "Timesheet Inputs", icon: <FiClock /> },
      { path: "/payroll-user?tab=deductions", label: "Variable Deductions", icon: <FiSliders /> },
      { path: "/payroll-user?tab=drafts", label: "Draft Generation", icon: <FiCheckSquare /> },
    ],
  },
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const role = user?.role || "EMPLOYEE";
  const navConfig = ROLE_NAV_ITEMS[role] || ROLE_NAV_ITEMS.EMPLOYEE;

  const handleLogout = async () => {
    if (logout) await logout();
    navigate("/login");
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`portal-sidebar ${isOpen ? "sidebar-open" : ""} ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div
          className="sidebar-brand"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 10px"
          }}
        >
          <Link to={navConfig.basePath} className="sidebar-brand-link">
            {isSidebarCollapsed ? (
              <img
                src="/Logo.png"
                alt="PeoplePay360"
                className="sidebar-logo-img"
                style={{ height: "38px", width: "auto", maxWidth: "48px", objectFit: "contain" }}
              />
            ) : (
              <img
                src="/Logo.png"
                alt="PeoplePay360"
                className="sidebar-logo-img"
                style={{ height: "60px", width: "auto", maxWidth: "90%", objectFit: "contain" }}
              />
            )}
          </Link>
        </div>

        {!isSidebarCollapsed && (
          <div className="sidebar-role-badge-row">
            <Badge variant={navConfig.badgeVariant} size="sm">
              {navConfig.label}
            </Badge>
          </div>
        )}

        <nav className="sidebar-nav">
          {!isSidebarCollapsed && <span className="sidebar-section-title">Navigation Menu</span>}
          <ul className="sidebar-menu">
            {navConfig.items.map((item) => {
              const currentFull = location.pathname + location.search;
              const isActive =
                currentFull === item.path ||
                (item.path === navConfig.basePath &&
                  location.pathname === navConfig.basePath &&
                  !location.search);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`sidebar-nav-link ${isActive ? "active" : ""}`}
                    onClick={onClose}
                    title={item.label}
                  >
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span className="sidebar-item-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className="sidebar-footer"
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: isSidebarCollapsed ? "column" : "row",
            justifyContent: isSidebarCollapsed ? "center" : "space-between",
            gap: "8px",
            padding: isSidebarCollapsed ? "12px 6px" : "10px 12px"
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 0, width: isSidebarCollapsed ? "auto" : "100%" }}>
            <div
              className="sidebar-user-card"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: isSidebarCollapsed ? "center" : "space-between" }}
              title={user?.name || "User"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                <div className="sidebar-user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                {!isSidebarCollapsed && (
                  <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
                    <span className="sidebar-user-name">{user?.name || "User"}</span>
                    <span className="sidebar-user-role">{role}</span>
                  </div>
                )}
              </div>
              {!isSidebarCollapsed && <FiChevronDown style={{ color: "#fff", opacity: 0.8 }} />}
            </div>

            {isProfileMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  border: "1px solid #e5e7eb",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>
                    {user?.name || "User"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    {user?.email || ""}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    color: "#dc2626",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FiLogOut /> Sign Out
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="sidebar-collapse-toggle-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#ffffff",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0
            }}
          >
            {isSidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
