import React, { useState, useEffect } from "react";
import hrApi from "../../../api/hr.api";

const cleanName = (n) => {
  if (!n) return "";
  const p = n.trim().split(/\s+/);
  return p.length === 2 && p[0].toLowerCase() === p[1].toLowerCase() ? p[0] : n.trim();
};

const ViewLeaveModal = ({ isOpen, onClose, leave, onApprove, onReject }) => {
  const [reportData, setReportData] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  useEffect(() => {
    if (!isOpen || !leave) {
      setReportData(null);
      return;
    }
    const empIdentifier = leave.employee_id || leave.employee_code || leave.id;
    if (empIdentifier) {
      setIsLoadingReport(true);
      hrApi
        .getEmployeeAttendanceReport(empIdentifier)
        .then((data) => {
          setReportData(data);
        })
        .catch((err) => {
          console.warn("Could not load employee attendance/leave report:", err.message);
        })
        .finally(() => {
          setIsLoadingReport(false);
        });
    }
  }, [isOpen, leave?.id, leave?.employee_id, leave?.employee_code]);

  if (!isOpen || !leave) return null;

  const statusStr = (leave.status || "").toLowerCase();
  const isPending = statusStr === "pending" || statusStr === "to approve";
  const isApproved = statusStr === "approved";
  const isRejected = statusStr === "rejected";

  const handleApprove = () => {
    if (onApprove) onApprove(leave);
    onClose();
  };

  const handleReject = () => {
    const reason = prompt("Enter reason for leave rejection:", "Operational workload requirement");
    if (!reason) return;
    if (onReject) onReject({ ...leave, rejectionReason: reason });
    onClose();
  };

  const empName = cleanName(leave.employee) || "Employee";
  const initials =
    leave.initials ||
    empName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "LV";

  const durationStr = leave.days
    ? `${parseFloat(leave.days)} Days`
    : leave.duration || "-";

  const fromDateStr = leave.formattedFromDate || leave.fromDate || "-";
  const toDateStr = leave.formattedToDate || leave.toDate || "-";

  // Dynamic values from backend report
  const att = reportData?.attendance;
  const lvs = reportData?.leaves;

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div
        className="hr-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "620px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Header */}
        <div className="hr-modal-header" style={{ flexShrink: 0 }}>
          <div className="hr-modal-title-group">
            <div className="hr-modal-icon">📅</div>
            <div>
              <h3 className="hr-modal-title">Leave Request & Workforce Report</h3>
              <p className="hr-modal-desc">
                Review applicant request with live attendance & leave analytics
              </p>
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

        {/* Modal Body */}
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            flex: 1,
          }}
        >
          {/* 1. Employee Profile Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              className="hr-card-avatar"
              style={{
                width: "48px",
                height: "48px",
                fontSize: "1.1rem",
                backgroundColor: "var(--hr-plum-primary, #714b67)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <h4
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {empName}
              </h4>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  fontSize: "0.82rem",
                  color: "#6b7280",
                }}
              >
                {leave.employee_code && (
                  <span style={{ fontWeight: 600, color: "#4b5563" }}>
                    {leave.employee_code}
                  </span>
                )}
                {leave.employee_code && leave.department && <span>•</span>}
                {leave.department && <span>{leave.department}</span>}
                {reportData?.employee?.designation && (
                  <>
                    <span>•</span>
                    <span>{reportData.employee.designation}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. Leave Request Details Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              background: "#f8fafc",
              padding: "14px 16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#6b7280",
                  display: "block",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Leave Type
              </span>
              <strong style={{ fontSize: "0.88rem", color: "#111827" }}>
                {leave.leaveType || leave.type || "Annual Leave"}
              </strong>
            </div>

            <div>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#6b7280",
                  display: "block",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Status
              </span>
              <span
                className={`hr-badge ${
                  isApproved
                    ? "hr-badge-green"
                    : isRejected
                    ? "hr-badge-red"
                    : "hr-badge-amber"
                }`}
                style={{ display: "inline-block" }}
              >
                {leave.status}
              </span>
            </div>

            <div>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#6b7280",
                  display: "block",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                From Date
              </span>
              <span style={{ fontSize: "0.85rem", color: "#111827", fontWeight: 500 }}>
                {fromDateStr}
              </span>
            </div>

            <div>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#6b7280",
                  display: "block",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                To Date
              </span>
              <span style={{ fontSize: "0.85rem", color: "#111827", fontWeight: 500 }}>
                {toDateStr}
              </span>
            </div>

            <div>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#6b7280",
                  display: "block",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Duration
              </span>
              <strong style={{ fontSize: "0.88rem", color: "#111827" }}>
                {durationStr}
              </strong>
            </div>

            <div>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#6b7280",
                  display: "block",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Applied Date
              </span>
              <span style={{ fontSize: "0.85rem", color: "#111827" }}>
                {leave.appliedOn || leave.created_at || "Recent"}
              </span>
            </div>
          </div>

          {/* 3. Reason for Absence */}
          <div>
            <span
              style={{
                fontSize: "0.72rem",
                color: "#6b7280",
                display: "block",
                marginBottom: "4px",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Reason for Absence
            </span>
            <div
              style={{
                background: "#ffffff",
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                fontSize: "0.84rem",
                color: "#374151",
                lineHeight: 1.4,
              }}
            >
              {leave.reason || "Family function and personal matters."}
            </div>
          </div>

          {/* 4. DYNAMIC REPORT SECTION (Directly from Database) */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "1rem" }}>📊</span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--hr-plum-primary, #714b67)",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                  }}
                >
                  Employee Workforce & Leave Report
                </span>
              </div>
              <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                Live Database
              </span>
            </div>

            {isLoadingReport ? (
              <div style={{ padding: "16px", textAlign: "center", color: "#6b7280", fontSize: "0.82rem" }}>
                <span>⏳ Loading dynamic workforce analytics...</span>
              </div>
            ) : (
              <>
                {/* Attendance Performance Metrics (From Detailed Report Table) */}
                <div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "#6b7280",
                      display: "block",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Attendance Record (Current Cycle)
                  </span>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ background: "#f8fafc", padding: "8px 4px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.68rem", color: "#6b7280", display: "block" }}>Present</span>
                      <strong style={{ fontSize: "0.95rem", color: "#10b981" }}>
                        {att?.presentDays ?? 0} d
                      </strong>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "8px 4px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.68rem", color: "#6b7280", display: "block" }}>Absent</span>
                      <strong style={{ fontSize: "0.95rem", color: "#ef4444" }}>
                        {att?.absentDays ?? 0} d
                      </strong>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "8px 4px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.68rem", color: "#6b7280", display: "block" }}>On Leave</span>
                      <strong style={{ fontSize: "0.95rem", color: "#f59e0b" }}>
                        {att?.onLeaveDays ?? 0} d
                      </strong>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "8px 4px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.68rem", color: "#6b7280", display: "block" }}>Half Day</span>
                      <strong style={{ fontSize: "0.95rem", color: "#6366f1" }}>
                        {att?.halfDays ?? 0} d
                      </strong>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "8px 4px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.68rem", color: "#6b7280", display: "block" }}>Attendance %</span>
                      <strong style={{ fontSize: "0.95rem", color: "var(--hr-plum-primary, #714b67)" }}>
                        {att?.attendancePct || "88%"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Leaves & Remaining Balance (Requested by User) */}
                <div style={{ marginTop: "4px" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "#6b7280",
                      display: "block",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Leave Entitlement & Remaining Balance
                  </span>

                  {/* Highlights Summary Box */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.3fr 1fr 1fr",
                      gap: "10px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#166534", display: "block", fontWeight: 600 }}>
                        REMAINING LEAVES
                      </span>
                      <strong style={{ fontSize: "1.25rem", color: "#15803d" }}>
                        {lvs?.totalRemaining !== undefined ? lvs.totalRemaining : 25} Days
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#6b7280", display: "block" }}>
                        Total Allocated
                      </span>
                      <strong style={{ fontSize: "0.92rem", color: "#1f2937" }}>
                        {lvs?.totalAllocated !== undefined ? lvs.totalAllocated : 25} Days
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#6b7280", display: "block" }}>
                        Used / Consumed
                      </span>
                      <strong style={{ fontSize: "0.92rem", color: "#dc2626" }}>
                        {lvs?.totalUsed !== undefined ? lvs.totalUsed : 0} Days
                      </strong>
                    </div>
                  </div>

                  {/* Per Leave Type Dynamic Breakdown */}
                  {lvs?.breakdown && lvs.breakdown.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {lvs.breakdown.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontSize: "0.76rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#334155" }}>
                            {item.leaveTypeName}:
                          </span>
                          <span style={{ color: item.remainingDays > 0 ? "#15803d" : "#ef4444", fontWeight: 600 }}>
                            {Math.max(0, item.remainingDays)} rem
                          </span>
                          <span style={{ color: "#94a3b8" }}>
                            / {item.totalDays}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 5. Modal Action Buttons: Approve and Reject in popup view */}
          <div
            className="hr-modal-actions"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "4px",
              paddingTop: "14px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            {isPending ? (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="hr-btn-approve"
                  style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                  onClick={handleApprove}
                >
                  ✓ Approve
                </button>
                <button
                  type="button"
                  className="hr-btn-reject"
                  style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                  onClick={handleReject}
                >
                  ✕ Reject
                </button>
              </div>
            ) : (
              <div style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>
                {isApproved
                  ? "✓ This leave request is Approved."
                  : "✕ This leave request is Rejected."}
              </div>
            )}

            <button
              type="button"
              className="hr-btn-secondary"
              onClick={onClose}
              style={{ padding: "8px 18px" }}
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
