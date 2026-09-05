import React, { useState } from "react";

const CreatePayCycleWizardView = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(2); // Starts at Step 2 as shown in image Screen 4
  const [selectedStructure, setSelectedStructure] = useState("Default Structure (Full Time)");
  const [selectedEmployees, setSelectedEmployees] = useState(["EMP001", "EMP002", "EMP003", "EMP004", "EMP005"]);

  const employeesList = [
    { code: "EMP001", name: "Rahul Sharma", dept: "Engineering", contract: "Active", wage: "₹ 56,000" },
    { code: "EMP002", name: "Priya Mehta", dept: "HR", contract: "Active", wage: "₹ 45,000" },
    { code: "EMP003", name: "Vikram Rao", dept: "Sales", contract: "Active", wage: "₹ 55,000" },
    { code: "EMP004", name: "Sneha Iyer", dept: "Product", contract: "Active", wage: "₹ 46,000" },
    { code: "EMP005", name: "Aditya Gupta", dept: "Engineering", contract: "Active", wage: "₹ 52,000" },
  ];

  const toggleSelectEmp = (code) => {
    setSelectedEmployees((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="mgr-content-body">
      {/* Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Create Pay Cycle</h1>
          <p className="mgr-page-subtitle">
            Set up a new payroll cycle for your organization
          </p>
        </div>
      </div>

      {/* 4-Step Stepper Bar */}
      <div className="mgr-stepper">
        <div className={`mgr-step ${currentStep > 1 ? "completed" : currentStep === 1 ? "active" : ""}`}>
          <div className="mgr-step-num">{currentStep > 1 ? "✓" : "1"}</div>
          <span>Payroll Period</span>
        </div>
        <div className="mgr-step-divider" />

        <div className={`mgr-step ${currentStep > 2 ? "completed" : currentStep === 2 ? "active" : ""}`}>
          <div className="mgr-step-num">{currentStep > 2 ? "✓" : "2"}</div>
          <span>Salary Structure</span>
        </div>
        <div className="mgr-step-divider" />

        <div className={`mgr-step ${currentStep > 3 ? "completed" : currentStep === 3 ? "active" : ""}`}>
          <div className="mgr-step-num">{currentStep > 3 ? "✓" : "3"}</div>
          <span>Select Employees</span>
        </div>
        <div className="mgr-step-divider" />

        <div className={`mgr-step ${currentStep === 4 ? "active" : ""}`}>
          <div className="mgr-step-num">4</div>
          <span>Review & Create</span>
        </div>
      </div>

      {/* Step 2: Select Salary Structure (Screen 4) */}
      {currentStep === 2 && (
        <div className="mgr-section-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 12px 0" }}>
              Select Salary Structure
            </h3>
            <select
              className="mgr-form-select"
              value={selectedStructure}
              onChange={(e) => setSelectedStructure(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "0.85rem",
              }}
            >
              <option value="Default Structure (Full Time)">
                Default Structure (Full Time) ⌵
              </option>
              <option value="Part Time Structure">Part Time Structure</option>
              <option value="Contractor Structure">Contractor Structure</option>
            </select>
          </div>

          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Structure Name</span>
              <strong style={{ fontSize: "0.88rem", color: "#111827" }}>
                Default Structure (Full Time)
              </strong>
            </div>

            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Description</span>
              <span style={{ fontSize: "0.82rem", color: "#4b5563" }}>
                Standard salary structure for full time employees
              </span>
            </div>

            <div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Total Components</span>
              <strong style={{ fontSize: "0.85rem", color: "#111827" }}>
                8 (5 Earnings, 3 Deductions)
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" className="mgr-btn-secondary" onClick={onBack}>
              Cancel
            </button>
            <button
              type="button"
              className="mgr-btn-primary"
              onClick={() => setCurrentStep(3)}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Employees (Screen 5) */}
      {currentStep === 3 && (
        <div className="mgr-section-card">
          <div className="mgr-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <select className="mgr-btn-secondary" style={{ padding: "6px 12px" }}>
                <option>All Departments ⌵</option>
              </select>
              <select className="mgr-btn-secondary" style={{ padding: "6px 12px" }}>
                <option>Active Only ⌵</option>
              </select>
            </div>

            <div className="mgr-input-search-wrapper">
              <span style={{ color: "#9ca3af" }}>🔍</span>
              <input type="text" placeholder="Search employees..." />
            </div>
          </div>

          <div className="mgr-table-responsive">
            <table className="mgr-data-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.length === employeesList.length}
                      onChange={() => {
                        if (selectedEmployees.length === employeesList.length) {
                          setSelectedEmployees([]);
                        } else {
                          setSelectedEmployees(employeesList.map((e) => e.code));
                        }
                      }}
                    />
                  </th>
                  <th>Employee Code</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Contract</th>
                  <th>Monthly Wage</th>
                </tr>
              </thead>
              <tbody>
                {employeesList.map((e) => (
                  <tr key={e.code}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(e.code)}
                        onChange={() => toggleSelectEmp(e.code)}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{e.code}</td>
                    <td style={{ fontWeight: 600, color: "#111827" }}>{e.name}</td>
                    <td>{e.dept}</td>
                    <td>
                      <span className="mgr-badge mgr-badge-green">
                        {e.contract}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{e.wage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              className="mgr-btn-secondary"
              onClick={() => setCurrentStep(2)}
            >
              ← Back
            </button>
            <button
              type="button"
              className="mgr-btn-primary"
              onClick={() => {
                alert("Pay Cycle Created! Moving to Process Payroll Review...");
                if (onComplete) onComplete();
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePayCycleWizardView;
