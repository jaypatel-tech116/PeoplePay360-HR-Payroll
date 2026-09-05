import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

export default function AddEditSalaryRuleModal({
  isOpen,
  onClose,
  rule = null,
  structures = [],
  onSaved,
  readOnly = false,
}) {
  const isCreate = !rule && !readOnly;
  const [isEditing, setIsEditing] = useState(isCreate && !readOnly);

  // Form fields
  const [ruleName, setRuleName] = useState("");
  const [structureId, setStructureId] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("BASIC");
  const [sequence, setSequence] = useState(1);
  const [quantity, setQuantity] = useState(1.0);
  const [computation, setComputation] = useState("PERCENTAGE"); // FIXED | PERCENTAGE | FORMULA
  
  // Specific computation values
  const [fixedAmount, setFixedAmount] = useState(0);
  const [percentage, setPercentage] = useState(50);
  const [percentageBase, setPercentageBase] = useState("WAGE"); // WAGE | BASIC | GROSS
  const [formula, setFormula] = useState("");

  // Formula validation state
  const [sampleWage, setSampleWage] = useState(50000);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg("");
      setValidationResult(null);
      return;
    }

    if (rule) {
      setIsEditing(false);
      setRuleName(rule.name || "");
      setStructureId(rule.salary_structure_id || (structures[0]?.id || 1));
      setCode(rule.code || "");
      setCategory(rule.category || "BASIC");
      setSequence(rule.sequence !== undefined ? rule.sequence : 1);
      setQuantity(rule.quantity !== undefined ? rule.quantity : 1.0);
      setComputation(rule.calculation_type || "FIXED");
      setFixedAmount(rule.fixed_amount || 0);
      setPercentage(rule.percentage || 0);
      setPercentageBase(rule.formula && ["WAGE", "BASIC", "GROSS"].includes(rule.formula.toUpperCase()) ? rule.formula.toUpperCase() : "WAGE");
      setFormula(rule.formula || "");
    } else {
      setIsEditing(!readOnly);
      setRuleName("");
      setStructureId(structures[0]?.id || 1);
      setCode("");
      setCategory("BASIC");
      setSequence(10);
      setQuantity(1.0);
      setComputation("PERCENTAGE");
      setFixedAmount(0);
      setPercentage(50);
      setPercentageBase("WAGE");
      setFormula("BASIC * 0.40");
    }
    if (readOnly) {
      setIsEditing(false);
    }
  }, [isOpen, rule, structures, readOnly]);

  if (!isOpen) return null;

  // Insert variable into formula textarea
  const insertVariable = (varName) => {
    if (!isEditing) return;
    setFormula((prev) => {
      const trimmed = (prev || "").trim();
      if (!trimmed) return varName;
      return `${trimmed} ${varName}`;
    });
    setValidationResult(null);
  };

  // Dry run formula test
  const handleTestFormula = async () => {
    if (!formula.trim()) {
      setValidationResult({ isValid: false, error: "Please enter a formula to test." });
      return;
    }
    setIsValidating(true);
    setValidationResult(null);
    try {
      const res = await payrollApi.validateFormula(formula, sampleWage);
      if (res?.success) {
        setValidationResult({
          isValid: true,
          sampleResult: res.data?.sampleResult,
          variablesUsed: res.data?.variablesUsed || [],
          normalizedFormula: res.data?.normalizedFormula,
        });
      } else {
        setValidationResult({
          isValid: false,
          error: res?.message || "Invalid formula syntax",
        });
      }
    } catch (err) {
      setValidationResult({
        isValid: false,
        error: err.response?.data?.message || err.message || "Failed to evaluate formula",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!ruleName.trim()) {
      setErrorMsg("Rule Name is required.");
      return;
    }
    if (!code.trim()) {
      setErrorMsg("Rule Code is required.");
      return;
    }
    if (!structureId) {
      setErrorMsg("Please select a Salary Structure.");
      return;
    }

    // Validate formula if mode is FORMULA
    if (computation === "FORMULA") {
      if (!formula.trim()) {
        setErrorMsg("Formula expression cannot be empty.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        salary_structure_id: Number(structureId),
        name: ruleName.trim(),
        code: code.trim().toUpperCase(),
        category,
        sequence: Number(sequence) || 1,
        quantity: Number(quantity) || 1.0,
        calculation_type: computation,
        fixed_amount: computation === "FIXED" ? Number(fixedAmount) || 0 : null,
        percentage: computation === "PERCENTAGE" ? Number(percentage) || 0 : null,
        formula: computation === "FORMULA" ? formula.trim() : (computation === "PERCENTAGE" ? percentageBase : null),
      };

      if (isCreate) {
        await payrollApi.createSalaryRule(payload);
      } else {
        await payrollApi.updateSalaryRule(rule.id, payload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save salary rule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div
        className="hr-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "760px",
          width: "95%",
          maxHeight: "92vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* 1. Modal Top Bar (Odoo Breadcrumbs & Status) */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f8fafc",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          <div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
              HR / Payroll / Salary Rules
            </div>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "1.2rem", fontWeight: 700, color: "#1e293b" }}>
              {isCreate ? "New Salary Rule" : `Salary Rule / ${ruleName || code || "Detail"}`}
            </h3>
            <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
              {readOnly ? "View Details (Read-Only)" : "Form view"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {readOnly ? (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#475569",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "#e2e8f0",
                  padding: "4px 10px",
                  borderRadius: "12px",
                }}
              >
                <span>🔒</span> Read-Only View
              </span>
            ) : (
              <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                Live Database
              </span>
            )}
            <button
              type="button"
              className="hr-modal-close-btn"
              onClick={onClose}
              style={{ background: "transparent", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. Error Message Banner */}
        {errorMsg && (
          <div
            style={{
              margin: "16px 24px 0 24px",
              padding: "10px 16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#dc2626",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 3. Action Toolbar: EDIT / SAVE / CANCEL */}
        <div style={{ padding: "16px 24px 0 24px", display: "flex", gap: "10px" }}>
          {readOnly ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#475569",
                fontSize: "0.82rem",
                background: "#f1f5f9",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                width: "100%",
              }}
            >
              <span style={{ fontSize: "1rem" }}>🔒</span>
              <span>
                <strong>Read-Only Mode:</strong> Salary rule calculation parameters and formulas are view-only for HR Payroll Users. Rule modifications are restricted to HR Payroll Managers.
              </span>
            </div>
          ) : !isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                backgroundColor: "#ffffff",
                border: "1.5px solid #cbd5e1",
                borderRadius: "6px",
                padding: "6px 22px",
                fontSize: "0.86rem",
                fontWeight: 700,
                color: "#1e293b",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                letterSpacing: "0.03em",
              }}
            >
              EDIT
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  backgroundColor: "var(--hr-plum-primary, #714b67)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "7px 24px",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {isSubmitting ? "SAVING..." : "SAVE"}
              </button>
              {!isCreate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setErrorMsg("");
                  }}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "7px 18px",
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  DISCARD
                </button>
              )}
            </>
          )}
        </div>

        {/* 4. Form Fields Grid (Exactly matching Odoo mockup) */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px 32px",
              background: "#ffffff",
            }}
          >
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Rule Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Rule Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="e.g. Basic Salary"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                    color: "#1e293b",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Code */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Code <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  disabled={!isEditing || !isCreate}
                  placeholder="e.g. BASIC"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    backgroundColor: isEditing && isCreate ? "#ffffff" : "#f8fafc",
                    color: "#1e293b",
                    textTransform: "uppercase",
                    boxSizing: "border-box",
                  }}
                />
                {!isCreate && (
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px", display: "block" }}>
                    Code is a permanent system identifier
                  </span>
                )}
              </div>

              {/* Category */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Category <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  disabled={!isEditing}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                    color: "#1e293b",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="BASIC">Basic</option>
                  <option value="ALLOWANCE">Allowance</option>
                  <option value="GROSS">Gross</option>
                  <option value="DEDUCTION">Deduction</option>
                  <option value="CONTRIBUTION">Contribution</option>
                  <option value="NET">Net</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Sequence */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Sequence (Order of Execution)
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  disabled={!isEditing}
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                    color: "#1e293b",
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px", display: "block" }}>
                  Rules execute in ascending sequence order (e.g. Basic: 1, HRA: 2, Gross: 10, PF: 20, Net: 99)
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Salary Structure */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Salary Structure <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  disabled={!isEditing}
                  value={structureId}
                  onChange={(e) => setStructureId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                    color: "#1e293b",
                    boxSizing: "border-box",
                  }}
                >
                  {structures.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Computation Method */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Computation Method <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  disabled={!isEditing}
                  value={computation}
                  onChange={(e) => {
                    setComputation(e.target.value);
                    setValidationResult(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                    color: "#1e293b",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="PERCENTAGE">Percentage of Wage</option>
                  <option value="FIXED">Fixed Amount</option>
                  <option value="FORMULA">Python Code / Formula</option>
                </select>
              </div>

              {/* Dynamic inputs based on computation */}
              {computation === "PERCENTAGE" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      disabled={!isEditing}
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      placeholder="e.g. 50"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.88rem",
                        backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Percentage Base
                    </label>
                    <select
                      disabled={!isEditing}
                      value={percentageBase}
                      onChange={(e) => setPercentageBase(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.88rem",
                        backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="WAGE">Contract Wage</option>
                      <option value="BASIC">Basic Salary</option>
                      <option value="GROSS">Gross Salary</option>
                    </select>
                  </div>
                </div>
              )}

              {computation === "FIXED" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Fixed Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isEditing}
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                    placeholder="e.g. 2000"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.88rem",
                      backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              {/* Quantity */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Quantity
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isEditing}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                    color: "#1e293b",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          {/* 5. Computation Options Sandbox Box (Replica of Sketch Tabbed Card) */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--hr-plum-primary, #714b67)", textTransform: "uppercase" }}>
                Computation options from the source
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                {["Fixed Amount", "Percentage of Wage", "Python Code"].map((tab) => {
                  const mappedType = tab === "Fixed Amount" ? "FIXED" : tab === "Percentage of Wage" ? "PERCENTAGE" : "FORMULA";
                  const isCurrent = computation === mappedType;
                  return (
                    <button
                      key={tab}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => {
                        setComputation(mappedType);
                        setValidationResult(null);
                      }}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "0.76rem",
                        fontWeight: 600,
                        border: isCurrent ? "1px solid var(--hr-plum-primary, #714b67)" : "1px solid #cbd5e1",
                        background: isCurrent ? "var(--hr-plum-primary, #714b67)" : "#ffffff",
                        color: isCurrent ? "#ffffff" : "#475569",
                        cursor: isEditing ? "pointer" : "default",
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formula / Python Code Textarea & Variable Chips */}
            {computation === "FORMULA" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Clickable Variable Helpers */}
                {isEditing && (
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block", marginBottom: "4px" }}>
                      Click to insert variable into expression:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {[
                        "WAGE",
                        "BASIC",
                        "GROSS",
                        "PAID_DAYS",
                        "WORKED_DAYS",
                        "SCHEDULED_DAYS",
                        "LOP_DAYS",
                        "OVERTIME_HOURS",
                        "min()",
                        "max()",
                        "round()",
                      ].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          style={{
                            background: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontSize: "0.72rem",
                            color: "#334155",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          + {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formula Text Area */}
                <div>
                  <textarea
                    rows={3}
                    disabled={!isEditing}
                    placeholder="Example expression: result = categories['BASIC'] * 0.40 or (WAGE / 30) * PAID_DAYS"
                    value={formula}
                    onChange={(e) => {
                      setFormula(e.target.value);
                      setValidationResult(null);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      backgroundColor: isEditing ? "#ffffff" : "#f1f5f9",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Real-time Sandbox Live Tester */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569" }}>
                    🧪 Live Test Sandbox:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.74rem", color: "#64748b" }}>Test Wage (₹):</span>
                    <input
                      type="number"
                      value={sampleWage}
                      onChange={(e) => setSampleWage(e.target.value)}
                      style={{
                        width: "90px",
                        padding: "3px 6px",
                        borderRadius: "4px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.76rem",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleTestFormula}
                    disabled={isValidating}
                    style={{
                      background: "#0284c7",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 12px",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {isValidating ? "Validating..." : "Test Formula"}
                  </button>

                  {/* Feedback Badge */}
                  {validationResult && (
                    <div style={{ marginLeft: "auto", fontSize: "0.78rem" }}>
                      {validationResult.isValid ? (
                        <span style={{ color: "#15803d", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>✅ Valid:</span>
                          <span style={{ background: "#dcfce7", padding: "2px 8px", borderRadius: "4px" }}>
                            ₹ {Number(validationResult.sampleResult || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: "#dc2626", fontWeight: 600 }}>
                          ❌ {validationResult.error}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "0.82rem", color: "#64748b", fontStyle: "italic", background: "#ffffff", padding: "10px 14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                {computation === "FIXED"
                  ? `Fixed Amount of ₹${fixedAmount} will be directly added/deducted on each calculated payslip.`
                  : `Percentage Rule: ${percentage}% calculated against ${percentageBase === "WAGE" ? "Contract Wage" : percentageBase === "BASIC" ? "Basic Salary" : "Gross Salary"}.`}
              </div>
            )}

            <div style={{ fontSize: "0.72rem", color: "#64748b", borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
              <strong>Useful note:</strong> A Salary Rule needs a clear computation method and category because these drive the lines displayed on the final payslip.
            </div>
          </div>
        </div>

        {/* 6. Footer Close */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: "#f8fafc",
            borderBottomLeftRadius: "12px",
            borderBottomRightRadius: "12px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "7px 20px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
