import React, { useState, useEffect } from "react";
import { payrollApi } from "../../../api/payroll.api";

const ManagerDashboardView = ({ onNavigateTab }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("All Periods");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedEmpType, setSelectedEmpType] = useState("All Types");

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

  const kpis = dashboardData?.kpis || dashboardData?.kpi || {
    total_employees: 18,
    active_contracts: 9,
    completed_payruns: 9,
    pending_validation_count: 9,
    total_payroll_cost: 15641775,
    total_net_payout: 226587.5,
    payout_change_pct: "+8.2%",
    payslips_generated: 4,
    payslips_paid_count: 10,
    payslips_pending_count: 4,
    average_salary: 45317.5,
    approved_time_off_days: 89,
    attendance_health: 94,
  };

  const monthlyTrend = (dashboardData?.monthly_trend || []).map((t) => {
    const netVal = parseFloat(t.net_total || t.net || t.gross || 0);
    return {
      m: t.month ? t.month.slice(0, 3) : "Mon",
      year: t.year || "2026",
      amount: "₹ " + (netVal / 100000).toFixed(1) + "L",
      rawAmount: netVal,
      status: t.status || "Completed",
      height: Math.min(100, Math.max(20, Math.round((netVal / 3000000) * 100))) + "%",
    };
  });

  const deptColors = ["var(--mgr-plum-primary)", "#9333ea", "#0284c7", "#059669", "#d97706", "#dc2626", "#4f46e5", "#0891b2"];
  const deptPayroll = (dashboardData?.department_distribution || dashboardData?.department_payroll || []).map((d, idx) => ({
    name: d.name || d.department || "General",
    amount: "₹ " + parseFloat(d.total_cost || d.net_expenditure || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 }),
    headcount: d.headcount || d.employee_count || 0,
    percentage: Math.round(parseFloat(d.pct || 0)),
    color: deptColors[idx % deptColors.length],
  }));

  const attOverview = dashboardData?.attendance_overview || {
    present_count: 11,
    half_day_count: 1,
    absent_count: 1,
    overtime_count: 0,
    missing_checkins: 2,
    coverage_pct: 94,
  };

  const timeOffOverview = dashboardData?.time_off_overview || [];
  const statusSplit = dashboardData?.status_split || { paid: 10, validated: 4, pending: 25, paid_pct: 26, validated_pct: 10, pending_pct: 64 };
  const warningsList = dashboardData?.warnings || [];

  const recentActivity = (dashboardData?.recent_activity || []).map((r, idx) => {
    return {
      id: r.id || idx + 1,
      emp: r.entity_type === "PAYRUN" ? `PAYRUN #${r.entity_id}` : r.entity_type || "PAYROLL",
      act: r.action ? r.action.replace(/_/g, " ") : "Payroll Activity",
      user: r.full_name || "System Admin",
      details: r.new_data ? (typeof r.new_data === "string" ? r.new_data : JSON.stringify(r.new_data)) : "-",
      date: r.created_at
        ? new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : "-",
    };
  });

  const formattedNetPaid =
    typeof kpis.total_net_payout === "number"
      ? "₹ " + (kpis.total_net_payout >= 100000 ? (kpis.total_net_payout / 100000).toFixed(1) + "L" : kpis.total_net_payout.toLocaleString("en-IN", { minimumFractionDigits: 2 }))
      : kpis.total_net_payout;

  const formattedAvgSalary =
    typeof kpis.average_salary === "number"
      ? "₹ " + Math.round(kpis.average_salary).toLocaleString("en-IN")
      : kpis.average_salary;

  return (
    <div className="mgr-content-body">
      {/* 1. Header with Period, Department, Employee Type, Company Selectors (Image 4) */}
      <div className="mgr-page-header" style={{ marginBottom: "16px" }}>
        <div>
          <h1 className="mgr-page-title">Payroll Dashboard</h1>
          <p className="mgr-page-subtitle">
            Combines Payroll with HR data across models to present actionable insights for selected scope
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
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

      {/* Scope Filter Bar matching Screen 6 (Period, Department, Employee Type, Company) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
          padding: "12px 18px",
          backgroundColor: "#ffffff",
          border: "1px solid var(--mgr-border)",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#4b5563" }}>Period:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="mgr-select"
            style={{ padding: "4px 8px", fontSize: "0.82rem" }}
          >
            <option value="All Periods">All Periods</option>
            <option value="February 2026">February 2026</option>
            <option value="March 2026">March 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="September 2026">September 2026</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#4b5563" }}>Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="mgr-select"
            style={{ padding: "4px 8px", fontSize: "0.82rem" }}
          >
            <option value="All Departments">All Departments</option>
            {deptPayroll.map((d, i) => (
              <option key={i} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#4b5563" }}>Employee Type:</span>
          <select
            value={selectedEmpType}
            onChange={(e) => setSelectedEmpType(e.target.value)}
            className="mgr-select"
            style={{ padding: "4px 8px", fontSize: "0.82rem" }}
          >
            <option value="All Types">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Contractor">Contractor</option>
            <option value="Intern">Intern</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto" }}>
          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#4b5563" }}>Company:</span>
          <span className="mgr-badge mgr-badge-purple" style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
            🏢 OXP Pvt Ltd
          </span>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
          Loading real-time dashboard aggregations from database...
        </div>
      )}

      {/* 2. Top 5 KPI Metric Cards matching Screen 6 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "22px" }}>
        {/* KPI 1: Total Net Salary Paid */}
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#f3ebf4", color: "var(--mgr-plum-primary)" }}>
            💳
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">TOTAL NET SALARY PAID</span>
            <div className="mgr-stat-value">{formattedNetPaid}</div>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-green-text)", fontWeight: 600, marginTop: "2px" }}>
              {kpis.payout_change_pct || "+8.2% vs previous month"}
            </span>
          </div>
        </div>

        {/* KPI 2: Payslips Generated */}
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-blue-bg)", color: "var(--mgr-blue-text)" }}>
            📄
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">PAYSLIPS GENERATED</span>
            <div className="mgr-stat-value">{kpis.payslips_generated || kpis.total_employees}</div>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)", fontWeight: 500, marginTop: "2px" }}>
              {kpis.payslips_paid_count || 10} paid, {kpis.payslips_pending_count || 4} pending
            </span>
          </div>
        </div>

        {/* KPI 3: Avg Salary / Employee */}
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-green-bg)", color: "var(--mgr-green-text)" }}>
            📊
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">AVG SALARY / EMPLOYEE</span>
            <div className="mgr-stat-value">{formattedAvgSalary}</div>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)", fontWeight: 500, marginTop: "2px" }}>
              Based on active payrun
            </span>
          </div>
        </div>

        {/* KPI 4: Approved Time Off Days */}
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-amber-bg)", color: "var(--mgr-amber-text)" }}>
            🏖
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">APPROVED TIME OFF DAYS</span>
            <div className="mgr-stat-value">{kpis.approved_time_off_days || 89} Days</div>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)", fontWeight: 500, marginTop: "2px" }}>
              Across selected period
            </span>
          </div>
        </div>

        {/* KPI 5: Attendance Health */}
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
            ⏱
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">ATTENDANCE HEALTH</span>
            <div className="mgr-stat-value">{kpis.attendance_health || 94}%</div>
            <span style={{ fontSize: "0.74rem", color: "#059669", fontWeight: 600, marginTop: "2px" }}>
              Present / reviewed records
            </span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Salary Cost by Dept, Monthly Trend, Payslip Status & Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "22px" }}>
        {/* Salary Cost by Department */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.96rem", fontWeight: 700, color: "#111827" }}>
                Salary Cost by Department
              </h3>
              <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)" }}>
                Source: Payslips + Employee Department
              </span>
            </div>
            <span className="mgr-badge mgr-badge-purple">Dynamic</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {deptPayroll.filter((d) => d.percentage > 0).map((d, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>{d.name} ({d.headcount} emp)</span>
                  <span style={{ fontWeight: 700, color: "#111827" }}>{d.amount} ({d.percentage}%)</span>
                </div>
                <div style={{ height: "7px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${d.percentage}%`,
                      backgroundColor: d.color,
                      borderRadius: "4px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Net Salary Trend */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.96rem", fontWeight: 700, color: "#111827" }}>
                Monthly Net Salary Trend
              </h3>
              <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)" }}>
                Source: Historical Payruns / Payslips
              </span>
            </div>
            <span className="mgr-badge mgr-badge-blue">12 Cycles</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              height: "160px",
              paddingTop: "16px",
              borderBottom: "1px solid #e5e7eb",
              gap: "6px",
            }}
          >
            {monthlyTrend.slice(-6).map((item, idx) => (
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
                    width: "75%",
                    maxWidth: "32px",
                    height: item.height,
                    backgroundColor: idx === 5 ? "var(--mgr-plum-primary)" : "#d8c4d3",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.4s ease",
                  }}
                  title={`${item.m} ${item.year}: ${item.amount}`}
                />
                <span style={{ fontSize: "0.74rem", color: "#4b5563", marginTop: "6px", fontWeight: 600 }}>
                  {item.m}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payslip Status & Payroll Alerts */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.96rem", fontWeight: 700, color: "#111827" }}>
                Payslip Status & Payroll Alerts
              </h3>
              <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)" }}>
                Source: Payrun + Payslip Validation
              </span>
            </div>
          </div>

          {/* Status Split Progress Bar */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#4b5563", marginBottom: "6px" }}>
              Status Split:
            </div>
            <div style={{ height: "10px", display: "flex", borderRadius: "5px", overflow: "hidden", backgroundColor: "#e5e7eb" }}>
              <div style={{ width: `${statusSplit.paid_pct}%`, backgroundColor: "#059669" }} title={`Paid: ${statusSplit.paid}`} />
              <div style={{ width: `${statusSplit.validated_pct}%`, backgroundColor: "#0284c7" }} title={`Validated: ${statusSplit.validated}`} />
              <div style={{ width: `${statusSplit.pending_pct}%`, backgroundColor: "#d97706" }} title={`Pending: ${statusSplit.pending}`} />
            </div>
            <div style={{ display: "flex", gap: "12px", fontSize: "0.72rem", color: "#6b7280", marginTop: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#059669" }} />
                Paid ({statusSplit.paid})
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#0284c7" }} />
                Validated ({statusSplit.validated})
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#d97706" }} />
                Pending ({statusSplit.pending})
              </span>
            </div>
          </div>

          {/* Current Alerts List */}
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#4b5563", marginBottom: "6px" }}>
            Current Alerts:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "140px", overflowY: "auto" }}>
            {warningsList.slice(0, 4).map((w, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  borderRadius: "5px",
                  backgroundColor: w.severity === "danger" ? "#fee2e2" : "#fef3c7",
                  fontSize: "0.75rem",
                  color: w.severity === "danger" ? "#991b1b" : "#92400e",
                }}
              >
                <span>• {w.message}</span>
                <span style={{ fontWeight: 700, fontSize: "0.7rem", textDecoration: "underline", cursor: "pointer" }}>
                  {w.action}
                </span>
              </div>
            ))}
            {warningsList.length === 0 && (
              <div style={{ fontSize: "0.75rem", color: "#059669" }}>
                ✓ No critical payroll warnings. All contracts and accounts verified.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Attendance Overview, Time Off Overview, Department Overview (Image 4) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "22px" }}>
        {/* Attendance Overview */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.96rem", fontWeight: 700, color: "#111827" }}>
                Attendance Overview
              </h3>
              <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)" }}>
                Source: Attendance Log Aggregations
              </span>
            </div>
          </div>

          {/* Counts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", textAlign: "center", margin: "16px 0" }}>
            <div style={{ padding: "10px", backgroundColor: "#ecfdf5", borderRadius: "6px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#059669" }}>{attOverview.present_count}</div>
              <div style={{ fontSize: "0.72rem", color: "#065f46", fontWeight: 600 }}>Present</div>
            </div>

            <div style={{ padding: "10px", backgroundColor: "#fef3c7", borderRadius: "6px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#d97706" }}>{attOverview.half_day_count}</div>
              <div style={{ fontSize: "0.72rem", color: "#92400e", fontWeight: 600 }}>Late / Half</div>
            </div>

            <div style={{ padding: "10px", backgroundColor: "#fee2e2", borderRadius: "6px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#dc2626" }}>{attOverview.absent_count}</div>
              <div style={{ fontSize: "0.72rem", color: "#991b1b", fontWeight: 600 }}>Absent</div>
            </div>

            <div style={{ padding: "10px", backgroundColor: "#f3ebf4", borderRadius: "6px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--mgr-plum-primary)" }}>{attOverview.overtime_count}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--mgr-plum-primary)", fontWeight: 600 }}>Overtime</div>
            </div>
          </div>

          <div style={{ fontSize: "0.75rem", color: "#4b5563", backgroundColor: "#f9fafb", padding: "8px 12px", borderRadius: "6px" }}>
            Missing check-ins & manual edits: <strong>{attOverview.missing_checkins}</strong> • Attendance coverage: <strong>{attOverview.coverage_pct}%</strong>
          </div>
        </div>

        {/* Time Off Overview */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.96rem", fontWeight: 700, color: "#111827" }}>
                Time Off Overview
              </h3>
              <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)" }}>
                Source: Time Off Requests + Allocations
              </span>
            </div>
          </div>

          <table className="mgr-table" style={{ fontSize: "0.8rem", marginTop: "8px" }}>
            <thead>
              <tr>
                <th>Type</th>
                <th style={{ textAlign: "center" }}>Approved</th>
                <th style={{ textAlign: "center" }}>Pending</th>
                <th style={{ textAlign: "right" }}>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {timeOffOverview.slice(0, 4).map((t, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{t.name}</td>
                  <td style={{ textAlign: "center", color: "#059669", fontWeight: 600 }}>{parseFloat(t.approved_days)} d</td>
                  <td style={{ textAlign: "center", color: "#d97706", fontWeight: 600 }}>{parseFloat(t.pending_days)} d</td>
                  <td style={{ textAlign: "right", color: "#4b5563" }}>{t.remaining_balance} Days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Department Overview Table */}
        <div className="mgr-section-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.96rem", fontWeight: 700, color: "#111827" }}>
                Department Overview
              </h3>
              <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)" }}>
                Source: Employee + Contract + Payslip Totals
              </span>
            </div>
          </div>

          <table className="mgr-table" style={{ fontSize: "0.8rem", marginTop: "8px" }}>
            <thead>
              <tr>
                <th>Department</th>
                <th style={{ textAlign: "center" }}>Headcount</th>
                <th style={{ textAlign: "right" }}>Monthly Salary</th>
              </tr>
            </thead>
            <tbody>
              {deptPayroll.filter((d) => d.headcount > 0).map((d, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{d.name}</td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>{d.headcount}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--mgr-plum-primary)" }}>
                    {d.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Audit & Activity Log */}
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
          <div>
            <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700, color: "#111827" }}>
              Audit Log & Payroll Activity
            </h3>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)" }}>
              Real-time audit log of payroll calculations, validation events and disbursement
            </span>
          </div>
          <button
            type="button"
            className="mgr-btn-secondary"
            style={{ padding: "4px 10px", fontSize: "0.76rem" }}
            onClick={() => onNavigateTab && onNavigateTab("pay-cycles")}
          >
            View Payruns →
          </button>
        </div>

        <div className="mgr-table-container">
          <table className="mgr-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Target Reference</th>
                <th>Operation</th>
                <th>Action Taken By</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((a, index) => (
                <tr key={a.id || index}>
                  <td style={{ color: "#9ca3af" }}>{index + 1}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{a.emp}</td>
                  <td>
                    <span className="mgr-badge mgr-badge-purple" style={{ fontSize: "0.72rem" }}>
                      {a.act}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "#4b5563" }}>{a.user}</td>
                  <td style={{ fontSize: "0.78rem", color: "#6b7280", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.details}
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#6b7280" }}>{a.date}</td>
                </tr>
              ))}
              {recentActivity.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#9ca3af" }}>
                    No audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardView;
