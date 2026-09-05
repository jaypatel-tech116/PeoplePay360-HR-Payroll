import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Topbar.css";

const ROLES = [
  { id: "ADMIN", label: "Admin", path: "/admin" },
  { id: "EMPLOYEE", label: "Employee", path: "/employee" },
  { id: "HR_MANAGER", label: "HR Manager", path: "/hr-manager" },
  { id: "PAYROLL_MANAGER", label: "Payroll Manager", path: "/payroll-manager" },
  { id: "PAYROLL_USER", label: "Payroll User", path: "/payroll-user" },
];

const Topbar = ({ onToggleSidebar, title = "Dashboard" }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const selectedRoleId = e.target.value;
    const target = ROLES.find((r) => r.id === selectedRoleId);
    if (target) {
      if (switchDemoRole) {
        switchDemoRole(target.id);
      }
      navigate(target.path);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="portal-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <h1 className="topbar-page-title">{title}</h1>
      </div>

      <div className="topbar-right">
        {/* Quick Role Switcher for Hackathon Demo Presentations */}
        <div className="topbar-demo-switcher" title="Switch between 5 stakeholders during hackathon demo">
          <span className="demo-switcher-label">🎭 Demo Switcher:</span>
          <select
            className="demo-switcher-select"
            value={user?.role || "EMPLOYEE"}
            onChange={handleRoleChange}
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="topbar-user-section">
          <span className="topbar-greeting">
            Hello, <strong>{user?.name || "User"}</strong>
          </span>
          <button
            type="button"
            className="topbar-logout-btn"
            onClick={handleLogout}
            title="Sign out of current account"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
