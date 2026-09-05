import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  FileText,
  CalendarClock,
  Banknote,
  Receipt,
  Sliders,
  UserCheck,
  Building2,
  ShieldCheck,
  UserCog,
  LogOut,
  ChevronDown,
  Sparkles,
  User
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout, switchDemoAccount, DEMO_ACCOUNTS } = useAuth();
  const navigate = useNavigate();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  if (!user) return null;

  // Role permissions
  const isAdmin = user.role === 'Admin';
  const isHRManager = user.role === 'HR Manager';
  const isPayrollMgr = user.role === 'HR Payroll Manager';
  const isPayrollUser = user.role === 'HR Payroll User';
  const isEmployee = user.role === 'Employee';

  const canAccessPayroll = isPayrollUser || isPayrollMgr || isAdmin;
  const canAccessPayrollConfig = isPayrollMgr || isAdmin;
  const canAccessAdmin = isAdmin;
  const canReviewRegistrations = isHRManager || isAdmin;
  const canAccessGeneralHR = !isEmployee;

  const handleDemoSwitch = async (email) => {
    try {
      await switchDemoAccount(email);
      setShowDemoMenu(false);
      navigate('/');
    } catch (err) {
      alert('Failed to switch demo account: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'role-badge role-admin';
      case 'HR Manager': return 'role-badge role-hr';
      case 'HR Payroll Manager': return 'role-badge role-payroll-mgr';
      case 'HR Payroll User': return 'role-badge role-payroll-user';
      default: return 'role-badge role-employee';
    }
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <Sparkles size={20} className="brand-icon-svg" />
        </div>
        <div className="brand-info">
          <div className="brand-title">
            PeoplePay<span className="brand-version">360</span>
          </div>
          <div className="tenant-badge" title={user.company?.name || 'Default Organization'}>
            <Building2 size={12} />
            <span>{user.company?.name || 'PeoplePay Global'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        {/* SECTION 1: WORKSPACE */}
        <div className="nav-section-label">WORKSPACE</div>

        {!isEmployee && (
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>
        )}

        {canAccessGeneralHR ? (
          <NavLink
            to="/employees"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={18} className="nav-icon" />
            <span className="nav-text">Employees</span>
          </NavLink>
        ) : (
          <NavLink
            to={`/employees/${user.employee_id || user.id}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <User size={18} className="nav-icon" />
            <span className="nav-text">My Profile</span>
          </NavLink>
        )}

        <NavLink
          to="/attendance"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Clock size={18} className="nav-icon" />
          <span className="nav-text">Attendance</span>
        </NavLink>

        <NavLink
          to="/time-off"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Calendar size={18} className="nav-icon" />
          <span className="nav-text">Time Off</span>
        </NavLink>

        {canAccessGeneralHR && (
          <NavLink
            to="/contracts"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FileText size={18} className="nav-icon" />
            <span className="nav-text">Contracts</span>
          </NavLink>
        )}

        {canAccessGeneralHR && (
          <NavLink
            to="/schedules"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <CalendarClock size={18} className="nav-icon" />
            <span className="nav-text">Working Schedules</span>
          </NavLink>
        )}

        {/* SECTION 2: PAYROLL */}
        {(canAccessPayroll || isEmployee) && (
          <>
            <div className="nav-section-label">PAYROLL & REWARDS</div>

            {canAccessPayroll && (
              <>
                <NavLink
                  to="/payroll/payruns"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Banknote size={18} className="nav-icon" />
                  <span className="nav-text">Payruns</span>
                </NavLink>

                <NavLink
                  to="/payroll/payslips"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Receipt size={18} className="nav-icon" />
                  <span className="nav-text">All Payslips</span>
                </NavLink>
              </>
            )}

            {isEmployee && (
              <NavLink
                to="/my-payslips"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Receipt size={18} className="nav-icon" />
                <span className="nav-text">My Payslips</span>
              </NavLink>
            )}

            {canAccessPayrollConfig && (
              <NavLink
                to="/payroll/structures"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Sliders size={18} className="nav-icon" />
                <span className="nav-text">Salary Structures</span>
              </NavLink>
            )}
          </>
        )}

        {/* SECTION 3: ADMINISTRATION */}
        {(canReviewRegistrations || canAccessAdmin) && (
          <>
            <div className="nav-section-label">GOVERNANCE & ADMIN</div>

            {canReviewRegistrations && (
              <NavLink
                to="/admin/registrations"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <UserCheck size={18} className="nav-icon" />
                <span className="nav-text">Candidate Approvals</span>
              </NavLink>
            )}

            {canAccessAdmin && (
              <>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <UserCog size={18} className="nav-icon" />
                  <span className="nav-text">User Accounts</span>
                </NavLink>

                <NavLink
                  to="/admin/companies"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Building2 size={18} className="nav-icon" />
                  <span className="nav-text">Organizations</span>
                </NavLink>

                <NavLink
                  to="/admin/audit-logs"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <ShieldCheck size={18} className="nav-icon" />
                  <span className="nav-text">Security Audit Trail</span>
                </NavLink>
              </>
            )}
          </>
        )}
      </nav>

      {/* Sidebar Footer: User profile & demo switcher */}
      <div className="sidebar-footer">
        {/* Quick Demo Switcher Dropdown */}
        <div className="demo-switch-container">
          <button
            type="button"
            className="demo-switch-btn"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            title="Switch demo persona for testing"
          >
            <span className="demo-dot"></span>
            <span className="demo-label">Switch Persona</span>
            <ChevronDown size={14} className={`demo-chevron ${showDemoMenu ? 'open' : ''}`} />
          </button>

          {showDemoMenu && (
            <div className="demo-dropdown-menu animate-fade-in">
              <div className="demo-dropdown-header">Switch Role Persona</div>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  className={`demo-option-item ${user.email === acc.email ? 'current' : ''}`}
                  onClick={() => handleDemoSwitch(acc.email)}
                >
                  <div className="demo-opt-role">{acc.role}</div>
                  <div className="demo-opt-email">{acc.email}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="user-profile-card">
          <div className="user-avatar-circle">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} />
            ) : (
              <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>
          <div className="user-details-block">
            <div className="user-display-name" title={user.name}>{user.name}</div>
            <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
          </div>
          <button
            type="button"
            className="logout-action-btn"
            onClick={handleLogout}
            title="Log out of session"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
