import React, { useState, useEffect } from "react";
import { updateEmployee, getDepartments } from "../../../api/admin.api";

export default function EditEmployeeModal({ isOpen, onClose, employee, onSuccess }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    departmentId: "",
    jobTitle: "",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    workLocation: "Bangalore Office",
    wage: "50000",
    panNumber: "",
    bankAccount: "",
  });

  useEffect(() => {
    if (isOpen && employee) {
      const raw = employee.raw || employee;
      const nameParts = (employee.name || `${raw.first_name || ''} ${raw.last_name || ''}`).trim().split(/\s+/);
      const first = nameParts[0] || raw.first_name || "";
      const last = nameParts.slice(1).join(" ") || raw.last_name || "";

      setFormData({
        firstName: first,
        lastName: last,
        email: employee.email || raw.email || "",
        phone: employee.phone || raw.phone || "",
        departmentId: raw.department_id || "",
        jobTitle: employee.jobTitle || raw.designation || "Staff",
        employmentType: raw.employee_type || (employee.employmentType === "Full Time" ? "FULL_TIME" : "FULL_TIME"),
        status: (employee.status || raw.status || "Active").toUpperCase(),
        workLocation: raw.work_location || employee.workLocation || "Bangalore Office",
        wage: raw.wage || employee.wage || "50000",
        panNumber: raw.pan_number || employee.panNumber || "",
        bankAccount: raw.bank_account || employee.bankAccount || "",
      });

      getDepartments()
        .then((depts) => {
          if (depts) setDepartments(depts);
        })
        .catch((err) => console.error("Failed to load departments:", err));
      
      setError("");
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const empId = employee.id || employee.raw?.id || employee.dbId;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department_id: formData.departmentId ? parseInt(formData.departmentId) : undefined,
        designation: formData.jobTitle.trim(),
        employee_type: formData.employmentType,
        status: formData.status,
        work_location: formData.workLocation.trim(),
        wage: parseFloat(formData.wage) || 50000,
        pan_number: formData.panNumber.trim() || undefined,
        bank_account: formData.bankAccount.trim() || undefined,
      };

      const updated = await updateEmployee(empId, payload);
      setLoading(false);
      if (onSuccess) {
        onSuccess(updated || {
          ...employee,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
          employmentType: formData.employmentType === "FULL_TIME" ? "Full Time" : formData.employmentType,
          status: formData.status === "ACTIVE" ? "Active" : "Inactive",
          wage: formData.wage,
          workLocation: formData.workLocation,
        });
      }
      onClose();
    } catch (err) {
      console.error("Failed to update employee:", err);
      setError(err.response?.data?.message || err.message || "Failed to update employee record.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
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
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
              Edit Employee Data
            </h3>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
              Code: {employee.code || employee.raw?.employee_code || `EMP${empId}`}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.3rem",
              color: "#64748b",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {error && (
            <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#dc2626", fontSize: "0.82rem" }}>
              {error}
            </div>
          )}

          {/* Section 1: Personal & Contact Details */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", fontWeight: 700, color: "#714B67", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Personal & Contact Information
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Work Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Employment & Position */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", fontWeight: 700, color: "#714B67", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Employment & Designation
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Department
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", backgroundColor: "#fff" }}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Job Title / Designation
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Employment Type
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", backgroundColor: "#fff" }}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", backgroundColor: "#fff" }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Location */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", fontWeight: 700, color: "#714B67", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Compensation & Location
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Monthly Base Wage (₹)
                </label>
                <input
                  type="number"
                  name="wage"
                  value={formData.wage}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Work Location
                </label>
                <input
                  type="text"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#fff",
                color: "#475569",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 20px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#714B67",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
