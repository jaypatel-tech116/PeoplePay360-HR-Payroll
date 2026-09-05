import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

export default function ManagerReportsView() {
  const [activeSubTab, setActiveSubTab] = useState("summary");
  const [selectedMonth, setSelectedMonth] = useState("August 2026");
  const [liveReport, setLiveReport] = useState(null);

  useEffect(() => {
    payrollApi
      .getReports("department")
      .then((data) => setLiveReport(data))
      .catch((err) => console.error("Failed to load live department report:", err));
  }, []);

  const subTabs = [
    { id: "summary", label: "Payroll Summary", icon: "📊" },
    { id: "department", label: "Department Wise", icon: "🏢" },
    { id: "earnings", label: "Earnings & Deductions", icon: "⚖️" },
    { id: "tax", label: "Tax Report", icon: "📋" },
    { id: "bank", label: "Bank Transfer", icon: "🏦" },
  ];

  const colors = ["var(--mgr-plum-primary)", "#9333ea", "#0284c7", "#059669", "#d97706", "#64748b"];
  const deptData = liveReport?.departments?.length
    ? liveReport.departments.map((d, idx) => {
        const amt = parseFloat(d.net_cost || d.total_payroll_cost || 0);
        const emps = parseInt(d.employee_count) || 1;
        const avg = emps > 0 ? amt / emps : 0;
        return {
          name: d.department_name || "General",
          employees: emps,
          amount: "₹ " + amt.toLocaleString("en-IN", { minimumFractionDigits: 0 }),
          percentage: parseFloat(d.percentage_of_total || 15).toFixed(1),
          color: colors[idx % colors.length],
          avgSalary: "₹ " + avg.toLocaleString("en-IN", { minimumFractionDigits: 0 }),
        };
      })
    : [
        { name: "Engineering", employees: 15, amount: "₹ 8,24,000", percentage: 34.2, color: "var(--mgr-plum-primary)", avgSalary: "₹ 54,933" },
        { name: "Sales", employees: 10, amount: "₹ 5,12,000", percentage: 21.3, color: "#9333ea", avgSalary: "₹ 51,200" },
        { name: "HR", employees: 7, amount: "₹ 3,48,000", percentage: 14.5, color: "#0284c7", avgSalary: "₹ 49,714" },
        { name: "Product", employees: 6, amount: "₹ 3,12,000", percentage: 13.0, color: "#059669", avgSalary: "₹ 52,000" },
        { name: "Marketing", employees: 4, amount: "₹ 2,08,000", percentage: 8.6, color: "#d97706", avgSalary: "₹ 52,000" },
        { name: "Operations", employees: 6, amount: "₹ 2,04,560", percentage: 8.4, color: "#64748b", avgSalary: "₹ 34,093" },
      ];

  const monthlyTrend = [
    { month: "Mar", height: "55%", amount: "₹ 21.1L" },
    { month: "Apr", height: "62%", amount: "₹ 21.8L" },
    { month: "May", height: "66%", amount: "₹ 22.1L" },
    { month: "Jun", height: "74%", amount: "₹ 22.7L" },
    { month: "Jul", height: "82%", amount: "₹ 23.4L" },
    { month: "Aug", height: "92%", amount: "₹ 24.1L" },
  ];

  const earningsData = [
    { item: "Basic Salary", code: "BASIC", amount: "₹ 16,80,000.00", percentage: "58.7%" },
    { item: "House Rent Allowance", code: "HRA", amount: "₹ 6,72,000.00", percentage: "23.5%" },
    { item: "Conveyance Allowance", code: "CONV", amount: "₹ 1,92,000.00", percentage: "6.7%" },
    { item: "Special Allowance", code: "SPL_ALW", amount: "₹ 2,40,000.00", percentage: "8.4%" },
    { item: "Performance Bonus", code: "BONUS", amount: "₹ 76,800.00", percentage: "2.7%" },
  ];

  const deductionsData = [
    { item: "Provident Fund (Employee)", code: "PF", amount: "₹ 2,01,600.00", percentage: "44.6%" },
    { item: "Professional Tax", code: "PT", amount: "₹ 9,600.00", percentage: "2.1%" },
    { item: "Income Tax / TDS", code: "TDS", amount: "₹ 2,41,040.00", percentage: "53.3%" },
  ];

  const bankTransferData = [
    { code: "EMP001", name: "Rahul Sharma", bank: "HDFC Bank", account: "•••• 4821", ifsc: "HDFC0001245", amount: "₹ 46,700.00", status: "Transferred" },
    { code: "EMP002", name: "Priya Mehta", bank: "ICICI Bank", account: "•••• 7312", ifsc: "ICIC0000341", amount: "₹ 43,700.00", status: "Transferred" },
    { code: "EMP003", name: "Vikram Rao", bank: "SBI", account: "•••• 9012", ifsc: "SBIN0004512", amount: "₹ 54,800.00", status: "Transferred" },
    { code: "EMP004", name: "Sneha Iyer", bank: "Axis Bank", account: "•••• 3391", ifsc: "UTIB0001092", amount: "₹ 44,000.00", status: "Pending Verification" },
    { code: "EMP005", name: "Aditya Gupta", bank: "HDFC Bank", account: "•••• 1109", ifsc: "HDFC0001245", amount: "₹ 52,100.00", status: "Transferred" },
  ];

  const taxData = [
    { code: "EMP001", name: "Rahul Sharma", pan: "ABCPS1234F", taxable: "₹ 52,000.00", tds: "₹ 3,500.00", pt: "₹ 200.00", status: "Compliant" },
    { code: "EMP002", name: "Priya Mehta", pan: "BMEPS5678G", taxable: "₹ 48,500.00", tds: "₹ 3,200.00", pt: "₹ 200.00", status: "Compliant" },
    { code: "EMP003", name: "Vikram Rao", pan: "VROPS9012K", taxable: "₹ 61,000.00", tds: "₹ 4,400.00", pt: "₹ 200.00", status: "Compliant" },
    { code: "EMP004", name: "Sneha Iyer", pan: "SIYPS3456L", taxable: "₹ 49,000.00", tds: "₹ 3,300.00", pt: "₹ 200.00", status: "Compliant" },
    { code: "EMP005", name: "Aditya Gupta", pan: "AGUPS7890M", taxable: "₹ 58,000.00", tds: "₹ 4,100.00", pt: "₹ 200.00", status: "Compliant" },
  ];

  const handleExport = () => {
    alert(`Exporting ${activeSubTab.toUpperCase()} report for ${selectedMonth} in Excel/CSV format.`);
  };

  return (
    <div className="mgr-content-body">
      {/* 1. Page Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Payroll Reports</h1>
          <p className="mgr-page-subtitle">Analyze payroll costs and employee compensation</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="mgr-btn-secondary"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "7px 12px", fontWeight: 600 }}
          >
            <option>August 2026 ⌵</option>
            <option>July 2026 ⌵</option>
            <option>June 2026 ⌵</option>
          </select>
          <button type="button" className="mgr-btn-primary" onClick={handleExport}>
            <span>📥</span> Export Report
          </button>
        </div>
      </div>

      {/* 2. Sub Tabs Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--mgr-border)",
          paddingBottom: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              padding: "7px 14px",
              borderRadius: "6px",
              border: "1px solid " + (activeSubTab === tab.id ? "var(--mgr-plum-primary)" : "var(--mgr-border)"),
              backgroundColor: activeSubTab === tab.id ? "var(--mgr-plum-primary)" : "#ffffff",
              color: activeSubTab === tab.id ? "#ffffff" : "var(--mgr-text-body)",
              fontSize: "0.82rem",
              fontWeight: activeSubTab === tab.id ? 600 : 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Top 4 KPI Cards (Requested for Reports) */}
      <div className="mgr-stats-grid" style={{ marginBottom: "20px" }}>
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#f3ebf4", color: "var(--mgr-plum-primary)" }}>
            💳
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">TOTAL PAYROLL</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">₹ 24,08,560</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--mgr-text-muted)", marginTop: "2px" }}>
              Total net disbursement
            </span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-green-bg)", color: "var(--mgr-green-text)" }}>
            👥
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">EMPLOYEES PAID</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">45</span>
              <span className="mgr-badge mgr-badge-green">93.7%</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--mgr-green-text)", fontWeight: 600, marginTop: "2px" }}>
              Batch disbursed successfully
            </span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-amber-bg)", color: "var(--mgr-amber-text)" }}>
            ⏳
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">PENDING PAYMENTS</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">3</span>
              <span className="mgr-badge mgr-badge-amber">Action Req</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--mgr-amber-text)", fontWeight: 600, marginTop: "2px" }}>
              Needs account verification
            </span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-blue-bg)", color: "var(--mgr-blue-text)" }}>
            📊
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">AVERAGE SALARY</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">₹ 53,523</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--mgr-text-muted)", marginTop: "2px" }}>
              Per employee this cycle
            </span>
          </div>
        </div>
      </div>

      {/* 4. Tab 1: Payroll Summary */}
      {activeSubTab === "summary" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "20px" }}>
          {/* Monthly Payroll Trend */}
          <div className="mgr-section-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 className="mgr-section-heading" style={{ margin: 0 }}>Monthly Payroll Trend</h2>
                <p style={{ fontSize: "0.76rem", color: "var(--mgr-text-muted)", margin: "3px 0 0 0" }}>
                  Net salary payout comparison over past 6 months
                </p>
              </div>
              <span className="mgr-badge mgr-badge-purple">+18.5% Growth</span>
            </div>

            <div
              style={{
                display: "flex",
                height: "210px",
                alignItems: "flex-end",
                gap: "20px",
                paddingBottom: "10px",
                borderBottom: "1px solid var(--mgr-border-subtle)",
                position: "relative",
              }}
            >
              {/* Y axis labels */}
              <div
                style={{
                  position: "absolute",
                  left: "-6px",
                  top: 0,
                  bottom: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  fontSize: "0.68rem",
                  color: "var(--mgr-text-muted)",
                }}
              >
                <span>30L</span>
                <span>20L</span>
                <span>10L</span>
                <span>0L</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flex: 1,
                  justifyContent: "space-around",
                  alignItems: "flex-end",
                  height: "100%",
                  marginLeft: "28px",
                }}
              >
                {monthlyTrend.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      flex: 1,
                    }}
                  >
                    <span style={{ fontSize: "0.70rem", color: "var(--mgr-text-muted)", fontWeight: 600 }}>
                      {item.amount}
                    </span>
                    <div
                      style={{
                        width: "34px",
                        height: item.height,
                        backgroundColor: item.month === "Aug" ? "var(--mgr-plum-primary)" : "#c7b5c3",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.4s ease",
                      }}
                      title={`${item.month}: ${item.amount}`}
                    />
                    <span
                      style={{
                        fontSize: "0.76rem",
                        color: item.month === "Aug" ? "var(--mgr-plum-primary)" : "var(--mgr-text-muted)",
                        fontWeight: item.month === "Aug" ? 700 : 500,
                      }}
                    >
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Wise Payroll Overview */}
          <div className="mgr-section-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="mgr-section-heading" style={{ margin: 0 }}>Department Wise Payroll</h2>
              <button
                type="button"
                onClick={() => setActiveSubTab("department")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--mgr-plum-primary)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                View Full Details →
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {deptData.slice(0, 5).map((d, index) => (
                <div key={index} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--mgr-text-dark)" }}>
                      {d.name} <span style={{ fontSize: "0.72rem", color: "var(--mgr-text-muted)", fontWeight: 400 }}>({d.employees} emps)</span>
                    </span>
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
                        width: `${d.percentage * 2.5}%`,
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
      )}

      {/* 5. Tab 2: Department Wise Table */}
      {activeSubTab === "department" && (
        <div className="mgr-section-card">
          <div className="mgr-section-header">
            <div>
              <h2 className="mgr-section-heading" style={{ margin: 0 }}>Department Wise Payroll Breakdown</h2>
              <p style={{ fontSize: "0.76rem", color: "var(--mgr-text-muted)", margin: "2px 0 0 0" }}>
                Total expenditure, headcount allocation, and percentage distribution
              </p>
            </div>
          </div>

          <div className="mgr-table-responsive">
            <table className="mgr-data-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Department</th>
                  <th style={{ textAlign: "center", width: "110px" }}>Employees</th>
                  <th style={{ textAlign: "right", width: "160px" }}>Payroll Cost</th>
                  <th style={{ textAlign: "right", width: "150px" }}>Avg Salary / Emp</th>
                  <th style={{ textAlign: "right", width: "110px" }}>Percentage</th>
                  <th style={{ width: "180px" }}>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {deptData.map((d, index) => (
                  <tr key={index}>
                    <td style={{ color: "var(--mgr-text-muted)" }}>{index + 1}</td>
                    <td style={{ fontWeight: 600, color: "var(--mgr-text-dark)" }}>{d.name}</td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          backgroundColor: "#f1f5f9",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          fontSize: "0.80rem",
                        }}
                      >
                        {d.employees}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--mgr-text-dark)" }}>
                      {d.amount}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--mgr-text-body)" }}>
                      {d.avgSalary}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "var(--mgr-plum-primary)" }}>
                      {d.percentage}%
                    </td>
                    <td>
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
                            width: `${d.percentage * 2.8}%`,
                            height: "100%",
                            backgroundColor: d.color,
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "#f8fafc", fontWeight: 700 }}>
                  <td colSpan="2">Total Overall</td>
                  <td style={{ textAlign: "center" }}>48 Employees</td>
                  <td style={{ textAlign: "right", color: "var(--mgr-plum-primary)" }}>₹ 24,08,560.00</td>
                  <td style={{ textAlign: "right" }}>₹ 53,523.00</td>
                  <td style={{ textAlign: "right" }}>100.0%</td>
                  <td>-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Earnings & Deductions */}
      {activeSubTab === "earnings" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Earnings Card */}
          <div className="mgr-section-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="mgr-section-heading" style={{ margin: 0, color: "#059669" }}>
                Gross Earnings Summary
              </h2>
              <span className="mgr-badge mgr-badge-green">₹ 28,60,800.00</span>
            </div>

            <div className="mgr-table-responsive">
              <table className="mgr-data-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Code</th>
                    <th style={{ textAlign: "right" }}>Total Amount</th>
                    <th style={{ textAlign: "right" }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsData.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.item}</td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "0.78rem", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "3px" }}>
                          {row.code}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{row.amount}</td>
                      <td style={{ textAlign: "right", color: "var(--mgr-text-muted)" }}>{row.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Deductions Card */}
          <div className="mgr-section-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="mgr-section-heading" style={{ margin: 0, color: "#dc2626" }}>
                Statutory & Tax Deductions
              </h2>
              <span className="mgr-badge mgr-badge-red">₹ 4,52,240.00</span>
            </div>

            <div className="mgr-table-responsive">
              <table className="mgr-data-table">
                <thead>
                  <tr>
                    <th>Deduction Item</th>
                    <th>Code</th>
                    <th style={{ textAlign: "right" }}>Total Amount</th>
                    <th style={{ textAlign: "right" }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {deductionsData.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.item}</td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "0.78rem", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "3px" }}>
                          {row.code}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{row.amount}</td>
                      <td style={{ textAlign: "right", color: "var(--mgr-text-muted)" }}>{row.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: "20px",
                padding: "14px 16px",
                backgroundColor: "var(--mgr-plum-light)",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, color: "var(--mgr-plum-primary)", fontSize: "0.92rem" }}>
                Net Payout Disbursed (Gross - Deductions):
              </span>
              <span style={{ fontWeight: 800, color: "var(--mgr-plum-primary)", fontSize: "1.15rem" }}>
                ₹ 24,08,560.00
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: Tax Report */}
      {activeSubTab === "tax" && (
        <div className="mgr-section-card">
          <div className="mgr-section-header">
            <div>
              <h2 className="mgr-section-heading" style={{ margin: 0 }}>Tax & Statutory Compliance Statement</h2>
              <p style={{ fontSize: "0.76rem", color: "var(--mgr-text-muted)", margin: "2px 0 0 0" }}>
                Form 16 / TDS Section 192 & Professional Tax summary for {selectedMonth}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <span className="mgr-badge mgr-badge-blue">Total TDS: ₹ 2,41,040.00</span>
              <span className="mgr-badge mgr-badge-green">Total PT: ₹ 9,600.00</span>
            </div>
          </div>

          <div className="mgr-table-responsive">
            <table className="mgr-data-table">
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Employee Name</th>
                  <th>PAN Number</th>
                  <th style={{ textAlign: "right" }}>Taxable Income</th>
                  <th style={{ textAlign: "right" }}>TDS Deducted</th>
                  <th style={{ textAlign: "right" }}>PT Deducted</th>
                  <th style={{ textAlign: "center" }}>Compliance</th>
                </tr>
              </thead>
              <tbody>
                {taxData.map((row) => (
                  <tr key={row.code}>
                    <td style={{ fontWeight: 600 }}>{row.code}</td>
                    <td style={{ fontWeight: 600, color: "var(--mgr-text-dark)" }}>{row.name}</td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.82rem", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "3px" }}>
                        {row.pan}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>{row.taxable}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "#dc2626" }}>{row.tds}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{row.pt}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className="mgr-badge mgr-badge-green" style={{ fontSize: "0.75rem" }}>
                        ✓ {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Tab 5: Bank Transfer */}
      {activeSubTab === "bank" && (
        <div className="mgr-section-card">
          <div className="mgr-section-header">
            <div>
              <h2 className="mgr-section-heading" style={{ margin: 0 }}>Corporate Bank Transfer Payout Summary</h2>
              <p style={{ fontSize: "0.76rem", color: "var(--mgr-text-muted)", margin: "2px 0 0 0" }}>
                Direct NEFT / RTGS account disbursement batch for {selectedMonth}
              </p>
            </div>
            <button
              type="button"
              className="mgr-btn-secondary"
              onClick={() => alert("Downloading bank transfer NACH / NEFT formatted batch text file.")}
            >
              📄 Download NEFT File
            </button>
          </div>

          <div className="mgr-table-responsive">
            <table className="mgr-data-table">
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Employee Name</th>
                  <th>Bank Name</th>
                  <th>Account Number</th>
                  <th>IFSC Code</th>
                  <th style={{ textAlign: "right" }}>Net Amount</th>
                  <th style={{ textAlign: "center" }}>Transfer Status</th>
                </tr>
              </thead>
              <tbody>
                {bankTransferData.map((row) => (
                  <tr key={row.code}>
                    <td style={{ fontWeight: 600 }}>{row.code}</td>
                    <td style={{ fontWeight: 600, color: "var(--mgr-text-dark)" }}>{row.name}</td>
                    <td>{row.bank}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{row.account}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{row.ifsc}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--mgr-plum-primary)" }}>
                      {row.amount}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`mgr-badge ${
                          row.status === "Transferred" ? "mgr-badge-green" : "mgr-badge-amber"
                        }`}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {row.status === "Transferred" ? "✓ Done" : "⏳ Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
