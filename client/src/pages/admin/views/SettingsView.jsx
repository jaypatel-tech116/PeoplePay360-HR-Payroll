import React, { useState } from "react";
import { MOCK_SETTINGS } from "../adminMockData";

export default function SettingsView() {
  const [activeSettingsNav, setActiveSettingsNav] = useState("general");
  const [generalSettings, setGeneralSettings] = useState(MOCK_SETTINGS.general);
  const [preferences, setPreferences] = useState(MOCK_SETTINGS.preferences);

  const settingsNavItems = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "organization", label: "Organization", icon: "🏢" },
    { id: "payroll", label: "Payroll Configuration", icon: "💵" },
    { id: "leave", label: "Leave Configuration", icon: "📅" },
    { id: "email", label: "Email Templates", icon: "✉️" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "logs", label: "System Logs", icon: "📋" },
  ];

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    alert("System settings and preferences saved successfully!");
  };

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Settings</h1>
          <p className="adm-page-subtitle">Manage system configuration</p>
        </div>

        <button type="button" className="adm-btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      {/* 2. 2-Column Settings Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "20px", alignItems: "start" }}>
        {/* Left Settings Sidebar */}
        <div className="adm-section-card" style={{ padding: "8px" }}>
          {settingsNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSettingsNav(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "6px",
                border: "none",
                background: activeSettingsNav === item.id ? "var(--adm-plum-light)" : "transparent",
                color: activeSettingsNav === item.id ? "var(--adm-plum-primary)" : "var(--adm-text-body)",
                fontWeight: activeSettingsNav === item.id ? 700 : 500,
                fontSize: "0.84rem",
                textAlign: "left",
                cursor: "pointer",
                marginBottom: "2px",
                transition: "all 0.15s ease",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right Settings Body (Screen 16 General Settings) */}
        {activeSettingsNav === "general" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* General Settings Card */}
            <div className="adm-section-card" style={{ padding: "24px" }}>
              <h3 className="adm-section-heading" style={{ marginBottom: "20px" }}>
                General Settings
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                      Company Name
                    </label>
                    <input
                      type="text"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                      value={generalSettings.companyName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                      Currency
                    </label>
                    <select
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                      value={generalSettings.currency}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                    >
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                      Date Format
                    </label>
                    <select
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                      value={generalSettings.dateFormat}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                    >
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                      Timezone
                    </label>
                    <select
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                    >
                      <option>Asia/Kolkata</option>
                      <option>UTC</option>
                      <option>America/New_York</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                      Financial Year Start
                    </label>
                    <select
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                      value={generalSettings.financialYearStart}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, financialYearStart: e.target.value })}
                    >
                      <option>1 April</option>
                      <option>1 January</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                      Default Work Hours Per Day
                    </label>
                    <input
                      type="number"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                      value={generalSettings.defaultWorkHoursPerDay}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, defaultWorkHoursPerDay: e.target.value })}
                    />
                  </div>
                </div>

                {/* Company Logo */}
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "6px" }}>
                    Company Logo
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div
                      style={{
                        padding: "16px 24px",
                        backgroundColor: "#f9fafb",
                        border: "1px dashed var(--adm-border)",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <img src="/Logo.png" alt="Company Logo" style={{ height: "54px", width: "auto", objectFit: "contain" }} />
                    </div>
                    <button type="button" className="adm-btn-secondary" onClick={() => alert("Upload new logo")}>
                      Change Logo
                    </button>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--adm-text-light)", display: "block", marginTop: "4px" }}>
                    Recommended size: 200 x 200 px
                  </span>
                </div>
              </div>
            </div>

            {/* System Preferences Card (6 Toggles) */}
            <div className="adm-section-card" style={{ padding: "24px" }}>
              <h3 className="adm-section-heading" style={{ marginBottom: "20px" }}>
                System Preferences
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "16px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "var(--adm-text-body)" }}>
                    Enable Email Notifications
                  </span>
                  <label className="adm-toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={() => togglePreference("emailNotifications")}
                    />
                    <span className="adm-toggle-slider" />
                  </label>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "16px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "var(--adm-text-body)" }}>
                    Allow Overtime
                  </span>
                  <label className="adm-toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.allowOvertime}
                      onChange={() => togglePreference("allowOvertime")}
                    />
                    <span className="adm-toggle-slider" />
                  </label>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "16px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "var(--adm-text-body)" }}>
                    Enable Employee Self Service
                  </span>
                  <label className="adm-toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.employeeSelfService}
                      onChange={() => togglePreference("employeeSelfService")}
                    />
                    <span className="adm-toggle-slider" />
                  </label>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "16px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "var(--adm-text-body)" }}>
                    Enable Multi-Department
                  </span>
                  <label className="adm-toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.multiDepartment}
                      onChange={() => togglePreference("multiDepartment")}
                    />
                    <span className="adm-toggle-slider" />
                  </label>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "16px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "var(--adm-text-body)" }}>
                    Enable Mobile Access
                  </span>
                  <label className="adm-toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.mobileAccess}
                      onChange={() => togglePreference("mobileAccess")}
                    />
                    <span className="adm-toggle-slider" />
                  </label>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "16px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "var(--adm-text-body)" }}>
                    Enable Audit Logs
                  </span>
                  <label className="adm-toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.auditLogs}
                      onChange={() => togglePreference("auditLogs")}
                    />
                    <span className="adm-toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Settings Views */}
        {activeSettingsNav !== "general" && (
          <div className="adm-section-card" style={{ padding: "30px", textAlign: "center" }}>
            <h3 className="adm-section-heading">
              {settingsNavItems.find((n) => n.id === activeSettingsNav)?.label} Configuration
            </h3>
            <p className="adm-page-subtitle" style={{ marginTop: "8px" }}>
              Configuration parameters for {activeSettingsNav} are securely persisted in the database.
            </p>
            <button className="adm-btn-secondary" style={{ marginTop: "14px" }} onClick={() => setActiveSettingsNav("general")}>
              ← Back to General Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
