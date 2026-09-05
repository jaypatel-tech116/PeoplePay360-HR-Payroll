import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

/**
 * Navigation Bar Component for PeoplePay360
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleBadgeColor = (role) => {
    if (role === "EMPLOYEE") return "badge-emp";
    if (role === "HR_MANAGER" || role === "ADMIN") return "badge-hr";
    return "badge-default";
  };

  return (
    <header className="navbar">
      <Link
        to={user ? (user.role === "EMPLOYEE" ? "/employee" : "/hr") : "/login"}
        className="navbar-brand"
      >
        <span className="navbar-logo-icon">💼</span>
        <span className="navbar-brand-name">PeoplePay360</span>
      </Link>

      <nav className="navbar-menu">
        {user ? (
          <>
            {user.role === "EMPLOYEE" ? (
              <Link to="/employee" className="navbar-link">
                Employee Portal
              </Link>
            ) : (
              <Link to="/hr" className="navbar-link">
                HR Portal
              </Link>
            )}

            <div className="navbar-user-pill">
              <span className={`navbar-role-pill ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
              <span className="navbar-username">
                {user.email} (ID: #{user.employee_id || user.id?.slice(0, 6)})
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="navbar-btn-logout"
              title="Sign Out"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Sign In
            </Link>
            <Link to="/register" className="navbar-link">
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
