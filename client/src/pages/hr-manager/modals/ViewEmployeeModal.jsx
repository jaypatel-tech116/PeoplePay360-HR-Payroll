import React from "react";

const ViewEmployeeModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div className="hr-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="hr-modal-header">
          <div className="hr-modal-title-group">
            <div className="hr-modal-icon">📇</div>
            <div>
              <h3 className="hr-modal-title">Employee Record</h3>
              <p className="hr-modal-desc">{employee.code} • Detailed Profile</p>
            </div>
          </div>
          <button
            type="button"
            className="hr-modal-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div className="hr-card-avatar" style={{ width: "48px", height: "48px", fontSize: "1.1rem" }}>
              {employee.initials || employee.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: 700 }}>
                {employee.name}
              </h4>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>
                {employee.jobPosition || employee.designation} • {employee.department}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Employee Code</span>
              <strong style={{ fontSize: "0.85rem", color: "#111827" }}>{employee.code}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Status</span>
              <span className={`hr-badge ${employee.status === "Active" ? "hr-badge-green" : "hr-badge-amber"}`}>
                {employee.status}
              </span>
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Employment Type</span>
              <span style={{ fontSize: "0.85rem", color: "#111827" }}>{employee.employeeType || "Full Time"}</span>
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Joining Date</span>
              <span style={{ fontSize: "0.85rem", color: "#111827" }}>{employee.joiningDate || "01 Sep 2023"}</span>
            </div>
          </div>

          <div className="hr-modal-actions">
            <button
              type="button"
              className="hr-btn-primary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;
