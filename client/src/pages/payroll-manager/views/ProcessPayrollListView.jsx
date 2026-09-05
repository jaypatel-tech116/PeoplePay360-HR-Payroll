import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

const ProcessPayrollListView = ({ cycle, onProceedToVerify }) => {
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
        const details = await payrollApi.getPayrunById(targetId);
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
  const isComputed = status === "Computed" || status === "Validated" || status === "Completed" || status === "Paid";
  const isValidated = status === "Validated" || status === "Completed" || status === "Paid";
  const isPaid = status === "Completed" || status === "Paid";

  const grossNum = parseFloat(payrun?.total_gross) || 0;
  const netNum = parseFloat(payrun?.total_net) || 0;
  const payslips = payrun?.payslips || [];

  return (
    <div className="mgr-content-body">
      {/* 1. Header & Primary Action Bar */}
      <div className="mgr-page-header" style={{ alignItems: "flex-start" }}>
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
              ? `Period: ${new Date(payrun.period_start).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} – ${new Date(payrun.period_end).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} • Structure: ${payrun?.salary_structure_name || "Default Structure"}`
              : "Synchronized live payroll execution"}
          </p>
        </div>

        {/* Action Button Hierarchy */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Primary: Compute */}
          <button
            type="button"
            className="mgr-btn-primary"
            onClick={handleCompute}
            disabled={actionLoading || isPaid}
            title="Compute salary components and rule calculations"
          >
            <span>⚙️</span> Compute
          </button>

          {/* Secondary: Validate */}
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={handleValidate}
            disabled={actionLoading || !isComputed || isPaid}
            title="Validate pre-payroll audit and calculations"
          >
            <span>✓</span> Validate
          </button>

          {/* Success: Mark Paid */}
          <button
            type="button"
            onClick={handleMarkPaid}
            disabled={actionLoading || !isValidated || isPaid}
            style={{
              backgroundColor: isPaid ? "#9ca3af" : "#059669",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "7px 16px",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: isPaid ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
            title="Confirm disbursement and finalize payrun"
          >
            <span>🏦</span> {isPaid ? "Paid & Finalized" : "Mark Paid"}
          </button>

          {/* Outline: Send Payslips */}
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={handleSendPayslips}
            disabled={actionLoading || !isComputed}
            title="Email payslips to all employees"
          >
            <span>✉️</span> Send Payslips
          </button>

          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={loadPayrunData}
            title="Refresh"
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

      {/* 2. Horizontal Status Progression Bar */}
      <div
        className="mgr-section-card"
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          marginBottom: "16px",
        }}
      >
        {[
          { label: "Draft", active: true },
          { label: "Processing", active: true },
          { label: "Computed", active: isComputed },
          { label: "Validated", active: isValidated },
          { label: "Paid", active: isPaid },
        ].map((step, idx, arr) => (
          <React.Fragment key={idx}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  backgroundColor: step.active ? "var(--mgr-plum-primary)" : "#e2e8f0",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {step.active ? "✓" : idx + 1}
              </div>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: step.active ? 700 : 500,
                  color: step.active ? "var(--mgr-plum-primary)" : "#64748b",
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < arr.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  backgroundColor: step.active ? "var(--mgr-plum-primary)" : "#e2e8f0",
                  margin: "0 12px",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 3. Summary Cards */}
      <div className="mgr-kpi-grid" style={{ marginBottom: "16px" }}>
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
          <div className="mgr-kpi-val" style={{ fontSize: "1.3rem" }}>
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
                    <tr key={slip.id || index}>
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
