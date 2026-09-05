import React, { useState } from "react";

const PaySlipsListView = ({ onSelectPaySlip }) => {
  const [selectedMonth, setSelectedMonth] = useState("August 2025");
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const slipsData = [
    { id: 1, code: "EMP001", name: "Rahul Sharma", dept: "Engineering", net: "₹ 46,700", status: "Paid" },
    { id: 2, code: "EMP002", name: "Priya Mehta", dept: "HR", net: "₹ 43,700", status: "Paid" },
    { id: 3, code: "EMP003", name: "Vikram Rao", dept: "Sales", net: "₹ 54,800", status: "Paid" },
    { id: 4, code: "EMP004", name: "Sneha Iyer", dept: "Product", net: "₹ 44,000", status: "Pending" },
    { id: 5, code: "EMP005", name: "Aditya Gupta", dept: "Engineering", net: "₹ 52,100", status: "Pending" },
    { id: 6, code: "EMP006", name: "Neha Patel", dept: "HR", net: "₹ 38,800", status: "Paid" },
  ];

  const filteredSlips = slipsData.filter((s) => {
    if (deptFilter !== "All Departments" && s.dept !== deptFilter) return false;
    if (statusFilter !== "All" && s.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <div className="pay-content-body">
      {/* 1. Header */}
      <div className="pay-page-header">
        <div>
          <h1 className="pay-page-title">Pay Slips</h1>
          <p className="pay-page-subtitle">
            View and manage employee pay slips
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            className="pay-btn-secondary"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "7px 12px" }}
          >
            <option value="August 2025">📅 August 2025 ⌵</option>
            <option value="July 2025">📅 July 2025 ⌵</option>
            <option value="June 2025">📅 June 2025 ⌵</option>
          </select>

          <button
            type="button"
            className="pay-btn-secondary"
            onClick={() => alert("Exporting pay slips batch to ZIP/PDF...")}
          >
            <span>📥</span>
            <span>Export</span>
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
        <div className="pay-input-search-wrapper" style={{ width: "280px" }}>
          <span style={{ color: "#9ca3af" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name or employee code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            className="pay-btn-secondary"
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
            className="pay-btn-secondary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All">Status ⌵</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* 3. Slips Table */}
      <div className="pay-section-card">
        <div className="pay-table-responsive">
          <table className="pay-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
                <th style={{ width: "30px" }}></th>
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
                  <td style={{ fontWeight: 700 }}>{row.net}</td>
                  <td>
                    <span
                      className={`pay-badge ${
                        row.status === "Paid" ? "pay-badge-green" : "pay-badge-amber"
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
                  <td style={{ textAlign: "center", color: "#9ca3af" }}>⋮</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pay-pagination-footer">
          <span>Showing 1 to {filteredSlips.length} of 48 pay slips</span>
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
              onClick={() => setCurrentPage(8)}
            >
              8
            </button>
            <button
              type="button"
              className="pay-page-btn"
              onClick={() => setCurrentPage((p) => Math.min(8, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaySlipsListView;
