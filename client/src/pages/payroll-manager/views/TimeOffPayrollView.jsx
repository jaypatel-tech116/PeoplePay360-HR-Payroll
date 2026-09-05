import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

export default function TimeOffPayrollView() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getTimeOff();
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load time-off records for payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const formattedLeaves = leaveRequests.map((l) => {
    const fromStr = l.start_date
      ? new Date(l.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "-";
    const toStr = l.end_date
      ? new Date(l.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "-";

    const isLop =
      l.leave_type_code === "UNPAID" ||
      l.affects_payroll === 1 ||
      (l.leave_type_name && l.leave_type_name.toLowerCase().includes("unpaid"));

    return {
      id: l.id,
      code: l.employee_code || `EMP${l.employee_id}`,
      employee: l.employee_name || "Employee",
      dept: l.department_name || "General",
      type: l.leave_type_name || "Casual Leave",
      from: fromStr,
      to: toStr,
      days: parseFloat(l.days_requested) || 1,
      lopImpact: isLop ? "Yes (Salary Deduction)" : "No (Paid)",
      status: l.status
        ? l.status.charAt(0).toUpperCase() + l.status.slice(1).toLowerCase()
        : "Approved",
    };
  });

  const uniqueTypes = ["All Types", ...Array.from(new Set(formattedLeaves.map((l) => l.type).filter(Boolean)))];

  const filteredData = formattedLeaves.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      l.employee.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q);
    const matchesType = typeFilter === "All Types" || l.type === typeFilter;
    const matchesStatus =
      statusFilter === "All Status" ||
      l.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="mgr-content-body">
      {/* 1. Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Time Off & Leaves</h1>
          <p className="mgr-page-subtitle">
            Track employee leaves, paid status, and LOP deductions synchronized with database
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={fetchLeaves}
            title="Refresh leave requests"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* 2. Filters Bar */}
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: "6px 12px" }}
            >
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
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
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
            Showing {filteredData.length} of {leaveRequests.length} requests
          </span>
        </div>

        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading leave requests from database...
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
                  <th>Leave Type</th>
                  <th>Period</th>
                  <th style={{ textAlign: "center" }}>Days</th>
                  <th>LOP Impact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id || index}>
                    <td style={{ color: "#9ca3af" }}>{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>
                      <code>{item.code}</code>
                    </td>
                    <td style={{ fontWeight: 600, color: "#111827" }}>{item.employee}</td>
                    <td>{item.dept}</td>
                    <td>
                      <span className="mgr-badge mgr-badge-purple">{item.type}</span>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>
                      {item.from} – {item.to}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>{item.days}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: item.lopImpact.startsWith("Yes") ? "#fee2e2" : "#e6f7ef",
                          color: item.lopImpact.startsWith("Yes") ? "#dc2626" : "#059669",
                        }}
                      >
                        {item.lopImpact}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`mgr-badge ${
                          item.status === "Approved"
                            ? "mgr-badge-green"
                            : item.status === "Pending"
                            ? "mgr-badge-amber"
                            : "mgr-badge-red"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                      No leave requests found matching filter criteria.
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
