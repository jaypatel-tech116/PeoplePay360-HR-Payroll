import React, { useState } from "react";

const EmployeeDetailsView = ({ employee, onBack, onNavigateTab }) => {
  const [activeSubtab, setActiveSubtab] = useState("Payroll Details");

  const emp = employee || {
    name: "Rahul Sharma",
    code: "EMP001",
    department: "Engineering",
    jobTitle: "Software Developer",
    joinedDate: "01 Sep 2023",
    employeeType: "Full Time",
    payrollStatus: "Active",
  };

  const initials = emp.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="pay-content-body">
      {/* 1. Breadcrumb & Header Action */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="pay-breadcrumb">
          <span className="pay-breadcrumb-link" onClick={onBack}>
            Employees
          </span>
          <span>&gt;</span>
          <strong style={{ color: "#111827" }}>{emp.name}</strong>
        </div>

        <button
          type="button"
          className="pay-btn-secondary"
          onClick={() => alert(`Editing payroll structure for ${emp.name}`)}
        >
          <span>✏</span> Edit
        </button>
      </div>

      {/* 2. Employee Profile Header Card */}
      <div className="pay-section-card" style={{ padding: "20px" }}>
        <div
          style={{
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
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#ede9fe",
                color: "#6d28d9",
                fontWeight: 700,
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {initials}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                  {emp.name}
                </h2>
                <span className="pay-badge pay-badge-green">
                  {emp.payrollStatus}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#6b7280",
                  margin: "4px 0 0 0",
                }}
              >
                {emp.jobTitle} • {emp.department} • {emp.code}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "0.82rem" }}>
            <div>
              <span style={{ color: "#9ca3af", display: "block" }}>Joined On</span>
              <strong style={{ color: "#111827" }}>
                {emp.joinedDate || "01 Sep 2023"}
              </strong>
            </div>

            <div>
              <span style={{ color: "#9ca3af", display: "block" }}>
                Employment Type
              </span>
              <strong style={{ color: "#111827" }}>
                {emp.employeeType || "Full Time"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tabs */}
      <div className="pay-subtabs-bar">
        {["Overview", "Payroll Details", "Pay Slips", "Salary History"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`pay-subtab-btn ${activeSubtab === tab ? "active" : ""}`}
            onClick={() => {
              setActiveSubtab(tab);
              if (tab === "Pay Slips") onNavigateTab("payslips");
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Salary Structure & Deductions (2 Cards) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Card 1: Salary Structure */}
        <div className="pay-section-card">
          <div className="pay-section-header">
            <h3 className="pay-section-heading">Salary Structure</h3>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.84rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>Basic Salary</span>
              <strong style={{ color: "#111827" }}>₹ 30,000</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>HRA (40%)</span>
              <strong style={{ color: "#111827" }}>₹ 12,000</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>Conveyance Allowance</span>
              <strong style={{ color: "#111827" }}>₹ 2,000</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>Special Allowance</span>
              <strong style={{ color: "#111827" }}>₹ 5,000</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>Other Allowance</span>
              <strong style={{ color: "#111827" }}>₹ 3,000</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "12px",
                marginTop: "6px",
                borderTop: "1px solid #e2e8f0",
                fontSize: "0.9rem",
              }}
            >
              <strong style={{ color: "#111827" }}>Gross Salary</strong>
              <strong style={{ color: "#111827" }}>₹ 52,000</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Deductions */}
        <div className="pay-section-card">
          <div className="pay-section-header">
            <h3 className="pay-section-heading">Deductions</h3>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.84rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>PF (12%)</span>
              <strong style={{ color: "#111827" }}>₹ 3,600</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>Professional Tax</span>
              <strong style={{ color: "#111827" }}>₹ 200</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>ESI</span>
              <strong style={{ color: "#111827" }}>₹ 0</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>TDS</span>
              <strong style={{ color: "#111827" }}>₹ 1,500</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4b5563" }}>Other Deductions</span>
              <strong style={{ color: "#111827" }}>₹ 0</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "12px",
                marginTop: "6px",
                borderTop: "1px solid #e2e8f0",
                fontSize: "0.9rem",
              }}
            >
              <strong style={{ color: "#111827" }}>Total Deductions</strong>
              <strong style={{ color: "#111827" }}>₹ 5,300</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Banner: Net Salary */}
      <div
        style={{
          backgroundColor: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: "8px",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#065f46" }}>
          Net Salary
        </span>
        <span style={{ fontSize: "1.65rem", fontWeight: 800, color: "#059669" }}>
          ₹ 46,700
        </span>
      </div>
    </div>
  );
};

export default EmployeeDetailsView;
