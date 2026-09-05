import React, { useState } from "react";

const ManagerDashboardView = ({ onNavigateTab }) => {
  const [selectedMonth, setSelectedMonth] = useState("August 2025");

  const recentActivity = [
    { id: 1, emp: "Rahul Sharma", act: "Payslip Generated", period: "Aug 2025", amt: "₹ 46,700", status: "Paid", date: "28 Aug 2025" },
    { id: 2, emp: "Priya Mehta", act: "Payslip Generated", period: "Aug 2025", amt: "₹ 43,700", status: "Paid", date: "28 Aug 2025" },
    { id: 3, emp: "Vikram Rao", act: "Marked as Paid", period: "Aug 2025", amt: "₹ 54,800", status: "Paid", date: "27 Aug 2025" },
    { id: 4, emp: "Sneha Iyer", act: "Payroll Processed", period: "Aug 2025", amt: "-", status: "Completed", date: "27 Aug 2025" },
    { id: 5, emp: "Aditya Gupta", act: "Run Created", period: "Aug 2025", amt: "-", status: "Processing", date: "26 Aug 2025" },
  ];

  return (
    <div className="mgr-content-body">
      {/* 1. Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Good morning, HR Payroll Manager 👋</h1>
          <p className="mgr-page-subtitle">
            Here's your payroll overview for August 2025
          </p>
        </div>

        <select
          className="mgr-btn-secondary"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ padding: "7px 14px" }}
        >
          <option value="August 2025">August 2025 ⌵</option>
          <option value="July 2025">July 2025 ⌵</option>
          <option value="June 2025">June 2025 ⌵</option>
        </select>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div className="mgr-stats-grid">
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#f3ebf4", color: "#714B67" }}>
            👥
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Total Employees</span>
            <span className="mgr-stat-value">48</span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#e6f7ef", color: "#059669" }}>
            ✓
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Processed Payroll</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">45</span>
              <span className="mgr-badge mgr-badge-green">↑ 12%</span>
            </div>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
            ⏱
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Pending Payroll</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">3</span>
              <span className="mgr-badge mgr-badge-red">
                ↓ 25%
              </span>
            </div>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
            💳
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Total Payout</span>
            <span className="mgr-stat-value" style={{ fontSize: "1.35rem" }}>
              ₹ 24,08,560
            </span>
          </div>
        </div>
      </div>

      {/* 3. Middle 2 Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px" }}>
        {/* Monthly Payroll Trend */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 16px 0" }}>
            Monthly Payroll Trend
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", height: "150px", gap: "16px", padding: "10px 0 0 30px", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8" }}>
              <span>30L</span>
              <span>20L</span>
              <span>10L</span>
              <span>0</span>
            </div>
            {[
              { m: "Jan", val: "50%" },
              { m: "Feb", val: "58%" },
              { m: "Mar", val: "55%" },
              { m: "Apr", val: "65%" },
              { m: "May", val: "62%" },
              { m: "Jun", val: "75%" },
              { m: "Jul", val: "72%" },
              { m: "Aug", val: "85%" },
            ].map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "24px", height: b.val, backgroundColor: "#8b5cf6", borderRadius: "3px 3px 0 0" }} />
                <span style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "4px" }}>{b.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Distribution Donut */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 16px 0" }}>
            Salary Distribution
          </h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%" }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0284c7" strokeWidth="4" strokeDasharray="52, 100" strokeDashoffset="0" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="20, 100" strokeDashoffset="-52" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15, 100" strokeDashoffset="-72" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="13, 100" strokeDashoffset="-87" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>48</span>
                <span style={{ fontSize: "0.6rem", color: "#6b7280" }}>Employees</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, fontSize: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><span style={{ color: "#0284c7" }}>●</span> Basic</span>
                <strong>52%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><span style={{ color: "#10b981" }}>●</span> Allowances</span>
                <strong>20%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><span style={{ color: "#f59e0b" }}>●</span> Deductions</span>
                <strong>15%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><span style={{ color: "#8b5cf6" }}>●</span> Other</span>
                <strong>13%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity */}
      <div className="mgr-section-card">
        <div className="mgr-section-header">
          <h2 className="mgr-section-heading">Recent Payroll Activity</h2>
          <span
            style={{ fontSize: "0.8rem", color: "#714B67", fontWeight: 600, cursor: "pointer" }}
            onClick={() => onNavigateTab("pay-slips")}
          >
            View All
          </span>
        </div>

        <div className="mgr-table-responsive">
          <table className="mgr-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Employee</th>
                <th>Activity</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((r) => (
                <tr key={r.id}>
                  <td style={{ color: "#9ca3af" }}>{r.id}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{r.emp}</td>
                  <td>{r.act}</td>
                  <td>{r.period}</td>
                  <td style={{ fontWeight: 600 }}>{r.amt}</td>
                  <td>
                    <span
                      className={`mgr-badge ${
                        r.status === "Paid" || r.status === "Completed"
                          ? "mgr-badge-green"
                          : "mgr-badge-blue"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardView;
