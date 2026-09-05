import React, { useState } from "react";

export default function SalaryRulesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedRule, setSelectedRule] = useState(null);

  const rules = [
    {
      id: 1,
      ruleName: "Basic Salary",
      code: "BASIC",
      categoryType: "Earnings",
      calculationType: "Fixed",
      defaultValue: "0",
      status: "Active",
      description: "Base taxable salary for contracted role",
    },
    {
      id: 2,
      ruleName: "HRA",
      code: "HRA",
      categoryType: "Allowance",
      calculationType: "Percentage",
      defaultValue: "40%",
      status: "Active",
      description: "House Rent Allowance calculated as percentage of Basic Salary",
    },
    {
      id: 3,
      ruleName: "Conveyance",
      code: "CONV",
      categoryType: "Allowance",
      calculationType: "Fixed",
      defaultValue: "2,000",
      status: "Active",
      description: "Fixed monthly allowance for travel & commute",
    },
    {
      id: 4,
      ruleName: "PF",
      code: "PF",
      categoryType: "Deduction",
      calculationType: "Percentage",
      defaultValue: "12%",
      status: "Active",
      description: "Employee Provident Fund mandatory statutory deduction",
    },
    {
      id: 5,
      ruleName: "Professional Tax",
      code: "PT",
      categoryType: "Deduction",
      calculationType: "Fixed",
      defaultValue: "200",
      status: "Active",
      description: "State level professional tax monthly deduction",
    },
  ];

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === "All" || rule.categoryType === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="mgr-content-body">
      {/* Page Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Salary Rules</h1>
          <p className="mgr-page-subtitle">View salary rules and components (Read Only)</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="mgr-section-card">
        <div className="mgr-section-header">
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--mgr-border)",
                fontSize: "0.8rem",
                color: "var(--mgr-text-body)",
                background: "#ffffff",
              }}
            >
              <option value="All">All Categories</option>
              <option value="Earnings">Earnings</option>
              <option value="Allowance">Allowance</option>
              <option value="Deduction">Deduction</option>
            </select>
          </div>

          <div className="mgr-input-search-wrapper" style={{ width: "260px" }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search salary rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="mgr-table-responsive">
          <table className="mgr-data-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Code</th>
                <th>Category Type</th>
                <th>Calculation Type</th>
                <th>Default Value</th>
                <th>Status</th>
                <th style={{ textAlign: "center", width: "90px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: "var(--mgr-text-dark)" }}>{r.ruleName}</td>
                  <td>
                    <code
                      style={{
                        backgroundColor: "#f1f5f9",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.78rem",
                      }}
                    >
                      {r.code}
                    </code>
                  </td>
                  <td>
                    <span
                      className={`mgr-badge ${
                        r.categoryType === "Earnings"
                          ? "mgr-badge-green"
                          : r.categoryType === "Allowance"
                          ? "mgr-badge-blue"
                          : "mgr-badge-red"
                      }`}
                    >
                      {r.categoryType}
                    </span>
                  </td>
                  <td style={{ color: "var(--mgr-text-muted)" }}>{r.calculationType}</td>
                  <td style={{ fontWeight: 600 }}>{r.defaultValue}</td>
                  <td>
                    <span className="mgr-badge mgr-badge-green">{r.status}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => setSelectedRule(r)}
                      className="mgr-btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                    >
                      👁 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Read-Only Rule Detail Modal */}
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
            className="mgr-section-card"
            style={{ width: "100%", maxWidth: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mgr-section-header">
              <h3 className="mgr-section-heading">Rule Details: {selectedRule.ruleName}</h3>
              <button
                onClick={() => setSelectedRule(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "var(--mgr-text-muted)",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--mgr-border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--mgr-text-muted)" }}>Rule Code:</span>
                <strong>{selectedRule.code}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--mgr-border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--mgr-text-muted)" }}>Category:</span>
                <strong>{selectedRule.categoryType}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--mgr-border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--mgr-text-muted)" }}>Calculation Method:</span>
                <strong>{selectedRule.calculationType}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--mgr-border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--mgr-text-muted)" }}>Default Value:</span>
                <strong>{selectedRule.defaultValue}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--mgr-border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--mgr-text-muted)" }}>Status:</span>
                <span className="mgr-badge mgr-badge-green">{selectedRule.status}</span>
              </div>
              <div style={{ marginTop: "6px" }}>
                <span style={{ color: "var(--mgr-text-muted)", display: "block", marginBottom: "4px" }}>Description:</span>
                <p style={{ margin: 0, color: "var(--mgr-text-body)", lineHeight: 1.4 }}>{selectedRule.description}</p>
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--mgr-border-subtle)", display: "flex", justifyContent: "flex-end" }}>
              <button className="mgr-btn-secondary" onClick={() => setSelectedRule(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
