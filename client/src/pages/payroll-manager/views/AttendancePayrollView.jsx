import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

export default function AttendancePayrollView() {
  const [attendance, setAttendance] = useState([]);
  const [kpi, setKpi] = useState({ total_records: 0, present_count: 0, absent_count: 0, on_leave_count: 0 });
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getAttendance();
      if (Array.isArray(data)) {
        setAttendance(data);
        setKpi({
          total_records: data.length,
          present_count: data.filter((a) => a.status === "Present").length,
          absent_count: data.filter((a) => a.status === "Absent").length,
          on_leave_count: data.filter((a) => a.status === "On Leave").length,
        });
      } else if (data?.attendance) {
        setAttendance(data.attendance);
        if (data.kpi) setKpi(data.kpi);
      }
    } catch (err) {
      console.error("Failed to load attendance for payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const formattedAttendance = attendance.map((a) => {
    const dateStr = a.attendance_date
      ? new Date(a.attendance_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "-";

    return {
      id: a.id,
      code: a.employee_code || `EMP${a.employee_id}`,
      name: a.employee_name || "Employee",
      role: a.designation || "Staff Member",
      dept: a.department_name || "General",
      date: dateStr,
      checkIn: a.check_in ? new Date(a.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-",
      checkOut: a.check_out ? new Date(a.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-",
      hours: a.worked_hours ? parseFloat(a.worked_hours).toFixed(1) : "-",
      status: a.status || "Present",
      lopImpact: a.status === "Absent" ? "LOP Deduction" : "Full Pay",
    };
  });

  const uniqueDepts = ["All Departments", ...Array.from(new Set(formattedAttendance.map((a) => a.dept).filter(Boolean)))];

  const filteredData = formattedAttendance.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q);
    const matchesDept = deptFilter === "All Departments" || item.dept === deptFilter;
    const matchesStatus =
      statusFilter === "All Status" ||
      item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="mgr-content-body">
      {/* 1. Page Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Attendance</h1>
          <p className="mgr-page-subtitle">
            Review live employee attendance records, check-in timestamps, and loss-of-pay deductions synchronized with database
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={fetchAttendance}
            title="Refresh attendance records"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="mgr-stats-grid" style={{ marginBottom: "20px" }}>
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#f3ebf4", color: "var(--mgr-plum-primary)" }}>
            📅
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">TOTAL LOGS</span>
            <span className="mgr-stat-value">{kpi.total_records || attendance.length}</span>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-text-muted)", marginTop: "2px" }}>
              Attendance entries
            </span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-green-bg)", color: "var(--mgr-green-text)" }}>
            ✓
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">PRESENT LOGS</span>
            <span className="mgr-stat-value" style={{ color: "#059669" }}>
              {kpi.present_count}
            </span>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-green-text)", fontWeight: 600, marginTop: "2px" }}>
              Recorded worked shifts
            </span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "var(--mgr-amber-bg)", color: "var(--mgr-amber-text)" }}>
            🌴
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">ON LEAVE</span>
            <span className="mgr-stat-value" style={{ color: "#d97706" }}>
              {kpi.on_leave_count}
            </span>
            <span style={{ fontSize: "0.74rem", color: "var(--mgr-amber-text)", fontWeight: 600, marginTop: "2px" }}>
              Approved leaves
            </span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
            ✕
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">UNEXCUSED ABSENCES</span>
            <span className="mgr-stat-value" style={{ color: "#dc2626" }}>
              {kpi.absent_count}
            </span>
            <span style={{ fontSize: "0.74rem", color: "#dc2626", fontWeight: 600, marginTop: "2px" }}>
              Subject to LOP deduction
            </span>
          </div>
        </div>
      </div>

      {/* 3. Table & Filters */}
      <div className="mgr-section-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--mgr-border)",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="mgr-input-search-wrapper" style={{ width: "240px" }}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search employee, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="mgr-btn-secondary"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ padding: "6px 12px" }}
            >
              {uniqueDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="mgr-btn-secondary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "6px 12px" }}
            >
              <option value="All Status">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
            Showing {filteredData.length} of {attendance.length} logs
          </span>
        </div>

        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading attendance records from database...
          </div>
        )}

        {!loading && (
          <div className="mgr-table-container">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>#</th>
                  <th>Employee Code</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th style={{ textAlign: "center" }}>Hours</th>
                  <th>Status</th>
                  <th>Payroll Impact</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id || index}>
                    <td style={{ color: "#9ca3af" }}>{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>
                      <code>{item.code}</code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{item.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>{item.role}</div>
                    </td>
                    <td>{item.dept}</td>
                    <td style={{ fontSize: "0.82rem" }}>{item.date}</td>
                    <td style={{ fontSize: "0.82rem" }}>{item.checkIn}</td>
                    <td style={{ fontSize: "0.82rem" }}>{item.checkOut}</td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{item.hours}</td>
                    <td>
                      <span
                        className={`mgr-badge ${
                          item.status === "Present"
                            ? "mgr-badge-green"
                            : item.status === "Absent"
                            ? "mgr-badge-red"
                            : "mgr-badge-amber"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: item.status === "Absent" ? "#fee2e2" : "#e6f7ef",
                          color: item.status === "Absent" ? "#dc2626" : "#059669",
                        }}
                      >
                        {item.lopImpact}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                      No attendance records found matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
