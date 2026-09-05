import React, { useState, useEffect } from "react";
import { getSalaryRules } from "../../../api/admin.api";
import { MOCK_SALARY_RULES } from "../adminMockData";

export default function SalaryRulesView() {
  const [rules, setRules] = useState(MOCK_SALARY_RULES);
  const [activePill, setActivePill] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [componentFilter, setComponentFilter] = useState("All Components");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedRule, setSelectedRule] = useState(null);

  const loadData = async () => {
    try {
      const data = await getSalaryRules();
      if (data && data.length > 0) {
        setRules(data.map((r) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          category: r.category,
          type: r.category === "BASIC" || r.category === "ALLOWANCE" ? "Earning" : (r.category === "DEDUCTION" ? "Deduction" : "Other"),
          calcType: r.calculation_type || "Fixed",
          value: r.fixed_amount ? `₹ ${Number(r.fixed_amount).toLocaleString("en-IN")}` : (r.percentage ? `${r.percentage}%` : "Formula"),
          status: r.is_active ? "Active" : "Active",
        })));
      }
    } catch (err) {
      console.error("Error loading salary rules:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCount = rules.length;
  const earningsCount = rules.filter((r) => r.type === "Earning").length;
  const deductionsCount = rules.filter((r) => r.type === "Deduction").length;
  const otherCount = rules.filter((r) => r.type === "Other").length;

  const pills = [
    { id: "All", label: `All (${totalCount})` },
    { id: "Earnings", label: `Earnings (${earningsCount})` },
    { id: "Deductions", label: `Deductions (${deductionsCount})` },
    { id: "Other", label: `Other (${otherCount})` },
  ];


  const filtered = rules.filter((r) => {
    if (activePill === "Earnings" && r.type !== "Earning" && r.type !== "Allowance") return false;
    if (activePill === "Deductions" && r.type !== "Deduction") return false;
    if (activePill === "Other" && r.type !== "Other") return false;
    if (statusFilter !== "All Status" && r.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
  });

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Salary Rules</h1>
          <p className="adm-page-subtitle">Manage salary rules and components</p>
        </div>

        <button type="button" className="adm-btn-primary" onClick={() => alert("Add Salary Rule modal")}>
          <span>+</span> Add Rule
        </button>
      </div>

      {/* 2. Sub-Filter Pills */}
      <div className="adm-pill-filters-bar">
        {pills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            className={`adm-filter-pill ${activePill === pill.id ? "active" : ""}`}
            onClick={() => setActivePill(pill.id)}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* 3. Filter Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div className="adm-input-search-wrapper" style={{ width: "260px" }}>
          <span style={{ color: "var(--adm-text-light)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by rule name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="adm-btn-secondary"
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Components">All Components ⌵</option>
            <option value="Earning">Earning</option>
            <option value="Allowance">Allowance</option>
            <option value="Deduction">Deduction</option>
          </select>

          <select
            className="adm-btn-secondary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Status">All Status ⌵</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button type="button" className="adm-btn-secondary">
            <span>⚙️</span> Filters
          </button>
        </div>
      </div>

      {/* 4. Table Card */}
      <div className="adm-section-card">
        <div className="adm-table-responsive">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Rule Name</th>
                <th>Code</th>
                <th>Component Type</th>
                <th>Calculation Type</th>
                <th>Default Value</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--adm-text-light)" }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{r.name}</td>
                  <td><code>{r.code}</code></td>
                  <td>
                    <span
                      className={`adm-badge ${
                        r.type === "Earning"
                          ? "adm-badge-green"
                          : r.type === "Allowance"
                          ? "adm-badge-blue"
                          : r.type === "Deduction"
                          ? "adm-badge-red"
                          : "adm-badge-amber"
                      }`}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td>{r.calcType}</td>
                  <td style={{ fontWeight: 600 }}>{r.defaultValue}</td>
                  <td>
                    <span
                      className={`adm-badge ${
                        r.status === "Active" ? "adm-badge-green" : "adm-badge-red"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                      <button
                        type="button"
                        className="adm-btn-secondary"
                        style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                        onClick={() => setSelectedRule(r)}
                      >
                        👁 View
                      </button>
                      <button
                        type="button"
                        style={{ background: "none", border: "none", color: "var(--adm-text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
                        onClick={() => alert(`Edit rule ${r.name}`)}
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
          <span>Showing 1 to 10 of 16 salary rules</span>
          <div className="adm-pagination-controls">
            <button type="button" className="adm-page-btn">‹</button>
            <button type="button" className="adm-page-btn active">1</button>
            <button type="button" className="adm-page-btn">2</button>
            <button type="button" className="adm-page-btn">›</button>
          </div>
        </div>
      </div>

      {/* Rule Detail Modal */}
      {selectedRule && (
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
          onClick={() => setSelectedRule(null)}
        >
          <div
            className="adm-section-card"
            style={{ width: "100%", maxWidth: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-section-header">
              <h3 className="adm-section-heading">{selectedRule.name} ({selectedRule.code})</h3>
              <button
                onClick={() => setSelectedRule(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Component Type:</span>
                <strong>{selectedRule.type}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Calculation Method:</span>
                <strong>{selectedRule.calcType}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Default Amount/Rate:</span>
                <strong>{selectedRule.defaultValue}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Status:</span>
                <span className={`adm-badge ${selectedRule.status === "Active" ? "adm-badge-green" : "adm-badge-red"}`}>
                  {selectedRule.status}
                </span>
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--adm-border-subtle)", display: "flex", justifyContent: "flex-end" }}>
              <button className="adm-btn-secondary" onClick={() => setSelectedRule(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
