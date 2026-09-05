import React, { useState } from "react";

const ManagerPaySlipsView = ({ onSelectPaySlip }) => {
  const [selectedMonth, setSelectedMonth] = useState("August 2025");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");

  const slips = [
    { id: 1, code: "EMP001", name: "Rahul Sharma", dept: "Engineering", gross: "₹ 52,000", net: "₹ 46,700", status: "Paid" },
    { id: 2, code: "EMP002", name: "Priya Mehta", dept: "HR", gross: "₹ 48,500", net: "₹ 43,700", status: "Paid" },
    { id: 3, code: "EMP003", name: "Vikram Rao", dept: "Sales", gross: "₹ 61,000", net: "₹ 54,800", status: "Paid" },
    { id: 4, code: "EMP004", name: "Sneha Iyer", dept: "Product", gross: "₹ 49,000", net: "₹ 44,000", status: "Pending" },
    { id: 5, code: "EMP005", name: "Aditya Gupta", dept: "Engineering", gross: "₹ 58,000", net: "₹ 52,100", status: "Paid" },
  ];

  const filteredSlips = slips.filter((s) => {
    if (deptFilter !== "All Departments" && s.dept !== deptFilter) return false;
    if (statusFilter !== "All Status" && s.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <div className="mgr-content-body">
      {/* 1. Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Pay Slips</h1>
          <p className="mgr-page-subtitle">
            View and manage employee pay slips
          </p>
        </div>

        <button
          type="button"
          className="mgr-btn-secondary"
          onClick={() => alert("Exporting all pay slips to CSV...")}
        >
          <span>📥</span> Export
        </button>
      </div>

      {/* 2. Filters Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            className="mgr-btn-secondary"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="August 2025">📅 August 2025 ⌵</option>
            <option value="July 2025">📅 July 2025 ⌵</option>
          </select>

          <select
            className="mgr-btn-secondary"
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
            className="mgr-btn-secondary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Status">All Status ⌵</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="mgr-input-search-wrapper">
          <span style={{ color: "#9ca3af" }}>🔍</span>
          <input
            type="text"
            placeholder="Search pay cycles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Table */}
      <div className="mgr-section-card">
        <div className="mgr-table-responsive">
          <table className="mgr-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Gross Salary</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlips.map((row) => (
                <tr
                  key={row.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelectPaySlip(row)}
                >
                  <td style={{ color: "#9ca3af" }}>{row.id}</td>
                  <td style={{ fontWeight: 600 }}>{row.code}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{row.name}</td>
                  <td>{row.dept}</td>
                  <td>{row.gross}</td>
                  <td style={{ fontWeight: 700 }}>{row.net}</td>
                  <td>
                    <span
                      className={`mgr-badge ${
                        row.status === "Paid" ? "mgr-badge-green" : "mgr-badge-amber"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="hr-btn-view"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPaySlip(row);
                      }}
                    >
                      <span>👁</span> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mgr-pagination-footer">
          <span>Showing 1 to 5 of 48 slips</span>
          <div className="mgr-pagination-controls">
            <button type="button" className="mgr-page-btn">‹</button>
            <button type="button" className="mgr-page-btn active">1</button>
            <button type="button" className="mgr-page-btn">2</button>
            <button type="button" className="mgr-page-btn">3</button>
            <span style={{ padding: "0 4px", color: "#9ca3af" }}>...</span>
            <button type="button" className="mgr-page-btn">5</button>
            <button type="button" className="mgr-page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPaySlipsView;
