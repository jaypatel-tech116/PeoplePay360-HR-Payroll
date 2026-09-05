import React, { useState } from "react";

export default function SalaryStructuresView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStructure, setSelectedStructure] = useState(null);

  const structures = [
    {
      id: 1,
      name: "Default Structure (Full Time)",
      description: "Standard salary structure for full time employees",
      componentsCount: 8,
      type: "FT",
      status: "Active",
      components: [
        { name: "Basic Salary", code: "BASIC", type: "Earnings", calculation: "Fixed", value: "₹ 30,000" },
        { name: "House Rent Allowance (HRA)", code: "HRA", type: "Allowance", calculation: "Percentage (40%)", value: "₹ 12,000" },
        { name: "Conveyance Allowance", code: "CONV", type: "Allowance", calculation: "Fixed", value: "₹ 2,000" },
        { name: "Special Allowance", code: "SA", type: "Allowance", calculation: "Fixed", value: "₹ 5,000" },
        { name: "Provident Fund (PF)", code: "PF", type: "Deduction", calculation: "Percentage (12%)", value: "₹ 3,600" },
        { name: "Professional Tax", code: "PT", type: "Deduction", calculation: "Fixed", value: "₹ 200" },
        { name: "ESI", code: "ESI", type: "Deduction", calculation: "Percentage", value: "₹ 0" },
        { name: "TDS", code: "TDS", type: "Deduction", calculation: "Fixed", value: "₹ 1,500" },
      ],
    },
    {
      id: 2,
      name: "Part Time Structure",
      description: "For part time employees",
      componentsCount: 6,
      type: "PT",
      status: "Active",
      components: [
        { name: "Basic Hourly Wage", code: "BASIC_PT", type: "Earnings", calculation: "Hourly", value: "₹ 20,000" },
        { name: "Conveyance Allowance", code: "CONV", type: "Allowance", calculation: "Fixed", value: "₹ 1,000" },
        { name: "Special Allowance", code: "SA", type: "Allowance", calculation: "Fixed", value: "₹ 2,500" },
        { name: "Provident Fund (PF)", code: "PF", type: "Deduction", calculation: "Percentage", value: "₹ 2,400" },
        { name: "Professional Tax", code: "PT", type: "Deduction", calculation: "Fixed", value: "₹ 200" },
        { name: "TDS", code: "TDS", type: "Deduction", calculation: "Fixed", value: "₹ 500" },
      ],
    },
    {
      id: 3,
      name: "Contractor Structure",
      description: "For contract employees",
      componentsCount: 4,
      type: "Contract",
      status: "Active",
      components: [
        { name: "Contract Retainer Fee", code: "RETAINER", type: "Earnings", calculation: "Fixed", value: "₹ 45,000" },
        { name: "Travel Reimbursement", code: "TRAVEL", type: "Allowance", calculation: "Fixed", value: "₹ 3,000" },
        { name: "TDS under 194J", code: "TDS_194J", type: "Deduction", calculation: "Percentage (10%)", value: "₹ 4,500" },
        { name: "Other Deduction", code: "OTHER", type: "Deduction", calculation: "Fixed", value: "₹ 0" },
      ],
    },
  ];

  const filteredStructures = structures.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mgr-content-body">
      {/* Page Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Salary Structures</h1>
          <p className="mgr-page-subtitle">View salary structures (Read Only)</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="mgr-section-card">
        <div className="mgr-section-header">
          <div className="mgr-input-search-wrapper" style={{ width: "260px" }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search structures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="mgr-table-responsive">
          <table className="mgr-data-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Total Components</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ textAlign: "center", width: "90px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStructures.map((struct) => (
                <tr key={struct.id}>
                  <td style={{ color: "var(--mgr-text-muted)", fontWeight: 500 }}>{struct.id}</td>
                  <td style={{ fontWeight: 600, color: "var(--mgr-text-dark)" }}>{struct.name}</td>
                  <td style={{ color: "var(--mgr-text-muted)" }}>{struct.description}</td>
                  <td style={{ fontWeight: 600 }}>{struct.componentsCount}</td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--mgr-text-body)",
                      }}
                    >
                      {struct.type}
                    </span>
                  </td>
                  <td>
                    <span className="mgr-badge mgr-badge-green">{struct.status}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => setSelectedStructure(struct)}
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

      {/* Read-Only Structure Detail Modal */}
      {selectedStructure && (
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
          onClick={() => setSelectedStructure(null)}
        >
          <div
            className="mgr-section-card"
            style={{ width: "100%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mgr-section-header">
              <div>
                <h3 className="mgr-section-heading">{selectedStructure.name}</h3>
                <p className="mgr-section-subheading">{selectedStructure.description}</p>
              </div>
              <button
                onClick={() => setSelectedStructure(null)}
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

            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", gap: "20px", marginBottom: "20px", fontSize: "0.82rem" }}>
                <div>
                  <span style={{ color: "var(--mgr-text-muted)" }}>Type: </span>
                  <strong>{selectedStructure.type}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--mgr-text-muted)" }}>Status: </span>
                  <span className="mgr-badge mgr-badge-green">{selectedStructure.status}</span>
                </div>
                <div>
                  <span style={{ color: "var(--mgr-text-muted)" }}>Components: </span>
                  <strong>{selectedStructure.componentsCount}</strong>
                </div>
              </div>

              <h4 style={{ fontSize: "0.9rem", marginBottom: "12px", color: "var(--mgr-text-dark)" }}>
                Configured Salary Components (Read-Only)
              </h4>
              <table className="mgr-data-table" style={{ border: "1px solid var(--mgr-border)" }}>
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Calculation</th>
                    <th>Sample Value</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStructure.components.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>
                        <code>{c.code}</code>
                      </td>
                      <td>
                        <span
                          className={`mgr-badge ${
                            c.type === "Earnings"
                              ? "mgr-badge-green"
                              : c.type === "Allowance"
                              ? "mgr-badge-blue"
                              : "mgr-badge-red"
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td style={{ color: "var(--mgr-text-muted)" }}>{c.calculation}</td>
                      <td style={{ fontWeight: 600 }}>{c.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--mgr-border-subtle)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button className="mgr-btn-secondary" onClick={() => setSelectedStructure(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
