import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

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
    return <div className="detail-loading">Authenticating session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role) && user.role !== 'Admin') {
    return (
      <div className="main-content" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <h3>Access Restricted</h3>
        <p>Your current role ({user.role}) does not have permission to view this section.</p>
      </div>
    );
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      {user && <Navbar />}

      <main className={user ? 'main-content animate-fade-in' : ''}>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" replace />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/:id"
            element={
              <ProtectedRoute>
                <EmployeeDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/contracts"
            element={
              <ProtectedRoute allowedRoles={['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin']}>
                <ContractsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedules"
            element={
              <ProtectedRoute allowedRoles={['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin']}>
                <WorkingSchedulesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/time-off"
            element={
              <ProtectedRoute>
                <TimeOffPage />
              </ProtectedRoute>
            }
          />

          {/* Payroll Routes */}
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

          <Route
            path="/payroll/structures"
            element={
              <ProtectedRoute allowedRoles={['HR Payroll Manager', 'Admin']}>
                <SalaryStructuresPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-payslips"
            element={
              <ProtectedRoute>
                <EmployeeDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Admin & Approvals */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/registrations"
            element={
              <ProtectedRoute allowedRoles={['HR Manager', 'Admin']}>
                <RegistrationApprovalPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <CompanyAdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
