import React, { useState, useEffect } from "react";
import { getSalaryStructures } from "../../../api/admin.api";
import { MOCK_SALARY_STRUCTURES } from "../adminMockData";

export default function SalaryStructuresView() {
  const [structures, setStructures] = useState(MOCK_SALARY_STRUCTURES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStruct, setSelectedStruct] = useState(null);

  const loadData = async () => {
    try {
      const data = await getSalaryStructures();
      if (data && data.length > 0) {
        setStructures(data.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          type: s.type === "FT" ? "Regular Monthly" : (s.type === "PT" ? "Hourly / Part-Time" : s.type),
          rulesCount: parseInt(s.rule_count) || 6,
          assignedEmployees: parseInt(s.assigned_employees) || 1,
          status: s.is_active ? "Active" : "Inactive",
          description: s.description || "Standard company compensation structure",
        })));
      }
    } catch (err) {
      console.error("Error loading salary structures:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const filtered = structures.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Salary Structures</h1>
          <p className="adm-page-subtitle">Manage salary structures and their components</p>
        </div>

        <button type="button" className="adm-btn-primary" onClick={() => alert("Add Salary Structure modal")}>
          <span>+</span> Add Structure
        </button>
      </div>

      {/* 2. Search & Filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div className="adm-input-search-wrapper" style={{ width: "280px" }}>
          <span style={{ color: "var(--adm-text-light)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by structure name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button type="button" className="adm-btn-secondary">
          <span>⚙️</span> Filters
        </button>
      </div>

      {/* 3. Table Card */}
      <div className="adm-section-card">
        <div className="adm-table-responsive">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Structure Name</th>
                <th>Code</th>
                <th>Description</th>
                <th style={{ textAlign: "center" }}>Employees</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr key={s.id}>
                  <td style={{ color: "var(--adm-text-light)" }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{s.name}</td>
                  <td><code>{s.code}</code></td>
                  <td style={{ color: "var(--adm-text-muted)" }}>{s.description}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{s.employees}</td>
                  <td>
                    <span
                      className={`adm-badge ${
                        s.status === "Active" ? "adm-badge-green" : "adm-badge-red"
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
                        onClick={() => setSelectedStruct(s)}
                      >
                        👁 View
                      </button>
                      <button
                        type="button"
                        style={{ background: "none", border: "none", color: "var(--adm-text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
                        onClick={() => alert(`Manage structure ${s.name}`)}
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
          <span>Showing 1 to {filtered.length} of 8 salary structures</span>
          <div className="adm-pagination-controls">
            <button type="button" className="adm-page-btn">‹</button>
            <button type="button" className="adm-page-btn active">1</button>
            <button type="button" className="adm-page-btn">›</button>
          </div>
        </div>
      </div>

      {/* Structure Details Modal */}
      {selectedStruct && (
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
          onClick={() => setSelectedStruct(null)}
        >
          <div
            className="adm-section-card"
            style={{ width: "100%", maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-section-header">
              <h3 className="adm-section-heading">{selectedStruct.name} ({selectedStruct.code})</h3>
              <button
                onClick={() => setSelectedStruct(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <p style={{ margin: 0, color: "var(--adm-text-muted)" }}>{selectedStruct.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Enrolled Employees:</span>
                <strong>{selectedStruct.employees}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Status:</span>
                <span className={`adm-badge ${selectedStruct.status === "Active" ? "adm-badge-green" : "adm-badge-red"}`}>
                  {selectedStruct.status}
                </span>
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--adm-border-subtle)", display: "flex", justifyContent: "flex-end" }}>
              <button className="adm-btn-secondary" onClick={() => setSelectedStruct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
