import React, { useState, useEffect } from "react";
import { getPaySlips } from "../../../api/admin.api";
import { MOCK_PAYSLIPS } from "../adminMockData";

export default function PaySlipsView() {
  const [slips, setSlips] = useState(MOCK_PAYSLIPS);
  const [selectedMonth, setSelectedMonth] = useState("August 2025");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingSlip, setViewingSlip] = useState(null);

  const loadData = async () => {
    try {
      const data = await getPaySlips();
      if (data && data.length > 0) {
        setSlips(data.map((s) => ({
          id: s.id,
          slipId: s.payslip_number,
          name: s.employee_name || "Employee",
          code: s.employee_code || "EMP001",
          avatar: `${(s.employee_name || "E")[0]}`,
          dept: s.department_name || "Engineering",
          basicWage: `₹ ${Number(s.basic_wage || (s.gross_amount * 0.52)).toLocaleString("en-IN")}.00`,
          grossWage: `₹ ${Number(s.gross_amount || 0).toLocaleString("en-IN")}.00`,
          deductions: `₹ ${Number(s.deduction_amount || 0).toLocaleString("en-IN")}.00`,
          netWage: `₹ ${Number(s.net_amount || 0).toLocaleString("en-IN")}.00`,
          status: s.payment_status === "PAID" ? "Paid" : "Generated",
        })));
      }
    } catch (err) {
      console.error("Error loading payslips:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const filtered = slips.filter((s) => {
    if (deptFilter !== "All Departments" && s.dept !== deptFilter) return false;
    if (statusFilter !== "All Status" && s.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Pay Slips</h1>
          <p className="adm-page-subtitle">View and manage employee pay slips</p>
        </div>

        <button type="button" className="adm-btn-secondary" onClick={() => alert("Exporting all pay slips to CSV...")}>
          <span>📥</span> Export
        </button>
      </div>

      {/* 2. Filters Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="adm-btn-secondary"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="August 2025">📅 August 2025 ⌵</option>
            <option value="July 2025">📅 July 2025 ⌵</option>
          </select>

          <select
            className="adm-btn-secondary"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Departments">All Departments ⌵</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
          </select>

          <select
            className="adm-btn-secondary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Status">All Status ⌵</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="adm-input-search-wrapper" style={{ width: "260px" }}>
            <span style={{ color: "var(--adm-text-light)" }}>🔍</span>
            <input
              type="text"
              placeholder="Search by employee name or code..."
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
              {filtered.map((s, idx) => (
                <tr key={s.id}>
                  <td style={{ color: "var(--adm-text-light)" }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{s.code}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{s.name}</td>
                  <td>{s.dept}</td>
                  <td>{s.gross}</td>
                  <td style={{ fontWeight: 700, color: "var(--adm-text-dark)" }}>{s.net}</td>
                  <td>
                    <span
                      className={`adm-badge ${
                        s.status === "Paid" ? "adm-badge-green" : "adm-badge-amber"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                      <button
                        type="button"
                        className="adm-btn-secondary"
                        style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                        onClick={() => setViewingSlip(s)}
                      >
                        👁 View
                      </button>
                      <button
                        type="button"
                        style={{ background: "none", border: "none", color: "var(--adm-text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
                        onClick={() => alert(`More actions for ${s.name}`)}
                      >
                        ⋮
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-pagination-footer">
          <span>Showing 1 to {filtered.length} of 48 pay slips</span>
          <div className="adm-pagination-controls">
            <button type="button" className="adm-page-btn">‹</button>
            <button type="button" className="adm-page-btn active">1</button>
            <button type="button" className="adm-page-btn">2</button>
            <button type="button" className="adm-page-btn">3</button>
            <button type="button" className="adm-page-btn">4</button>
            <button type="button" className="adm-page-btn">5</button>
            <button type="button" className="adm-page-btn">›</button>
          </div>
        </div>
      </div>

      {/* Payslip View Modal */}
      {viewingSlip && (
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
          onClick={() => setViewingSlip(null)}
        >
          <div
            className="adm-section-card"
            style={{ width: "100%", maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-section-header">
              <h3 className="adm-section-heading">Payslip: {viewingSlip.name} ({selectedMonth})</h3>
              <button
                onClick={() => setViewingSlip(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Employee:</span>
                <strong>{viewingSlip.name} ({viewingSlip.code})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Department:</span>
                <strong>{viewingSlip.dept}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Gross Salary:</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{viewingSlip.gross}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Net Salary:</span>
                <strong style={{ color: "var(--adm-plum-primary)", fontSize: "1.1rem" }}>{viewingSlip.net}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Status:</span>
                <span className={`adm-badge ${viewingSlip.status === "Paid" ? "adm-badge-green" : "adm-badge-amber"}`}>
                  {viewingSlip.status}
                </span>
              </div>
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--adm-border-subtle)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="adm-btn-secondary" onClick={() => setViewingSlip(null)}>Close</button>
              <button className="adm-btn-primary" onClick={() => alert(`Downloading PDF for ${viewingSlip.name}...`)}>
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
