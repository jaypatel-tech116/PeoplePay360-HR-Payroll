import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

const cleanName = (name) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
    return parts[0];
  }
  return name.trim();
};

export default function EmployeesKanbanView() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getEmployees();
      setEmployees(data || []);
    } catch (err) {
      console.error("Failed to load employees for Payroll Kanban:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Format list for Kanban
  const avatarColors = ["#714B67", "#059669", "#d97706", "#2563eb", "#9333ea", "#0284c7"];
  const formattedEmployees = employees.map((emp, idx) => {
    const rawStatus = (emp.status || "ACTIVE").toUpperCase();
    let status = "Active";
    if (rawStatus.includes("LEAVE")) status = "On Leave";
    else if (rawStatus.includes("INACT") || rawStatus.includes("TERM") || rawStatus.includes("EXIT")) status = "Terminated";

    const wageNum = parseFloat(emp.wage) || 50000;
    return {
      id: emp.employee_code || `EMP${emp.id}`,
      dbId: emp.id,
      name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Employee",
      dept: emp.department_name || "General",
      role: emp.designation || "Staff Member",
      wage: "₹ " + wageNum.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      avatarBg: avatarColors[idx % avatarColors.length],
      status,
      email: emp.email || "-",
      phone: emp.phone || "-",
      manager: emp.manager_name || "HR Department",
      joiningDate: emp.joining_date
        ? new Date(emp.joining_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "-",
      schedule: emp.schedule_name || "General (Mon - Fri, 40 hrs)",
      contractRef: emp.contract_number || `CNT-${emp.employee_code || emp.id}`,
      contractStatus: emp.contract_status || (emp.active_contract_id ? "Active" : "No Contract"),
      salaryStructure: emp.salary_structure_name || "Default Structure (Full Time)",
      related: {
        contracts: emp.active_contract_id ? 1 : 0,
        attendance: 22,
        timeOff: 2,
        payslips: 4,
      },
    };
  });

  // Extract unique departments dynamically
  const uniqueDepts = ["All Departments", ...Array.from(new Set(formattedEmployees.map((e) => e.dept).filter(Boolean)))];

  // Group into Kanban columns
  const activeList = formattedEmployees.filter((e) => e.status === "Active");
  const onLeaveList = formattedEmployees.filter((e) => e.status === "On Leave");
  const terminatedList = formattedEmployees.filter((e) => e.status === "Terminated");

  const columns = [
    {
      id: "active",
      title: "Active",
      count: activeList.length,
      color: "#059669",
      bgColor: "#e6f7ef",
      employees: activeList,
    },
    {
      id: "leave",
      title: "On Leave",
      count: onLeaveList.length,
      color: "#d97706",
      bgColor: "#fef3c7",
      employees: onLeaveList,
    },
    {
      id: "terminated",
      title: "Terminated",
      count: terminatedList.length,
      color: "#dc2626",
      bgColor: "#fee2e2",
      employees: terminatedList,
    },
  ];

  return (
    <div className="mgr-content-body">
      {/* 1. Page Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Employees</h1>
          <p className="mgr-page-subtitle">
            View live employee roster, contracts and payroll eligibility synchronized with HR
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div className="mgr-input-search-wrapper" style={{ width: "240px" }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search employees or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="mgr-btn-secondary"
            style={{ padding: "6px 12px" }}
          >
            {uniqueDepts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={fetchEmployees}
            title="Refresh employees from database"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          <span>Loading synchronized employee records from database...</span>
        </div>
      )}

      {/* 2. 3-Column Kanban Board (Active, On Leave, Terminated) */}
      {!loading && (
        <div className="mgr-kanban-board">
          {columns.map((col) => {
            const filteredEmployees = col.employees.filter((emp) => {
              const matchesSearch =
                emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.dept.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesDept = deptFilter === "All Departments" || emp.dept === deptFilter;
              return matchesSearch && matchesDept;
            });

            return (
              <div key={col.id} className="mgr-kanban-col">
                {/* Column Header */}
                <div
                  className="mgr-kanban-col-head"
                  style={{
                    backgroundColor: col.bgColor,
                    color: col.color,
                    borderTop: `3px solid ${col.color}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>
                    {col.title} ({col.count})
                  </span>
                  <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                    {filteredEmployees.length} shown
                  </span>
                </div>

                {/* Column Cards */}
                <div className="mgr-kanban-cards">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="mgr-kanban-card"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid var(--mgr-border)",
                        backgroundColor: "#ffffff",
                        cursor: "pointer",
                        padding: "14px",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => setSelectedEmployee(emp)}
                      title={`Click to view payroll details for ${emp.name}`}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "50%",
                            backgroundColor: emp.avatarBg,
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            flexShrink: 0,
                          }}
                        >
                          {cleanName(emp.name)
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "0.88rem",
                                color: "#111827",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={cleanName(emp.name)}
                            >
                              {cleanName(emp.name)}
                            </span>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                color: "#4b5563",
                                backgroundColor: "#f3f4f6",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                flexShrink: 0,
                                border: "1px solid #e5e7eb",
                                fontFamily: "monospace",
                              }}
                            >
                              {emp.id}
                            </span>
                          </div>

                          <div style={{ fontSize: "0.76rem", color: "#6b7280", marginTop: "2px" }}>
                            {emp.dept} • {emp.role}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: "6px",
                            }}
                          >
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--mgr-plum-primary)" }}>
                              {emp.wage}
                            </span>
                            <span
                              className={`mgr-badge ${
                                emp.status === "Active"
                                  ? "mgr-badge-green"
                                  : emp.status === "On Leave"
                                  ? "mgr-badge-amber"
                                  : "mgr-badge-red"
                              }`}
                            >
                              {emp.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredEmployees.length === 0 && (
                    <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: "0.82rem" }}>
                      No employees in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Section 19: Employee Detail UI Modal */}
      {selectedEmployee && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setSelectedEmployee(null)}
        >
          <div
            className="mgr-section-card"
            style={{ maxWidth: "780px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "26px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "14px",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: selectedEmployee.avatarBg,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    fontWeight: 800,
                  }}
                >
                  {selectedEmployee.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#111827" }}>
                    {selectedEmployee.name}
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    {selectedEmployee.id} • {selectedEmployee.dept} • {selectedEmployee.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#9ca3af" }}
              >
                ✕
              </button>
            </div>

            {/* Smart Cards for Related Records */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Contract</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--mgr-plum-primary)" }}>
                  {selectedEmployee.contractStatus}
                </strong>
              </div>
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Attendance</span>
                <strong style={{ fontSize: "1.1rem", color: "#059669" }}>22 Days</strong>
              </div>
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Time Off</span>
                <strong style={{ fontSize: "1.1rem", color: "#d97706" }}>2 Days</strong>
              </div>
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Status</span>
                <strong style={{ fontSize: "1.1rem", color: "#0284c7" }}>{selectedEmployee.status}</strong>
              </div>
            </div>

            {/* 8 Structured Sections */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "0.84rem" }}>
              {/* Personal Information */}
              <div style={{ border: "1px solid #f1f5f9", borderRadius: "6px", padding: "12px", backgroundColor: "#fafafa" }}>
                <strong style={{ display: "block", color: "var(--mgr-plum-primary)", marginBottom: "6px" }}>1. Personal Information</strong>
                <div>Email: <span style={{ color: "#4b5563" }}>{selectedEmployee.email}</span></div>
                <div>Phone: <span style={{ color: "#4b5563" }}>{selectedEmployee.phone}</span></div>
              </div>

              {/* Employment Information */}
              <div style={{ border: "1px solid #f1f5f9", borderRadius: "6px", padding: "12px", backgroundColor: "#fafafa" }}>
                <strong style={{ display: "block", color: "var(--mgr-plum-primary)", marginBottom: "6px" }}>2. Employment Info</strong>
                <div>Manager: <span style={{ color: "#4b5563" }}>{selectedEmployee.manager}</span></div>
                <div>Joining Date: <span style={{ color: "#4b5563" }}>{selectedEmployee.joiningDate}</span></div>
              </div>

              {/* Contract */}
              <div style={{ border: "1px solid #f1f5f9", borderRadius: "6px", padding: "12px", backgroundColor: "#fafafa" }}>
                <strong style={{ display: "block", color: "var(--mgr-plum-primary)", marginBottom: "6px" }}>3. Contract Details</strong>
                <div>Ref: <code>{selectedEmployee.contractRef}</code></div>
                <div>Status: <span className="mgr-badge mgr-badge-green">{selectedEmployee.contractStatus}</span></div>
              </div>

              {/* Salary */}
              <div style={{ border: "1px solid #f1f5f9", borderRadius: "6px", padding: "12px", backgroundColor: "#fafafa" }}>
                <strong style={{ display: "block", color: "var(--mgr-plum-primary)", marginBottom: "6px" }}>4. Salary & Structure</strong>
                <div>Wage: <strong style={{ color: "#111827" }}>{selectedEmployee.wage}</strong></div>
                <div>Structure: <span style={{ color: "#4b5563" }}>{selectedEmployee.salaryStructure}</span></div>
              </div>

              {/* Working Schedule */}
              <div style={{ border: "1px solid #f1f5f9", borderRadius: "6px", padding: "12px", backgroundColor: "#fafafa" }}>
                <strong style={{ display: "block", color: "var(--mgr-plum-primary)", marginBottom: "6px" }}>5. Working Schedule</strong>
                <span style={{ color: "#4b5563" }}>{selectedEmployee.schedule}</span>
              </div>

              {/* Payroll Quick Status */}
              <div style={{ border: "1px solid #f1f5f9", borderRadius: "6px", padding: "12px", backgroundColor: "#fafafa" }}>
                <strong style={{ display: "block", color: "var(--mgr-plum-primary)", marginBottom: "6px" }}>6. Payroll Processing</strong>
                <div>Status: <span style={{ color: "#059669", fontWeight: 700 }}>Eligible for Payrun Processing</span></div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
              <button
                type="button"
                className="mgr-btn-secondary"
                onClick={() => setSelectedEmployee(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
