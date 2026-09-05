import React, { useState, useEffect } from "react";
import { getPayCycles } from "../../../api/admin.api";
import { MOCK_PAY_CYCLES } from "../adminMockData";

export default function PayCyclesView({ onCreateNewCycle }) {
  const [cycles, setCycles] = useState(MOCK_PAY_CYCLES);
  const [yearFilter, setYearFilter] = useState("All Years");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      const data = await getPayCycles();
      if (data && data.length > 0) {
        setCycles(data.map((c) => ({
          id: c.id,
          month: c.month || "August",
          year: String(c.year || "2025"),
          employees: parseInt(c.employee_count) || 8,
          totalPayroll: `₹ ${Number(c.total_net || 0).toLocaleString("en-IN")}.00`,
          payDate: c.pay_date ? new Date(c.pay_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "31 Aug 2025",
          status: c.status === "Closed" ? "Completed" : (c.status === "Computed" ? "Processing" : c.status || "Draft"),
          progress: c.status === "Closed" ? 100 : (c.status === "Computed" ? 75 : 25),
        })));
      }
    } catch (err) {
      console.error("Error loading pay cycles:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const filtered = cycles.filter((c) => {
    if (statusFilter !== "All Status" && c.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return (
      c.month.toLowerCase().includes(q) ||
      c.year.includes(q) ||
      c.payDate.toLowerCase().includes(q)
    );
  });

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Pay Cycles</h1>
          <p className="adm-page-subtitle">Manage monthly payroll cycles</p>
        </div>

        <button
          type="button"
          className="adm-btn-primary"
          onClick={onCreateNewCycle}
        >
          <span>+</span> Create Pay Cycle
        </button>
      </div>

      {/* 2. Filters Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="adm-btn-secondary"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Years">All Years ⌵</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          <select
            className="adm-btn-secondary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Status">All Status ⌵</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="adm-input-search-wrapper" style={{ width: "260px" }}>
            <span style={{ color: "var(--adm-text-light)" }}>🔍</span>
            <input
              type="text"
              placeholder="Search by month, year or pay date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button type="button" className="adm-btn-secondary">
            <span>⚙️</span> Filters
          </button>
        </div>
      </div>

      {/* 3. Table Card */}
      <div className="adm-section-card">
        <div className="adm-table-responsive">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Month</th>
                <th>Year</th>
                <th>Pay Date</th>
                <th style={{ textAlign: "center" }}>Employees</th>
                <th>Total Gross</th>
                <th>Total Deductions</th>
                <th>Total Net</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={c.id}>
                  <td style={{ color: "var(--adm-text-light)" }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{c.month}</td>
                  <td>{c.year}</td>
                  <td>{c.payDate}</td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>{c.emps}</td>
                  <td>{c.gross}</td>
                  <td style={{ color: "var(--adm-text-muted)" }}>{c.deductions}</td>
                  <td style={{ fontWeight: 700, color: "var(--adm-text-dark)" }}>{c.net}</td>
                  <td>
                    <span
                      className={`adm-badge ${
                        c.status === "Processing" ? "adm-badge-blue" : "adm-badge-green"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--adm-text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
                      onClick={() => alert(`Details for pay cycle ${c.month} ${c.year}`)}
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
          <span>Showing 1 to {filtered.length} of 8 pay cycles</span>
          <div className="adm-pagination-controls">
            <button type="button" className="adm-page-btn">‹</button>
            <button type="button" className="adm-page-btn active">1</button>
            <button type="button" className="adm-page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
