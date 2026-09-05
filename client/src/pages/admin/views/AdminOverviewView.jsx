import React, { useState, useEffect } from "react";
import { getAdminOverview } from "../../../api/admin.api";
import { MOCK_DASHBOARD_DATA } from "../adminMockData";
import { SkeletonDashboard } from "../../../components/ui/SkeletonLoader";

export default function AdminOverviewView({ onNavigateTab }) {
  const [selectedPeriod, setSelectedPeriod] = useState("August 2025");
  const [trendYear, setTrendYear] = useState("This Year");
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOverview()
      .then((data) => {
        if (data) setLiveData(data);
      })
      .catch((err) => console.error("Error loading admin overview:", err))
      .finally(() => setLoading(false));
  }, []);

  const kpis = {
    totalEmployees: {
      value: liveData?.kpi?.totalEmployees ?? MOCK_DASHBOARD_DATA.kpis.totalEmployees.value,
      trend: "+4.2%",
      subtext: "from last month",
    },
    onLeaveToday: {
      value: liveData?.kpi?.onLeaveToday ?? MOCK_DASHBOARD_DATA.kpis.onLeaveToday.value,
      trend: "Normal",
      subtext: "within expected limits",
    },
    activeContracts: {
      value: liveData?.kpi?.activeContracts ?? MOCK_DASHBOARD_DATA.kpis.activeContracts.value,
      trend: "+2.8%",
      subtext: "98% coverage",
    },
    totalPayroll: {
      value: liveData?.kpi?.totalPayroll ? `₹ ${Number(liveData.kpi.totalPayroll).toLocaleString("en-IN")}` : MOCK_DASHBOARD_DATA.kpis.totalPayroll.value,
      period: liveData?.kpi?.latestPayrunMonth || MOCK_DASHBOARD_DATA.kpis.totalPayroll.period,
    },
  };

  const leaveRequestsSummary = liveData?.leaveDistribution || MOCK_DASHBOARD_DATA.leaveRequestsSummary;

  const recentActivities = liveData?.recentActivities && liveData.recentActivities.length > 0
    ? liveData.recentActivities.map((act, i) => ({
        id: act.id || i + 1,
        activity: `${act.action} ${act.entity}`,
        user: act.full_name || act.email || "System Admin",
        module: act.entity || "System",
        date: act.created_at ? new Date(act.created_at).toLocaleString("en-IN") : "Just now",
      }))
    : MOCK_DASHBOARD_DATA.recentActivities;

  const monthlyEmployeeTrend = MOCK_DASHBOARD_DATA.monthlyEmployeeTrend;


  if (loading) return <SkeletonDashboard />;

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Good morning, Admin 👋</h1>
          <p className="adm-page-subtitle">
            Here's what's happening in your organization today.
          </p>
        </div>

        <select
          className="adm-btn-secondary"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          style={{ padding: "7px 14px", fontWeight: 500 }}
        >
          <option value="August 2025">August 2025 ⌵</option>
          <option value="July 2025">July 2025 ⌵</option>
          <option value="June 2025">June 2025 ⌵</option>
        </select>
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

        {/* On Leave Today */}
        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
            🎯
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">On Leave Today</span>
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
            <span className="adm-stat-label">Total Payroll</span>
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
            <h2 className="adm-section-heading">Employee Count Trend</h2>
            <select
              value={trendYear}
              onChange={(e) => setTrendYear(e.target.value)}
              className="adm-btn-secondary"
              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
            >
              <option value="This Year">This Year ⌵</option>
              <option value="Last Year">Last Year ⌵</option>
            </select>
          </div>

          <div style={{ display: "flex", height: "180px", alignItems: "flex-end", gap: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--adm-border-subtle)", position: "relative" }}>
            {/* Y axis */}
            <div style={{ position: "absolute", left: "-6px", top: 0, bottom: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--adm-text-light)" }}>
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>

            <div style={{ display: "flex", flex: 1, justifyContent: "space-around", alignItems: "flex-end", height: "100%", marginLeft: "28px" }}>
              {monthlyEmployeeTrend.map((item, idx) => {
                const heightPct = `${(item.count / 50) * 100}%`;
                const isAug = item.month === "Aug";
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
                    <div
                      style={{
                        width: "28px",
                        height: heightPct,
                        backgroundColor: isAug ? "var(--adm-plum-primary)" : "#c7b5c3",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s ease",
                      }}
                      title={`${item.month}: ${item.count} employees`}
                    />
                    <span style={{ fontSize: "0.72rem", color: "var(--adm-text-muted)", fontWeight: isAug ? 700 : 500 }}>
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
          <h2 className="adm-section-heading" style={{ marginBottom: "16px" }}>Leave Requests</h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", height: "180px" }}>
            {/* Donut graphic */}
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "conic-gradient(#f59e0b 0% 25%, #10b981 25% 83%, #ef4444 83% 100%)",
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
          <h2 className="adm-section-heading">Recent Activities</h2>
          <span
            style={{ fontSize: "0.8rem", color: "var(--adm-plum-primary)", fontWeight: 600, cursor: "pointer" }}
            onClick={() => onNavigateTab("settings")}
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
