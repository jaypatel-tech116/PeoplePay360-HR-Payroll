import React, { useState } from "react";

const PayrollSettingsView = ({ onOpenAddComponent }) => {
  const [activeSubtab, setActiveSubtab] = useState("Salary Components");

  const componentsList = [
    { id: 1, name: "Basic Salary", type: "Earning", applicable: "All", defVal: "0", status: "Active" },
    { id: 2, name: "HRA", type: "Earning", applicable: "All", defVal: "0", status: "Active" },
    { id: 3, name: "Conveyance Allowance", type: "Earning", applicable: "All", defVal: "0", status: "Active" },
    { id: 4, name: "Special Allowance", type: "Earning", applicable: "All", defVal: "0", status: "Active" },
    { id: 5, name: "Other Allowance", type: "Earning", applicable: "All", defVal: "0", status: "Active" },
    { id: 6, name: "PF", type: "Deduction", applicable: "All", defVal: "12%", status: "Active" },
    { id: 7, name: "Professional Tax", type: "Deduction", applicable: "All", defVal: "200", status: "Active" },
    { id: 8, name: "TDS", type: "Deduction", applicable: "All", defVal: "0", status: "Active" },
  ];

  return (
    <div className="pay-content-body">
      {/* 1. Header */}
      <div className="pay-page-header">
        <div>
          <h1 className="pay-page-title">Payroll Settings</h1>
          <p className="pay-page-subtitle">
            Configure payroll components and rules
          </p>
        </div>

        <button
          type="button"
          className="pay-btn-primary"
          onClick={onOpenAddComponent}
        >
          <span>+</span>
          <span>Add Component</span>
        </button>
      </div>

      {/* 2. Sub-Tabs */}
      <div className="pay-subtabs-bar">
        {[
          "Salary Components",
          "Deduction Rules",
          "Tax Settings",
          "Pay Cycle Settings",
        ].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`pay-subtab-btn ${activeSubtab === tab ? "active" : ""}`}
            onClick={() => setActiveSubtab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Components Table */}
      <div className="pay-section-card">
        <div className="pay-table-responsive">
          <table className="pay-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Component Name</th>
                <th>Component Type</th>
                <th>Applicable To</th>
                <th>Default Value</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {componentsList.map((row) => (
                <tr key={row.id}>
                  <td style={{ color: "#9ca3af" }}>{row.id}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{row.name}</td>
                  <td>{row.type}</td>
                  <td>{row.applicable}</td>
                  <td>{row.defVal}</td>
                  <td>
                    <span className="pay-badge pay-badge-green">
                      {row.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#9ca3af",
                        cursor: "pointer",
                        fontSize: "1rem",
                      }}
                      onClick={() => alert(`Configuring ${row.name}`)}
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollSettingsView;
