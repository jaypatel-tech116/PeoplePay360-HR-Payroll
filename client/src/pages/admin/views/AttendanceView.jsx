import React, { useState, useEffect } from "react";
import { getAttendance } from "../../../api/admin.api";
import { MOCK_ATTENDANCE } from "../adminMockData";
import { SkeletonListPage } from "../../../components/ui/SkeletonLoader";

export default function AttendanceView() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("August 2025");
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [records, setRecords] = useState(MOCK_ATTENDANCE.records);
  const [kpis, setKpis] = useState(MOCK_ATTENDANCE.kpis);

  const loadData = async () => {
    try {
      const data = await getAttendance();
      if (data && data.length > 0) {
        const formatted = data.map((a) => ({
          id: a.id,
          name: a.employee_name || "Employee",
          code: a.employee_code || "EMP001",
          avatar: `${(a.employee_name || "E")[0]}`,
          date: a.attendance_date ? new Date(a.attendance_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Today",
          checkIn: a.check_in ? new Date(a.check_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--",
          checkOut: a.check_out ? new Date(a.check_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--",
          hours: a.worked_hours ? `${parseFloat(a.worked_hours).toFixed(1)} hrs` : "-",
          status: a.status || "Present",
        }));
        setRecords(formatted);

        const presentCount = formatted.filter((r) => r.status === "Present").length;
        const absentCount = formatted.filter((r) => r.status === "Absent").length;
        const halfDayCount = formatted.filter((r) => r.status === "Half Day" || r.status === "Late").length;
        const total = formatted.length || 1;

        setKpis({
          present: { count: presentCount, pct: `${Math.round((presentCount / total) * 100)}%` },
          absent: { count: absentCount, pct: `${Math.round((absentCount / total) * 100)}%` },
          halfDay: { count: halfDayCount, pct: `${Math.round((halfDayCount / total) * 100)}%` },
          avgHours: { count: "8.2", subtext: "target 8.0 hrs" },
        });
      }
    } catch (err) {
      console.error("Error loading attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const filtered = records.filter((r) => {
    if (statusFilter !== "All Status" && r.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
  });

  if (loading) return <SkeletonListPage rows={7} cols={6} />;

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Attendance</h1>
          <p className="adm-page-subtitle">Track employee attendance</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            className="adm-btn-secondary"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "7px 12px" }}
          >
            <option value="August 2025">August 2025 ⌵</option>
            <option value="July 2025">July 2025 ⌵</option>
          </select>

          <button type="button" className="adm-btn-secondary" onClick={() => alert("Exporting attendance records...")}>
            <span>📤</span> Export
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "var(--adm-green-bg)", color: "var(--adm-green-text)" }}>
            ✓
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">Present</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value">{kpis.present.count}</span>
              <span className="adm-badge adm-badge-green">{kpis.present.pct}</span>
            </div>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "var(--adm-red-bg)", color: "var(--adm-red-text)" }}>
            ✕
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">Absent</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value">{kpis.absent.count}</span>
              <span className="adm-badge adm-badge-red">{kpis.absent.pct}</span>
            </div>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "var(--adm-purple-bg)", color: "var(--adm-purple-text)" }}>
            ⏱️
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">Half Day</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value">{kpis.halfDay.count}</span>
              <span className="adm-badge adm-badge-blue">{kpis.halfDay.pct}</span>
            </div>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper" style={{ backgroundColor: "var(--adm-amber-bg)", color: "var(--adm-amber-text)" }}>
            🏖️
          </div>
          <div className="adm-stat-info">
            <span className="adm-stat-label">On Leave</span>
            <div className="adm-stat-row">
              <span className="adm-stat-value">{kpis.onLeave.count}</span>
              <span className="adm-badge adm-badge-amber">{kpis.onLeave.pct}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filters Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div className="adm-input-search-wrapper" style={{ width: "260px" }}>
          <span style={{ color: "var(--adm-text-light)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by employee name, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="adm-btn-secondary"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Departments">All Departments ⌵</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Product">Product</option>
          </select>

          <select
            className="adm-btn-secondary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Status">All Status ⌵</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Half Day">Half Day</option>
            <option value="On Leave">On Leave</option>
          </select>

          <button type="button" className="adm-btn-secondary">
            <span>⚙️</span> Filters
          </button>
        </div>
      </div>

      {/* 4. Table Card */}
      <div className="adm-section-card">
        <div className="adm-table-responsive">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Date</th>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--adm-text-light)" }}>{idx + 1}</td>
                  <td style={{ color: "var(--adm-text-muted)" }}>{r.date}</td>
                  <td style={{ fontWeight: 600 }}>{r.code}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{r.name}</td>
                  <td>{r.in}</td>
                  <td>{r.out}</td>
                  <td style={{ fontWeight: 600 }}>{r.hours}</td>
                  <td>
                    <span
                      className={`adm-badge ${
                        r.status === "Present"
                          ? "adm-badge-green"
                          : r.status === "Absent"
                          ? "adm-badge-red"
                          : r.status === "Half Day"
                          ? "adm-badge-blue"
                          : "adm-badge-amber"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--adm-text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
                      onClick={() => alert(`Attendance details for ${r.name}`)}
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-pagination-footer">
          <span>Showing 1 to {filtered.length} of 48 attendance records</span>
          <div className="adm-pagination-controls">
            <button type="button" className="adm-page-btn">‹</button>
            <button type="button" className="adm-page-btn active">1</button>
            <button type="button" className="adm-page-btn">2</button>
            <button type="button" className="adm-page-btn">3</button>
            <button type="button" className="adm-page-btn">4</button>
            <button type="button" className="adm-page-btn">5</button>
            <button type="button" className="adm-page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
