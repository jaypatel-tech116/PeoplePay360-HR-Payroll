import React, { useState, useEffect } from "react";
import { getPayrollReports } from "../../../api/admin.api";
import { MOCK_PAYROLL_REPORTS } from "../adminMockData";

export default function PayrollReportsView() {
  const [activeSubTab, setActiveSubTab] = useState("summary");
  const [selectedMonth, setSelectedMonth] = useState("August 2025");
  const [reportsData, setReportsData] = useState(MOCK_PAYROLL_REPORTS);

  useEffect(() => {
    getPayrollReports()
      .then((data) => {
        if (data && data.departmentPayroll) {
          setReportsData((prev) => ({
            ...prev,
            departmentWise: data.departmentPayroll.map((d, idx) => ({
              id: idx + 1,
              name: d.department_name || "General",
              employees: parseInt(d.employee_count) || 1,
              gross: `₹ ${(Number(d.total_department_net) * 1.25).toLocaleString("en-IN")}.00`,
              deductions: `₹ ${(Number(d.total_department_net) * 0.25).toLocaleString("en-IN")}.00`,
              net: `₹ ${Number(d.total_department_net || 0).toLocaleString("en-IN")}.00`,
              pct: "100%",
            })),
          }));
        }
      })
      .catch((err) => console.error("Error loading payroll reports:", err));
  }, []);

  const { kpis, departmentWise, recentReports } = reportsData;


  const subTabs = [
    { id: "summary", label: "Payroll Summary" },
    { id: "dept", label: "Department Wise" },
    { id: "earnings", label: "Earnings & Deductions" },
    { id: "tax", label: "Tax Report" },
    { id: "bank", label: "Bank Transfer" },
  ];

  const monthlyTrend = [
    { month: "Jan", height: "35%" },
    { month: "Feb", height: "42%" },
    { month: "Mar", height: "48%" },
    { month: "Apr", height: "55%" },
    { month: "May", height: "62%" },
    { month: "Jun", height: "70%" },
    { month: "Jul", height: "78%" },
    { month: "Aug", height: "88%" },
  ];

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Payroll Reports</h1>
          <p className="adm-page-subtitle">Generate and view payroll related reports</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            className="adm-btn-secondary"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "7px 12px" }}
          >
            <option value="August 2025">📅 August 2025 ⌵</option>
            <option value="July 2025">📅 July 2025 ⌵</option>
          </select>

          <button type="button" className="adm-btn-primary" onClick={() => alert("Exporting report...")}>
            <span>📥</span> Export Report
          </button>
        </div>
      </div>

      {/* 2. Sub-Tabs Bar */}
      <div className="adm-pill-filters-bar">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`adm-filter-pill ${activeSubTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. 4 KPI Metrics */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
            💳
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">Total Payroll</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value" style={{ fontSize: "1.35rem" }}>{kpis.totalPayroll.value}</span>
              <span className="adm-badge adm-badge-green">{kpis.totalPayroll.change}</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--adm-text-light)" }}>{kpis.totalPayroll.subtext}</span>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "var(--adm-green-bg)", color: "var(--adm-green-text)" }}>
            👥
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">Employees Paid</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value">{kpis.employeesPaid.value}</span>
              <span className="adm-badge adm-badge-green">{kpis.employeesPaid.change}</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--adm-text-light)" }}>{kpis.employeesPaid.subtext}</span>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "var(--adm-amber-bg)", color: "var(--adm-amber-text)" }}>
            ⏳
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">Pending Payments</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value">{kpis.pendingPayments.value}</span>
              <span className="adm-badge adm-badge-amber">{kpis.pendingPayments.change}</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--adm-text-light)" }}>{kpis.pendingPayments.subtext}</span>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "#ede9fe", color: "#6d28d9" }}>
            📊
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">Average Salary</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value">{kpis.averageSalary.value}</span>
              <span className="adm-badge adm-badge-green">{kpis.averageSalary.change}</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--adm-text-light)" }}>{kpis.averageSalary.subtext}</span>
          </div>
        </div>
      </div>

      {/* 4. Charts Section (Monthly Trend & Department Wise) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: "20px" }}>
        {/* Monthly Payroll Trend */}
        <div className="adm-section-card" style={{ padding: "20px" }}>
          <h3 className="adm-section-heading" style={{ marginBottom: "20px" }}>
            Monthly Payroll Trend
          </h3>
          <div style={{ display: "flex", height: "200px", alignItems: "flex-end", gap: "12px", paddingBottom: "8px", borderBottom: "1px solid var(--adm-border-subtle)", position: "relative" }}>
            <div style={{ position: "absolute", left: "-6px", top: 0, bottom: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--adm-text-light)" }}>
              <span>30L</span>
              <span>20L</span>
              <span>10L</span>
              <span>0L</span>
            </div>

            <div style={{ display: "flex", flex: 1, justifyContent: "space-around", alignItems: "flex-end", height: "100%", marginLeft: "28px" }}>
              {monthlyTrend.map((item, idx) => {
                const isAug = item.month === "Aug";
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 }}>
                    <div
                      style={{
                        width: "22px",
                        height: item.height,
                        backgroundColor: isAug ? "var(--adm-plum-primary)" : "#c7b5c3",
                        borderRadius: "4px 4px 0 0",
                      }}
                      title={`${item.month}: ${item.height}`}
                    />
                    <span style={{ fontSize: "0.7rem", color: "var(--adm-text-muted)", fontWeight: isAug ? 700 : 500 }}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Department Wise Payroll */}
        <div className="adm-section-card" style={{ padding: "20px" }}>
          <h3 className="adm-section-heading" style={{ marginBottom: "16px" }}>
            Department Wise Payroll
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {departmentWise.map((d, index) => (
              <div key={index} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{d.name}</span>
                  <span style={{ fontWeight: 700, color: "var(--adm-text-dark)" }}>{d.amount}</span>
                </div>
                <div style={{ width: "100%", height: "6px", backgroundColor: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${d.pct}%`, height: "100%", backgroundColor: d.color, borderRadius: "3px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Recent Reports Table */}
      <div className="adm-section-card">
        <div className="adm-section-header">
          <h3 className="adm-section-heading">Recent Reports</h3>
        </div>

        <div className="adm-table-responsive">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Report Name</th>
                <th>Period</th>
                <th>Generated On</th>
                <th>Generated By</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((r, idx) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--adm-text-light)" }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{r.name}</td>
                  <td>{r.period}</td>
                  <td>{r.generatedOn}</td>
                  <td>{r.generatedBy}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="adm-btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                      onClick={() => alert(`Downloading ${r.name}...`)}
                    >
                      <span>📥</span> Download
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
}
