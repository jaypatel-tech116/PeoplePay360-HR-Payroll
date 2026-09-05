import React from "react";

const PaySlipDocumentView = ({ slip, onBack }) => {
  const data = slip || {
    name: "Rahul Sharma",
    code: "EMP001",
    dept: "Engineering",
    designation: "Software Developer",
    period: "01 Aug 2025 - 31 Aug 2025",
    payDate: "31 Aug 2025",
    workingDays: 26,
    lopDays: 0,
    basic: "₹ 30,000",
    hra: "₹ 12,000",
    conveyance: "₹ 2,000",
    special: "₹ 5,000",
    otherEarn: "₹ 3,000",
    totalEarnings: "₹ 52,000",
    pf: "₹ 3,600",
    pt: "₹ 200",
    esi: "₹ 0",
    tds: "₹ 1,500",
    otherDed: "₹ 0",
    totalDeductions: "₹ 5,300",
    netSalary: "₹ 46,700",
    netInWords: "INR Forty Six Thousand Seven Hundred Only",
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pay-content-body">
      {/* 1. Breadcrumb & Action Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div className="pay-breadcrumb">
          <span className="pay-breadcrumb-link" onClick={onBack}>
            Pay Slips
          </span>
          <span>&gt;</span>
          <span className="pay-breadcrumb-link" onClick={onBack}>
            August 2025
          </span>
          <span>&gt;</span>
          <strong style={{ color: "#111827" }}>{data.name}</strong>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="pay-btn-secondary"
            onClick={() => alert(`Downloading PDF for ${data.name}...`)}
          >
            <span>📥</span> Download PDF
          </button>
          <button
            type="button"
            className="pay-btn-secondary"
            onClick={handlePrint}
          >
            <span>🖨</span> Print
          </button>
        </div>
      </div>

      {/* 2. Official Printable Payslip Paper */}
      <div className="pay-slip-paper">
        {/* Document Header */}
        <div className="pay-slip-header-row">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "8px",
                backgroundColor: "#714B67",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.1rem",
              }}
            >
              P
            </div>
            <div>
              <div className="pay-slip-company-name">PeoplePay360</div>
              <div className="pay-slip-company-tagline">
                Empowering People, Building Futures
              </div>
            </div>
          </div>

          <div className="pay-slip-doc-title">
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111827", margin: 0 }}>
              Payslip
            </h2>
            <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
              August 2025
            </span>
          </div>
        </div>

        {/* Employee Info Grid */}
        <div className="pay-slip-meta-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>Employee Name</span>
              <strong style={{ color: "#111827" }}>{data.name}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>Employee Code</span>
              <strong style={{ color: "#111827" }}>{data.code || "EMP001"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>Department</span>
              <span>{data.dept || "Engineering"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>Designation</span>
              <span>{data.designation || "Software Developer"}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>Pay Period</span>
              <span>{data.period || "01 Aug 2025 - 31 Aug 2025"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>Pay Date</span>
              <span>{data.payDate || "31 Aug 2025"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>Working Days</span>
              <span>{data.workingDays || 26}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>LOP Days</span>
              <span>{data.lopDays || 0}</span>
            </div>
          </div>
        </div>

        {/* Breakdown Columns */}
        <div className="pay-slip-breakdown-grid">
          {/* Earnings */}
          <div className="pay-slip-column-card">
            <div className="pay-slip-col-head">Earnings</div>
            <div className="pay-slip-col-row">
              <span>Basic Salary</span>
              <span>{data.basic || "₹ 30,000"}</span>
            </div>
            <div className="pay-slip-col-row">
              <span>HRA</span>
              <span>{data.hra || "₹ 12,000"}</span>
            </div>
            <div className="pay-slip-col-row">
              <span>Conveyance Allowance</span>
              <span>{data.conveyance || "₹ 2,000"}</span>
            </div>
            <div className="pay-slip-col-row">
              <span>Special Allowance</span>
              <span>{data.special || "₹ 5,000"}</span>
            </div>
            <div className="pay-slip-col-row">
              <span>Other Allowance</span>
              <span>{data.otherEarn || "₹ 3,000"}</span>
            </div>
            <div className="pay-slip-col-total">
              <span>Total Earnings</span>
              <span>{data.totalEarnings || "₹ 52,000"}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="pay-slip-column-card">
            <div className="pay-slip-col-head">Deductions</div>
            <div className="pay-slip-col-row">
              <span>PF (12%)</span>
              <span>{data.pf || "₹ 3,600"}</span>
            </div>
            <div className="pay-slip-col-row">
              <span>Professional Tax</span>
              <span>{data.pt || "₹ 200"}</span>
            </div>
            <div className="pay-slip-col-row">
              <span>ESI</span>
              <span>{data.esi || "₹ 0"}</span>
            </div>
            <div className="pay-slip-col-row">
              <span>TDS</span>
              <span>{data.tds || "₹ 1,500"}</span>
            </div>
            <div className="pay-slip-col-row">
              <span>Other Deductions</span>
              <span>{data.otherDed || "₹ 0"}</span>
            </div>
            <div className="pay-slip-col-total">
              <span>Total Deductions</span>
              <span>{data.totalDeductions || "₹ 5,300"}</span>
            </div>
          </div>
        </div>

        {/* Net Salary Banner */}
        <div className="pay-slip-net-banner">
          <div>
            <span style={{ fontSize: "0.72rem", color: "#065f46", display: "block" }}>
              Net Salary (In Words)
            </span>
            <strong style={{ fontSize: "0.85rem", color: "#065f46" }}>
              {data.netInWords || "INR Forty Six Thousand Seven Hundred Only"}
            </strong>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", color: "#065f46", display: "block" }}>
              Net Salary
            </span>
            <strong style={{ fontSize: "1.45rem", color: "#059669" }}>
              {data.netSalary || "₹ 46,700"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaySlipDocumentView;
