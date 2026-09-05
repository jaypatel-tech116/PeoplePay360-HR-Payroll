import React, { useState, useEffect } from "react";
import hrApi from "../../../api/hr.api";

const TimeOffTypeModal = ({
  isOpen,
  onClose,
  leaveType = null, // null if creating new, or object if editing
  onSaved,
}) => {
  const [allTypes, setAllTypes] = useState([]);
  const [currentType, setCurrentType] = useState(leaveType);
  const [isEditing, setIsEditing] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [unit, setUnit] = useState("Days");
  const [requiresAllocation, setRequiresAllocation] = useState("Yes");
  const [active, setActive] = useState("True");
  const [approval, setApproval] = useState("Manager");
  const [payrollWorkEntry, setPayrollWorkEntry] = useState("Leave Work Entry");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const populateForm = (lt, editMode = false) => {
    setCurrentType(lt);
    setIsEditing(editMode);
    if (lt) {
      setTypeName(lt.name || "");
      setUnit(lt.unit === "HOURS" ? "Hours" : "Days");
      setRequiresAllocation(lt.requires_allocation ? "Yes" : "No");
      setActive(lt.is_active ? "True" : "False");
      setApproval(lt.approval_type || "Manager");
      setPayrollWorkEntry(lt.work_entry_type || "Leave Work Entry");
      setNotes(
        lt.notes ||
          "Standard annual leave. Balance comes from approved allocations."
      );
    } else {
      setTypeName("Paid Time Off");
      setUnit("Days");
      setRequiresAllocation("Yes");
      setActive("True");
      setApproval("Manager");
      setPayrollWorkEntry("Leave Work Entry");
      setNotes("Standard annual leave. Balance comes from approved allocations.");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg("");
      return;
    }

    // Fetch all leave types to populate switcher
    hrApi.getLeaveTypes().then((res) => {
      const list = Array.isArray(res) ? res : res?.leave_types || [];
      setAllTypes(list);
      
      // Determine initial selection
      if (leaveType) {
        populateForm(leaveType, false);
      } else {
        const pto = list.find((t) => t.name?.toLowerCase().includes("paid time off"));
        if (pto) {
          populateForm(pto, false);
        } else if (list.length > 0) {
          populateForm(list[0], false);
        } else {
          populateForm(null, true);
        }
      }
    }).catch(() => {
      populateForm(leaveType, !leaveType);
    });
  }, [isOpen, leaveType]);

  if (!isOpen) return null;

  const handleSelectType = (typeId) => {
    if (typeId === "new") {
      populateForm(null, true);
    } else {
      const found = allTypes.find((t) => String(t.id) === String(typeId));
      if (found) {
        populateForm(found, false);
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!typeName.trim()) {
      setErrorMsg("Type Name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        name: typeName.trim(),
        unit: unit,
        requires_allocation: requiresAllocation === "Yes",
        is_active: active === "True",
        approval_type: approval,
        work_entry_type: payrollWorkEntry,
        notes: notes,
      };

      if (currentType && currentType.id) {
        await hrApi.updateLeaveType(currentType.id, payload);
        alert(`Time Off Type "${typeName}" updated successfully.`);
      } else {
        await hrApi.createLeaveType(payload);
        alert(
          `Time Off Type "${typeName}" created successfully and allocated to employees.`
        );
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to save Time Off Type."
      );
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
          maxWidth: "720px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "24px 28px",
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Top Header & Breadcrumb from Image */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "14px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.45rem",
                fontWeight: 700,
                color: "#1e293b",
                margin: "0 0 4px 0",
                letterSpacing: "-0.02em",
              }}
            >
              Time Off Type / {typeName || "New"}
            </h2>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              Form view of one time off type
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {allTypes.length > 0 && (
              <select
                value={currentType?.id || "new"}
                onChange={(e) => handleSelectType(e.target.value)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  color: "#1e293b",
                  background: "#f8fafc",
                  cursor: "pointer",
                }}
              >
                <option value="new">+ New Leave Type</option>
                {allTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              className="hr-modal-close-btn"
              onClick={onClose}
              style={{ fontSize: "1.1rem" }}
            >
              ✕
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#dc2626",
              fontSize: "0.85rem",
              marginBottom: "16px",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Action Button: EDIT / SAVE matching the sketch */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          {!isEditing ? (
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
                  padding: "7px 22px",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: isSubmitting ? "wait" : "pointer",
                  boxShadow: "0 2px 4px rgba(113, 75, 103, 0.3)",
                }}
              >
                {isSubmitting ? "Saving..." : "SAVE"}
              </button>
              {currentType && (
                <button
                  type="button"
                  onClick={() => populateForm(currentType, false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "6px 16px",
                    fontSize: "0.86rem",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  Discard
                </button>
              )}
            </>
          )}
        </div>

        {/* Form Fields: Two Columns layout matching the image */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              columnGap: "32px",
              rowGap: "18px",
              marginBottom: "24px",
            }}
          >
            {/* Left Column 1: Type Name */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Type Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="e.g. Paid Time Off"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.88rem",
                  color: "#1e293b",
                  backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                  outline: "none",
                }}
                required
              />
            </div>

            {/* Right Column 1: Approval */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Approval
              </label>
              <select
                disabled={!isEditing}
                value={approval}
                onChange={(e) => setApproval(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.88rem",
                  color: "#1e293b",
                  backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                  outline: "none",
                }}
              >
                <option value="Manager">Manager</option>
                <option value="By Time Off Officer">By Time Off Officer</option>
                <option value="By Employee's Approver">By Employee's Approver</option>
                <option value="No Validation">No Validation</option>
              </select>
            </div>

            {/* Left Column 2: Unit */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Unit
              </label>
              <select
                disabled={!isEditing}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.88rem",
                  color: "#1e293b",
                  backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                  outline: "none",
                }}
              >
                <option value="Days">Days</option>
                <option value="Hours">Hours</option>
              </select>
            </div>

            {/* Right Column 2: Payroll / Work Entry */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Payroll / Work Entry
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={payrollWorkEntry}
                onChange={(e) => setPayrollWorkEntry(e.target.value)}
                placeholder="Leave Work Entry"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.88rem",
                  color: "#1e293b",
                  backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                  outline: "none",
                }}
              />
            </div>

            {/* Left Column 3: Requires Allocation */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Requires Allocation
              </label>
              <select
                disabled={!isEditing}
                value={requiresAllocation}
                onChange={(e) => setRequiresAllocation(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.88rem",
                  color: "#1e293b",
                  backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                  outline: "none",
                }}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Left Column 4: Active */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Active
              </label>
              <select
                disabled={!isEditing}
                value={active}
                onChange={(e) => setActive(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.88rem",
                  color: "#1e293b",
                  backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                  outline: "none",
                }}
              >
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            </div>
          </div>

          {/* Bottom Card: Configuration Notes matching image */}
          <div
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              padding: "16px 20px",
              backgroundColor: "#ffffff",
              marginBottom: "14px",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "0.84rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "8px",
              }}
            >
              Configuration Notes
            </label>
            <textarea
              disabled={!isEditing}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Standard annual leave. Balance comes from approved allocations."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                fontSize: "0.88rem",
                color: "#1e293b",
                backgroundColor: isEditing ? "#ffffff" : "#f8fafc",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Bottom Useful Note matching image */}
          <p
            style={{
              fontSize: "0.8rem",
              color: "#64748b",
              fontStyle: "italic",
              margin: "0 0 20px 4px",
            }}
          >
            Useful note: Time Off Type drives approval behavior and whether a request needs an allocation.
          </p>

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              borderTop: "1px solid #f1f5f9",
              paddingTop: "16px",
            }}
          >
            <button
              type="button"
              className="hr-btn-secondary"
              onClick={onClose}
              style={{ padding: "8px 20px" }}
            >
              Close
            </button>
            {isEditing && (
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: "var(--hr-plum-primary, #714b67)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 24px",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: isSubmitting ? "wait" : "pointer",
                }}
              >
                {isSubmitting ? "Saving..." : "Save Time Off Type"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeOffTypeModal;
