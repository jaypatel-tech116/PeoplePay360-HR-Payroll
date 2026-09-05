import React, { useState } from "react";

const ManagerPaySlipDetailView = ({ slip, onBack }) => {
  const [isPaid, setIsPaid] = useState(slip?.status === "Paid");

  const data = slip || {
    name: "Rahul Sharma",
    code: "EMP001",
    dept: "Engineering",
    designation: "Software Developer",
    period: "01 Aug 2025 - 31 Aug 2025",
    payDate: "31 Aug 2025",
    workingDays: 26,
    paidDays: 26,
    lopDays: 0,
    basic: "₹ 30,000",
    hra: "₹ 12,000",
    conveyance: "₹ 2,000",
    special: "₹ 5,000",
    totalEarnings: "₹ 49,000",
    pf: "₹ 3,600",
    pt: "₹ 200",
    esi: "₹ 0",
    tds: "₹ 1,500",
    totalDeductions: "₹ 5,300",
    netSalary: "₹ 46,700",
    netWords: "Indian Rupees Forty Six Thousand Seven Hundred Only",
  };

  const handleMarkAsPaid = () => {
    setIsPaid(true);
    alert(`Payslip for ${data.name} marked as PAID!`);
  };

  return (
    <div className="mgr-content-body">
      {/* 1. Breadcrumb & Action Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div className="mgr-breadcrumb">
          <span className="mgr-breadcrumb-link" onClick={onBack}>
            Pay Slips
          </span>
          <span>&gt;</span>
          <span className="mgr-breadcrumb-link" onClick={onBack}>
            August 2025
          </span>
          <span>&gt;</span>
          <strong style={{ color: "#111827" }}>{data.name}</strong>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={() => alert(`Downloading official PDF for ${data.name}...`)}
          >
            <span>📥</span> Download PDF
          </button>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={() => window.print()}
          >
            <span>🖨</span> Print
          </button>
          <button
            type="button"
            style={{
              backgroundColor: isPaid ? "#10b981" : "#0284c7",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "7px 14px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={handleMarkAsPaid}
          >
            {isPaid ? "✓ Marked as Paid" : "Mark as Paid"}
          </button>
        </div>
      </div>

      {/* 2. Employee Profile Card */}
      <div className="mgr-section-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#ede9fe",
                color: "#6d28d9",
                fontSize: "1.1rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              RS
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                  {data.name}
                </h3>
                <span className={`mgr-badge ${isPaid ? "mgr-badge-green" : "mgr-badge-amber"}`}>
                  {isPaid ? "Paid" : "Pending"}
                </span>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                {data.designation || "Software Developer"} - {data.dept || "Engineering"} • {data.code || "EMP001"}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: "20px", fontSize: "0.8rem" }}>
            <div>
              <span style={{ color: "#9ca3af", display: "block" }}>Payroll Period</span>
              <strong style={{ color: "#111827" }}>{data.period || "01 Aug 2025 - 31 Aug 2025"}</strong>
            </div>
            <div>
              <span style={{ color: "#9ca3af", display: "block" }}>Pay Date</span>
              <strong style={{ color: "#111827" }}>{data.payDate || "31 Aug 2025"}</strong>
            </div>
            <div>
              <span style={{ color: "#9ca3af", display: "block" }}>Working Days</span>
              <strong style={{ color: "#111827" }}>{data.workingDays || 26}</strong>
            </div>
            <div>
              <span style={{ color: "#9ca3af", display: "block" }}>Paid Days</span>
              <strong style={{ color: "#111827" }}>{data.paidDays || 26}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Breakdown Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Earnings */}
        <div className="mgr-section-card">
          <div className="mgr-section-header">
            <h3 className="mgr-section-heading">Earnings</h3>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.84rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Basic Salary</span>
              <strong>{data.basic || "₹ 30,000"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>HRA</span>
              <strong>{data.hra || "₹ 12,000"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Conveyance Allowance</span>
              <strong>{data.conveyance || "₹ 2,000"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Special Allowance</span>
              <strong>{data.special || "₹ 5,000"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
              <strong>Total Earnings</strong>
              <strong style={{ color: "#111827" }}>{data.totalEarnings || "₹ 49,000"}</strong>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="mgr-section-card">
          <div className="mgr-section-header">
            <h3 className="mgr-section-heading">Deductions</h3>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.84rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>PF (12%)</span>
              <strong>{data.pf || "₹ 3,600"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Professional Tax</span>
              <strong>{data.pt || "₹ 200"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>ESI</span>
              <strong>{data.esi || "₹ 0"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>TDS</span>
              <strong>{data.tds || "₹ 1,500"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
              <strong>Total Deductions</strong>
              <strong style={{ color: "#111827" }}>{data.totalDeductions || "₹ 5,300"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Net Salary Footer */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span style={{ fontSize: "0.72rem", color: "#065f46", display: "block" }}>
            Net Salary (In Words)
          </span>
          <strong style={{ fontSize: "0.85rem", color: "#065f46" }}>
            {data.netWords || "Indian Rupees Forty Six Thousand Seven Hundred Only"}
          </strong>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.72rem", color: "#065f46", display: "block" }}>
            Net Salary
          </span>
          <strong style={{ fontSize: "1.5rem", color: "#059669" }}>
            {data.netSalary || "₹ 46,700"}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default ManagerPaySlipDetailView;
