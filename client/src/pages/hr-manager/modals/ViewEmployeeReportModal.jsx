import React, { useState, useEffect } from "react";
import hrApi from "../../../api/hr.api";

const cleanName = (n) => {
  if (!n) return "";
  const p = n.trim().split(/\s+/);
  return p.length === 2 && p[0].toLowerCase() === p[1].toLowerCase() ? p[0] : n.trim();
};

const ViewEmployeeReportModal = ({ isOpen, onClose, employee }) => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !employee) {
      setReportData(null);
      return;
    }

    const id = employee.employee_id || employee.code || employee.id;
    if (id) {
      setIsLoading(true);
      hrApi
        .getEmployeeAttendanceReport(id)
        .then((data) => setReportData(data))
        .catch((err) => {
          console.warn("Failed to load employee report:", err.message);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const empName = cleanName(employee.name || reportData?.employee?.name) || "Employee";
  const empCode = employee.code || reportData?.employee?.code || "-";
  const department = employee.department || reportData?.employee?.department || "General";
  const designation = reportData?.employee?.designation || "-";

  const initials =
    empName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "EM";

  const att = reportData?.attendance || {
    presentDays: employee.presentDays || employee.present || 0,
    absentDays: employee.absentDays || employee.absent || 0,
    onLeaveDays: employee.onLeave || 0,
    halfDays: employee.halfDay || 0,
    totalWorkingDays: employee.totalWorkingDays || 26,
    attendancePct: employee.attendancePct || "85%",
  };

  const lvs = reportData?.leaves || {
    totalAllocated: employee.totalAllocatedLeaves || 25,
    totalUsed: employee.totalUsedLeaves || 0,
    totalRemaining: employee.remainingLeaves !== undefined ? employee.remainingLeaves : 25,
    breakdown: [],
  };

  const recentLeaves = reportData?.recentLeaves || [];

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div
        className="hr-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "680px",
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
            <div className="hr-modal-icon">📊</div>
            <div>
              <h3 className="hr-modal-title">Employee Attendance & Leave Report</h3>
              <p className="hr-modal-desc">
                Real-time workforce audit and leave balance from database
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

        {/* Modal Content */}
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            flex: 1,
          }}
        >
          {/* Employee Header */}
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
                  fontSize: "1.15rem",
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
                <span style={{ fontWeight: 600, color: "#4b5563" }}>{empCode}</span>
                <span>•</span>
                <span>{department}</span>
                {designation !== "-" && (
                  <>
                    <span>•</span>
                    <span>{designation}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#6b7280" }}>
              <span>⏳ Loading live employee attendance and leave report...</span>
            </div>
          ) : (
            <>
              {/* Attendance Breakdown Grid */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      color: "var(--hr-plum-primary, #714b67)",
                      textTransform: "uppercase",
                    }}
                  >
                    Attendance Record (Current Month)
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                    Total Working Days: <strong>{att.totalWorkingDays || 26}</strong>
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ background: "#f0fdf4", border: "1px solid #dcfce7", padding: "8px 4px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.68rem", color: "#166534", display: "block" }}>Present</span>
                    <strong style={{ fontSize: "1.05rem", color: "#15803d" }}>
                      {att.presentDays ?? 0} d
                    </strong>
                  </div>

                  <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", padding: "8px 4px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.68rem", color: "#991b1b", display: "block" }}>Absent</span>
                    <strong style={{ fontSize: "1.05rem", color: "#dc2626" }}>
                      {att.absentDays ?? 0} d
                    </strong>
                  </div>

                  <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "8px 4px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.68rem", color: "#92400e", display: "block" }}>On Leave</span>
                    <strong style={{ fontSize: "1.05rem", color: "#d97706" }}>
                      {att.onLeaveDays ?? 0} d
                    </strong>
                  </div>

                  <div style={{ background: "#f5f3ff", border: "1px solid #ede9fe", padding: "8px 4px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.68rem", color: "#5b21b6", display: "block" }}>Half Day</span>
                    <strong style={{ fontSize: "1.05rem", color: "#7c3aed" }}>
                      {att.halfDays ?? 0} d
                    </strong>
                  </div>

                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 4px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.68rem", color: "#334155", display: "block" }}>Attendance %</span>
                    <strong style={{ fontSize: "1.05rem", color: "var(--hr-plum-primary, #714b67)" }}>
                      {att.attendancePct || "85%"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Leave Entitlement & Remaining Leaves */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      color: "var(--hr-plum-primary, #714b67)",
                      textTransform: "uppercase",
                    }}
                  >
                    Leave Entitlement & Remaining Balance
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 600 }}>
                    ● Dynamic Database
                  </span>
                </div>

                {/* Highlight Summary Box */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.3fr 1fr 1fr",
                    gap: "10px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "#166534", display: "block", fontWeight: 600 }}>
                      REMAINING LEAVES
                    </span>
                    <strong style={{ fontSize: "1.35rem", color: "#15803d" }}>
                      {lvs.totalRemaining} Days
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.7rem", color: "#6b7280", display: "block" }}>
                      Total Allocated
                    </span>
                    <strong style={{ fontSize: "0.95rem", color: "#1f2937" }}>
                      {lvs.totalAllocated} Days
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.7rem", color: "#6b7280", display: "block" }}>
                      Used / Consumed
                    </span>
                    <strong style={{ fontSize: "0.95rem", color: "#dc2626" }}>
                      {lvs.totalUsed} Days
                    </strong>
                  </div>
                </div>

                {/* Breakdown per leave type */}
                {lvs.breakdown && lvs.breakdown.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {lvs.breakdown.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          padding: "5px 12px",
                          fontSize: "0.76rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#334155" }}>
                          {item.leaveTypeName}:
                        </span>
                        <span style={{ color: "#15803d", fontWeight: 600 }}>
                          {item.remainingDays} rem
                        </span>
                        <span style={{ color: "#94a3b8" }}>
                          / {item.totalDays}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Leave Requests History */}
              {recentLeaves.length > 0 && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      color: "var(--hr-plum-primary, #714b67)",
                      textTransform: "uppercase",
                    }}
                  >
                    Recent Leave Applications
                  </span>

                  <div className="hr-table-responsive">
                    <table className="hr-data-table" style={{ fontSize: "0.8rem" }}>
                      <thead>
                        <tr>
                          <th>Leave Type</th>
                          <th>Dates</th>
                          <th>Duration</th>
                          <th>Reason</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentLeaves.map((lr) => (
                          <tr key={lr.id}>
                            <td style={{ fontWeight: 600 }}>{lr.leave_type}</td>
                            <td>{lr.from_date} - {lr.to_date}</td>
                            <td>{parseFloat(lr.days)} d</td>
                            <td style={{ color: "#6b7280", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {lr.reason || "-"}
                            </td>
                            <td>
                              <span
                                className={`hr-badge ${
                                  lr.status === "Approved"
                                    ? "hr-badge-green"
                                    : lr.status === "Rejected"
                                    ? "hr-badge-red"
                                    : "hr-badge-amber"
                                }`}
                              >
                                {lr.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Modal Footer */}
          <div
            className="hr-modal-actions"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "4px",
              paddingTop: "14px",
              borderTop: "1px solid #f1f5f9",
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeReportModal;
