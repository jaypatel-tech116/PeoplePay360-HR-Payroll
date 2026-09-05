import React, { useEffect, useState } from "react";

const PayrollProcessingView = ({ onFinish }) => {
  const [progress, setProgress] = useState(65);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 600);
          return 100;
        }
        return p + 5;
      });
    }, 400);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="mgr-content-body">
      {/* 1. Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Processing Payroll...</h1>
          <p className="mgr-page-subtitle">
            Please do not close this window
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
        <div className="mgr-step completed">
          <div className="mgr-step-num">✓</div>
          <span>Verify Amounts</span>
        </div>
        <div className="mgr-step-divider" />
        <div className="mgr-step active">
          <div className="mgr-step-num">3</div>
          <span>Process Payroll</span>
        </div>
        <div className="mgr-step-divider" />
        <div className="mgr-step">
          <div className="mgr-step-num">4</div>
          <span>Completed</span>
        </div>
      </div>

      {/* 3. Progress Card */}
      <div className="mgr-section-card" style={{ padding: "40px 30px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "40px", alignItems: "center" }}>
          {/* Left: Progress Circle */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
            <div style={{ position: "relative", width: "160px", height: "160px" }}>
              <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%" }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3.2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#714B67"
                  strokeWidth="3.2"
                  strokeDasharray={`${progress}, 100`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                {progress}%
              </div>
            </div>
            <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 600 }}>
              Generating payslips...
            </span>
          </div>

          {/* Right: Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#059669", fontSize: "0.88rem", fontWeight: 600 }}>
              <span>✓</span>
              <span>Validating employee data (48/48)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#0284c7", fontSize: "0.88rem", fontWeight: 600 }}>
              <span>⟳</span>
              <span>Calculating salary components (31/48)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: progress >= 75 ? "#059669" : "#9ca3af", fontSize: "0.88rem" }}>
              <span>{progress >= 75 ? "✓" : "○"}</span>
              <span>Generating payslips</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: progress >= 90 ? "#059669" : "#9ca3af", fontSize: "0.88rem" }}>
              <span>{progress >= 90 ? "✓" : "○"}</span>
              <span>Updating payroll records</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: progress >= 100 ? "#059669" : "#9ca3af", fontSize: "0.88rem" }}>
              <span>{progress >= 100 ? "✓" : "○"}</span>
              <span>Finalizing process</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={onFinish}
          >
            Fast Forward to Complete ⏩
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollProcessingView;
