import React, { useState } from "react";

const PayrollReportsView = () => {
  const [selectedMonth, setSelectedMonth] = useState("Aug 2025");
  const [activeSubtab, setActiveSubtab] = useState("Payroll Summary");

  const deptPayroll = [
    { name: "Engineering", pct: "90%", amt: "₹ 8,24,000" },
    { name: "Sales", pct: "65%", amt: "₹ 5,12,000" },
    { name: "HR", pct: "45%", amt: "₹ 3,48,000" },
    { name: "Product", pct: "40%", amt: "₹ 3,12,000" },
    { name: "Marketing", pct: "30%", amt: "₹ 2,08,000" },
  ];

  return (
    <div className="pay-content-body">
      {/* 1. Header */}
      <div className="pay-page-header">
        <div>
          <h1 className="pay-page-title">Payroll Reports</h1>
          <p className="pay-page-subtitle">
            Generate and view payroll related reports
          </p>
        </div>

        <select
          className="pay-btn-secondary"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ padding: "7px 12px" }}
        >
          <option value="Aug 2025">📅 Aug 2025 ⌵</option>
          <option value="Jul 2025">📅 Jul 2025 ⌵</option>
          <option value="Jun 2025">📅 Jun 2025 ⌵</option>
        </select>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div className="pay-stats-grid">
        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#f3ebf4", color: "#714B67" }}>
            💳
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Total Payroll</span>
            <span className="pay-stat-value" style={{ fontSize: "1.35rem" }}>
              ₹ 24,08,560
            </span>
          </div>
        </div>

        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#e6f7ef", color: "#059669" }}>
            👥
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Employees Paid</span>
            <span className="pay-stat-value" style={{ color: "#059669" }}>
              45
            </span>
          </div>
        </div>

        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
            ⏱
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Pending Payments</span>
            <span className="pay-stat-value" style={{ color: "#dc2626" }}>
              3
            </span>
          </div>
        </div>

        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#ede9fe", color: "#6d28d9" }}>
            💰
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Average Salary</span>
            <span className="pay-stat-value" style={{ fontSize: "1.35rem" }}>
              ₹ 53,523
            </span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tabs */}
      <div className="pay-subtabs-bar">
        {[
          "Payroll Summary",
          "Department Wise",
          "Earnings & Deductions",
          "Tax Report",
          "Bank Transfer",
        ].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`pay-subtab-btn ${activeSubtab === tab ? "active" : ""}`}
            onClick={() => setActiveSubtab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Analytics: Monthly Payroll Trend & Top 5 Departments */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr", gap: "20px" }}>
        {/* Monthly Trend Bar Chart */}
        <div className="pay-section-card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 16px 0" }}>
            Monthly Payroll Trend
          </h3>

          <div style={{ display: "flex", alignItems: "flex-end", height: "160px", gap: "16px", padding: "10px 0 0 30px", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8" }}>
              <span>30L</span>
              <span>20L</span>
              <span>10L</span>
              <span>0</span>
            </div>

            {[
              { m: "Mar", val: "55%" },
              { m: "Apr", val: "65%" },
              { m: "May", val: "62%" },
              { m: "Jun", val: "78%" },
              { m: "Jul", val: "72%" },
              { m: "Aug", val: "88%" },
            ].map((b, idx) => (
              <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                <div
                  style={{
                    width: "30px",
                    height: b.val,
                    backgroundColor: "#8b5cf6",
                    borderRadius: "4px 4px 0 0",
                  }}
                />
                <span style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "6px" }}>
                  {b.m}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Departments by Payroll */}
        <div className="pay-section-card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 16px 0" }}>
            Top 5 Departments by Payroll
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "space-around" }}>
            {deptPayroll.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "0.8rem", color: "#374151", width: "100px", flexShrink: 0 }}>
                  {d.name}
                </span>
                <div style={{ flex: 1, height: "10px", backgroundColor: "#ede9fe", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: d.pct, backgroundColor: "#8b5cf6", borderRadius: "5px" }} />
                </div>
                <strong style={{ fontSize: "0.8rem", color: "#111827", width: "85px", textAlign: "right", flexShrink: 0 }}>
                  {d.amt}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollReportsView;
