import React from "react";

const DashboardView = ({
  onNavigate,
  checkedIn,
  onToggleCheckIn,
  onOpenLeaveModal,
  onViewPayslip,
}) => {
  return (
    <div className="employee-dashboard-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">Welcome, Rahul Sharma 👋</h1>
          <p className="odoo-page-subtitle">Here's your personal overview</p>
        </div>
        <div className="odoo-header-date">Wednesday, 27 Aug 2025</div>
      </div>

      {/* 5 Mini Metric Cards */}
      <div className="odoo-mini-stats-grid">
        <div className="odoo-mini-stat-card">
          <div className="odoo-mini-stat-icon">👤</div>
          <div className="odoo-mini-stat-content">
            <span className="odoo-mini-stat-label">Employee Code</span>
            <span className="odoo-mini-stat-value">EMP001</span>
          </div>
        </div>

        <div className="odoo-mini-stat-card">
          <div className="odoo-mini-stat-icon">🏢</div>
          <div className="odoo-mini-stat-content">
            <span className="odoo-mini-stat-label">Department</span>
            <span className="odoo-mini-stat-value">Engineering</span>
          </div>
        </div>

        <div className="odoo-mini-stat-card">
          <div className="odoo-mini-stat-icon">💼</div>
          <div className="odoo-mini-stat-content">
            <span className="odoo-mini-stat-label">Job Position</span>
            <span className="odoo-mini-stat-value">Software Developer</span>
          </div>
        </div>

        <div className="odoo-mini-stat-card">
          <div className="odoo-mini-stat-icon">📄</div>
          <div className="odoo-mini-stat-content">
            <span className="odoo-mini-stat-label">Employment Type</span>
            <span className="odoo-mini-stat-value">Full Time</span>
          </div>
        </div>

        <div className="odoo-mini-stat-card">
          <div className="odoo-mini-stat-icon">📅</div>
          <div className="odoo-mini-stat-content">
            <span className="odoo-mini-stat-label">Leave Balance</span>
            <span className="odoo-mini-stat-value">9 / 12 Days</span>
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
              RS
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#111827" }}>
                Rahul Sharma
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--odoo-text-secondary)" }}>
                Software Developer
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--odoo-text-muted)" }}>
                Engineering
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
              <span style={{ fontWeight: 600 }}>EMP001</span>
            </div>
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Department</span>
              <span style={{ fontWeight: 600 }}>Engineering</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Email</span>
              <span style={{ fontWeight: 600, wordBreak: "break-all" }}>rahul.sharma@company.com</span>
            </div>
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Manager</span>
              <span style={{ fontWeight: 600 }}>Priya Mehta</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Phone</span>
              <span style={{ fontWeight: 600 }}>+91 9876543210</span>
            </div>
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Work Schedule</span>
              <span style={{ fontWeight: 600 }}>General (Mon - Fri)</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Date of Birth</span>
              <span style={{ fontWeight: 600 }}>15 Jan 2000</span>
            </div>
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Status</span>
              <span className="odoo-badge odoo-badge-green">Active</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Joining Date</span>
              <span style={{ fontWeight: 600 }}>01 Sep 2023</span>
            </div>
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block" }}>Employee Type</span>
              <span style={{ fontWeight: 600 }}>Full Time</span>
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
                ● {checkedIn ? "Checked In" : "Checked Out"}
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
                    {checkedIn ? "09:05 AM" : "--:--"}
                  </div>
                  <div style={{ fontSize: "0.725rem", color: "var(--odoo-text-muted)" }}>
                    Check In
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", borderLeft: "1px solid var(--odoo-border)" }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--odoo-text-muted)" }}>
                    {checkedIn ? "--:--" : "06:12 PM"}
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
                  <tr>
                    <td>26 Aug 2025</td>
                    <td>09:00 AM</td>
                    <td>06:00 PM</td>
                    <td>9.00</td>
                    <td><span className="odoo-badge odoo-badge-green">Present</span></td>
                  </tr>
                  <tr>
                    <td>25 Aug 2025</td>
                    <td>09:15 AM</td>
                    <td>06:00 PM</td>
                    <td>8.75</td>
                    <td><span className="odoo-badge odoo-badge-green">Present</span></td>
                  </tr>
                  <tr>
                    <td>22 Aug 2025</td>
                    <td>09:00 AM</td>
                    <td>06:00 PM</td>
                    <td>9.00</td>
                    <td><span className="odoo-badge odoo-badge-green">Present</span></td>
                  </tr>
                  <tr>
                    <td>21 Aug 2025</td>
                    <td>09:30 AM</td>
                    <td>06:00 PM</td>
                    <td>8.50</td>
                    <td><span className="odoo-badge odoo-badge-orange">Late</span></td>
                  </tr>
                  <tr>
                    <td>20 Aug 2025</td>
                    <td>09:00 AM</td>
                    <td>06:00 PM</td>
                    <td>9.00</td>
                    <td><span className="odoo-badge odoo-badge-green">Present</span></td>
                  </tr>
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
                {/* 9 out of 12 = 75% -> 2 * PI * 38 = 238.76. dashoffset = 238.76 * (1 - 0.75) = 59.7 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="donut-circle-val"
                  strokeDasharray="238.76"
                  strokeDashoffset="60"
                />
              </svg>
              <div className="donut-center-text">
                <span className="donut-big-num">9</span>
                <span className="donut-sub-text">Remaining of 12 Days</span>
              </div>
            </div>

            <div className="donut-legend">
              <div className="donut-legend-item">
                <div className="donut-legend-left">
                  <span className="donut-dot allocated" />
                  <span>Total Allocated</span>
                </div>
                <strong>12</strong>
              </div>
              <div className="donut-legend-item">
                <div className="donut-legend-left">
                  <span className="donut-dot used" />
                  <span>Used</span>
                </div>
                <strong>3</strong>
              </div>
              <div className="donut-legend-item">
                <div className="donut-legend-left">
                  <span className="donut-dot remaining" />
                  <span>Remaining</span>
                </div>
                <strong>9</strong>
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
                  <tr>
                    <td>15 Sep 2025</td>
                    <td>16 Sep 2025</td>
                    <td>Annual Leave</td>
                    <td>2</td>
                    <td><span className="odoo-badge odoo-badge-orange">Pending</span></td>
                  </tr>
                  <tr>
                    <td>10 Jul 2025</td>
                    <td>10 Jul 2025</td>
                    <td>Sick Leave</td>
                    <td>1</td>
                    <td><span className="odoo-badge odoo-badge-green">Approved</span></td>
                  </tr>
                  <tr>
                    <td>12 Jun 2025</td>
                    <td>13 Jun 2025</td>
                    <td>Annual Leave</td>
                    <td>2</td>
                    <td><span className="odoo-badge odoo-badge-green">Approved</span></td>
                  </tr>
                  <tr>
                    <td>05 Mar 2025</td>
                    <td>05 Mar 2025</td>
                    <td>Sick Leave</td>
                    <td>1</td>
                    <td><span className="odoo-badge odoo-badge-red">Rejected</span></td>
                  </tr>
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
              <tr>
                <td>Aug 2025</td>
                <td>Regular Contract</td>
                <td>₹ 67,000.00</td>
                <td>₹ 12,500.00</td>
                <td><strong>₹ 54,500.00</strong></td>
                <td>Generated</td>
                <td><span className="odoo-badge odoo-badge-green">Paid</span></td>
                <td>
                  <button
                    type="button"
                    className="odoo-table-action-btn"
                    onClick={() => onViewPayslip("Aug 2025")}
                  >
                    👁 View
                  </button>
                </td>
              </tr>
              <tr>
                <td>Jul 2025</td>
                <td>Regular Contract</td>
                <td>₹ 67,000.00</td>
                <td>₹ 12,500.00</td>
                <td><strong>₹ 54,500.00</strong></td>
                <td>Generated</td>
                <td><span className="odoo-badge odoo-badge-green">Paid</span></td>
                <td>
                  <button
                    type="button"
                    className="odoo-table-action-btn"
                    onClick={() => onViewPayslip("Jul 2025")}
                  >
                    👁 View
                  </button>
                </td>
              </tr>
              <tr>
                <td>Jun 2025</td>
                <td>Regular Contract</td>
                <td>₹ 65,000.00</td>
                <td>₹ 12,000.00</td>
                <td><strong>₹ 53,000.00</strong></td>
                <td>Generated</td>
                <td><span className="odoo-badge odoo-badge-green">Paid</span></td>
                <td>
                  <button
                    type="button"
                    className="odoo-table-action-btn"
                    onClick={() => onViewPayslip("Jun 2025")}
                  >
                    👁 View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
