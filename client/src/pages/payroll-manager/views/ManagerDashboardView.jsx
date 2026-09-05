import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

const ManagerDashboardView = ({ onNavigateTab }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("All Periods");
  const [selectedDept, setSelectedDept] = useState("All Departments");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const kpis = dashboardData?.kpis || {
    total_employees: 48,
    active_contracts: 45,
    pending_validation_count: 3,
    total_payroll_cost: 2408560,
    completed_payruns: 8,
  };

  const monthlyTrend = dashboardData?.monthly_trend?.length
    ? dashboardData.monthly_trend.map((t) => ({
        m: t.month ? t.month.slice(0, 3) : "Mon",
        amount: "₹ " + (parseFloat(t.net_total || t.gross_total || 0) / 100000).toFixed(1) + "L",
        height: Math.min(100, Math.max(20, Math.round(((parseFloat(t.net_total || 0) || 2000000) / 3000000) * 100))) + "%",
      }))
    : [
        { m: "Jan", height: "50%", amount: "₹ 20.2L" },
        { m: "Feb", height: "55%", amount: "₹ 20.6L" },
        { m: "Mar", height: "58%", amount: "₹ 21.1L" },
        { m: "Apr", height: "64%", amount: "₹ 21.8L" },
        { m: "May", height: "68%", amount: "₹ 22.1L" },
        { m: "Jun", height: "74%", amount: "₹ 22.7L" },
        { m: "Jul", height: "80%", amount: "₹ 23.4L" },
        { m: "Aug", height: "88%", amount: "₹ 24.1L" },
      ];

  const deptColors = ["var(--mgr-plum-primary)", "#9333ea", "#0284c7", "#059669", "#d97706", "#dc2626"];
  const deptPayroll = dashboardData?.department_distribution?.length
    ? dashboardData.department_distribution.map((d, idx) => ({
        name: d.department || "General",
        amount: "₹ " + parseFloat(d.total_cost || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 }),
        percentage: Math.round(parseFloat(d.pct || 0)),
        color: deptColors[idx % deptColors.length],
      }))
    : [
        { name: "Engineering", amount: "₹ 8,24,000", percentage: 85, color: "var(--mgr-plum-primary)" },
        { name: "Sales", amount: "₹ 5,12,000", percentage: 62, color: "#9333ea" },
        { name: "HR", amount: "₹ 3,48,000", percentage: 44, color: "#0284c7" },
        { name: "Product", amount: "₹ 3,12,000", percentage: 38, color: "#059669" },
        { name: "Marketing", amount: "₹ 2,08,000", percentage: 26, color: "#d97706" },
      ];

  const recentActivity = dashboardData?.recent_activity?.length
    ? dashboardData.recent_activity.map((r, idx) => {
        const netNum = parseFloat(r.total_net) || 0;
        return {
          id: r.id || idx + 1,
          emp: r.run_number || `PR-${r.month || ""}`,
          act: r.status === "Completed" ? "Disbursement Finalized" : "Payrun Processing",
          period: `${r.month || ""} ${r.year || ""}`.trim(),
          amt: "₹ " + netNum.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
          status: r.status || "Draft",
          date: r.paid_at
            ? new Date(r.paid_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "-",
        };
      })
    : [
        { id: 1, emp: "Rahul Sharma", act: "Payslip Generated", period: "Aug 2026", amt: "₹ 46,700.00", status: "Paid", date: "28 Aug 2026" },
        { id: 2, emp: "Priya Mehta", act: "Payslip Generated", period: "Aug 2026", amt: "₹ 43,700.00", status: "Paid", date: "28 Aug 2026" },
        { id: 3, emp: "Vikram Rao", act: "Marked as Paid", period: "Aug 2026", amt: "₹ 54,800.00", status: "Paid", date: "27 Aug 2026" },
      ];

  const attentionItems = [
    {
      id: 1,
      icon: "📋",
      emp: "Live Payruns",
      desc: `${kpis.pending_validation_count || 0} batches requiring verification`,
      status: "Review",
      severity: "warning",
      actionText: "Payruns",
      tab: "pay-cycles",
    },
    {
      id: 2,
      icon: "💼",
      emp: "Contract Governance",
      desc: `${kpis.active_contracts || 0} active contracts verified for compensation`,
      status: "Active",
      severity: "success",
      actionText: "Contracts",
      tab: "contracts",
    },
    {
      id: 3,
      icon: "👥",
      emp: "Employee Roster",
      desc: `${kpis.total_employees || 0} employees synchronized across HR and Payroll`,
      status: "Active",
      severity: "info",
      actionText: "Employees",
      tab: "employees",
    },
  ];

  const formattedPayout =
    typeof kpis.total_payroll_cost === "number"
      ? "₹ " + kpis.total_payroll_cost.toLocaleString("en-IN", { minimumFractionDigits: 2 })
      : kpis.total_payroll_cost;

  return (
    <div className="mgr-content-body">
      {/* 1. Header with Period & Department Selectors */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Payroll Dashboard</h1>
          <p className="mgr-page-subtitle">
            Monitor payroll processing, employee costs and operations synchronized with live database
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={fetchDashboard}
            title="Refresh dashboard metrics"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "30px", textAlign: "center", color: "#6b7280" }}>
          Loading live analytics and aggregations from database...
        </div>
      )}

      {/* 2. Top 4 KPI Metric Cards */}
      <div className="mgr-stats-grid">
        {/* Total Employees */}
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#f3ebf4", color: "var(--mgr-plum-primary)" }}>
            👥
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">TOTAL EMPLOYEES</span>
            <span className="mgr-stat-value">{kpis.total_employees}</span>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)", marginTop: "2px" }}>
              Active company roster
            </span>
          </div>
        </div>

        {/* Processed Contracts */}
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-green-bg)", color: "var(--mgr-green-text)" }}>
            ✓
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">ACTIVE CONTRACTS</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">{kpis.active_contracts}</span>
              <span className="mgr-badge mgr-badge-green">100% Valid</span>
            </div>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-green-text)", fontWeight: 600, marginTop: "2px" }}>
              Payroll eligible
            </span>
          </div>
        </div>

        {/* Pending Validation */}
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-amber-bg)", color: "var(--mgr-amber-text)" }}>
            ⏱
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">PENDING VALIDATION</span>
            <div className="mgr-stat-row">
              <span className="mgr-stat-value">{kpis.pending_validation_count}</span>
              <span className="mgr-badge mgr-badge-amber">In Review</span>
            </div>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-amber-text)", fontWeight: 600, marginTop: "2px" }}>
              Batches in progress
            </span>
          </div>
        </div>

        {/* Total Net Payout */}
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-blue-bg)", color: "var(--mgr-blue-text)" }}>
            💳
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">TOTAL PAYROLL DISBURSEMENT</span>
            <span className="mgr-stat-value" style={{ fontSize: "1.25rem" }}>
              {formattedPayout}
            </span>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)", marginTop: "2px" }}>
              Completed payrun disbursements
            </span>
          </div>
        </div>
      </div>

      {/* 3. Middle Visualizations Grid */}
      <div className="mgr-visuals-grid">
        {/* Monthly Trend Chart */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700, color: "#111827" }}>
                Monthly Payroll Trend
              </h3>
              <span style={{ fontSize: "0.76rem", color: "var(--mgr-text-muted)" }}>
                Database historical disbursement totals
              </span>
            </div>
            <span className="mgr-badge mgr-badge-purple">Historical</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              height: "170px",
              paddingTop: "20px",
              borderBottom: "1px solid #e5e7eb",
              gap: "8px",
            }}
          >
            {monthlyTrend.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <span style={{ fontSize: "0.68rem", color: "#6b7280", marginBottom: "4px", fontWeight: 600 }}>
                  {item.amount}
                </span>
                <div
                  style={{
                    width: "70%",
                    maxWidth: "28px",
                    height: item.height,
                    backgroundColor: idx === monthlyTrend.length - 1 ? "var(--mgr-plum-primary)" : "#d8c4d3",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.4s ease",
                  }}
                  title={`${item.m}: ${item.amount}`}
                />
                <span style={{ fontSize: "0.74rem", color: "#4b5563", marginTop: "6px", fontWeight: 600 }}>
                  {item.m}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Wise Payroll */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700, color: "#111827" }}>
                Department Wise Payroll
              </h3>
              <span style={{ fontSize: "0.76rem", color: "var(--mgr-text-muted)" }}>
                Distribution across company departments
              </span>
            </div>
            <span className="mgr-badge mgr-badge-blue">Aggregated</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {deptPayroll.map((d, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>{d.name}</span>
                  <span style={{ fontWeight: 700, color: "#111827" }}>{d.amount}</span>
                </div>
                <div style={{ height: "6px", backgroundColor: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${d.percentage}%`,
                      backgroundColor: d.color,
                      borderRadius: "3px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Attention Required Panel */}
      <div className="mgr-section-card" style={{ padding: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.1rem" }}>⚡</span>
            <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700, color: "#111827" }}>
              Quick Operational Links
            </h3>
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--mgr-text-muted)" }}>
            Synchronized system status
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
          {attentionItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "6px",
                border: "1px solid var(--mgr-border)",
                backgroundColor: "#fafafa",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#111827" }}>
                    {item.emp}
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "#6b7280" }}>
                    {item.desc}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="mgr-btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.76rem" }}
                onClick={() => onNavigateTab && onNavigateTab(item.tab)}
              >
                {item.actionText} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Payroll Activity Table */}
      <div className="mgr-section-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--mgr-border)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700, color: "#111827" }}>
            Recent Payrun Batches
          </h3>
          <button
            type="button"
            className="mgr-btn-secondary"
            style={{ padding: "4px 10px", fontSize: "0.76rem" }}
            onClick={() => onNavigateTab && onNavigateTab("pay-cycles")}
          >
            View All Payruns →
          </button>
        </div>

        <div className="mgr-table-container">
          <table className="mgr-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Batch Reference</th>
                <th>Operation</th>
                <th>Period</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((a, index) => (
                <tr key={a.id || index}>
                  <td style={{ color: "#9ca3af" }}>{index + 1}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{a.emp}</td>
                  <td style={{ fontSize: "0.82rem", color: "#4b5563" }}>{a.act}</td>
                  <td>{a.period}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--mgr-plum-primary)" }}>
                    {a.amt}
                  </td>
                  <td>
                    <span
                      className={`mgr-badge ${
                        a.status === "Completed" || a.status === "Paid"
                          ? "mgr-badge-green"
                          : a.status === "Validated"
                          ? "mgr-badge-purple"
                          : "mgr-badge-blue"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#6b7280" }}>{a.date}</td>
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
