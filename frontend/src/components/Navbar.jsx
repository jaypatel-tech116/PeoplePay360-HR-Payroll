import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  FileText,
  Clock,
  Calendar,
  DollarSign,
  BarChart3,
  ShieldCheck,
  LogOut,
  ChevronDown,
  UserCheck,
  Sparkles,
  Layers,
  Settings
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, switchDemoAccount, DEMO_ACCOUNTS } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  if (!user) return null;

  // Determine role-based permissions for navigation visibility
  const canAccessPayroll = ['HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(user.role);
  const canAccessReports = ['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(user.role);
  const canAccessAdmin = user.role === 'Admin';
  const isEmployeeOnly = user.role === 'Employee';

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleDemoSwitch = async (email) => {
    try {
      await switchDemoAccount(email);
      setShowDemoMenu(false);
      navigate('/');
    } catch (err) {
      alert('Failed to switch demo account: ' + err.message);
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-icon">
            <Sparkles size={20} className="logo-svg" />
          </div>
          <div className="brand-text-block">
            <span className="brand-name">PeoplePay<span className="brand-highlight">360</span></span>
            <span className="brand-tag">HR & Payroll Suite</span>
          </div>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="navbar-nav">
          {canAccessReports && (
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <BarChart3 size={17} />
              <span>Dashboard</span>
            </Link>
          )}

          <Link to="/employees" className={`nav-link ${isActive('/employees') ? 'active' : ''}`}>
            <Users size={17} />
            <span>Employees</span>
          </Link>

          {!isEmployeeOnly && (
            <Link to="/contracts" className={`nav-link ${isActive('/contracts') ? 'active' : ''}`}>
              <FileText size={17} />
              <span>Contracts</span>
            </Link>
          )}

          {!isEmployeeOnly && (
            <Link to="/schedules" className={`nav-link ${isActive('/schedules') ? 'active' : ''}`}>
              <Clock size={17} />
              <span>Schedules</span>
            </Link>
          )}

          <Link to="/attendance" className={`nav-link ${isActive('/attendance') ? 'active' : ''}`}>
            <Clock size={17} />
            <span>Attendance</span>
          </Link>

          <Link to="/time-off" className={`nav-link ${isActive('/time-off') ? 'active' : ''}`}>
            <Calendar size={17} />
            <span>Time Off</span>
          </Link>

          {/* Payroll Module (Completely hidden from standard Employee & HR Manager) */}
          {canAccessPayroll && (
            <div className="nav-dropdown-wrapper">
              <Link to="/payroll/payruns" className={`nav-link ${location.pathname.startsWith('/payroll') ? 'active' : ''}`}>
                <DollarSign size={17} />
                <span>Payroll</span>
                <ChevronDown size={13} className="chevron" />
              </Link>
              <div className="nav-dropdown-menu">
                <Link to="/payroll/payruns" className="dropdown-item">
                  <DollarSign size={15} />
                  <span>Payrun Batches</span>
                </Link>
                <Link to="/payroll/payslips" className="dropdown-item">
                  <FileText size={15} />
                  <span>All Payslips</span>
                </Link>
                {['HR Payroll Manager', 'Admin'].includes(user.role) && (
                  <>
                    <div className="dropdown-divider" />
                    <Link to="/payroll/structures" className="dropdown-item">
                      <Layers size={15} />
                      <span>Salary Structures</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {isEmployeeOnly && (
            <Link to="/my-payslips" className={`nav-link ${isActive('/my-payslips') ? 'active' : ''}`}>
              <DollarSign size={17} />
              <span>My Payslips</span>
            </Link>
          )}

          {canAccessAdmin && (
            <Link to="/admin/users" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
              <Settings size={17} />
              <span>User Admin</span>
            </Link>
          )}
        </nav>

        {/* Right Nav Utilities: Demo Account Switcher & Profile */}
        <div className="navbar-right">
          {/* Quick Role Switcher for Hackathon Judges */}
          <div className="demo-switcher-wrapper">
            <button
              className="demo-switcher-btn"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              title="Quickly switch between all 5 roles for testing"
            >
              <UserCheck size={15} />
              <span className="demo-btn-text">Test Role: <strong>{user.role}</strong></span>
              <ChevronDown size={14} />
            </button>

            {showDemoMenu && (
              <div className="demo-dropdown-menu animate-fade-in">
                <div className="demo-menu-header">Quick Role Switch (Demo Mode)</div>
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    className={`demo-menu-item ${user.email === acc.email ? 'selected' : ''}`}
                    onClick={() => handleDemoSwitch(acc.email)}
                  >
                    <div className="demo-item-info">
                      <span className="demo-item-label">{acc.label}</span>
                      <span className="demo-item-email">{acc.email}</span>
                    </div>
                    {user.email === acc.email && <span className="active-dot" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="profile-wrapper">
            <button
              className="profile-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="user-avatar-img" />
              ) : (
                <div className="user-avatar-placeholder">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="profile-info-text">
                <span className="profile-name">{user.name}</span>
                <span className="profile-role-badge">{user.role}</span>
              </div>
              <ChevronDown size={14} className="profile-chevron" />
            </button>

            {showUserMenu && (
              <div className="user-dropdown-menu animate-fade-in">
                <div className="user-menu-header">
                  <p className="user-menu-name">{user.name}</p>
                  <p className="user-menu-email">{user.email}</p>
                </div>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item logout-item"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
