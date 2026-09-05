import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

export default function AddEditSalaryStructureModal({
  isOpen,
  onClose,
  structure = null,
  onSaved,
  readOnly = false,
}) {
  const isCreate = !structure && !readOnly;
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("FT");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg("");
      return;
    }
    if (structure) {
      setName(structure.name || "");
      setCode(structure.code || "");
      setType(structure.type || "FT");
      setDescription(structure.description || "");
      setIsActive(structure.is_active !== undefined ? Boolean(structure.is_active) : true);
    } else {
      setName("");
      setCode("");
      setType("FT");
      setDescription("");
      setIsActive(true);
    }
  }, [isOpen, structure]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Structure Name is required.");
      return;
    }
    if (!code.trim()) {
      setErrorMsg("Structure Code is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        type,
        description: description.trim() || null,
        is_active: isActive,
      };

      if (isCreate) {
        await payrollApi.createSalaryStructure(payload);
      } else {
        await payrollApi.updateSalaryStructure(structure.id, payload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save salary structure.");
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
          maxWidth: "560px",
          width: "90%",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                Payroll Configuration
              </div>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "1.15rem", fontWeight: 700, color: "#1e293b" }}>
                {readOnly ? `Structure Details: ${structure?.name || "View"}` : isCreate ? "Create Salary Structure" : `Edit Structure: ${structure?.name}`}
              </h3>
            </div>
            {readOnly && (
              <span
                style={{
                  fontSize: "0.74rem",
                  color: "#475569",
                  background: "#e2e8f0",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  marginLeft: "10px",
                }}
              >
                🔒 Read-Only
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: "transparent", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}
          >
            ✕
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div
            style={{
              margin: "16px 24px 0 24px",
              padding: "10px 14px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              color: "#dc2626",
              fontSize: "0.85rem",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              Structure Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              disabled={readOnly}
              placeholder="e.g. Regular Full-Time Structure"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.88rem",
                boxSizing: "border-box",
                backgroundColor: readOnly ? "#f8fafc" : "#ffffff",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Code <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                disabled={!isCreate || readOnly}
                placeholder="e.g. REG_SAL"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  backgroundColor: !isCreate || readOnly ? "#f8fafc" : "#ffffff",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Employment Type
              </label>
              <select
                value={type}
                disabled={readOnly}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.88rem",
                  boxSizing: "border-box",
                  backgroundColor: readOnly ? "#f8fafc" : "#ffffff",
                }}
              >
                <option value="FT">Full Time (FT)</option>
                <option value="PT">Part Time (PT)</option>
                <option value="EXEC">Executive (EXEC)</option>
                <option value="CONTRACT">Contractual</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              Description
            </label>
            <textarea
              rows={2}
              disabled={readOnly}
              placeholder="Standard salary structure package and component rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                boxSizing: "border-box",
                resize: "vertical",
                backgroundColor: readOnly ? "#f8fafc" : "#ffffff",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="isActiveStruct"
              disabled={readOnly}
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "var(--hr-plum-primary, #714b67)" }}
            />
            <label htmlFor="isActiveStruct" style={{ fontSize: "0.84rem", color: "#334155", fontWeight: 500, cursor: readOnly ? "default" : "pointer" }}>
              Active (Available for contracts and payruns)
            </label>
          </div>

          {/* Actions */}
          <div
            style={{
              marginTop: "10px",
              paddingTop: "14px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            {readOnly ? (
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "7px 22px",
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
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "7px 18px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "7px 22px",
                    borderRadius: "6px",
                    border: "none",
                    background: "var(--hr-plum-primary, #714b67)",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Saving..." : isCreate ? "Create Structure" : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
