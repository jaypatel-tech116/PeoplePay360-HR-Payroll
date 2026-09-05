import React, { useState } from "react";

const AddEmployeePayrollModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    code: `EMP00${Math.floor(Math.random() * 90) + 10}`,
    name: "",
    department: "Engineering",
    jobTitle: "Software Developer",
    employeeType: "Full Time",
    payrollStatus: "Active",
    basicSalary: 30000,
    hra: 12000,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAdd) {
      onAdd(formData);
    }
    onClose();
  };

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div className="hr-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="hr-modal-header">
          <div className="hr-modal-title-group">
            <div className="hr-modal-icon">👤</div>
            <div>
              <h3 className="hr-modal-title">Add Employee to Payroll</h3>
              <p className="hr-modal-desc">Configure employee salary parameters</p>
            </div>
          </div>
          <button type="button" className="hr-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hr-modal-form">
          <div className="hr-form-row-2">
            <div className="hr-form-group">
              <label className="hr-form-label">Employee Code *</label>
              <input
                type="text"
                className="hr-form-input"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>
            <div className="hr-form-group">
              <label className="hr-form-label">Full Name *</label>
              <input
                type="text"
                className="hr-form-input"
                name="name"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="hr-form-row-2">
            <div className="hr-form-group">
              <label className="hr-form-label">Department *</label>
              <select
                className="hr-form-select"
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div className="hr-form-group">
              <label className="hr-form-label">Job Title *</label>
              <input
                type="text"
                className="hr-form-input"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="hr-form-row-2">
            <div className="hr-form-group">
              <label className="hr-form-label">Employment Type</label>
              <select
                className="hr-form-select"
                name="employeeType"
                value={formData.employeeType}
                onChange={handleChange}
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="hr-form-group">
              <label className="hr-form-label">Payroll Status</label>
              <select
                className="hr-form-select"
                name="payrollStatus"
                value={formData.payrollStatus}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="hr-modal-actions">
            <button type="button" className="pay-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="pay-btn-primary">
              + Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeePayrollModal;
