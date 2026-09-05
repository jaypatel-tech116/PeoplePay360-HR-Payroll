import React, { useState } from "react";

const PayCyclesListView = ({ onOpenCreateWizard, onSelectCycle }) => {
  const [selectedMonth, setSelectedMonth] = useState("August 2025");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const cycles = [
    { id: 1, month: "August", year: "2025", payDate: "31 Aug 2025", emps: 48, gross: "₹ 28,60,800", net: "₹ 24,08,560", status: "Processing" },
    { id: 2, month: "July", year: "2025", payDate: "31 Jul 2025", emps: 47, gross: "₹ 27,90,000", net: "₹ 23,45,700", status: "Completed" },
    { id: 3, month: "June", year: "2025", payDate: "30 Jun 2025", emps: 46, gross: "₹ 26,80,000", net: "₹ 22,68,450", status: "Completed" },
    { id: 4, month: "May", year: "2025", payDate: "31 May 2025", emps: 45, gross: "₹ 26,40,000", net: "₹ 22,16,200", status: "Completed" },
    { id: 5, month: "April", year: "2025", payDate: "30 Apr 2025", emps: 45, gross: "₹ 25,90,000", net: "₹ 21,78,800", status: "Completed" },
    { id: 6, month: "March", year: "2025", payDate: "31 Mar 2025", emps: 44, gross: "₹ 25,20,000", net: "₹ 21,16,600", status: "Completed" },
    { id: 7, month: "February", year: "2025", payDate: "28 Feb 2025", emps: 44, gross: "₹ 24,80,000", net: "₹ 20,65,700", status: "Completed" },
    { id: 8, month: "January", year: "2025", payDate: "31 Jan 2025", emps: 42, gross: "₹ 24,20,000", net: "₹ 20,18,450", status: "Completed" },
  ];

  return (
    <div className="mgr-content-body">
      {/* 1. Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Pay Cycles</h1>
          <p className="mgr-page-subtitle">
            Manage monthly payroll cycles
          </p>
        </div>

        <button
          type="button"
          className="mgr-btn-primary"
          onClick={onOpenCreateWizard}
        >
          <span>+</span>
          <span>Create Pay Cycle</span>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All">Status ⌵</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
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
                <th>Month</th>
                <th>Year</th>
                <th>Pay Date</th>
                <th>Employees</th>
                <th>Total Gross</th>
                <th>Total Net</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((c) => (
                <tr
                  key={c.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelectCycle(c)}
                >
                  <td style={{ color: "#9ca3af" }}>{c.id}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{c.month}</td>
                  <td>{c.year}</td>
                  <td>{c.payDate}</td>
                  <td>{c.emps}</td>
                  <td>{c.gross}</td>
                  <td style={{ fontWeight: 700 }}>{c.net}</td>
                  <td>
                    <span
                      className={`mgr-badge ${
                        c.status === "Processing"
                          ? "mgr-badge-blue"
                          : "mgr-badge-green"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCycle(c);
                      }}
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mgr-pagination-footer">
          <span>Showing 1 to 8 of 8 pay cycles</span>
          <div className="mgr-pagination-controls">
            <button type="button" className="mgr-page-btn">‹</button>
            <button type="button" className="mgr-page-btn active">1</button>
            <button type="button" className="mgr-page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayCyclesListView;
