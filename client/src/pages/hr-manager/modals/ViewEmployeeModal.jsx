import React, { useState, useEffect } from "react";
import hrApi from "../../../api/hr.api";

/** Clean duplicate first/last name */
const cleanName = (name) => {
  if (!name) return "Employee";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
    return parts[0];
  }
  return name.trim();
};

const ViewEmployeeModal = ({ isOpen, onClose, employee }) => {
  const [empAttendance, setEmpAttendance] = useState([]);
  const [loadingAtt, setLoadingAtt] = useState(false);

  useEffect(() => {
    if (!isOpen || !employee) return;
    const fetchAttendance = async () => {
      try {
        setLoadingAtt(true);
        const empId = employee.id || employee.employee_id;
        const res = await hrApi.getAttendance({ employee_id: empId });
        setEmpAttendance(Array.isArray(res) ? res.slice(0, 5) : []);
      } catch (err) {
        console.error("Failed to load employee attendance:", err);
      } finally {
        setLoadingAtt(false);
      }
    };
    fetchAttendance();
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const displayName = cleanName(employee.name);

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div className="hr-modal-card" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
        <div className="hr-modal-header">
          <div className="hr-modal-title-group">
            <div className="hr-modal-icon">📇</div>
            <div>
              <h3 className="hr-modal-title">Employee Record</h3>
              <p className="hr-modal-desc">{employee.code || employee.employee_code} • Detailed Profile & Attendance</p>
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
          {/* Header row with Avatar & Job */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div className="hr-card-avatar" style={{ width: "48px", height: "48px", fontSize: "1.1rem" }}>
              {employee.initials || displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>
                {displayName}
              </h4>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>
                {employee.jobPosition || employee.designation || "Staff"} • {employee.department || "General"}
              </p>
            </div>
          </div>

          {/* Quick Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Employee Code</span>
              <strong style={{ fontSize: "0.85rem", color: "#111827" }}>{employee.code || employee.employee_code}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Status</span>
              <span className={`hr-badge ${employee.status === "ACTIVE" || employee.status === "Active" ? "hr-badge-green" : "hr-badge-amber"}`}>
                {employee.status}
              </span>
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Employment Type</span>
              <span style={{ fontSize: "0.85rem", color: "#111827" }}>{employee.employeeType || "Full Time"}</span>
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Joining Date</span>
              <span style={{ fontSize: "0.85rem", color: "#111827" }}>{employee.formattedJoiningDate || employee.joiningDate || "01 Sep 2023"}</span>
            </div>
          </div>

          {/* Employee Attendance Section */}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e1b4b" }}>
                ⏱️ Recent Attendance History
              </span>
              <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                {empAttendance.length} records found
              </span>
            </div>

            {loadingAtt ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: "0.8rem", color: "#9ca3af" }}>
                Loading attendance...
              </div>
            ) : empAttendance.length === 0 ? (
              <div style={{ padding: "14px", background: "#f9fafb", borderRadius: "6px", textAlign: "center", fontSize: "0.8rem", color: "#9ca3af" }}>
                No attendance logs found for this employee yet.
              </div>
            ) : (
              <div style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                <table style={{ width: "100%", fontSize: "0.78rem", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    <tr>
                      <th style={{ padding: "6px 8px" }}>Date</th>
                      <th style={{ padding: "6px 8px" }}>In</th>
                      <th style={{ padding: "6px 8px" }}>Out</th>
                      <th style={{ padding: "6px 8px" }}>Hours</th>
                      <th style={{ padding: "6px 8px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empAttendance.map((rec) => (
                      <tr key={rec.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 8px", fontWeight: 500 }}>{rec.formattedDate || rec.date}</td>
                        <td style={{ padding: "6px 8px" }}>{rec.checkIn || "--:--"}</td>
                        <td style={{ padding: "6px 8px" }}>{rec.checkOut || (rec.checkIn ? "Working..." : "--:--")}</td>
                        <td style={{ padding: "6px 8px", fontWeight: 600 }}>
                          {rec.hours && parseFloat(rec.hours) > 0 ? `${rec.hours} hrs` : "--"}
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <span
                            className={`hr-badge ${
                              rec.status === "Present"
                                ? "hr-badge-green"
                                : rec.status === "On Leave"
                                ? "hr-badge-purple"
                                : "hr-badge-red"
                            }`}
                            style={{ fontSize: "0.68rem", padding: "1px 5px" }}
                          >
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="hr-modal-actions" style={{ marginTop: "4px" }}>
            <button
              type="button"
              className="hr-btn-primary"
              onClick={onClose}
              style={{ width: "100%", justifyContent: "center" }}
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
