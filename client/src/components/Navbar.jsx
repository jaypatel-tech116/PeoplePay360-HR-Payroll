import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

/**
 * Top application navigation bar
 * Displays authentication status, active user avatar, and navigation controls
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Helper to extract first initials when avatar is not uploaded
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <Link to={user ? "/dashboard" : "/login"} className="navbar-brand">
        <span className="navbar-logo-icon">⚡</span>
        <span>AuthBase</span>
      </Link>

      <nav className="navbar-menu">
        {user ? (
          <>
            <div className="navbar-user-pill">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`${user.name}'s avatar`}
                  className="navbar-avatar"
                />
              ) : (
                <div className="navbar-avatar-placeholder">
                  {getInitials(user.name)}
                </div>
              )}
              <span className="navbar-username">{user.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="navbar-btn-logout"
              title="Log out of your account"
            >
              Log out
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
