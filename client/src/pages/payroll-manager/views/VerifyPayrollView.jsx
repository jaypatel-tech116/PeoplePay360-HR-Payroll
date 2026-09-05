import React from "react";

const VerifyPayrollView = ({ onBack, onProcessPayroll }) => {
  const issues = [
    { id: 1, emp: "Sneha Iyer", type: "Missing Attendance", desc: "Attendance not found for 2 days", severity: "Warning", action: "Review" },
    { id: 2, emp: "Rohan Desai", type: "No Active Contract", desc: "Contract expired on 31 Jul 2025", severity: "Error", action: "Exclude" },
    { id: 3, emp: "Meera Nair", type: "OK - Ready for processing", desc: "All parameters checked", severity: "OK", action: "-" },
  ];

  return (
    <div className="mgr-content-body">
      {/* 1. Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Verify Payroll - August 2025</h1>
          <p className="mgr-page-subtitle">
            Check validation results before processing
          </p>
        </div>
      </div>

      {/* 2. Stepper */}
      <div className="mgr-stepper">
        <div className="mgr-step completed">
          <div className="mgr-step-num">✓</div>
          <span>Review Employees</span>
        </div>
        <div className="mgr-step-divider" />
        <div className="mgr-step active">
          <div className="mgr-step-num">2</div>
          <span>Verify Amounts</span>
        </div>
        <div className="mgr-step-divider" />
        <div className="mgr-step">
          <div className="mgr-step-num">3</div>
          <span>Process Payroll</span>
        </div>
        <div className="mgr-step-divider" />
        <div className="mgr-step">
          <div className="mgr-step-num">4</div>
          <span>Completed</span>
        </div>
      </div>

      {/* 3. Summary Cards */}
      <div className="mgr-stats-grid">
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#e6f7ef", color: "#059669" }}>
            👥
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Employees Ready</span>
            <span className="mgr-stat-value" style={{ color: "#059669" }}>42</span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
            ⚠️
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">With Warnings</span>
            <span className="mgr-stat-value" style={{ color: "#d97706" }}>2</span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
            💳
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Total Gross</span>
            <span className="mgr-stat-value" style={{ fontSize: "1.3rem" }}>₹ 26,60,000</span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#ede9fe", color: "#6d28d9" }}>
            💰
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Total Net</span>
            <span className="mgr-stat-value" style={{ fontSize: "1.3rem" }}>₹ 22,60,450</span>
          </div>
        </div>
      </div>

      {/* 4. Issues Table */}
      <div className="mgr-section-card">
        <div className="mgr-table-responsive">
          <table className="mgr-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Employee</th>
                <th>Issue Type</th>
                <th>Description</th>
                <th>Severity</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((row) => (
                <tr key={row.id}>
                  <td style={{ color: "#9ca3af" }}>{row.id}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{row.emp}</td>
                  <td>{row.type}</td>
                  <td>{row.desc}</td>
                  <td>
                    <span
                      className={`mgr-badge ${
                        row.severity === "Warning"
                          ? "mgr-badge-amber"
                          : row.severity === "Error"
                          ? "mgr-badge-red"
                          : "mgr-badge-green"
                      }`}
                    >
                      {row.severity}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {row.action !== "-" ? (
                      <button
                        type="button"
                        className="mgr-btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                        onClick={() => alert(`Handling action: ${row.action} for ${row.emp}`)}
                      >
                        {row.action}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", borderTop: "1px solid #f1f5f9" }}>
          <button type="button" className="mgr-btn-secondary" onClick={onBack}>
            ← Back
          </button>
          <button
            type="button"
            className="mgr-btn-primary"
            onClick={onProcessPayroll}
          >
            Process Payroll →
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyPayrollView;
