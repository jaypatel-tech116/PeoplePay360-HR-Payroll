import React, { useState } from "react";

const PayrollDashboardView = ({ onNavigateTab, onSelectEmployee }) => {
  const [selectedMonth, setSelectedMonth] = useState("August 2025");

  const recentActivity = [
    { id: 1, employee: "Rahul Sharma", month: "Aug 2025", amount: "₹ 52,000", status: "Paid", date: "28 Aug 2025" },
    { id: 2, employee: "Priya Mehta", month: "Aug 2025", amount: "₹ 48,500", status: "Paid", date: "28 Aug 2025" },
    { id: 3, employee: "Vikram Rao", month: "Aug 2025", amount: "₹ 61,000", status: "Pending", date: "-" },
  ];

  return (
    <div className="pay-content-body">
      {/* 1. Header */}
      <div className="pay-page-header">
        <div>
          <h1 className="pay-page-title">Payroll</h1>
          <p className="pay-page-subtitle">
            Manage salaries, pay cycles and employee pay slips
          </p>
        </div>
        <select
          className="pay-btn-secondary"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ padding: "7px 14px" }}
        >
          <option value="August 2025">August 2025 ⌵</option>
          <option value="July 2025">July 2025 ⌵</option>
          <option value="June 2025">June 2025 ⌵</option>
        </select>
      </div>

      {/* 2. Top 4 KPI Metrics */}
      <div className="pay-stats-grid">
        {/* Card 1: Total Employees */}
        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#f3ebf4", color: "#714B67" }}>
            👥
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Total Employees</span>
            <div className="pay-stat-row">
              <span className="pay-stat-value">48</span>
            </div>
          </div>
        </div>

        {/* Card 2: Processed */}
        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#e6f7ef", color: "#059669" }}>
            ✓
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Processed</span>
            <div className="pay-stat-row">
              <span className="pay-stat-value">45</span>
              <span className="pay-badge pay-badge-green">94 %</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
            ⏱
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Pending</span>
            <div className="pay-stat-row">
              <span className="pay-stat-value">3</span>
              <span className="pay-badge pay-badge-amber">6 %</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Payout */}
        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
            💳
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Total Payout</span>
            <div className="pay-stat-row">
              <span className="pay-stat-value" style={{ fontSize: "1.35rem" }}>
                ₹ 24,08,560
              </span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Aug 2025</span>
          </div>
        </div>
      </div>

      {/* 3. Middle 2 Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
        {/* Monthly Payroll Trend Bar Chart */}
        <div className="pay-section-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
                Monthly Payroll Trend
              </h3>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", height: "150px", gap: "18px", padding: "10px 0 0 30px", position: "relative" }}>
            {/* Y axis */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8" }}>
              <span>30L</span>
              <span>20L</span>
              <span>10L</span>
              <span>0</span>
            </div>

            {/* Bars */}
            {[
              { m: "Mar", val: "55%", amt: "18L" },
              { m: "Apr", val: "65%", amt: "21L" },
              { m: "May", val: "62%", amt: "20L" },
              { m: "Jun", val: "75%", amt: "23L" },
              { m: "Jul", val: "72%", amt: "22.5L" },
              { m: "Aug", val: "85%", amt: "24.1L" },
            ].map((bar, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                <div
                  style={{
                    width: "32px",
                    height: bar.val,
                    backgroundColor: "#8b5cf6",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s ease",
                  }}
                  title={`${bar.m}: ${bar.amt}`}
                />
                <span style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "6px" }}>
                  {bar.m}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "12px", fontSize: "0.72rem", color: "#6b7280" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#8b5cf6" }} />
            <span>Payroll Amount</span>
          </div>
        </div>

        {/* Salary Distribution Donut Chart */}
        <div className="pay-section-card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 14px 0" }}>
            Salary Distribution
          </h3>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            {/* SVG Donut */}
            <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%" }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="4"
                />
                {/* Basic 52% (Cyan) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="4"
                  strokeDasharray="52, 100"
                  strokeDashoffset="0"
                />
                {/* HRA 20% (Green) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray="20, 100"
                  strokeDashoffset="-52"
                />
                {/* Allowances 15% (Amber) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeDasharray="15, 100"
                  strokeDashoffset="-72"
                />
                {/* Deductions 13% (Red) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeDasharray="13, 100"
                  strokeDashoffset="-87"
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                  48
                </span>
                <span style={{ fontSize: "0.62rem", color: "#6b7280" }}>Employees</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, fontSize: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#0284c7" }} />
                  Basic
                </span>
                <strong>52%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                  HRA
                </span>
                <strong>20%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                  Allowances
                </span>
                <strong>15%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                  Deductions
                </span>
                <strong>13%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom: Recent Payroll Activity */}
      <div className="pay-section-card">
        <div className="pay-section-header">
          <h2 className="pay-section-heading">Recent Payroll Activity</h2>
          <span
            style={{ fontSize: "0.8rem", color: "#714B67", fontWeight: 600, cursor: "pointer" }}
            onClick={() => onNavigateTab("payslips")}
          >
            View All
          </span>
        </div>

        <div className="pay-table-responsive">
          <table className="pay-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Employee</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Processed On</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((row) => (
                <tr key={row.id}>
                  <td style={{ color: "#9ca3af" }}>{row.id}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{row.employee}</td>
                  <td>{row.month}</td>
                  <td style={{ fontWeight: 600 }}>{row.amount}</td>
                  <td>
                    <span
                      className={`pay-badge ${
                        row.status === "Paid" ? "pay-badge-green" : "pay-badge-amber"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboardView;
