import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";
import "./Sidebar.css";

const ROLE_NAV_ITEMS = {
  ADMIN: {
    label: "Admin Portal",
    badgeVariant: "danger",
    basePath: "/admin",
    items: [
      { path: "/admin", label: "Overview", icon: "📊" },
      { path: "/admin?tab=users", label: "User Management", icon: "👥" },
      { path: "/admin?tab=settings", label: "Company Settings", icon: "⚙️" },
      { path: "/admin?tab=audits", label: "Security & Audits", icon: "🛡️" },
    ],
  },
  EMPLOYEE: {
    label: "Employee Portal",
    badgeVariant: "info",
    basePath: "/employee",
    items: [
      { path: "/employee", label: "My Dashboard", icon: "🏠" },
      { path: "/employee?tab=attendance", label: "My Attendance", icon: "⏱️" },
      { path: "/employee?tab=leaves", label: "My Leaves", icon: "🌴" },
      { path: "/employee?tab=payslips", label: "My Payslips", icon: "💳" },
      { path: "/employee?tab=profile", label: "My Profile", icon: "👤" },
    ],
  },
  HR_MANAGER: {
    label: "HR Manager",
    badgeVariant: "success",
    basePath: "/hr-manager",
    items: [
      { path: "/hr-manager", label: "HR Overview", icon: "📈" },
      { path: "/hr-manager?tab=directory", label: "Employee Directory", icon: "📇" },
      { path: "/hr-manager?tab=attendance", label: "Daily Attendance", icon: "📅" },
      { path: "/hr-manager?tab=approvals", label: "Leave Approvals", icon: "✅" },
    ],
  },
  PAYROLL_MANAGER: {
    label: "Payroll Manager",
    badgeVariant: "warning",
    basePath: "/payroll-manager",
    items: [
      { path: "/payroll-manager", label: "Payroll Overview", icon: "💰" },
      { path: "/payroll-manager?tab=structures", label: "Salary Structures", icon: "📑" },
      { path: "/payroll-manager?tab=runs", label: "Monthly Runs", icon: "🔄" },
      { path: "/payroll-manager?tab=payouts", label: "Final Approvals", icon: "🏦" },
    ],
  },
  PAYROLL_USER: {
    label: "Payroll Operator",
    badgeVariant: "primary",
    basePath: "/payroll-user",
    items: [
      { path: "/payroll-user", label: "Operations Hub", icon: "📋" },
      { path: "/payroll-user?tab=timesheets", label: "Timesheet Inputs", icon: "🕒" },
      { path: "/payroll-user?tab=deductions", label: "Variable Deductions", icon: "✏️" },
      { path: "/payroll-user?tab=drafts", label: "Draft Generation", icon: "🚀" },
    ],
  },
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || "EMPLOYEE";
  const navConfig = ROLE_NAV_ITEMS[role] || ROLE_NAV_ITEMS.EMPLOYEE;

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`portal-sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Link to={navConfig.basePath} className="sidebar-brand-link">
            <span className="sidebar-logo-badge">⚡</span>
            <div>
              <span className="sidebar-brand-name">PeoplePay360</span>
              <span className="sidebar-brand-sub">HR & Payroll Suite</span>
            </div>
          </Link>
        </div>

        <div className="sidebar-role-badge-row">
          <Badge variant={navConfig.badgeVariant} size="sm">
            {navConfig.label}
          </Badge>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-title">Navigation Menu</span>
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
                  >
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span className="sidebar-item-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || "User"}</span>
              <span className="sidebar-user-role">{role}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
