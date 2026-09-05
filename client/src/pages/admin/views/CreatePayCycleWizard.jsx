import React, { useState } from "react";

export default function CreatePayCycleWizard({ onBack, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    month: "August",
    year: "2025",
    periodStart: "2025-08-01",
    periodEnd: "2025-08-31",
    payDate: "2025-08-31",
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      alert("New Pay Cycle created successfully!");
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Create Pay Cycle</h1>
          <p className="adm-page-subtitle">
            Set up a new payroll cycle for your organization
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button type="button" className="adm-btn-secondary" onClick={onBack}>
            Cancel
          </button>
          <button type="button" className="adm-btn-primary" onClick={handleNext}>
            Next →
          </button>
        </div>
      </div>

      {/* 2. 4-Step Stepper Bar */}
      <div className="adm-stepper">
        <div className={`adm-step ${currentStep > 1 ? "completed" : currentStep === 1 ? "active" : ""}`}>
          <div className="adm-step-num">{currentStep > 1 ? "✓" : "1"}</div>
          <span>Payroll Period</span>
        </div>
        <div className="adm-step-divider" />

        <div className={`adm-step ${currentStep > 2 ? "completed" : currentStep === 2 ? "active" : ""}`}>
          <div className="adm-step-num">{currentStep > 2 ? "✓" : "2"}</div>
          <span>Salary Structure</span>
        </div>
        <div className="adm-step-divider" />

        <div className={`adm-step ${currentStep > 3 ? "completed" : currentStep === 3 ? "active" : ""}`}>
          <div className="adm-step-num">{currentStep > 3 ? "✓" : "3"}</div>
          <span>Select Employees</span>
        </div>
        <div className="adm-step-divider" />

        <div className={`adm-step ${currentStep === 4 ? "active" : ""}`}>
          <div className="adm-step-num">4</div>
          <span>Review & Create</span>
        </div>
      </div>

      {/* Step 1: Payroll Period (Screen 10) */}
      {currentStep === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
          {/* Form Card */}
          <div className="adm-section-card" style={{ padding: "24px" }}>
            <h3 className="adm-section-heading" style={{ marginBottom: "20px" }}>
              Payroll Period
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                    Month *
                  </label>
                  <select
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.84rem" }}
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  >
                    <option>August</option>
                    <option>September</option>
                    <option>October</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                    Year *
                  </label>
                  <select
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.84rem" }}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  >
                    <option>2025</option>
                    <option>2026</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                  Period Start *
                </label>
                <input
                  type="date"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.84rem" }}
                  value={formData.periodStart}
                  onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                  Period End *
                </label>
                <input
                  type="date"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.84rem" }}
                  value={formData.periodEnd}
                  onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                  Pay Date *
                </label>
                <input
                  type="date"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.84rem" }}
                  value={formData.payDate}
                  onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Period Summary Card */}
          <div className="adm-section-card" style={{ padding: "24px" }}>
            <h3 className="adm-section-heading" style={{ marginBottom: "20px" }}>
              Period Summary
            </h3>

            <div
              style={{
                backgroundColor: "#fdf8fb",
                border: "1px solid #f0deec",
                borderRadius: "8px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "8px",
                  backgroundColor: "var(--adm-plum-primary)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                }}
              >
                📅
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--adm-text-dark)", fontWeight: 700 }}>
                  {formData.month} {formData.year}
                </h4>
                <span style={{ fontSize: "0.78rem", color: "var(--adm-text-muted)" }}>
                  01 {formData.month.slice(0, 3)} {formData.year} - 31 {formData.month.slice(0, 3)} {formData.year}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--adm-border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Pay Date</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>31 {formData.month.slice(0, 3)} {formData.year}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--adm-border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Payroll Type</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>Monthly Payroll</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Status</span>
                <span
                  style={{
                    padding: "3px 10px",
                    backgroundColor: "#f1f5f9",
                    color: "var(--adm-text-body)",
                    borderRadius: "4px",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                >
                  Draft
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Steps 2-4 */}
      {currentStep > 1 && (
        <div className="adm-section-card" style={{ padding: "30px", textAlign: "center" }}>
          <h3 className="adm-section-heading">Step {currentStep}: Ready for Execution</h3>
          <p className="adm-page-subtitle" style={{ marginTop: "8px" }}>
            Salary structures and employees are auto-assigned for this cycle period.
          </p>
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
            <button type="button" className="adm-btn-secondary" onClick={() => setCurrentStep(currentStep - 1)}>
              ← Back
            </button>
            <button type="button" className="adm-btn-primary" onClick={handleNext}>
              {currentStep === 4 ? "Create Cycle" : "Next →"}
            </button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
        <button type="button" className="adm-btn-secondary" onClick={onBack}>
          Cancel
        </button>
        <button type="button" className="adm-btn-primary" onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  );
}
