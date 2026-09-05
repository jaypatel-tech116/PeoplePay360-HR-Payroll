import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import { ShieldAlert } from 'lucide-react';
import './App.css';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import ContractsPage from './pages/ContractsPage';
import WorkingSchedulesPage from './pages/WorkingSchedulesPage';
import AttendancePage from './pages/AttendancePage';
import TimeOffPage from './pages/TimeOffPage';
import SalaryStructuresPage from './pages/SalaryStructuresPage';
import PayrunsPage from './pages/PayrunsPage';
import PayrunDetailPage from './pages/PayrunDetailPage';
import PayslipDetailPage from './pages/PayslipDetailPage';
import UserManagementPage from './pages/UserManagementPage';
import RegisterPage from './pages/RegisterPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import RegistrationApprovalPage from './pages/RegistrationApprovalPage';
import AuditLogsPage from './pages/AuditLogsPage';
import CompanyAdminPage from './pages/CompanyAdminPage';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="detail-loading">Authenticating secure session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role) && user.role !== 'Admin') {
    return (
      <div className="access-denied-container animate-fade-in">
        <div className="access-denied-icon">
          <ShieldAlert size={28} />
        </div>
        <h3 className="access-denied-title">Access Restricted</h3>
        <p className="access-denied-message">
          Your active role (<strong>{user.role}</strong>) does not have sufficient permission to access this module.
        </p>
        <Link to="/" className="access-denied-action">
          Return to Safe View
        </Link>
      </div>
    );
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  // If unauthenticated, show clean auth viewport
  if (!user) {
    return (
      <div className="auth-page-wrapper">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Modern Left Vertical Sidebar */}
      <Sidebar />

      {/* Main Software Viewport */}
      <div className="app-main-viewport">
        <TopHeader />

        <main className="app-content animate-fade-in">
          <Routes>
            {/* Redirect unauthenticated routes */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />

            {/* Dashboard: Managers/Admin see Dashboard, Employee redirects to Attendance */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {user.role === 'Employee' ? (
                    <Navigate to="/attendance" replace />
                  ) : (
                    <DashboardPage />
                  )}
                </ProtectedRoute>
              }
            />

            {/* Employee Directory */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin']}>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />

            {/* Employee Detail / Self Profile */}
            <Route
              path="/employees/:id"
              element={
                <ProtectedRoute>
                  <EmployeeDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Contracts */}
            <Route
              path="/contracts"
              element={
                <ProtectedRoute allowedRoles={['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin']}>
                  <ContractsPage />
                </ProtectedRoute>
              }
            />

            {/* Working Schedules */}
            <Route
              path="/schedules"
              element={
                <ProtectedRoute allowedRoles={['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin']}>
                  <WorkingSchedulesPage />
                </ProtectedRoute>
              }
            />

            {/* Attendance & Time Clock (All authenticated users) */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />

            {/* Time Off & Leaves (All authenticated users) */}
            <Route
              path="/time-off"
              element={
                <ProtectedRoute>
                  <TimeOffPage />
                </ProtectedRoute>
              }
            />

            {/* Payroll: Payruns */}
            <Route
              path="/payroll/payruns"
              element={
                <ProtectedRoute allowedRoles={['HR Payroll User', 'HR Payroll Manager', 'Admin']}>
                  <PayrunsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll/payruns/:id"
              element={
                <ProtectedRoute allowedRoles={['HR Payroll User', 'HR Payroll Manager', 'Admin']}>
                  <PayrunDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Payroll: Payslips */}
            <Route
              path="/payroll/payslips"
              element={
                <ProtectedRoute allowedRoles={['HR Payroll User', 'HR Payroll Manager', 'Admin']}>
                  <PayrunsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll/payslips/:id"
              element={
                <ProtectedRoute>
                  <PayslipDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Employee Self Payslips */}
            <Route
              path="/my-payslips"
              element={
                <ProtectedRoute>
                  <EmployeeDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Salary Structures Configuration */}
            <Route
              path="/payroll/structures"
              element={
                <ProtectedRoute allowedRoles={['HR Payroll Manager', 'Admin']}>
                  <SalaryStructuresPage />
                </ProtectedRoute>
              }
            />

            {/* Candidate Registration Approvals */}
            <Route
              path="/admin/registrations"
              element={
                <ProtectedRoute allowedRoles={['HR Manager', 'Admin']}>
                  <RegistrationApprovalPage />
                </ProtectedRoute>
              }
            />

            {/* User Account Access (Admin Only) */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Multi-Tenant Organizations (Admin Only) */}
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <CompanyAdminPage />
                </ProtectedRoute>
              }
            />

            {/* Security Audit Trail (Admin Only) */}
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
