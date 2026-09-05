import React, { useState, useEffect } from "react";
import hrApi from "../../../api/hr.api";

const NewEmployeeModal = ({ isOpen, onClose, onSuccess, onAdd }) => {
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    code: `EMP00${Math.floor(Math.random() * 90) + 10}`,
    name: "",
    departmentId: "",
    jobPosition: "Software Developer",
    employeeType: "Full Time",
    pipelineStage: "New Joiners",
    joiningDate: new Date().toISOString().split("T")[0],
    workEmail: "",
    password: "",
    confirmPassword: "",
  });

  // Fetch departments from database when modal opens
  useEffect(() => {
    if (isOpen) {
      hrApi
        .getDepartments()
        .then((depts) => {
          setDepartments(depts || []);
          if (depts && depts.length > 0 && !formData.departmentId) {
            setFormData((prev) => ({ ...prev, departmentId: depts[0].id }));
          }
        })
        .catch((err) => {
          console.error("Failed to load departments:", err);
        });
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validations
    if (!formData.code.trim() || !formData.name.trim()) {
      setErrorMessage("Please enter both Employee Code and Full Name.");
      return;
    }

    if (!formData.workEmail.trim()) {
      setErrorMessage("Work Email is required for employee account creation.");
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setErrorMessage("Password and Confirm Password are required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      // Map to backend API schema
      const payload = {
        employee_code: formData.code.trim(),
        full_name: formData.name.trim(),
        department_id: Number(formData.departmentId) || (departments[0]?.id || 1),
        job_position: formData.jobPosition.trim(),
        employee_type: formData.employeeType === "Full Time" ? "FULL_TIME" :
                       formData.employeeType === "Part Time" ? "PART_TIME" :
                       formData.employeeType === "Contract" ? "CONTRACT" : "INTERN",
        pipeline_stage: formData.pipelineStage === "New Joiners" ? "NEW_JOINER" :
                        formData.pipelineStage === "Active" ? "ACTIVE" :
                        formData.pipelineStage === "On Leave" ? "ON_LEAVE" : "EXITING",
        joining_date: formData.joiningDate,
        work_email: formData.workEmail.trim(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };

      const created = await hrApi.createEmployee(payload);

      // Reset form and notify parent to refresh
      setFormData({
        code: `EMP00${Math.floor(Math.random() * 90) + 10}`,
        name: "",
        departmentId: departments[0]?.id || "",
        jobPosition: "Software Developer",
        employeeType: "Full Time",
        pipelineStage: "New Joiners",
        joiningDate: new Date().toISOString().split("T")[0],
        workEmail: "",
        password: "",
        confirmPassword: "",
      });

      if (onSuccess) {
        onSuccess(created);
      }
      if (onAdd) {
        onAdd(created);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to onboard employee.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div className="hr-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="hr-modal-header">
          <div className="hr-modal-title-group">
            <div className="hr-modal-icon">👤</div>
            <div>
              <h3 className="hr-modal-title">New Employee</h3>
              <p className="hr-modal-desc">Onboard employee into the pipeline</p>
            </div>
          </div>
          <button
            type="button"
            className="hr-modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              margin: "0 24px 16px 24px",
              padding: "10px 14px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#b91c1c",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="hr-modal-form">
          <div className="hr-form-row-2">
            <div className="hr-form-group">
              <label className="hr-form-label">
                Employee Code <span className="hr-req-star">*</span>
              </label>
              <input
                type="text"
                className="hr-form-input"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="hr-form-group">
              <label className="hr-form-label">
                Full Name <span className="hr-req-star">*</span>
              </label>
              <input
                type="text"
                className="hr-form-input"
                placeholder="e.g. John Doe"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="hr-form-row-2">
            <div className="hr-form-group">
              <label className="hr-form-label">
                Department <span className="hr-req-star">*</span>
              </label>
              <select
                className="hr-form-select"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                {departments.length > 0 ? (
                  departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Engineering</option>
                    <option value="2">Human Resources</option>
                    <option value="5">Product</option>
                    <option value="3">Sales</option>
                    <option value="4">Marketing</option>
                  </>
                )}
              </select>
            </div>

            <div className="hr-form-group">
              <label className="hr-form-label">
                Job Position <span className="hr-req-star">*</span>
              </label>
              <input
                type="text"
                className="hr-form-input"
                name="jobPosition"
                placeholder="e.g. Software Developer"
                value={formData.jobPosition}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="hr-form-row-2">
            <div className="hr-form-group">
              <label className="hr-form-label">Employee Type</label>
              <select
                className="hr-form-select"
                name="employeeType"
                value={formData.employeeType}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div className="hr-form-group">
              <label className="hr-form-label">Pipeline Stage</label>
              <select
                className="hr-form-select"
                name="pipelineStage"
                value={formData.pipelineStage}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="New Joiners">New Joiners</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Exiting">Exiting</option>
              </select>
            </div>
          </div>

          <div className="hr-form-group">
            <label className="hr-form-label">Joining Date</label>
            <input
              type="date"
              className="hr-form-input"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {/* LOGIN DETAILS Section */}
          <div
            style={{
              margin: "16px 0 10px 0",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "12px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "#714B67",
                textTransform: "uppercase",
              }}
            >
              LOGIN DETAILS
            </span>
          </div>

          <div className="hr-form-group">
            <label className="hr-form-label">
              Work Email <span className="hr-req-star">*</span>
            </label>
            <input
              type="email"
              className="hr-form-input"
              placeholder="e.g. john.doe@company.com"
              name="workEmail"
              value={formData.workEmail}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="hr-form-row-2">
            <div className="hr-form-group">
              <label className="hr-form-label">
                Password <span className="hr-req-star">*</span>
              </label>
              <input
                type="password"
                className="hr-form-input"
                placeholder="Min. 6 characters"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="hr-form-group">
              <label className="hr-form-label">
                Confirm Password <span className="hr-req-star">*</span>
              </label>
              <input
                type="password"
                className="hr-form-input"
                placeholder="Re-enter password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="hr-modal-actions">
            <button
              type="button"
              className="hr-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="hr-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Onboarding..." : "+ Save & Onboard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEmployeeModal;
