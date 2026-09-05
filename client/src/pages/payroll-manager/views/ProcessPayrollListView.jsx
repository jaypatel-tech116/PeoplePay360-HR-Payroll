import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

const ProcessPayrollListView = ({ cycle, onProceedToVerify, onBack, onSelectPayslip }) => {
  const [payrun, setPayrun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [validationWarnings, setValidationWarnings] = useState([]);

  const loadPayrunData = async () => {
    try {
      setLoading(true);
      let targetId = cycle?.id;
      if (!targetId) {
        const list = await payrollApi.getPayruns();
        if (list && list.length > 0) {
          targetId = list[0].id;
        }
      }

      if (targetId) {
        let details = await payrollApi.getPayrunById(targetId);
        // If payrun has zero payslips and is in Draft, automatically compute so UI never displays blank 0s
        if (
          (!details.payslips || details.payslips.length === 0) &&
          details.status !== "Completed" &&
          details.status !== "Paid"
        ) {
          try {
            await payrollApi.computePayrun(targetId);
            details = await payrollApi.getPayrunById(targetId);
          } catch (autoErr) {
            console.warn("Auto-compute fallback:", autoErr.message);
          }
        }
        setPayrun(details);
      }
    } catch (err) {
      console.error("Failed to load payrun details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrunData();
  }, [cycle]);

  const handleCompute = async () => {
    if (!payrun?.id) return;
    try {
      setActionLoading(true);
      setActionMessage("Computing salary rules and attendance adjustments across active contracts...");
      await payrollApi.computePayrun(payrun.id);
      await loadPayrunData();
      setActionMessage("✅ Salary rules computed successfully!");
      setTimeout(() => setActionMessage(""), 4000);
    } catch (err) {
      alert("Payroll Computation Error: " + (err.response?.data?.message || err.message));
      setActionMessage("");
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!payrun?.id) return;
    try {
      setActionLoading(true);
      setActionMessage("Validating employee banking, tax, and contract parameters...");
      const res = await payrollApi.validatePayrun(payrun.id);
      await loadPayrunData();
      if (res?.warnings && res.warnings.length > 0) {
        setValidationWarnings(res.warnings);
        setActionMessage(`⚠️ Payrun validated with ${res.warnings.length} warning(s).`);
      } else {
        setValidationWarnings([]);
        setActionMessage("✅ Payrun validated successfully! Ready for disbursement.");
      }
      setTimeout(() => setActionMessage(""), 5000);
    } catch (err) {
      alert("Validation Error: " + (err.response?.data?.message || err.message));
      setActionMessage("");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!payrun?.id) return;
    try {
      setActionLoading(true);
      setActionMessage("Finalizing payment disbursement and locking payrun...");
      await payrollApi.markPayrunPaid(payrun.id);
      await loadPayrunData();
      setActionMessage("✅ Payrun marked as COMPLETED and paid! All employee payslips finalized.");
      setTimeout(() => setActionMessage(""), 5000);
    } catch (err) {
      alert("Payment Finalization Error: " + (err.response?.data?.message || err.message));
      setActionMessage("");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendPayslips = async () => {
    if (!payrun?.id) return;
    try {
      setActionLoading(true);
      setActionMessage("Dispatching digital payslip statements to employee work emails...");
      const res = await payrollApi.sendPayslips(payrun.id);
      setActionMessage(`✅ Payslips dispatched: ${res?.sent || 0} sent, ${res?.skipped || 0} skipped.`);
      setTimeout(() => setActionMessage(""), 5000);
    } catch (err) {
      alert("Payslip Email Dispatch Error: " + (err.response?.data?.message || err.message));
      setActionMessage("");
    } finally {
      setActionLoading(false);
    }
  };

  const status = payrun?.status || "Draft";

  // Strict 4-Step Pipeline Index: 1 = Draft, 2 = Computed, 3 = Validated, 4 = Paid
  let currentStep = 1;
  if (status === "Draft" || status === "Processing") {
    currentStep = 1;
  } else if (status === "Computed") {
    currentStep = 2;
  } else if (status === "Validated") {
    currentStep = 3;
  } else if (status === "Completed" || status === "Paid") {
    currentStep = 4;
  }

  const isDraft = currentStep === 1;
  const isComputed = currentStep === 2;
  const isValidated = currentStep === 3;
  const isPaid = currentStep === 4;

  const grossNum = parseFloat(payrun?.total_gross) || 0;
  const netNum = parseFloat(payrun?.total_net) || 0;
  const payslips = payrun?.payslips || [];

  return (
    <div className="mgr-content-body">
      {/* 1. Header & Primary Action Bar */}
      <div className="mgr-page-header" style={{ alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          {onBack && (
            <button
              type="button"
              className="mgr-btn-secondary"
              onClick={onBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Return to Payruns Batches List"
            >
              <span>←</span> Back to Payruns
            </button>
          )}

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h1 className="mgr-page-title" style={{ margin: 0 }}>
                {payrun?.month && payrun?.year ? `${payrun.month} ${payrun.year} Payrun` : payrun?.run_number || "Payrun Processing"}
              </h1>
              <span
                className={`mgr-badge ${
                  isPaid
                    ? "mgr-badge-green"
                    : isValidated
                    ? "mgr-badge-purple"
                    : isComputed
                    ? "mgr-badge-blue"
                    : "mgr-badge-amber"
                }`}
                style={{ fontSize: "0.8rem", padding: "4px 10px" }}
              >
                {status}
              </span>
            </div>
            <p className="mgr-page-subtitle">
              {payrun?.period_start && payrun?.period_end
                ? `Period: ${new Date(payrun.period_start).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} – ${new Date(payrun.period_end).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} • Structure: ${payrun?.salary_structure_name || "Default Structure (Full Time)"}`
                : "Synchronized live payroll execution"}
            </p>
          </div>
        </div>

        {/* Action Button Hierarchy (Strict Pipeline 1 -> 2 -> 3 -> 4) */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Step 2: Compute Button (Enabled only in Draft or Computed) */}
          <button
            type="button"
            className="mgr-btn-primary"
            onClick={handleCompute}
            disabled={actionLoading || isValidated || isPaid}
            style={{
              opacity: isValidated || isPaid ? 0.45 : 1,
              cursor: isValidated || isPaid ? "not-allowed" : "pointer",
            }}
            title={
              isPaid
                ? "Payrun is finalized and closed. Calculations locked."
                : isValidated
                ? "Payrun is validated and locked for payout. Cannot recompute."
                : isComputed
                ? "Re-compute salary rules across active contracts"
                : "Step 2: Compute salary components and rule formulas across active contracts"
            }
          >
            <span>⚙️</span> {isComputed ? "Re-Compute" : "Compute"}
          </button>

          {/* Step 3: Validate Button (Strictly DISABLED in Draft; Enabled only in Computed) */}
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={handleValidate}
            disabled={actionLoading || isDraft || isValidated || isPaid}
            style={{
              opacity: isDraft || isValidated || isPaid ? 0.45 : 1,
              cursor: isDraft || isValidated || isPaid ? "not-allowed" : "pointer",
              backgroundColor: isComputed ? "var(--mgr-plum-subtle, #f5f3ff)" : undefined,
              borderColor: isComputed ? "var(--mgr-plum-primary, #714B67)" : undefined,
              color: isComputed ? "var(--mgr-plum-primary, #714B67)" : undefined,
              fontWeight: 600,
            }}
            title={
              isDraft
                ? "🔒 Step 3 Locked: You must Compute salary rules first (Step 2) before validating."
                : isValidated
                ? "✓ Step 3 Complete: Payrun already validated. Proceed to Mark Paid."
                : isPaid
                ? "Payrun finalized."
                : "Step 3: Validate pre-payroll audit and calculations"
            }
          >
            <span>{isValidated ? "✓" : "🔒"}</span> {isValidated ? "Validated" : "Validate"}
          </button>

          {/* Step 4: Mark Paid Button (Strictly DISABLED in Draft & Computed; Enabled only in Validated) */}
          <button
            type="button"
            onClick={handleMarkPaid}
            disabled={actionLoading || isDraft || isComputed || isPaid}
            style={{
              backgroundColor: isPaid ? "#9ca3af" : isValidated ? "#059669" : "#e5e7eb",
              color: isPaid || isValidated ? "#ffffff" : "#9ca3af",
              border: "none",
              borderRadius: "6px",
              padding: "7px 16px",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: isValidated ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: isDraft || isComputed ? 0.5 : 1,
              transition: "all 0.15s ease",
            }}
            title={
              isDraft
                ? "🔒 Step 4 Locked: Compute and validate payrun first before payout."
                : isComputed
                ? "🔒 Step 4 Locked: Validate payrun (Step 3) before marking as paid."
                : isValidated
                ? "Step 4: Confirm disbursement and finalize payrun"
                : "Payrun disbursed and finalized."
            }
          >
            <span>{isPaid ? "✓" : isValidated ? "🏦" : "🔒"}</span> {isPaid ? "Paid & Finalized" : "Mark Paid"}
          </button>

          {/* Dispatch Payslips (Enabled only after Validated or Paid) */}
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={handleSendPayslips}
            disabled={actionLoading || currentStep < 3}
            style={{
              opacity: currentStep < 3 ? 0.45 : 1,
              cursor: currentStep < 3 ? "not-allowed" : "pointer",
            }}
            title={
              currentStep < 3
                ? "🔒 Locked: Payslips can only be emailed after validation or completion."
                : "Email payslips to all employees"
            }
          >
            <span>✉️</span> Send Payslips
          </button>

          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={loadPayrunData}
            title="Refresh from database"
          >
            🔄
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            padding: "12px 18px",
            marginBottom: "16px",
            borderRadius: "6px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            fontWeight: 600,
            fontSize: "0.86rem",
          }}
        >
          {actionMessage}
        </div>
      )}

      {/* 2. Strict 4-Step Interactive Pipeline Stepper (Draft -> Computed -> Validated -> Paid) */}
      <div className="mgr-pipeline-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", padding: "0 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280" }}>
              Payroll Pipeline Stage:
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--mgr-plum-primary, #714B67)" }}>
              Step {currentStep} of 4 — {status}
            </span>
          </div>

          <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
            {isDraft && "👉 Click 'Compute' to calculate salary rules"}
            {isComputed && "👉 Review payslips below, then click 'Validate'"}
            {isValidated && "👉 Audit complete. Click 'Mark Paid' to disburse"}
            {isPaid && "✓ Batch closed and payslips locked"}
          </span>
        </div>

        <div className="mgr-pipeline-stepper">
          {[
            {
              stepNum: 1,
              label: "Draft",
              desc: "Batch configured",
              isCompleted: currentStep > 1,
              isCurrent: currentStep === 1,
              isClickable: false,
              onClick: null,
              tooltip: "Step 1: Batch parameters configured",
            },
            {
              stepNum: 2,
              label: "Computed",
              desc: "Salary rules calculated",
              isCompleted: currentStep > 2,
              isCurrent: currentStep === 2,
              isClickable: isDraft && !actionLoading,
              onClick: isDraft ? handleCompute : null,
              tooltip: isDraft
                ? "Click to execute Step 2 (Compute salary rules)"
                : currentStep >= 2
                ? "Salary rules computed"
                : "Step 2: Computed",
            },
            {
              stepNum: 3,
              label: "Validated",
              desc: "Audit & compliance verified",
              isCompleted: currentStep > 3,
              isCurrent: currentStep === 3,
              isClickable: isComputed && !actionLoading,
              onClick: isComputed ? handleValidate : null,
              tooltip: isDraft
                ? "🔒 Locked: Compute salary rules first before validating"
                : isComputed
                ? "Click to execute Step 3 (Validate audit)"
                : "Step 3: Validated",
            },
            {
              stepNum: 4,
              label: "Paid",
              desc: "Disbursed & finalized",
              isCompleted: currentStep === 4,
              isCurrent: currentStep === 4,
              isClickable: isValidated && !actionLoading,
              onClick: isValidated ? handleMarkPaid : null,
              tooltip: isDraft || isComputed
                ? "🔒 Locked: Must validate payrun first before payout"
                : isValidated
                ? "Click to execute Step 4 (Mark Paid & finalize)"
                : "Step 4: Paid & Closed",
            },
          ].map((step, idx, arr) => {
            const isClickable = Boolean(step.isClickable);
            const isCompleted = step.isCompleted;
            const isCurrent = step.isCurrent;
            const isLocked = !isCompleted && !isCurrent && !isClickable;

            return (
              <React.Fragment key={step.stepNum}>
                <button
                  type="button"
                  className={`mgr-pipeline-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isPaid && isCompleted ? "paid-done" : ""} ${isClickable ? "clickable" : ""}`}
                  onClick={step.onClick || undefined}
                  title={step.tooltip}
                  disabled={!isClickable}
                  style={{
                    outline: "none",
                    cursor: isClickable ? "pointer" : isCurrent ? "default" : "not-allowed",
                    opacity: isLocked ? 0.45 : 1,
                  }}
                >
                  <div
                    className="mgr-pipeline-circle"
                    style={{
                      border: isCurrent ? "2px solid var(--mgr-plum-primary, #714B67)" : undefined,
                      boxShadow: isCurrent ? "0 0 0 4px rgba(113, 75, 103, 0.15)" : undefined,
                    }}
                  >
                    {isCompleted ? "✓" : isLocked ? "🔒" : step.stepNum}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span className="mgr-pipeline-label" style={{ fontWeight: isCurrent ? 700 : 600 }}>
                      {step.stepNum}. {step.label}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: isCurrent ? "var(--mgr-plum-primary, #714B67)" : "#9ca3af" }}>
                      {step.desc}
                    </span>
                  </div>
                </button>

                {idx < arr.length - 1 && (
                  <div
                    className={`mgr-pipeline-line ${
                      arr[idx + 1].isCompleted || arr[idx + 1].isCurrent
                        ? isPaid
                          ? "paid-done"
                          : "completed"
                        : ""
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Summary KPI Cards */}
      <div className="mgr-kpi-grid">
        <div className="mgr-kpi-card">
          <span className="mgr-kpi-title">Batch Employees</span>
          <div className="mgr-kpi-val">{payrun?.employee_count || payslips.length || 0}</div>
          <span className="mgr-kpi-sub">Active contracted staff</span>
        </div>
        <div className="mgr-kpi-card">
          <span className="mgr-kpi-title">Gross Payroll</span>
          <div className="mgr-kpi-val" style={{ color: "var(--mgr-plum-primary)" }}>
            {"₹ " + grossNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span className="mgr-kpi-sub">Calculated total earnings</span>
        </div>
        <div className="mgr-kpi-card">
          <span className="mgr-kpi-title">Net Disbursement</span>
          <div className="mgr-kpi-val" style={{ color: "#059669" }}>
            {"₹ " + netNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span className="mgr-kpi-sub">Total payable to employees</span>
        </div>
        <div className="mgr-kpi-card">
          <span className="mgr-kpi-title">Current Status</span>
          <div className="mgr-kpi-val" style={{ fontSize: "1.35rem", color: isPaid ? "#059669" : isValidated ? "var(--mgr-plum-primary)" : "#2563eb" }}>
            {status}
          </div>
          <span className="mgr-kpi-sub">{isPaid ? "Locked & Protected" : "Operational Batch"}</span>
        </div>
      </div>

      {/* 4. Validation Warnings Banner */}
      {validationWarnings.length > 0 && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "16px",
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "6px",
            color: "#92400e",
            fontSize: "0.84rem",
          }}
        >
          <strong>⚠️ Pre-Validation Issues Detected:</strong>
          <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
            {validationWarnings.map((w, idx) => (
              <li key={idx}>
                {w.code}: {w.message} (Employee ID: {w.employee_id})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Employee Payslips Table */}
      <div className="mgr-section-card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--mgr-border)" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
            Itemized Employee Payslips ({payslips.length})
          </h3>
        </div>

        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading payrun details from database...
          </div>
        )}

        {!loading && (
          <div className="mgr-table-container">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th style={{ textAlign: "center" }}>Worked Days</th>
                  <th style={{ textAlign: "center" }}>Paid Days</th>
                  <th style={{ textAlign: "right" }}>Gross Salary</th>
                  <th style={{ textAlign: "right" }}>Deductions</th>
                  <th style={{ textAlign: "right" }}>Net Salary</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Statement</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((slip, index) => {
                  const slipGross = parseFloat(slip.gross_amount) || 0;
                  const slipDed = parseFloat(slip.deduction_amount) || 0;
                  const slipNet = parseFloat(slip.net_amount) || 0;

                  return (
                    <tr
                      key={slip.id || index}
                      style={{ cursor: onSelectPayslip ? "pointer" : "default" }}
                      onClick={() => onSelectPayslip && onSelectPayslip(slip)}
                    >
                      <td style={{ color: "#9ca3af" }}>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{slip.employee_name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                          {slip.employee_code} • {slip.designation || "Staff"}
                        </div>
                      </td>
                      <td>{slip.department_name || "General"}</td>
                      <td style={{ textAlign: "center" }}>{slip.worked_days || "-"}</td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>{slip.paid_days || "-"}</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {"₹ " + slipGross.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: "right", color: "#dc2626" }}>
                        {"₹ " + slipDed.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--mgr-plum-primary)" }}>
                        {"₹ " + slipNet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span
                          className={`mgr-badge ${
                            slip.payment_status === "PAID"
                              ? "mgr-badge-green"
                              : slip.status === "Validated"
                              ? "mgr-badge-purple"
                              : "mgr-badge-blue"
                          }`}
                        >
                          {slip.payment_status === "PAID" ? "Paid" : slip.status || "Computed"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <a
                          href={payrollApi.getPayslipPdfUrl(slip.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="hr-btn-view"
                          style={{ textDecoration: "none" }}
                        >
                          <span>📄</span> PDF
                        </a>
                      </td>
                    </tr>
                  );
                })}

                {payslips.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                      No payslips computed yet. Click "⚙️ Compute" in the top bar to calculate salary rules for all eligible employees.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessPayrollListView;
