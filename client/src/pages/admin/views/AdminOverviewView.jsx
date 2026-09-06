import React, { useState, useEffect } from "react";
import { getAdminOverview } from "../../../api/admin.api";
import { SkeletonDashboard } from "../../../components/ui/SkeletonLoader";

const MONTH_OPTIONS = [
  "All Months",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AdminOverviewView({ onNavigateTab }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = (yr, mth) => {
    setLoading(true);
    getAdminOverview({ year: yr, month: mth })
      .then((data) => {
        if (data) setLiveData(data);
      })
      .catch((err) => console.error("Error loading admin overview:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const availableYears = liveData?.availableYears || [2026, 2025, 2024];

  const kpis = {
    totalEmployees: {
      value: liveData?.kpi?.totalEmployees ?? 500,
      trend: "Active",
      subtext: "total headcount",
    },
    onLeaveToday: {
      value: liveData?.kpi?.onLeaveToday ?? 0,
      trend: selectedMonth === "All Months" ? "This Year" : selectedMonth,
      subtext: "approved time off",
    },
    activeContracts: {
      value: liveData?.kpi?.activeContracts ?? 300,
      trend: "Active",
      subtext: "signed contracts",
    },
    totalPayroll: {
      value: liveData?.kpi?.totalPayroll
        ? `₹ ${Number(liveData.kpi.totalPayroll).toLocaleString("en-IN")}`
        : "₹ 0",
      period: liveData?.kpi?.periodLabel || (selectedMonth === "All Months" ? `Year ${selectedYear}` : `${selectedMonth} ${selectedYear}`),
    },
  };

  const leaveRequestsSummary = liveData?.leaveDistribution || {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  };

  const recentActivities = liveData?.recentActivities && liveData.recentActivities.length > 0
    ? liveData.recentActivities.map((act, i) => ({
        id: act.id || i + 1,
        activity: `${act.action || "LOG"} ${act.entity_type || act.entity || ""}`,
        user: act.full_name || act.email || "System Admin",
        module: act.entity_type || act.module || "System",
        date: act.created_at ? new Date(act.created_at).toLocaleString("en-IN") : "Just now",
      }))
    : [];

  const monthlyEmployeeTrend = liveData?.monthlyEmployeeTrend || [];
  const maxCount = Math.max(...monthlyEmployeeTrend.map((d) => d.count || 0), 10);

  // Compute donut gradient angles for leave distribution
  const leaveTotal = leaveRequestsSummary.total || 1;
  const pendingPct = Math.round(((leaveRequestsSummary.pending || 0) / leaveTotal) * 100);
  const approvedPct = Math.round(((leaveRequestsSummary.approved || 0) / leaveTotal) * 100);
  const pendingEnd = pendingPct;
  const approvedEnd = pendingPct + approvedPct;

  if (loading && !liveData) return <SkeletonDashboard />;

  return (
    <div className="adm-content-body">
      {/* 1. Header with Month & Year Selectors */}
      <div className="adm-page-header" style={{ flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="adm-page-title">Good morning, Admin 👋</h1>
          <p className="adm-page-subtitle">
            Here's what's happening in your organization for {selectedMonth === "All Months" ? `Year ${selectedYear}` : `${selectedMonth} ${selectedYear}`}.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Month Selector */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--adm-text-muted)" }}>
              Month:
            </label>
            <select
              className="adm-btn-secondary"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ padding: "7px 14px", fontWeight: 600, cursor: "pointer", borderRadius: "6px" }}
            >
              {MONTH_OPTIONS.map((mth) => (
                <option key={mth} value={mth}>
                  {mth}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--adm-text-muted)" }}>
              Year:
            </label>
            <select
              className="adm-btn-secondary"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ padding: "7px 14px", fontWeight: 600, cursor: "pointer", borderRadius: "6px" }}
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div className="adm-stats-grid">
        {/* Total Employees */}
        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "#f3ebf4", color: "#714B67" }}>
            👥
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">Total Employees</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value">{kpis.totalEmployees.value}</span>
              <span className="adm-badge adm-badge-green">{kpis.totalEmployees.trend}</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--adm-text-light)" }}>{kpis.totalEmployees.subtext}</span>
          </div>
        </div>

        {/* On Leave Today / Month */}
        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
            🎯
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">{selectedMonth === "All Months" ? "Leave Requests (Year)" : `Leave Requests (${selectedMonth})`}</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value">{kpis.onLeaveToday.value}</span>
              <span className="adm-badge adm-badge-amber">{kpis.onLeaveToday.trend}</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--adm-text-light)" }}>{kpis.onLeaveToday.subtext}</span>
          </div>
        </div>

        {/* Active Contracts */}
        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "#e6f7ef", color: "#059669" }}>
            📄
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">Active Contracts</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value">{kpis.activeContracts.value}</span>
              <span className="adm-badge adm-badge-green">{kpis.activeContracts.trend}</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--adm-text-light)" }}>{kpis.activeContracts.subtext}</span>
          </div>
        </div>

        {/* Total Payroll */}
        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
            💳
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">Total Payroll Expenditure</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value" style={{ fontSize: "1.35rem" }}>{kpis.totalPayroll.value}</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--adm-text-light)" }}>{kpis.totalPayroll.period}</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "18px" }}>
        {/* Employee Count Trend */}
        <div className="adm-section-card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 className="adm-section-heading">Employee Count Trend ({selectedYear})</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="adm-btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.75rem" }}
              >
                {MONTH_OPTIONS.map((mth) => (
                  <option key={mth} value={mth}>{mth}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="adm-btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.75rem" }}
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", height: "180px", alignItems: "flex-end", gap: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--adm-border-subtle)", position: "relative" }}>
            {/* Y axis */}
            <div style={{ position: "absolute", left: "-6px", top: 0, bottom: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--adm-text-light)" }}>
              <span>{maxCount}</span>
              <span>{Math.round(maxCount * 0.75)}</span>
              <span>{Math.round(maxCount * 0.5)}</span>
              <span>{Math.round(maxCount * 0.25)}</span>
              <span>0</span>
            </div>

            <div style={{ display: "flex", flex: 1, justifyContent: "space-around", alignItems: "flex-end", height: "100%", marginLeft: "28px" }}>
              {monthlyEmployeeTrend.map((item, idx) => {
                const heightPct = `${Math.min(100, Math.max(8, ((item.count || 0) / maxCount) * 100))}%`;
                const isSelectedMonth = item.isSelected || (selectedMonth !== "All Months" && item.fullName?.toLowerCase() === selectedMonth.toLowerCase());
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
                    <div
                      style={{
                        width: "24px",
                        height: heightPct,
                        backgroundColor: isSelectedMonth ? "var(--adm-plum-primary)" : "#c7b5c3",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s ease",
                        boxShadow: isSelectedMonth ? "0 0 8px rgba(113, 75, 103, 0.5)" : "none",
                      }}
                      title={`${item.month} ${selectedYear}: ${item.count} employees`}
                    />
                    <span style={{ fontSize: "0.72rem", color: isSelectedMonth ? "var(--adm-plum-primary)" : "var(--adm-text-muted)", fontWeight: isSelectedMonth ? 700 : 500 }}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Leave Requests Donut */}
        <div className="adm-section-card" style={{ padding: "18px 20px" }}>
          <h2 className="adm-section-heading" style={{ marginBottom: "16px" }}>
            Leave Distribution ({selectedMonth === "All Months" ? `Year ${selectedYear}` : `${selectedMonth} ${selectedYear}`})
          </h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", height: "180px" }}>
            {/* Donut graphic */}
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: `conic-gradient(#f59e0b 0% ${pendingEnd}%, #10b981 ${pendingEnd}% ${approvedEnd}%, #ef4444 ${approvedEnd}% 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--adm-text-dark)", lineHeight: 1 }}>
                  {leaveRequestsSummary.total}
                </span>
                <span style={{ fontSize: "0.65rem", color: "var(--adm-text-muted)" }}>Requests</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
                <span><span style={{ color: "#f59e0b" }}>●</span> Pending</span>
                <strong>{leaveRequestsSummary.pending}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
                <span><span style={{ color: "#10b981" }}>●</span> Approved</span>
                <strong>{leaveRequestsSummary.approved}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
                <span><span style={{ color: "#ef4444" }}>●</span> Rejected</span>
                <strong>{leaveRequestsSummary.rejected}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Activities Table */}
      <div className="adm-section-card">
        <div className="adm-section-header">
          <h2 className="adm-section-heading">Recent Audit Logs</h2>
          <span
            style={{ fontSize: "0.8rem", color: "var(--adm-plum-primary)", fontWeight: 600, cursor: "pointer" }}
            onClick={() => onNavigateTab && onNavigateTab("settings")}
          >
            View All
          </span>
        </div>

        <div className="adm-table-responsive">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Activity</th>
                <th>User</th>
                <th>Module</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((act) => (
                <tr key={act.id}>
                  <td style={{ color: "var(--adm-text-light)" }}>{act.id}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{act.activity}</td>
                  <td>{act.user}</td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                      }}
                    >
                      {act.module}
                    </span>
                  </td>
                  <td style={{ color: "var(--adm-text-muted)" }}>{act.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
