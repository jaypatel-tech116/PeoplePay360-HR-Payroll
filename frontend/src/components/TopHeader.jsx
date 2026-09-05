import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Bell, Shield, Clock as ClockIcon } from 'lucide-react';
import './TopHeader.css';

const ROUTE_TITLES = {
  '/': 'Executive Dashboard & Live Aggregations',
  '/employees': 'Employee Directory & Profiles',
  '/contracts': 'Employment Contracts & Wage Agreements',
  '/schedules': 'Working Schedules & Working Hours',
  '/attendance': 'Daily Attendance & Time Tracking',
  '/time-off': 'Time Off Management & Leave Balances',
  '/payroll/payruns': 'Payroll Operations & Payrun Batches',
  '/payroll/payslips': 'Payslip Records & Computations',
  '/my-payslips': 'My Compensation & Payslips',
  '/payroll/structures': 'Salary Structures & Rule Configurations',
  '/admin/users': 'User Account Access & Role Permissions',
  '/admin/registrations': 'Employee Registration Approvals',
  '/admin/companies': 'Multi-Tenant Organizations',
  '/admin/audit-logs': 'Security Audit Trail & Activity Logs'
};

export default function TopHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }) + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    if (ROUTE_TITLES[location.pathname]) return ROUTE_TITLES[location.pathname];
    if (location.pathname.startsWith('/employees/')) return 'Employee Details';
    if (location.pathname.startsWith('/payroll/payruns/')) return 'Payrun Execution & Breakdown';
    if (location.pathname.startsWith('/payroll/payslips/')) return 'Payslip Computation Detail';
    return 'PeoplePay360 HR & Payroll';
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <h1 className="topbar-page-title">{getPageTitle()}</h1>
      </div>

      <div className="topbar-right">
        {/* Real-time Clock */}
        <div className="topbar-chip time-chip">
          <ClockIcon size={14} />
          <span>{timeStr}</span>
        </div>

        {/* Company context pill */}
        <div className="topbar-chip company-chip" title="Current Company Workspace">
          <Building2 size={14} />
          <span className="chip-text">{user?.company?.name || 'PeoplePay Global'}</span>
        </div>

        {/* Security badge */}
        <div className="topbar-chip security-chip" title="Active Protected Session">
          <Shield size={14} />
          <span>RBAC Protected</span>
        </div>
      </div>
    </header>
  );
}
