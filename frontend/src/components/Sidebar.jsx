import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Users, 
  Building2, 
  Clock, 
  CalendarDays,
  Layers,
  Banknote,
  FileText,
  BarChart2,
  Settings,
  UserCircle,
  HelpCircle,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-primary">PeoplePay</span>
        <span className="brand-secondary">360</span>
      </div>

      <div className="sidebar-content">
        <div className="nav-group">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end>
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>
        </div>

        <div className="nav-group">
          <div className="nav-label">HR MANAGEMENT</div>
          <NavLink to="/employees" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={18} />
            <span>Employees</span>
          </NavLink>
          <NavLink to="/departments" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Building2 size={18} />
            <span>Departments</span>
          </NavLink>
          <NavLink to="/attendance" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Clock size={18} />
            <span>Attendance</span>
          </NavLink>
          <NavLink to="/time-off" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <CalendarDays size={18} />
            <span>Leave Management</span>
          </NavLink>
        </div>

        <div className="nav-group">
          <div className="nav-label">PAYROLL</div>
          <NavLink to="/payroll/structures" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Layers size={18} />
            <span>Salary Structures</span>
          </NavLink>
          <NavLink to="/payroll/payruns" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Banknote size={18} />
            <span>Payruns</span>
          </NavLink>
          <NavLink to="/payroll/payslips" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <FileText size={18} />
            <span>Payslips</span>
          </NavLink>
        </div>

        <div className="nav-group">
          <div className="nav-label">REPORTS</div>
          <NavLink to="/reports" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <BarChart2 size={18} />
            <span>Reports</span>
          </NavLink>
        </div>

        <div className="nav-group">
          <div className="nav-label">SYSTEM</div>
          <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
          <NavLink to="/admin/users" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <UserCircle size={18} />
            <span>User / Role Management</span>
          </NavLink>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="help-card">
          <div className="help-icon-wrapper">
            <UserCircle size={20} className="help-icon" />
          </div>
          <div className="help-content">
            <p className="help-title">Need help?</p>
            <p className="help-text">Check our documentation or contact support.</p>
            <button className="btn-help">Contact Support</button>
          </div>
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
