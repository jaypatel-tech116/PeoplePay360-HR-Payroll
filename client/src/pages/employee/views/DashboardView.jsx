import React, { useState, useEffect } from "react";
import { getEmployeeDashboard } from "../../../api/employee.api";

const DashboardView = ({
  onNavigate,
  checkedIn,
  onToggleCheckIn,
  onOpenLeaveModal,
  onViewPayslip,
  refreshKey,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeDashboard();
        if (isMounted && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn("Failed to load employee dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const emp = data?.employee || {
    fullName: "Rahul Sharma",
    initials: "RS",
    employeeCode: "EMP001",
    department: "Engineering",
    jobPosition: "Software Developer",
    employeeType: "Full Time",
    manager: "Priya Mehta",
    email: "rahul.sharma@company.com",
    phone: "+91 98765 43210",
    workSchedule: "General (Mon - Fri)",
    dateOfBirth: "15 Jan 2000",
    status: "Active",
    joiningDate: "01 Sep 2023",
  };

  const att = data?.todayAttendance || {
    checkInTime: checkedIn ? "09:05 AM" : "--:--",
    checkOutTime: "--:--",
  };

  const lb = data?.leaveBalance || {
    totalAllocated: 12,
    used: 3,
    remaining: 9,
  };

  const recentAtt = data?.recentAttendance || [
    { id: 1, date: "26 Aug 2025", checkIn: "09:00 AM", checkOut: "06:00 PM", workedHours: "9.00", status: "Present" },
    { id: 2, date: "25 Aug 2025", checkIn: "09:15 AM", checkOut: "06:00 PM", workedHours: "8.75", status: "Present" },
    { id: 3, date: "22 Aug 2025", checkIn: "09:00 AM", checkOut: "06:00 PM", workedHours: "9.00", status: "Present" },
    { id: 4, date: "21 Aug 2025", checkIn: "09:30 AM", checkOut: "06:00 PM", workedHours: "8.50", status: "Late" },
    { id: 5, date: "20 Aug 2025", checkIn: "09:00 AM", checkOut: "06:00 PM", workedHours: "9.00", status: "Present" },
  ];

  const recentLeaves = data?.recentLeaves || [
    { id: 1, from: "15 Sep 2025", to: "16 Sep 2025", type: "Annual Leave", days: 2, status: "Pending" },
    { id: 2, from: "10 Jul 2025", to: "10 Jul 2025", type: "Sick Leave", days: 1, status: "Approved" },
    { id: 3, from: "12 Jun 2025", to: "13 Jun 2025", type: "Annual Leave", days: 2, status: "Approved" },
    { id: 4, from: "05 Mar 2025", to: "05 Mar 2025", type: "Sick Leave", days: 1, status: "Rejected" },
  ];

  const recentPayslips = data?.recentPayslips || [
    { id: 1, period: "Aug 2025", contract: "Regular Contract", grossAmount: "₹ 67,000.00", deductionAmount: "₹ 12,500.00", netAmount: "₹ 54,500.00", status: "Generated", paymentStatus: "Paid" },
    { id: 2, period: "Jul 2025", contract: "Regular Contract", grossAmount: "₹ 67,000.00", deductionAmount: "₹ 12,500.00", netAmount: "₹ 54,500.00", status: "Generated", paymentStatus: "Paid" },
    { id: 3, period: "Jun 2025", contract: "Regular Contract", grossAmount: "₹ 65,000.00", deductionAmount: "₹ 12,000.00", netAmount: "₹ 53,000.00", status: "Generated", paymentStatus: "Paid" },
  ];

  // Donut calculations: 2 * PI * 38 = 238.76
  const ratio = lb.totalAllocated > 0 ? lb.remaining / lb.totalAllocated : 0.75;
  const strokeDashoffset = Math.round(238.76 * (1 - Math.min(1, Math.max(0, ratio))));

  const currentDateText = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="employee-dashboard-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">Welcome, {emp.fullName} 👋</h1>
          <p className="odoo-page-subtitle">Here's your personal overview</p>
        </div>
        <div className="odoo-header-date">{currentDateText}</div>
      </div>

      {/* 5 Mini Metric Cards */}
      <div className="odoo-mini-stats-grid">
        <div className="odoo-mini-stat-card">
          <div className="odoo-mini-stat-icon">👤</div>
          <div className="odoo-mini-stat-content">
            <span className="odoo-mini-stat-label">Employee Code</span>
            <span className="odoo-mini-stat-value">{emp.employeeCode}</span>
          </div>
        </div>

        <div className="odoo-mini-stat-card">
          <div className="odoo-mini-stat-icon">🏢</div>
          <div className="odoo-mini-stat-content">
            <span className="odoo-mini-stat-label">Department</span>
            <span className="odoo-mini-stat-value">{emp.department}</span>
          </div>
        </div>

        <div className="odoo-mini-stat-card">
          <div className="odoo-mini-stat-icon">💼</div>
          <div className="odoo-mini-stat-content">
            <span className="odoo-mini-stat-label">Job Position</span>
            <span className="odoo-mini-stat-value">{emp.jobPosition}</span>
          </div>
        </div>

        <div className="odoo-mini-stat-card">
          <div className="odoo-mini-stat-icon">📄</div>
          <div className="odoo-mini-stat-content">
            <span className="odoo-mini-stat-label">Employment Type</span>
            <span className="odoo-mini-stat-value">{emp.employeeType}</span>
          </div>
        </div>

        <div className="odoo-mini-stat-card">
          <div className="odoo-mini-stat-icon">📅</div>
          <div className="odoo-mini-stat-content">
            <span className="odoo-mini-stat-label">Leave Balance</span>
            <span className="odoo-mini-stat-value">{lb.remaining} / {lb.totalAllocated} Days</span>
          </div>
        </div>
      </div>

      {/* 3-Column Middle Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 1.25fr 1fr",
          gap: "16px",
          marginBottom: "20px",
        }}
        className="odoo-3col-grid"
      >
        {/* Column 1: My Profile */}
        <div className="odoo-card">
          <div className="odoo-card-header">
            <h3 className="odoo-card-title">My Profile</h3>
            <span
              className="odoo-view-all-link"
              onClick={() => onNavigate("profile")}
            >
              View All
            </span>
          </div>

          <div style={{ display: "flex", gap: "14px", marginBottom: "16px", alignItems: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "8px",
                backgroundColor: "#ede6ed",
                color: "var(--odoo-plum-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.25rem",
                flexShrink: 0,
              }}
            >
              {emp.initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#111827" }}>
                {emp.fullName}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--odoo-text-secondary)" }}>
                {emp.jobPosition}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--odoo-text-muted)" }}>
                {emp.department}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px 14px",
              fontSize: "0.775rem",
              borderTop: "1px solid var(--odoo-border)",
              paddingTop: "12px",
            }}
          >
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Employee Code</span>
              <span style={{ fontWeight: 600 }}>{emp.employeeCode}</span>
            </div>
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Department</span>
              <span style={{ fontWeight: 600 }}>{emp.department}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Email</span>
              <span style={{ fontWeight: 600, wordBreak: "break-all" }}>{emp.email}</span>
            </div>
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Manager</span>
              <span style={{ fontWeight: 600 }}>{emp.manager}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Phone</span>
              <span style={{ fontWeight: 600 }}>{emp.phone}</span>
            </div>
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Work Schedule</span>
              <span style={{ fontWeight: 600 }}>{emp.workSchedule}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Date of Birth</span>
              <span style={{ fontWeight: 600 }}>{emp.dateOfBirth}</span>
            </div>
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Status</span>
              <span className="odoo-badge odoo-badge-green">{emp.status}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Joining Date</span>
              <span style={{ fontWeight: 600 }}>{emp.joiningDate}</span>
            </div>
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Employee Type</span>
              <span style={{ fontWeight: 600 }}>{emp.employeeType}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Today's Attendance & Recent Attendance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Today's Attendance */}
          <div className="odoo-card">
            <div className="odoo-card-header">
              <h3 className="odoo-card-title">Today's Attendance</h3>
              <span className={`odoo-badge ${checkedIn ? "odoo-badge-green" : "odoo-badge-orange"}`}>
                {checkedIn ? "Checked In" : "Checked Out"}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                textAlign: "center",
                padding: "8px 0 16px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                <span style={{ fontSize: "1.25rem", color: "var(--odoo-plum-primary)" }}>⏱️</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                    {att.checkInTime}
                  </div>
                  <div style={{ fontSize: "0.725rem", color: "var(--odoo-text-muted)" }}>
                    Check In
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", borderLeft: "1px solid var(--odoo-border)" }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--odoo-text-muted)" }}>
                    {att.checkOutTime}
                  </div>
                  <div style={{ fontSize: "0.725rem", color: "var(--odoo-text-muted)" }}>
                    Check Out
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="odoo-btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={onToggleCheckIn}
            >
              {checkedIn ? "↪ Check Out" : "⏱️ Check In"}
            </button>
          </div>

          {/* Recent Attendance */}
          <div className="odoo-card" style={{ flex: 1 }}>
            <div className="odoo-card-header">
              <h3 className="odoo-card-title">Recent Attendance</h3>
              <span
                className="odoo-view-all-link"
                onClick={() => onNavigate("attendance")}
              >
                View All
              </span>
            </div>

            <div className="odoo-table-wrapper">
              <table className="odoo-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Worked Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAtt.map((r, i) => (
                    <tr key={r.id || i}>
                      <td>{r.date}</td>
                      <td>{r.checkIn}</td>
                      <td>{r.checkOut}</td>
                      <td>{r.workedHours}</td>
                      <td>
                        <span
                          className={`odoo-badge ${
                            r.status === "Present"
                              ? "odoo-badge-green"
                              : "odoo-badge-orange"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Column 3: Leave Balance & My Leave Requests */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Leave Balance Donut */}
          <div className="odoo-card">
            <div className="odoo-card-header">
              <h3 className="odoo-card-title">Leave Balance</h3>
              <span
                className="odoo-view-all-link"
                onClick={() => onNavigate("leaves")}
              >
                View All
              </span>
            </div>

            <div className="donut-container">
              <svg className="donut-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" className="donut-circle-bg" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="donut-circle-val"
                  strokeDasharray="238.76"
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="donut-center-text">
                <span className="donut-big-num">{lb.remaining}</span>
                <span className="donut-sub-text">Remaining of {lb.totalAllocated} Days</span>
              </div>
            </div>

            <div className="donut-legend">
              <div className="donut-legend-item">
                <div className="donut-legend-left">
                  <span className="donut-dot allocated" />
                  <span>Total Allocated</span>
                </div>
                <strong>{lb.totalAllocated}</strong>
              </div>
              <div className="donut-legend-item">
                <div className="donut-legend-left">
                  <span className="donut-dot used" />
                  <span>Used</span>
                </div>
                <strong>{lb.used}</strong>
              </div>
              <div className="donut-legend-item">
                <div className="donut-legend-left">
                  <span className="donut-dot remaining" />
                  <span>Remaining</span>
                </div>
                <strong>{lb.remaining}</strong>
              </div>
            </div>

            <button
              type="button"
              className="odoo-btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={onOpenLeaveModal}
            >
              ✈ Request Leave
            </button>
          </div>

          {/* My Leave Requests */}
          <div className="odoo-card" style={{ flex: 1 }}>
            <div className="odoo-card-header">
              <h3 className="odoo-card-title">My Leave Requests</h3>
              <span
                className="odoo-view-all-link"
                onClick={() => onNavigate("leaves")}
              >
                View All
              </span>
            </div>

            <div className="odoo-table-wrapper">
              <table className="odoo-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Leave Type</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves.map((l, i) => (
                    <tr key={l.id || i}>
                      <td>{l.from}</td>
                      <td>{l.to}</td>
                      <td>{l.type}</td>
                      <td>{l.days}</td>
                      <td>
                        <span
                          className={`odoo-badge ${
                            l.status === "Approved"
                              ? "odoo-badge-green"
                              : l.status === "Pending"
                              ? "odoo-badge-orange"
                              : "odoo-badge-red"
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Payslips */}
      <div className="odoo-card">
        <div className="odoo-card-header">
          <h3 className="odoo-card-title">Recent Payslips</h3>
          <span
            className="odoo-view-all-link"
            onClick={() => onNavigate("payslips")}
          >
            View All
          </span>
        </div>

        <div className="odoo-table-wrapper">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Contract</th>
                <th>Gross Amount</th>
                <th>Deduction Amount</th>
                <th>Net Amount</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPayslips.map((p, i) => (
                <tr key={p.id || i}>
                  <td>{p.period}</td>
                  <td>{p.contract}</td>
                  <td>{p.grossAmount}</td>
                  <td>{p.deductionAmount}</td>
                  <td><strong>{p.netAmount}</strong></td>
                  <td>{p.status}</td>
                  <td>
                    <span className={`odoo-badge ${p.paymentStatus === "Paid" ? "odoo-badge-green" : "odoo-badge-orange"}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="odoo-table-action-btn"
                      onClick={() => onViewPayslip(p.id || p.period)}
                    >
                      👁 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
