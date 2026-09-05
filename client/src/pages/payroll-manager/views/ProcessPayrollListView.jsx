import React, { useState } from "react";

const ProcessPayrollListView = ({ onProceedToVerify }) => {
  const [selectedEmps, setSelectedEmps] = useState([1, 2, 3, 4, 5]);

  const employees = [
    { id: 1, code: "EMP001", name: "Rahul Sharma", dept: "Engineering", gross: "₹ 52,000", ded: "₹ 5,300", net: "₹ 46,700", status: "Pending" },
    { id: 2, code: "EMP002", name: "Priya Mehta", dept: "HR", gross: "₹ 48,500", ded: "₹ 4,800", net: "₹ 43,700", status: "Pending" },
    { id: 3, code: "EMP003", name: "Vikram Rao", dept: "Sales", gross: "₹ 61,000", ded: "₹ 6,200", net: "₹ 54,800", status: "Pending" },
    { id: 4, code: "EMP004", name: "Sneha Iyer", dept: "Product", gross: "₹ 49,000", ded: "₹ 5,000", net: "₹ 44,000", status: "Pending" },
    { id: 5, code: "EMP005", name: "Aditya Gupta", dept: "Engineering", gross: "₹ 58,000", ded: "₹ 5,900", net: "₹ 52,100", status: "Pending" },
  ];

  const toggleSelect = (id) => {
    setSelectedEmps((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="mgr-content-body">
      {/* 1. Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Process Payroll - August 2025</h1>
          <p className="mgr-page-subtitle">
            Review and process salaries for all eligible employees
          </p>
        </div>
      </div>

      {/* 2. Stepper */}
      <div className="mgr-stepper">
        <div className="mgr-step active">
          <div className="mgr-step-num">1</div>
          <span>Review Employees</span>
        </div>
        <div className="mgr-step-divider" />
        <div className="mgr-step">
          <div className="mgr-step-num">2</div>
          <span>Verify Amounts</span>
        </div>
        <div className="mgr-step-divider" />
        <div className="mgr-step">
          <div className="mgr-step-num">3</div>
          <span>Process Payroll</span>
        </div>
        <div className="mgr-step-divider" />
        <div className="mgr-step">
          <div className="mgr-step-num">4</div>
          <span>Completed</span>
        </div>
      </div>

      {/* 3. Four Summary Cards */}
      <div className="mgr-stats-grid">
        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#f3ebf4", color: "#714B67" }}>
            👥
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Total Employees</span>
            <span className="mgr-stat-value">48</span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#e6f7ef", color: "#059669" }}>
            👥
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Eligible</span>
            <span className="mgr-stat-value" style={{ color: "#059669" }}>45</span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
            👤
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Excluded</span>
            <span className="mgr-stat-value" style={{ color: "#dc2626" }}>3</span>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-icon-wrapper" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
            💳
          </div>
          <div className="mgr-stat-info">
            <span className="mgr-stat-label">Total Payout</span>
            <span className="mgr-stat-value" style={{ fontSize: "1.3rem" }}>₹ 24,08,560</span>
          </div>
        </div>
      </div>

      {/* 4. Table */}
      <div className="mgr-section-card">
        <div className="mgr-table-responsive">
          <table className="mgr-data-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={selectedEmps.length === employees.length}
                    onChange={() => {
                      if (selectedEmps.length === employees.length) {
                        setSelectedEmps([]);
                      } else {
                        setSelectedEmps(employees.map((e) => e.id));
                      }
                    }}
                  />
                </th>
                <th style={{ width: "30px" }}>#</th>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedEmps.includes(e.id)}
                      onChange={() => toggleSelect(e.id)}
                    />
                  </td>
                  <td style={{ color: "#9ca3af" }}>{e.id}</td>
                  <td style={{ fontWeight: 600 }}>{e.code}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{e.name}</td>
                  <td>{e.dept}</td>
                  <td>{e.gross}</td>
                  <td style={{ color: "#dc2626" }}>{e.ded}</td>
                  <td style={{ fontWeight: 700, color: "#059669" }}>{e.net}</td>
                  <td>
                    <span className="mgr-badge mgr-badge-amber">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", borderTop: "1px solid #f1f5f9" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={() => alert("Draft payroll saved successfully!")}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="mgr-btn-primary"
            onClick={onProceedToVerify}
          >
            Proceed to Verify →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessPayrollListView;
