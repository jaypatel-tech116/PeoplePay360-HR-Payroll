import React, { useState } from "react";

const ContractView = () => {
  const [showHistory, setShowHistory] = useState(false);

  // State 2: Contract History (Image 2 Bottom Right)
  if (showHistory) {
    return (
      <div className="employee-contract-history-view">
        {/* Header */}
        <div className="odoo-page-header">
          <div>
            <div className="odoo-breadcrumb">
              <span>My Contract</span>
              <span className="odoo-breadcrumb-sep">›</span>
              <span className="odoo-breadcrumb-current">Contract History</span>
            </div>
            <p className="odoo-page-subtitle">View the history of your contracts</p>
          </div>
          <button
            type="button"
            className="odoo-btn-secondary"
            onClick={() => setShowHistory(false)}
          >
            ← Back
          </button>
        </div>

        {/* Timeline List */}
        <div className="odoo-contract-timeline">
          {/* Contract 1: Current Active */}
          <div className="odoo-timeline-item">
            <div className="odoo-timeline-dot active" />
            <div className="odoo-timeline-card">
              <div className="odoo-timeline-card-header">
                <div className="odoo-timeline-header-left">
                  <span className="odoo-timeline-code">CT-2023-001</span>
                  <span className="odoo-timeline-tag">(Current Contract)</span>
                  <span className="odoo-badge odoo-badge-green">Active</span>
                  <span className="odoo-timeline-dates">01 Sep 2023 - 31 Dec 2026</span>
                </div>
                <button
                  type="button"
                  className="odoo-table-action-btn"
                  onClick={() => setShowHistory(false)}
                >
                  👁 View
                </button>
              </div>

              <div className="odoo-timeline-grid">
                <div className="odoo-timeline-grid-item">
                  <span>Contract Type</span>
                  <span>Permanent</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Salary Structure</span>
                  <span>Regular Monthly Salary</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Wage</span>
                  <span>₹ 50,000.00</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Pay Frequency</span>
                  <span>Monthly</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Working Schedule</span>
                  <span>General (Mon - Fri)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contract 2: Expired 2022 */}
          <div className="odoo-timeline-item">
            <div className="odoo-timeline-dot expired" />
            <div className="odoo-timeline-card">
              <div className="odoo-timeline-card-header">
                <div className="odoo-timeline-header-left">
                  <span className="odoo-timeline-code">CT-2022-001</span>
                  <span className="odoo-badge" style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>Expired</span>
                  <span className="odoo-timeline-dates">01 Sep 2022 - 31 Aug 2023</span>
                </div>
                <button
                  type="button"
                  className="odoo-table-action-btn"
                  onClick={() => alert("Viewing archived contract CT-2022-001 details...")}
                >
                  👁 View
                </button>
              </div>

              <div className="odoo-timeline-grid">
                <div className="odoo-timeline-grid-item">
                  <span>Contract Type</span>
                  <span>Fixed Term</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Salary Structure</span>
                  <span>Regular Monthly Salary</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Wage</span>
                  <span>₹ 45,000.00</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Pay Frequency</span>
                  <span>Monthly</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Working Schedule</span>
                  <span>General (Mon - Fri)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contract 3: Expired 2021 */}
          <div className="odoo-timeline-item">
            <div className="odoo-timeline-dot expired" />
            <div className="odoo-timeline-card">
              <div className="odoo-timeline-card-header">
                <div className="odoo-timeline-header-left">
                  <span className="odoo-timeline-code">CT-2021-001</span>
                  <span className="odoo-badge" style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>Expired</span>
                  <span className="odoo-timeline-dates">01 Mar 2021 - 31 Aug 2022</span>
                </div>
                <button
                  type="button"
                  className="odoo-table-action-btn"
                  onClick={() => alert("Viewing archived contract CT-2021-001 details...")}
                >
                  👁 View
                </button>
              </div>

              <div className="odoo-timeline-grid">
                <div className="odoo-timeline-grid-item">
                  <span>Contract Type</span>
                  <span>Fixed Term</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Salary Structure</span>
                  <span>Regular Monthly Salary</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Wage</span>
                  <span>₹ 40,000.00</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Pay Frequency</span>
                  <span>Monthly</span>
                </div>
                <div className="odoo-timeline-grid-item">
                  <span>Working Schedule</span>
                  <span>General (Mon - Fri)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 1: View Contract (Image 2 Bottom Left)
  return (
    <div className="employee-contract-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <div className="odoo-breadcrumb">
            <span>My Contract</span>
            <span className="odoo-breadcrumb-sep">›</span>
            <span className="odoo-breadcrumb-current">View Contract</span>
          </div>
          <p className="odoo-page-subtitle">View your employment contract details</p>
        </div>
        <button
          type="button"
          className="odoo-btn-primary"
          onClick={() => setShowHistory(true)}
        >
          ⏱️ View History
        </button>
      </div>

      {/* Grid: Contract Details (Left) + Additional Info & Schedule Summary (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Left Card: Contract Details */}
        <div className="odoo-card">
          <h3 className="odoo-card-title" style={{ marginBottom: "18px" }}>
            <span>💼</span> Contract Details
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px 18px",
              fontSize: "0.8rem",
            }}
          >
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Contract Reference</span>
              <span style={{ fontWeight: 600 }}>CT-2023-001</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Contract Type</span>
              <span style={{ fontWeight: 600 }}>Permanent</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Start Date</span>
              <span style={{ fontWeight: 600 }}>01 Sep 2023</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Pay Frequency</span>
              <span style={{ fontWeight: 600 }}>Monthly</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>End Date</span>
              <span style={{ fontWeight: 600 }}>31 Dec 2026</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Working Schedule</span>
              <span style={{ fontWeight: 600 }}>General (Mon - Fri)</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Salary Structure</span>
              <span style={{ fontWeight: 600 }}>Regular Monthly Salary</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Status</span>
              <span className="odoo-badge odoo-badge-green">Active</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Wage (Monthly)</span>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>₹ 50,000.00</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Probation End Date</span>
              <span style={{ fontWeight: 600 }}>28 Feb 2024</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Currency</span>
              <span style={{ fontWeight: 600 }}>INR</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Notice Period</span>
              <span style={{ fontWeight: 600 }}>30 Days</span>
            </div>
          </div>
        </div>

        {/* Right Column: Additional Information & Schedule Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Card 1: Additional Information */}
          <div className="odoo-card">
            <h3 className="odoo-card-title" style={{ marginBottom: "14px" }}>
              <span>ℹ️</span> Additional Information
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Department</span>
                <span style={{ fontWeight: 600 }}>Engineering</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Job Position</span>
                <span style={{ fontWeight: 600 }}>Software Developer</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Manager</span>
                <span style={{ fontWeight: 600 }}>Priya Mehta</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Employee Type</span>
                <span style={{ fontWeight: 600 }}>Full Time</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Created On</span>
                <span style={{ fontWeight: 600 }}>28 Aug 2023</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Created By</span>
                <span style={{ fontWeight: 600 }}>HR Manager</span>
              </div>
            </div>
          </div>

          {/* Card 2: Schedule Summary */}
          <div className="odoo-card">
            <h3 className="odoo-card-title" style={{ marginBottom: "14px" }}>
              <span>📅</span> Schedule Summary
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Working Days</span>
                <span style={{ fontWeight: 600 }}>5 Days</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Daily Hours</span>
                <span style={{ fontWeight: 600 }}>8 Hours</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Weekly Hours</span>
                <span style={{ fontWeight: 600 }}>40 Hours</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Break Time</span>
                <span style={{ fontWeight: 600 }}>1 Hour</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractView;
