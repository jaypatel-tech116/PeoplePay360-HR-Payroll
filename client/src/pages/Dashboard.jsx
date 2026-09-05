import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfileRequest } from "../api/user.api";
import "./Dashboard.css";

/**
 * Protected Dashboard Page Component
 * Displays user info and provides profile update / avatar replacement
 */
const Dashboard = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Sync initial state whenever auth user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Clean up object URL memory
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Avatar file size must be less than 2MB.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Only JPG, PNG, or WebP image files are supported.");
      return;
    }

    setErrorMessage("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage("Name cannot be blank.");
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Email cannot be blank.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("email", formData.email.trim());

      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      const res = await updateProfileRequest(payload);
      const updatedUserData = res.data?.user;

      // Update user state in AuthContext so navbar and cards immediately reflect changes
      updateUser(updatedUserData);

      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccessMessage("Your profile has been successfully updated!");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to update profile. Please review your input and try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <main className="dashboard-page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Account Dashboard</h1>
        <p className="dashboard-subtitle">
          Manage your personal details, email address, and profile avatar
        </p>
      </div>

      {successMessage && (
        <div className="dashboard-alert-success" role="status">
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="dashboard-alert-error" role="alert">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Column: Logged-in User Profile Summary */}
        <section className="dashboard-card" aria-label="Profile Summary">
          <h2 className="dashboard-card-title">User Profile</h2>
          <div className="profile-hero">
            <div className="profile-avatar-wrapper">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`${user.name}'s profile avatar`}
                  className="profile-avatar-img"
                />
              ) : (
                <span className="profile-avatar-fallback">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>

            <h3 className="profile-name">{user?.name}</h3>
            <span className="profile-role-badge">{user?.role || "user"}</span>
          </div>

          <div className="profile-meta-list">
            <div className="profile-meta-item">
              <span className="profile-meta-label">Email</span>
              <span className="profile-meta-value">{user?.email}</span>
            </div>

            <div className="profile-meta-item">
              <span className="profile-meta-label">Account ID</span>
              <span className="profile-meta-value">#{user?.id}</span>
            </div>

            <div className="profile-meta-item">
              <span className="profile-meta-label">Member Since</span>
              <span className="profile-meta-value">
                {formatDate(user?.created_at)}
              </span>
            </div>

            <div className="profile-meta-item">
              <span className="profile-meta-label">Last Updated</span>
              <span className="profile-meta-value">
                {formatDate(user?.updated_at)}
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Update Profile Form */}
        <section className="dashboard-card" aria-label="Edit Profile">
          <h2 className="dashboard-card-title">Edit Profile Information</h2>
          <form onSubmit={handleSubmit} className="edit-profile-form" noValidate>
            {/* Avatar Replace Row */}
            <div className="form-group">
              <label className="form-label">Profile Avatar</label>
              <div className="avatar-replace-row">
                <div className="avatar-replace-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="New avatar preview" />
                  ) : user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Current avatar" />
                  ) : (
                    <span>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>

                <div className="avatar-replace-meta">
                  <span className="avatar-upload-hint">
                    {avatarFile ? avatarFile.name : "Replace your avatar (Max 2MB)"}
                  </span>
                  <label htmlFor="dashboard-avatar-input" className="btn-upload-avatar">
                    {avatarFile ? "Choose Different Photo" : "Upload New Photo"}
                  </label>
                  <input
                    id="dashboard-avatar-input"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleAvatarChange}
                    className="file-input-hidden"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="edit-name" className="form-label">
                Full Name
              </label>
              <input
                id="edit-name"
                name="name"
                type="text"
                required
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-email" className="form-label">
                Email Address
              </label>
              <input
                id="edit-email"
                name="email"
                type="email"
                required
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-save-profile"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn-reset-profile"
                disabled={isSubmitting}
              >
                Reset
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
