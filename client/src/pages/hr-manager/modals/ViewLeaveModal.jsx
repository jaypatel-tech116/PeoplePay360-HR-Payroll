import React from "react";

const ViewLeaveModal = ({ isOpen, onClose, leave, onApprove, onReject }) => {
  if (!isOpen || !leave) return null;

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div className="hr-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="hr-modal-header">
          <div className="hr-modal-title-group">
            <div className="hr-modal-icon">📅</div>
            <div>
              <h3 className="hr-modal-title">Leave Request Details</h3>
              <p className="hr-modal-desc">Review applicant request</p>
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
            <div className="hr-card-avatar" style={{ width: "44px", height: "44px", fontSize: "1rem" }}>
              {leave.employee ? leave.employee.split(" ").map((n) => n[0]).join("") : "LE"}
            </div>
            <div>
              <h4 style={{ margin: "0 0 2px 0", fontSize: "1.05rem", fontWeight: 700 }}>
                {leave.employee}
              </h4>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>
                Applied on: {leave.appliedOn || "Recent"}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Leave Type</span>
              <strong style={{ fontSize: "0.85rem", color: "#111827" }}>{leave.type || leave.leaveType}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Status</span>
              <span className={`hr-badge ${
                leave.status === "Approved" ? "hr-badge-green" :
                leave.status === "Rejected" ? "hr-badge-red" : "hr-badge-amber"
              }`}>
                {leave.status}
              </span>
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Date Range</span>
              <span style={{ fontSize: "0.82rem", color: "#111827" }}>
                {leave.fromDate} to {leave.toDate}
              </span>
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Duration</span>
              <strong style={{ fontSize: "0.85rem", color: "#111827" }}>{leave.duration}</strong>
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Reason for Absence:
            </span>
            <div style={{ background: "#ffffff", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.82rem", color: "#374151" }}>
              {leave.reason || "Family function and personal matters."}
            </div>
          </div>

          <div className="hr-modal-actions" style={{ justifyContent: "space-between" }}>
            {leave.status === "To Approve" ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  style={{
                    backgroundColor: "#10b981",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 14px",
                    fontSize: "0.82rem",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    if (onApprove) onApprove(leave);
                    onClose();
                  }}
                >
                  ✓ Approve
                </button>
                <button
                  type="button"
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 14px",
                    fontSize: "0.82rem",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    if (onReject) onReject(leave);
                    onClose();
                  }}
                >
                  ✕ Reject
                </button>
              </div>
            ) : <div />}
            <button
              type="button"
              className="hr-btn-secondary"
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

export default ViewLeaveModal;
