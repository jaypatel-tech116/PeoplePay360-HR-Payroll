import React, { useState } from "react";
import { MOCK_EMPLOYEES } from "../adminMockData";
import EditEmployeeModal from "../modals/EditEmployeeModal";

export default function EmployeeDetailsView({ employee, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentEmp, setCurrentEmp] = useState(employee || MOCK_EMPLOYEES[0]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const emp = currentEmp;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "contracts", label: "Contracts" },
    { id: "attendance", label: "Attendance" },
    { id: "leaves", label: "Leaves" },
    { id: "payroll", label: "Payroll" },
    { id: "documents", label: "Documents" },
  ];

  return (
    <div className="adm-content-body">
      {/* 1. Breadcrumb */}
      <div className="adm-breadcrumb">
        <span className="adm-breadcrumb-link" onClick={onBack}>
          Employees
        </span>
        <span>&gt;</span>
        <span style={{ color: "var(--adm-text-dark)", fontWeight: 600 }}>{emp.name}</span>
      </div>

      {/* 2. Employee Profile Header Card */}
      <div
        className="adm-section-card"
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "var(--adm-plum-primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              fontWeight: 700,
            }}
          >
            {emp.avatar || (emp.name ? emp.name.split(" ").map((n) => n[0]).join("") : "E")}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--adm-text-dark)", margin: 0 }}>
                {emp.name}
              </h2>
              <span className="adm-badge adm-badge-green">{emp.status || "Active"}</span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.84rem", color: "var(--adm-text-muted)" }}>
              {emp.code} • {emp.jobTitle}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button type="button" className="adm-btn-primary" onClick={() => setIsEditModalOpen(true)}>
            Edit
          </button>
          <button
            type="button"
            className="adm-btn-secondary"
            style={{ padding: "7px 10px", fontSize: "1rem" }}
            onClick={() => alert("More options menu")}
          >
            ⋯
          </button>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--adm-border)",
          paddingBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              border: "1px solid " + (activeTab === tab.id ? "var(--adm-plum-primary)" : "transparent"),
              backgroundColor: activeTab === tab.id ? "var(--adm-plum-primary)" : "transparent",
              color: activeTab === tab.id ? "#ffffff" : "var(--adm-text-body)",
              fontSize: "0.84rem",
              fontWeight: activeTab === tab.id ? 600 : 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Tab 1: Overview Grid (4 Cards) */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Personal Information */}
          <div className="adm-section-card" style={{ padding: "20px" }}>
            <h3 className="adm-section-heading" style={{ marginBottom: "16px" }}>
              Personal Information
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Full Name</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.name}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Employee Code</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.code}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Email</span>
                <a href={`mailto:${emp.email}`} style={{ color: "var(--adm-blue-text)", textDecoration: "none", fontWeight: 500 }}>
                  {emp.email}
                </a>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Phone</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.phone || "+91 98765 43210"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Date of Birth</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.dateOfBirth || "12 Jan 1995"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Gender</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.gender || "Male"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Address</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.address || "Bangalore, Karnataka, India"}</strong>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="adm-section-card" style={{ padding: "20px" }}>
            <h3 className="adm-section-heading" style={{ marginBottom: "16px" }}>
              Employment Information
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Department</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.department}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Job Title</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.jobTitle}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Employment Type</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.employmentType}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Joining Date</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.joiningDate || "01 Sep 2023"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Status</span>
                <span className="adm-badge adm-badge-green">{emp.status || "Active"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Manager</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.manager || "Aditya Verma"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Work Location</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.workLocation || "Bangalore Office"}</strong>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="adm-section-card" style={{ padding: "20px" }}>
            <h3 className="adm-section-heading" style={{ marginBottom: "16px" }}>
              Additional Information
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>National ID</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.nationalId || "XXXX1234"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>Bank Account</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.bankAccount || "HDFC **** 4321"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>PAN Number</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.panNumber || "ABCDE1234F"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--adm-text-muted)" }}>UAN Number</span>
                <strong style={{ color: "var(--adm-text-dark)" }}>{emp.uanNumber || "100012345678"}</strong>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="adm-section-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="adm-section-heading">Recent Activity</h3>
              <span style={{ fontSize: "0.78rem", color: "var(--adm-plum-primary)", fontWeight: 600, cursor: "pointer" }}>
                View All
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.82rem" }}>
              {(emp.recentActivity || [
                { action: "Payroll processed Aug 2025", date: "27 Aug 2025" },
                { action: "Leave approved 2 days", date: "26 Aug 2025" },
                { action: "Attendance updated", date: "26 Aug 2025" },
                { action: "Contract renewed", date: "01 Aug 2025" },
              ]).map((act, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--adm-border-subtle)", paddingBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--adm-green-text)" }}>●</span>
                    <span style={{ color: "var(--adm-text-dark)", fontWeight: 500 }}>{act.action}</span>
                  </div>
                  <span style={{ color: "var(--adm-text-muted)", fontSize: "0.75rem" }}>{act.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs Preview */}
      {activeTab !== "overview" && (
        <div className="adm-section-card" style={{ padding: "30px", textAlign: "center" }}>
          <h3 className="adm-section-heading">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Records for {emp.name}
          </h3>
          <p className="adm-page-subtitle" style={{ marginTop: "6px" }}>
            All related records for {activeTab} are actively synced with the database.
          </p>
          <button className="adm-btn-secondary" style={{ marginTop: "14px" }} onClick={() => setActiveTab("overview")}>
            ← Back to Overview
          </button>
        </div>
      )}

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={emp}
        onSuccess={(updatedData) => {
          setIsEditModalOpen(false);
          if (updatedData) {
            setCurrentEmp((prev) => ({
              ...prev,
              ...updatedData,
              name: updatedData.first_name && updatedData.last_name ? `${updatedData.first_name} ${updatedData.last_name}` : (updatedData.name || prev.name),
              email: updatedData.email || prev.email,
              phone: updatedData.phone || prev.phone,
              jobTitle: updatedData.designation || updatedData.jobTitle || prev.jobTitle,
              employmentType: updatedData.employee_type || updatedData.employmentType || prev.employmentType,
              status: updatedData.status ? (updatedData.status === "ACTIVE" ? "Active" : updatedData.status) : prev.status,
              wage: updatedData.wage || prev.wage,
              workLocation: updatedData.work_location || updatedData.workLocation || prev.workLocation,
            }));
          }
        }}
      />
    </div>
  );
}
