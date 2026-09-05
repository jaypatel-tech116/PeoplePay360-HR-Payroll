import React, { useState, useEffect } from "react";
import { getEmployeeProfile, updateEmployeeProfile } from "../../../api/employee.api";
import { SkeletonProfileHeader, SkeletonCard } from "../../../components/ui/SkeletonLoader";

const ProfileView = ({ refreshKey }) => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [formData, setFormData] = useState({
    employeeCode: "", department: "", firstName: "", jobPosition: "",
    lastName: "", manager: "", email: "", employeeType: "",
    phone: "", joiningDate: "", dateOfBirth: "", workSchedule: "",
    gender: "", status: "", address: "", initials: "",
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeProfile();
        if (isMounted && res?.data?.profile) {
          setFormData(res.data.profile);
        }
      } catch (err) {
        console.warn("Could not load employee profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [refreshKey]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateEmployeeProfile({
        phone: formData.phone,
        address: formData.address,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setIsEditing(false);
      setSaveMsg({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setSaveMsg({ type: "error", text: "Failed to update profile. Please try again." });
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const getDisplayInitials = () => {
    if (formData.initials && formData.initials.length <= 2 && formData.initials[0]?.toLowerCase() !== formData.initials[1]?.toLowerCase()) {
      return formData.initials;
    }
    return formData.firstName ? formData.firstName.slice(0, 2).toUpperCase() : "EM";
  };

  const getDisplayName = () => {
    if (formData.lastName && formData.lastName.toLowerCase() !== formData.firstName?.toLowerCase()) {
      return `${formData.firstName} ${formData.lastName}`;
    }
    return formData.firstName || "Employee";
  };

  if (loading) return (
    <div className="sk-dashboard-wrap">
      <SkeletonProfileHeader />
      <div className="sk-two-col"><SkeletonCard lines={5} /><SkeletonCard lines={5} /></div>
    </div>
  );

  // Themed success/error message
  const SaveMessage = () => {
    if (!saveMsg) return null;
    return (
      <div className="themed-modal-backdrop" onClick={() => setSaveMsg(null)}>
        <div className="themed-modal" onClick={(e) => e.stopPropagation()}>
          <div className="themed-modal-body">
            <div className={`themed-modal-icon ${saveMsg.type}`}>
              {saveMsg.type === "success" ? "✓" : "✕"}
            </div>
            <div className="themed-modal-title">
              {saveMsg.type === "success" ? "Success" : "Error"}
            </div>
            <div className="themed-modal-message">{saveMsg.text}</div>
          </div>
          <div className="themed-modal-actions">
            <button className="odoo-btn-primary" onClick={() => setSaveMsg(null)}>OK</button>
          </div>
        </div>
      </div>
    );
  };

  // Edit Profile Mode
  if (isEditing) {
    return (
      <div className="employee-profile-edit-view">
        <SaveMessage />
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
            <button type="button" className="odoo-btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="button" className="odoo-btn-primary" onClick={handleSave}>💾 Save Changes</button>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="profile-section-card">
            <h3 className="profile-section-title"><span>👤</span> Personal Information</h3>
            <div className="profile-field-grid">
              <div className="odoo-form-group">
                <label className="odoo-form-label">First Name</label>
                <input type="text" className="odoo-form-input" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
              </div>
              <div className="odoo-form-group">
                <label className="odoo-form-label">Last Name</label>
                <input type="text" className="odoo-form-input" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
              </div>
              <div className="odoo-form-group">
                <label className="odoo-form-label">Phone</label>
                <input type="text" className="odoo-form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
              </div>
              <div className="odoo-form-group">
                <label className="odoo-form-label">Gender</label>
                <select className="odoo-form-select" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="odoo-form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="odoo-form-label">Address</label>
                <textarea className="odoo-form-textarea" rows="2" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // View Profile Mode - Modern Design
  return (
    <div className="employee-profile-view">
      <SaveMessage />

      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">My Profile</h1>
          <p className="odoo-page-subtitle">Your personal and employment information</p>
        </div>
        <button type="button" className="odoo-btn-primary" onClick={() => setIsEditing(true)}>
          ✏️ Edit Profile
        </button>
      </div>

      {/* Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-avatar">{getDisplayInitials()}</div>
        <div className="profile-hero-info">
          <h2>{getDisplayName()}</h2>
          <p>{formData.jobPosition} • {formData.department}</p>
          <span className="profile-hero-badge">🟢 {formData.status || "Active"}</span>
        </div>
      </div>

      {/* Info Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Personal Info */}
        <div className="profile-section-card">
          <h3 className="profile-section-title"><span>👤</span> Personal Information</h3>
          <div className="profile-field-grid">
            <div className="profile-field">
              <span className="profile-field-label">Full Name</span>
              <span className="profile-field-value">{getDisplayName()}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Employee Code</span>
              <span className="profile-field-value">{formData.employeeCode}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Date of Birth</span>
              <span className="profile-field-value">{formData.dateOfBirth}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Gender</span>
              <span className="profile-field-value">{formData.gender}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Joining Date</span>
              <span className="profile-field-value">{formData.joiningDate}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Status</span>
              <span className="odoo-badge odoo-badge-green">{formData.status}</span>
            </div>
          </div>
        </div>

        {/* Employment Info */}
        <div className="profile-section-card">
          <h3 className="profile-section-title"><span>💼</span> Employment Details</h3>
          <div className="profile-field-grid">
            <div className="profile-field">
              <span className="profile-field-label">Department</span>
              <span className="profile-field-value">{formData.department}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Job Position</span>
              <span className="profile-field-value">{formData.jobPosition}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Employee Type</span>
              <span className="profile-field-value">{formData.employeeType}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Manager</span>
              <span className="profile-field-value">{formData.manager}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Work Schedule</span>
              <span className="profile-field-value">{formData.workSchedule}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="profile-section-card" style={{ gridColumn: "1 / -1" }}>
          <h3 className="profile-section-title"><span>📞</span> Contact & Address</h3>
          <div className="profile-field-grid">
            <div className="profile-field">
              <span className="profile-field-label">Email</span>
              <span className="profile-field-value">{formData.email}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Phone</span>
              <span className="profile-field-value">{formData.phone}</span>
            </div>
            <div className="profile-field" style={{ gridColumn: "1 / -1" }}>
              <span className="profile-field-label">Address</span>
              <span className="profile-field-value">{formData.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
