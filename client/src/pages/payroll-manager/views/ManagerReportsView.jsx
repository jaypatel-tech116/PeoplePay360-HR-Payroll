import React, { useState } from "react";

export default function ManagerReportsView() {
  const [activeSubTab, setActiveSubTab] = useState("summary");
  const [selectedMonth, setSelectedMonth] = useState("August 2025");

  const subTabs = [
    { id: "summary", label: "Payroll Summary" },
    { id: "department", label: "Department Wise" },
    { id: "earnings", label: "Earnings & Deductions" },
    { id: "tax", label: "Tax Report" },
    { id: "bank", label: "Bank Transfer" },
  ];

  const deptData = [
    { name: "Engineering", amount: "₹ 8,24,000", percentage: 70, color: "#714B67" },
    { name: "Sales", amount: "₹ 5,12,000", percentage: 50, color: "#9333ea" },
    { name: "HR", amount: "₹ 3,48,000", percentage: 35, color: "#0284c7" },
    { name: "Product", amount: "₹ 3,12,000", percentage: 32, color: "#059669" },
    { name: "Marketing", amount: "₹ 2,08,000", percentage: 22, color: "#d97706" },
  ];

  const monthlyTrend = [
    { month: "Mar", height: "45%" },
    { month: "Apr", height: "55%" },
    { month: "May", height: "50%" },
    { month: "Jun", height: "65%" },
    { month: "Jul", height: "70%" },
    { month: "Aug", height: "82%" },
  ];

  return (
    <div className="mgr-content-body">
      {/* Page Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Payroll Reports</h1>
          <p className="mgr-page-subtitle">Generate and view payroll related reports</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            className="mgr-select-filter"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "6px",
              border: "1px solid var(--mgr-border)",
              fontSize: "0.82rem",
              background: "#ffffff",
              color: "var(--mgr-text-body)",
              fontWeight: 500,
            }}
          >
            <option>August 2025</option>
            <option>July 2025</option>
            <option>June 2025</option>
          </select>
          <button className="mgr-btn-primary">
            <span>📥</span> Export Report
          </button>
        </div>
      </div>

      {/* Sub Tabs Pill Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--mgr-border)",
          paddingBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid " + (activeSubTab === tab.id ? "var(--mgr-plum-primary)" : "var(--mgr-border)"),
              backgroundColor: activeSubTab === tab.id ? "var(--mgr-plum-primary)" : "#ffffff",
              color: activeSubTab === tab.id ? "#ffffff" : "var(--mgr-text-body)",
              fontSize: "0.82rem",
              fontWeight: activeSubTab === tab.id ? 600 : 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4 Top KPI Cards */}
      <div className="mgr-stats-grid">
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#ede9fe", color: "var(--mgr-plum-primary)" }}>
            💳
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Total Payroll</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">₹ 24,08,560</span>
            </div>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-green-bg)", color: "var(--mgr-green-text)" }}>
            👥
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Employees Paid</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">45</span>
            </div>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-red-bg)", color: "var(--mgr-red-text)" }}>
            ⏳
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Pending Payments</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">3</span>
            </div>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-blue-bg)", color: "var(--mgr-blue-text)" }}>
            📊
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Average Salary</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">₹ 53,523</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts / Breakdown Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Monthly Payroll Trend */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <h2 className="mgr-section-heading" style={{ marginBottom: "24px" }}>
            Monthly Payroll Trend
          </h2>
          <div style={{ display: "flex", height: "190px", alignItems: "flex-end", gap: "20px", paddingBottom: "10px", borderBottom: "1px solid var(--mgr-border-subtle)", position: "relative" }}>
            {/* Y axis labels */}
            <div style={{ position: "absolute", left: "-6px", top: 0, bottom: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--mgr-text-muted)" }}>
              <span>30L</span>
              <span>20L</span>
              <span>10L</span>
              <span>0L</span>
            </div>
            
            <div style={{ display: "flex", flex: 1, justifyContent: "space-around", alignItems: "flex-end", height: "100%", marginLeft: "28px" }}>
              {monthlyTrend.map((item, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
                  <div
                    style={{
                      width: "32px",
                      height: item.height,
                      backgroundColor: item.month === "Aug" ? "var(--mgr-plum-primary)" : "#c7b5c3",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.4s ease",
                    }}
                    title={`${item.month}: ${item.height}`}
                  />
                  <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)", fontWeight: item.month === "Aug" ? 700 : 500 }}>
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Wise Payroll */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <h2 className="mgr-section-heading" style={{ marginBottom: "20px" }}>
            Department Wise Payroll
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {deptData.map((d, index) => (
              <div key={index} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--mgr-text-dark)" }}>{d.name}</span>
                  <span style={{ fontWeight: 700, color: "var(--mgr-text-dark)" }}>{d.amount}</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: "#f1f5f9",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${d.percentage}%`,
                      height: "100%",
                      backgroundColor: d.color,
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
