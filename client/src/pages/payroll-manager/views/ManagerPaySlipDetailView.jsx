import React, { useState } from "react";

const ManagerPaySlipDetailView = ({ slip, onBack }) => {
  const [isPaid, setIsPaid] = useState(slip?.status === "Paid");

  const data = slip || {
    name: "Rahul Sharma",
    code: "EMP001",
    dept: "Engineering",
    designation: "Software Developer",
    payrun: "August 2026 Payrun",
    period: "01 Aug 2026 – 31 Aug 2026",
    payDate: "31 Aug 2026",
    workedDays: 26,
    paidDays: 26,
    lopDays: 0,
    status: isPaid ? "Paid" : "Pending",
  };

  const earnings = [
    { name: "Basic Salary", amount: "₹ 30,000.00" },
    { name: "House Rent Allowance (HRA)", amount: "₹ 12,000.00" },
    { name: "Conveyance Allowance", amount: "₹ 2,000.00" },
    { name: "Special Allowance", amount: "₹ 5,000.00" },
    { name: "Performance Bonus", amount: "₹ 3,000.00" },
  ];

  const deductions = [
    { name: "Provident Fund (PF)", amount: "₹ 3,600.00" },
    { name: "Professional Tax (PT)", amount: "₹ 200.00" },
    { name: "Income Tax (TDS)", amount: "₹ 1,500.00" },
  ];

  const grossSalary = "₹ 52,000.00";
  const totalDeductions = "₹ 5,300.00";
  const netSalary = "₹ 46,700.00";

  const handleMarkAsPaid = () => {
    setIsPaid(true);
    alert(`Payslip for ${data.name} marked as PAID!`);
  };

  return (
    <div className="mgr-content-body">
      {/* 1. Header & Action Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={onBack}
            style={{ padding: "6px 12px" }}
          >
            ← Back to Payslips
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 className="mgr-page-title" style={{ margin: 0 }}>Payslip</h1>
              <span className={`mgr-badge ${isPaid ? "mgr-badge-green" : "mgr-badge-amber"}`}>
                {isPaid ? "Paid" : "Pending"}
              </span>
            </div>
            <p className="mgr-page-subtitle" style={{ margin: "2px 0 0 0" }}>
              Official monthly salary statement for {data.name} ({data.code})
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={() => window.print()}
          >
            <span>🖨</span> Print Payslip
          </button>

          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={() => alert(`Downloading official PDF payslip for ${data.name}...`)}
          >
            <span>📥</span> Download PDF
          </button>

          <button
            type="button"
            onClick={handleMarkAsPaid}
            style={{
              backgroundColor: isPaid ? "#059669" : "#0284c7",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "7px 16px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isPaid ? "✓ Marked Paid" : "Mark as Paid"}
          </button>
        </div>
      </div>

      {/* 2. Employee & Payrun Metadata Card */}
      <div className="mgr-section-card" style={{ padding: "22px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", fontSize: "0.84rem" }}>
          <div>
            <span style={{ color: "var(--mgr-text-muted)", fontSize: "0.74rem", display: "block", marginBottom: "2px" }}>Employee Name</span>
            <strong style={{ color: "#111827", fontSize: "0.95rem" }}>{data.name}</strong>
          </div>

          <div>
            <span style={{ color: "var(--mgr-text-muted)", fontSize: "0.74rem", display: "block", marginBottom: "2px" }}>Employee Code</span>
            <code style={{ fontWeight: 600 }}>{data.code}</code>
          </div>

          <div>
            <span style={{ color: "var(--mgr-text-muted)", fontSize: "0.74rem", display: "block", marginBottom: "2px" }}>Department</span>
            <span style={{ fontWeight: 600 }}>{data.dept}</span>
          </div>

          <div>
            <span style={{ color: "var(--mgr-text-muted)", fontSize: "0.74rem", display: "block", marginBottom: "2px" }}>Job Position</span>
            <span style={{ fontWeight: 600 }}>{data.designation || "Software Developer"}</span>
          </div>

          <div>
            <span style={{ color: "var(--mgr-text-muted)", fontSize: "0.74rem", display: "block", marginBottom: "2px" }}>Payrun Batch</span>
            <span style={{ fontWeight: 600 }}>{data.payrun || "August 2026 Payrun"}</span>
          </div>

          <div>
            <span style={{ color: "var(--mgr-text-muted)", fontSize: "0.74rem", display: "block", marginBottom: "2px" }}>Pay Period</span>
            <span style={{ fontWeight: 600 }}>{data.period || "01 Aug – 31 Aug 2026"}</span>
          </div>

          <div>
            <span style={{ color: "var(--mgr-text-muted)", fontSize: "0.74rem", display: "block", marginBottom: "2px" }}>Worked Days</span>
            <span style={{ fontWeight: 700, color: "#111827" }}>{data.workedDays || 26} Days</span>
          </div>

          <div>
            <span style={{ color: "var(--mgr-text-muted)", fontSize: "0.74rem", display: "block", marginBottom: "2px" }}>Disbursement Status</span>
            <span className={`mgr-badge ${isPaid ? "mgr-badge-green" : "mgr-badge-amber"}`}>
              {isPaid ? "Disbursed / Paid" : "Pending Approval"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Professional Salary Statement: Earnings & Deductions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Earnings Card */}
        <div className="mgr-section-card">
          <div className="mgr-section-header" style={{ borderBottom: "2px solid #e2e8f0" }}>
            <h3 className="mgr-section-heading" style={{ color: "var(--mgr-plum-primary)" }}>Earnings</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--mgr-text-muted)" }}>Credit Components</span>
          </div>

          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
            {earnings.map((e, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#374151" }}>{e.name}</span>
                <span style={{ fontWeight: 600, color: "#111827" }}>{e.amount}</span>
              </div>
            ))}

            {/* Gross Salary Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "2px dashed #e2e8f0",
                paddingTop: "14px",
                marginTop: "6px",
              }}
            >
              <strong style={{ fontSize: "0.95rem", color: "#111827" }}>Gross Salary</strong>
              <strong style={{ fontSize: "1.1rem", color: "var(--mgr-plum-primary)" }}>{grossSalary}</strong>
            </div>
          </div>
        </div>

        {/* Deductions Card */}
        <div className="mgr-section-card">
          <div className="mgr-section-header" style={{ borderBottom: "2px solid #e2e8f0" }}>
            <h3 className="mgr-section-heading" style={{ color: "#dc2626" }}>Deductions</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--mgr-text-muted)" }}>Debit & Statutory</span>
          </div>

          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
            {deductions.map((d, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#374151" }}>{d.name}</span>
                <span style={{ fontWeight: 600, color: "#dc2626" }}>{d.amount}</span>
              </div>
            ))}

            {/* Total Deductions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "2px dashed #e2e8f0",
                paddingTop: "14px",
                marginTop: "24px",
              }}
            >
              <strong style={{ fontSize: "0.95rem", color: "#111827" }}>Total Deductions</strong>
              <strong style={{ fontSize: "1.1rem", color: "#dc2626" }}>{totalDeductions}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Large Highlighted Net Salary Statement */}
      <div
        className="mgr-section-card"
        style={{
          padding: "24px 30px",
          backgroundColor: "#f5edf5",
          border: "2px solid var(--mgr-plum-primary)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--mgr-plum-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Net Salary Payable
          </span>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#6b7280" }}>
            Disbursed via Direct Company Bank Account Transfer
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--mgr-plum-primary)", letterSpacing: "-0.02em" }}>
            {netSalary}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#6b7280", fontStyle: "italic" }}>
            Indian Rupees Forty Six Thousand Seven Hundred Only
          </span>
        </div>
      </div>
    </div>
  );
};

export default ManagerPaySlipDetailView;
