import React from "react";

const ProcessCompletedView = ({ onViewPaySlips, onBackToDashboard }) => {
  return (
    <div className="mgr-content-body">
      {/* 1. Stepper */}
      <div className="mgr-stepper">
        <div className="mgr-step completed">
          <div className="mgr-step-num">✓</div>
          <span>Review Employees</span>
        </div>
        <div className="mgr-step-divider" />
        <div className="mgr-step completed">
          <div className="mgr-step-num">✓</div>
          <span>Verify Amounts</span>
        </div>
        <div className="mgr-step-divider" />
        <div className="mgr-step completed">
          <div className="mgr-step-num">✓</div>
          <span>Process Payroll</span>
        </div>
        <div className="mgr-step-divider" />
        <div className="mgr-step active">
          <div className="mgr-step-num">4</div>
          <span>Completed</span>
        </div>
      </div>

      {/* 2. Success Card */}
      <div className="mgr-success-card">
        <div className="mgr-success-icon">✓</div>

        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#111827", margin: "0 0 6px 0" }}>
            Payroll Processed Successfully!
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
            All payslips have been generated for August 2025.
          </p>
        </div>

        {/* 3 Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "16px", width: "100%" }}>
          <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Payslips Generated</span>
            <strong style={{ fontSize: "1.5rem", color: "#059669" }}>45</strong>
          </div>

          <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Excluded Employees</span>
            <strong style={{ fontSize: "1.5rem", color: "#dc2626" }}>3</strong>
          </div>

          <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Total Net Payroll</span>
            <strong style={{ fontSize: "1.35rem", color: "#111827" }}>₹ 24,08,560</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "10px" }}>
          <button
            type="button"
            className="mgr-btn-primary"
            onClick={onViewPaySlips}
          >
            View Pay Slips
          </button>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={onBackToDashboard}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessCompletedView;
