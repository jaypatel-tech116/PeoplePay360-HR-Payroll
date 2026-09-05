import React, { useState } from "react";

const ProfileView = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    employeeCode: "EMP001",
    department: "Engineering",
    firstName: "Rahul",
    jobPosition: "Software Developer",
    lastName: "Sharma",
    manager: "Priya Mehta",
    email: "rahul.sharma@company.com",
    employeeType: "Full Time",
    phone: "+91 9876543210",
    joiningDate: "01 Sep 2023",
    dateOfBirth: "15 Jan 2000",
    workSchedule: "General (Mon - Fri)",
    gender: "Male",
    status: "Active",
    address: "123, Green Park, Bangalore, Karnataka - 560001, India",
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert("Personal information updated successfully!");
  };

  // State 1: Edit Profile (Image 2 Top Left)
  if (isEditing) {
    return (
      <div className="employee-profile-edit-view">
        {/* Header */}
        <div className="odoo-page-header">
          <div>
            <div className="odoo-breadcrumb">
              <span>My Profile</span>
              <span className="odoo-breadcrumb-sep">›</span>
              <span className="odoo-breadcrumb-current">Edit Profile</span>
            </div>
            <p className="odoo-page-subtitle">Update your personal information</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="odoo-btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="odoo-btn-primary"
              onClick={handleSave}
            >
              💾 Save Changes
            </button>
          </div>
        </div>

        {/* 2-Column Edit Layout */}
        <form onSubmit={handleSave}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: "20px",
              alignItems: "start",
            }}
          >
            {/* Left Card: Change Photo */}
            <div className="odoo-card">
              <div className="odoo-photo-uploader">
                <div
                  className="odoo-photo-circle"
                  onClick={() => alert("Upload photo dialog (JPG, PNG up to 2MB)")}
                  title="Click to change photo"
                >
                  📷
                </div>
                <div className="odoo-photo-label">Change Photo</div>
                <div className="odoo-photo-hint">JPG, PNG up to 2MB</div>
              </div>
            </div>

            {/* Right Card: Personal Information Form */}
            <div className="odoo-card">
              <h3 className="odoo-card-title" style={{ marginBottom: "18px" }}>
                <span>👤</span> Personal Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px 18px",
                }}
              >
                <div className="odoo-form-group">
                  <label className="odoo-form-label">Employee Code</label>
                  <input
                    type="text"
                    className="odoo-form-input"
                    value={formData.employeeCode}
                    disabled
                    style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
                  />
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Department</label>
                  <select
                    className="odoo-form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Product">Product</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">First Name</label>
                  <input
                    type="text"
                    className="odoo-form-input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Job Position</label>
                  <select
                    className="odoo-form-select"
                    value={formData.jobPosition}
                    onChange={(e) => setFormData({ ...formData, jobPosition: e.target.value })}
                  >
                    <option value="Software Developer">Software Developer</option>
                    <option value="Senior Developer">Senior Developer</option>
                    <option value="QA Lead">QA Lead</option>
                  </select>
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Last Name</label>
                  <input
                    type="text"
                    className="odoo-form-input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Manager</label>
                  <select
                    className="odoo-form-select"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  >
                    <option value="Priya Mehta">Priya Mehta</option>
                    <option value="Alexander Wright">Alexander Wright</option>
                  </select>
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Email</label>
                  <input
                    type="email"
                    className="odoo-form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Employee Type</label>
                  <select
                    className="odoo-form-select"
                    value={formData.employeeType}
                    onChange={(e) => setFormData({ ...formData, employeeType: e.target.value })}
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Phone</label>
                  <input
                    type="text"
                    className="odoo-form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Joining Date</label>
                  <input
                    type="text"
                    className="odoo-form-input"
                    value={formData.joiningDate + " 📅"}
                    readOnly
                  />
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Date of Birth</label>
                  <input
                    type="text"
                    className="odoo-form-input"
                    value={formData.dateOfBirth + " 📅"}
                    readOnly
                  />
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Work Schedule</label>
                  <select
                    className="odoo-form-select"
                    value={formData.workSchedule}
                    onChange={(e) => setFormData({ ...formData, workSchedule: e.target.value })}
                  >
                    <option value="General (Mon - Fri)">General (Mon - Fri)</option>
                    <option value="Night Shift">Night Shift</option>
                  </select>
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Gender</label>
                  <select
                    className="odoo-form-select"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="odoo-form-group">
                  <label className="odoo-form-label">Address</label>
                  <textarea
                    className="odoo-form-textarea"
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // State 2: View Profile (Image 2 Top Right)
  return (
    <div className="employee-profile-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <div className="odoo-breadcrumb">
            <span>My Profile</span>
            <span className="odoo-breadcrumb-sep">›</span>
            <span className="odoo-breadcrumb-current">View Profile</span>
          </div>
          <p className="odoo-page-subtitle">Your personal information</p>
        </div>
        <button
          type="button"
          className="odoo-btn-primary"
          onClick={() => setIsEditing(true)}
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* 2-Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Left Column: Avatar Card */}
        <div className="odoo-card" style={{ textAlign: "center", padding: "28px 20px" }}>
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              backgroundColor: "#ede6ed",
              color: "var(--odoo-plum-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 800,
              margin: "0 auto 16px auto",
            }}
          >
            RS
          </div>

          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 4px 0" }}>
            {formData.firstName} {formData.lastName}
          </h2>
          <div style={{ fontSize: "0.8rem", color: "var(--odoo-text-muted)", marginBottom: "8px" }}>
            {formData.employeeCode}
          </div>

          <span className="odoo-badge odoo-badge-green" style={{ marginBottom: "20px" }}>
            {formData.status}
          </span>

          <div
            style={{
              borderTop: "1px solid var(--odoo-border)",
              paddingTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              textAlign: "left",
              fontSize: "0.78rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--odoo-text-secondary)" }}>
              <span>💼</span>
              <span>{formData.jobPosition}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--odoo-text-secondary)" }}>
              <span>🏢</span>
              <span>{formData.department}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--odoo-text-secondary)" }}>
              <span>✉️</span>
              <span style={{ wordBreak: "break-all" }}>{formData.email}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--odoo-text-secondary)" }}>
              <span>📞</span>
              <span>{formData.phone}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Information Read-Only View */}
        <div className="odoo-card">
          <h3 className="odoo-card-title" style={{ marginBottom: "18px" }}>
            <span>👤</span> Personal Information
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px 18px",
              fontSize: "0.8rem",
            }}
          >
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Employee Code</span>
              <span style={{ fontWeight: 600 }}>{formData.employeeCode}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Department</span>
              <span style={{ fontWeight: 600 }}>{formData.department}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>First Name</span>
              <span style={{ fontWeight: 600 }}>{formData.firstName}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Job Position</span>
              <span style={{ fontWeight: 600 }}>{formData.jobPosition}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Last Name</span>
              <span style={{ fontWeight: 600 }}>{formData.lastName}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Manager</span>
              <span style={{ fontWeight: 600 }}>{formData.manager}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Email</span>
              <span style={{ fontWeight: 600 }}>{formData.email}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Employee Type</span>
              <span style={{ fontWeight: 600 }}>{formData.employeeType}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Phone</span>
              <span style={{ fontWeight: 600 }}>{formData.phone}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Joining Date</span>
              <span style={{ fontWeight: 600 }}>{formData.joiningDate}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Date of Birth</span>
              <span style={{ fontWeight: 600 }}>{formData.dateOfBirth}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Work Schedule</span>
              <span style={{ fontWeight: 600 }}>{formData.workSchedule}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Gender</span>
              <span style={{ fontWeight: 600 }}>{formData.gender}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Status</span>
              <span className="odoo-badge odoo-badge-green">{formData.status}</span>
            </div>

            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--odoo-border-subtle)", paddingTop: "12px" }}>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Address</span>
              <span style={{ fontWeight: 600, lineHeight: 1.4 }}>{formData.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
