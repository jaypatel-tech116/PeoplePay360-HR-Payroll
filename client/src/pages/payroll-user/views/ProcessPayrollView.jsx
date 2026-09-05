import React, { useState } from "react";

const ProcessPayrollView = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmpIds, setSelectedEmpIds] = useState([1, 2, 3, 4, 5]);

  const processEmployees = [
    { id: 1, code: "EMP001", name: "Rahul Sharma", dept: "Engineering", gross: "₹ 52,000", ded: "₹ 5,300", net: "₹ 46,700", status: "Pending" },
    { id: 2, code: "EMP002", name: "Priya Mehta", dept: "HR", gross: "₹ 48,500", ded: "₹ 4,800", net: "₹ 43,700", status: "Pending" },
    { id: 3, code: "EMP003", name: "Vikram Rao", dept: "Sales", gross: "₹ 61,000", ded: "₹ 6,200", net: "₹ 54,800", status: "Pending" },
    { id: 4, code: "EMP004", name: "Sneha Iyer", dept: "Product", gross: "₹ 49,000", ded: "₹ 5,000", net: "₹ 44,000", status: "Pending" },
    { id: 5, code: "EMP005", name: "Aditya Gupta", dept: "Engineering", gross: "₹ 58,000", ded: "₹ 5,900", net: "₹ 52,100", status: "Pending" },
  ];

  const toggleSelect = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
    } else {
      alert("August 2025 Payroll processed successfully!");
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="pay-content-body">
      {/* 1. Breadcrumb */}
      <div className="pay-breadcrumb">
        <span className="pay-breadcrumb-link" onClick={onBack}>
          Pay Cycles
        </span>
        <span>&gt;</span>
        <strong style={{ color: "#111827" }}>August 2025</strong>
      </div>

      {/* 2. Header */}
      <div className="pay-page-header">
        <div>
          <h1 className="pay-page-title">Process Payroll - August 2025</h1>
          <p className="pay-page-subtitle">
            Review and process salaries for all eligible employees
          </p>
        </div>
      </div>

      {/* 3. 4-Step Stepper Bar */}
      <div className="pay-stepper-container">
        <div className={`pay-step-item ${currentStep >= 1 ? "active" : ""}`}>
          <div className="pay-step-num">1</div>
          <span>Review Employees</span>
        </div>
        <div className="pay-step-divider" />

        <div className={`pay-step-item ${currentStep >= 2 ? "active" : ""}`}>
          <div className="pay-step-num">2</div>
          <span>Verify Amounts</span>
        </div>
        <div className="pay-step-divider" />

        <div className={`pay-step-item ${currentStep >= 3 ? "active" : ""}`}>
          <div className="pay-step-num">3</div>
          <span>Process Payroll</span>
        </div>
        <div className="pay-step-divider" />

        <div className={`pay-step-item ${currentStep >= 4 ? "active" : ""}`}>
          <div className="pay-step-num">4</div>
          <span>Completed</span>
        </div>
      </div>

      {/* 4. Four Summary Stat Cards */}
      <div className="pay-stats-grid">
        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#f3ebf4", color: "#714B67" }}>
            👥
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Total Employees</span>
            <span className="pay-stat-value">48</span>
          </div>
        </div>

        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#e6f7ef", color: "#059669" }}>
            👥
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Eligible</span>
            <span className="pay-stat-value" style={{ color: "#059669" }}>45</span>
          </div>
        </div>

        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
            👤
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Excluded</span>
            <span className="pay-stat-value" style={{ color: "#dc2626" }}>3</span>
          </div>
        </div>

        <div className="pay-stat-card">
          <div className="pay-stat-icon-wrapper" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
            💳
          </div>
          <div className="pay-stat-info">
            <span className="pay-stat-label">Total Payout</span>
            <span className="pay-stat-value" style={{ fontSize: "1.3rem" }}>₹ 24,08,560</span>
          </div>
        </div>
      </div>

      {/* 5. Employee Checklist Table */}
      <div className="pay-section-card">
        <div className="pay-table-responsive">
          <table className="pay-data-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={selectedEmpIds.length === processEmployees.length}
                    onChange={() => {
                      if (selectedEmpIds.length === processEmployees.length) {
                        setSelectedEmpIds([]);
                      } else {
                        setSelectedEmpIds(processEmployees.map((e) => e.id));
                      }
                    }}
                  />
                </th>
                <th style={{ width: "30px" }}>#</th>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {processEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedEmpIds.includes(emp.id)}
                      onChange={() => toggleSelect(emp.id)}
                    />
                  </td>
                  <td style={{ color: "#9ca3af" }}>{emp.id}</td>
                  <td style={{ fontWeight: 600 }}>{emp.code}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{emp.name}</td>
                  <td>{emp.dept}</td>
                  <td>{emp.gross}</td>
                  <td style={{ color: "#dc2626" }}>{emp.ded}</td>
                  <td style={{ fontWeight: 700, color: "#059669" }}>{emp.net}</td>
                  <td>
                    <span
                      className={`pay-badge ${
                        currentStep === 4 ? "pay-badge-green" : "pay-badge-amber"
                      }`}
                    >
                      {currentStep === 4 ? "Processed" : emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f1f5f9" }}>
          <button
            type="button"
            className="pay-btn-primary"
            onClick={handleNextStep}
          >
            <span>
              {currentStep === 1
                ? "Proceed to Verify →"
                : currentStep === 2
                ? "Confirm & Process Payroll →"
                : currentStep === 3
                ? "Finalize Payroll Cycle ✓"
                : "Back to Pay Cycles"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessPayrollView;
