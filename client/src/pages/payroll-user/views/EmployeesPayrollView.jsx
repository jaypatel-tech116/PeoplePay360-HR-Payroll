import React, { useState } from "react";

const EmployeesPayrollView = ({
  employees,
  onOpenAddModal,
  onSelectEmployee,
}) => {
  const [activeStatusTab, setActiveStatusTab] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedType, setSelectedType] = useState("All Types");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEmployees = employees.filter((emp) => {
    if (activeStatusTab !== "All" && emp.payrollStatus !== activeStatusTab) {
      return false;
    }
    if (selectedDept !== "All Departments" && emp.department !== selectedDept) {
      return false;
    }
    if (selectedType !== "All Types" && emp.employeeType !== selectedType) {
      return false;
    }
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.code.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      emp.jobTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pay-content-body">
      {/* 1. Header */}
      <div className="pay-page-header">
        <div>
          <h1 className="pay-page-title">Employees</h1>
          <p className="pay-page-subtitle">
            Manage employee payroll details
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="pay-input-search-wrapper">
            <span style={{ color: "#9ca3af" }}>🔍</span>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="pay-btn-primary"
            onClick={onOpenAddModal}
          >
            <span>+</span>
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            className={`pay-subtab-btn ${activeStatusTab === "All" ? "active" : ""}`}
            onClick={() => setActiveStatusTab("All")}
          >
            All
          </button>
          <button
            type="button"
            className={`pay-subtab-btn ${activeStatusTab === "Active" ? "active" : ""}`}
            onClick={() => setActiveStatusTab("Active")}
          >
            Active
          </button>
          <button
            type="button"
            className={`pay-subtab-btn ${activeStatusTab === "Inactive" ? "active" : ""}`}
            onClick={() => setActiveStatusTab("Inactive")}
          >
            Inactive
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            className="pay-btn-secondary"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Departments">Department ⌵</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
          </select>

          <select
            className="pay-btn-secondary"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Types">Employee Type ⌵</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
          </select>

          <button type="button" className="pay-btn-secondary">
            <span>⚲</span> Filters
          </button>
        </div>
      </div>

      {/* 3. Table Section */}
      <div className="pay-section-card">
        <div className="pay-table-responsive">
          <table className="pay-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Job Title</th>
                <th>Employee Type</th>
                <th>Payroll Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, index) => (
                <tr
                  key={emp.code}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelectEmployee(emp)}
                >
                  <td style={{ color: "#9ca3af" }}>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{emp.code}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>{emp.jobTitle}</td>
                  <td>{emp.employeeType}</td>
                  <td>
                    <span
                      className={`pay-badge ${
                        emp.payrollStatus === "Active"
                          ? "pay-badge-green"
                          : "pay-badge-red"
                      }`}
                    >
                      {emp.payrollStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="hr-btn-view"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmployee(emp);
                      }}
                    >
                      <span>👁</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pay-pagination-footer">
          <span>Showing 1 to {filteredEmployees.length} of 48 employees</span>
          <div className="pay-pagination-controls">
            <button
              type="button"
              className="pay-page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            <button
              type="button"
              className={`pay-page-btn ${currentPage === 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            <button
              type="button"
              className={`pay-page-btn ${currentPage === 2 ? "active" : ""}`}
              onClick={() => setCurrentPage(2)}
            >
              2
            </button>
            <button
              type="button"
              className={`pay-page-btn ${currentPage === 3 ? "active" : ""}`}
              onClick={() => setCurrentPage(3)}
            >
              3
            </button>
            <span style={{ padding: "0 4px", color: "#9ca3af" }}>...</span>
            <button
              type="button"
              className="pay-page-btn"
              onClick={() => setCurrentPage(6)}
            >
              6
            </button>
            <button
              type="button"
              className="pay-page-btn"
              onClick={() => setCurrentPage((p) => Math.min(6, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPayrollView;
