import React, { useState } from "react";

export default function EmployeesKanbanView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");

  const columns = [
    {
      id: "active",
      title: "Active",
      count: 45,
      color: "#059669",
      bgColor: "#e6f7ef",
      employees: [
        { id: "EMP001", name: "Rahul Sharma", dept: "Engineering", role: "Software Developer", wage: "₹ 50,000", avatarBg: "#714B67" },
        { id: "EMP002", name: "Priya Mehta", dept: "HR", role: "HR Executive", wage: "₹ 45,000", avatarBg: "#059669" },
        { id: "EMP003", name: "Vikram Rao", dept: "Sales", role: "Account Executive", wage: "₹ 55,000", avatarBg: "#d97706" },
        { id: "EMP004", name: "Sneha Iyer", dept: "Product", role: "Product Designer", wage: "₹ 46,000", avatarBg: "#2563eb" },
        { id: "EMP005", name: "Aditya Gupta", dept: "Engineering", role: "Backend Engineer", wage: "₹ 52,000", avatarBg: "#9333ea" },
      ],
    },
    {
      id: "leave",
      title: "On Leave",
      count: 2,
      color: "#d97706",
      bgColor: "#fef3c7",
      employees: [
        { id: "EMP010", name: "Neha Patel", dept: "Sales", role: "Sales Manager", wage: "₹ 60,000", avatarBg: "#0284c7" },
        { id: "EMP015", name: "Rajat Singh", dept: "Engineering", role: "QA Engineer", wage: "₹ 42,000", avatarBg: "#dc2626" },
      ],
    },
    {
      id: "terminated",
      title: "Terminated",
      count: 1,
      color: "#dc2626",
      bgColor: "#fee2e2",
      employees: [
        { id: "EMP008", name: "Rohan Desai", dept: "Marketing", role: "Marketing Specialist", wage: "₹ 48,000", avatarBg: "#6b7280" },
      ],
    },
  ];

  return (
    <div className="mgr-content-body">
      {/* Page Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Employees</h1>
          <p className="mgr-page-subtitle">View employees details for payroll</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="mgr-input-search-wrapper" style={{ width: "220px" }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid var(--mgr-border)",
              fontSize: "0.82rem",
              color: "var(--mgr-text-body)",
              background: "#ffffff",
            }}
          >
            <option>All Departments</option>
            <option>Engineering</option>
            <option>HR</option>
            <option>Sales</option>
            <option>Product</option>
            <option>Marketing</option>
          </select>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
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
                }}
              >
                <span>
                  {col.title} ({col.count})
                </span>
                <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>{col.employees.length} shown</span>
              </div>

              {/* Column Cards */}
              <div style={{ display: "flex", flexDirection: "column", padding: "8px" }}>
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="mgr-kanban-card"
                    style={{
                      borderRadius: "6px",
                      marginBottom: "8px",
                      border: "1px solid var(--mgr-border)",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        backgroundColor: emp.avatarBg,
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        flexShrink: 0,
                      }}
                    >
                      {emp.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.84rem", color: "var(--mgr-text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {emp.name}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--mgr-text-muted)", fontWeight: 500 }}>
                          {emp.id}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--mgr-text-muted)" }}>
                        {emp.dept} • {emp.role}
                      </div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--mgr-plum-primary)", marginTop: "2px" }}>
                        {emp.wage}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
