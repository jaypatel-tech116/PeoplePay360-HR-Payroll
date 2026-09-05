import React, { useState } from "react";

export default function AttendancePayrollView() {
  const [selectedMonth, setSelectedMonth] = useState("August 2025");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [searchTerm, setSearchTerm] = useState("");

  const attendanceData = [
    { code: "EMP001", name: "Rahul Sharma", dept: "Engineering", present: 22, absent: 2, leave: 2, total: 26 },
    { code: "EMP002", name: "Priya Mehta", dept: "HR", present: 24, absent: 0, leave: 2, total: 26 },
    { code: "EMP003", name: "Vikram Rao", dept: "Sales", present: 21, absent: 3, leave: 2, total: 26 },
    { code: "EMP004", name: "Sneha Iyer", dept: "Product", present: 23, absent: 1, leave: 2, total: 26 },
    { code: "EMP005", name: "Aditya Gupta", dept: "Engineering", present: 22, absent: 2, leave: 2, total: 26 },
    { code: "EMP006", name: "Ananya Roy", dept: "Design", present: 24, absent: 1, leave: 1, total: 26 },
    { code: "EMP007", name: "Kunal Verma", dept: "Marketing", present: 20, absent: 4, leave: 2, total: 26 },
    { code: "EMP008", name: "Rohan Desai", dept: "Marketing", present: 15, absent: 8, leave: 3, total: 26 },
  ];

  const filteredData = attendanceData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "All Departments" || item.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="mgr-content-body">
      {/* Page Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Attendance</h1>
          <p className="mgr-page-subtitle">Review attendance (Read Only)</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
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
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
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
            <option>All Departments</option>
            <option>Engineering</option>
            <option>HR</option>
            <option>Sales</option>
            <option>Product</option>
            <option>Design</option>
            <option>Marketing</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="mgr-section-card">
        <div className="mgr-section-header">
          <div className="mgr-input-search-wrapper" style={{ width: "260px" }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--mgr-text-muted)" }}>
            Showing <strong>{filteredData.length}</strong> records for {selectedMonth}
          </div>
        </div>

        <div className="mgr-table-responsive">
          <table className="mgr-data-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th style={{ textAlign: "center" }}>Present</th>
                <th style={{ textAlign: "center" }}>Absent</th>
                <th style={{ textAlign: "center" }}>Leave</th>
                <th style={{ textAlign: "center" }}>Total Days</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.code}>
                  <td style={{ fontWeight: 600 }}>{row.code}</td>
                  <td style={{ fontWeight: 600, color: "var(--mgr-text-dark)" }}>{row.name}</td>
                  <td style={{ color: "var(--mgr-text-muted)" }}>{row.dept}</td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "var(--mgr-green-bg)",
                        color: "var(--mgr-green-text)",
                        borderRadius: "4px",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                      }}
                    >
                      {row.present}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: row.absent > 0 ? "var(--mgr-red-bg)" : "#f1f5f9",
                        color: row.absent > 0 ? "var(--mgr-red-text)" : "var(--mgr-text-muted)",
                        borderRadius: "4px",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                      }}
                    >
                      {row.absent}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "var(--mgr-amber-bg)",
                        color: "var(--mgr-amber-text)",
                        borderRadius: "4px",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                      }}
                    >
                      {row.leave}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "var(--mgr-text-dark)" }}>
                    {row.total}
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
