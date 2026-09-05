import React, { useState } from "react";
import PortalLayout from "../../components/layout/PortalLayout";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import "./PayrollManagerDashboard.css";

const MOCK_RUNS = [
  { id: "RUN-2026-03", cycle: "March 2026", employees: 94, gross: "$287,950.00", deductions: "$42,150.00", net: "$245,800.00", status: "Pending Approval", submittedBy: "Emma Davis (Operator)" },
  { id: "RUN-2026-02", cycle: "February 2026", employees: 92, gross: "$281,400.00", deductions: "$41,200.00", net: "$240,200.00", status: "Disbursed", submittedBy: "Emma Davis (Operator)" },
  { id: "RUN-2026-01", cycle: "January 2026", employees: 90, gross: "$276,000.00", deductions: "$40,100.00", net: "$235,900.00", status: "Disbursed", submittedBy: "Emma Davis (Operator)" },
];

const MOCK_GRADES = [
  { id: "G-A", name: "Grade A - Leadership & Staff", base: "60%", hra: "20%", special: "20%", standardPf: "12%", staffCount: 12 },
  { id: "G-B", name: "Grade B - Mid & Senior Level", base: "50%", hra: "25%", special: "25%", standardPf: "12%", staffCount: 48 },
  { id: "G-C", name: "Grade C - Associate & Entry", base: "50%", hra: "30%", special: "20%", standardPf: "12%", staffCount: 34 },
];

const PayrollManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("runs");
  const [runs, setRuns] = useState(MOCK_RUNS);

  const handleApproveBatch = (runId) => {
    setRuns((prev) =>
      prev.map((r) =>
        r.id === runId ? { ...r, status: "Approved & Queued" } : r
      )
    );
    alert(`Batch ${runId} has been successfully APPROVED and locked for bank disbursement!`);
  };

  const runColumns = [
    { key: "id", header: "Batch Code", width: "130px" },
    { key: "cycle", header: "Cycle" },
    { key: "employees", header: "Employees" },
    { key: "gross", header: "Gross Sum" },
    { key: "deductions", header: "Deductions" },
    {
      key: "net",
      header: "Net Payout",
      render: (row) => <strong>{row.net}</strong>,
    },
    {
      key: "status",
      header: "Approval State",
      render: (row) => {
        let variant = "neutral";
        if (row.status === "Disbursed") variant = "success";
        if (row.status === "Pending Approval") variant = "warning";
        if (row.status === "Approved & Queued") variant = "info";
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      key: "action",
      header: "Action Decision",
      render: (row) => {
        if (row.status === "Pending Approval") {
          return (
            <button
              type="button"
              className="btn-approve-batch"
              onClick={() => handleApproveBatch(row.id)}
            >
              ✓ Approve & Authorize
            </button>
          );
        }
        return <span className="text-muted-xs">Locked</span>;
      },
    },
  ];

  const gradeColumns = [
    { key: "id", header: "Grade Code", width: "100px" },
    { key: "name", header: "Salary Structure Title" },
    { key: "base", header: "Basic Pay %" },
    { key: "hra", header: "HRA %" },
    { key: "special", header: "Special Allowance %" },
    { key: "standardPf", header: "Statutory PF %" },
    {
      key: "staffCount",
      header: "Enrolled Employees",
      render: (row) => <Badge variant="neutral" size="sm">{row.staffCount} Staff</Badge>,
    },
  ];

  return (
    <PortalLayout title="Payroll Governance & Approvals">
      {/* Metrics Row */}
      <div className="stats-grid">
        <StatCard
          title="Monthly Payroll Sum"
          value="$245,800.00"
          subtitle="March 2026 cycle estimate"
          icon="💰"
          variant="primary"
          trend="+2.3% vs last month"
        />
        <StatCard
          title="Pending Authorization"
          value="1 Batch"
          subtitle="March 2026 Run awaiting review"
          icon="⏳"
          variant="warning"
        />
        <StatCard
          title="Tax & Statutory Withholding"
          value="$42,150.00"
          subtitle="TDS, PF, and Medical Insurance"
          icon="📑"
          variant="info"
        />
        <StatCard
          title="Next Payout Date"
          value="Mar 31, 2026"
          subtitle="Bank ACH transfer scheduled"
          icon="🏦"
          variant="success"
        />
      </div>

      {/* Tabs */}
      <div className="admin-tabs-bar">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "runs" ? "active" : ""}`}
          onClick={() => setActiveTab("runs")}
        >
          🔄 Payroll Runs & Final Approvals
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "structures" ? "active" : ""}`}
          onClick={() => setActiveTab("structures")}
        >
          📐 Salary Structures & Grades
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "compliance" ? "active" : ""}`}
          onClick={() => setActiveTab("compliance")}
        >
          🏛️ Compliance & Tax Reports
        </button>
      </div>

      {/* Tab 1: Runs */}
      {activeTab === "runs" && (
        <div className="tab-content">
          <DataTable
            title="Monthly Payroll Batches"
            subtitle="Review gross-to-net calculations, tax withholdings, and grant final disbursement sign-off."
            columns={runColumns}
            data={runs}
          />
        </div>
      )}

      {/* Tab 2: Structures */}
      {activeTab === "structures" && (
        <div className="tab-content">
          <DataTable
            title="Company Compensation Structures"
            subtitle="Define basic salary allocations, tax-exempt allowances, and statutory deduction policies."
            columns={gradeColumns}
            data={MOCK_GRADES}
            actions={
              <button
                type="button"
                className="btn-create-user"
                onClick={() => alert("Open New Structure Modal")}
              >
                + Define New Grade
              </button>
            }
          />
        </div>
      )}

      {/* Tab 3: Compliance */}
      {activeTab === "compliance" && (
        <div className="tab-content">
          <div className="settings-grid">
            <div className="settings-card">
              <h3 className="settings-card-title">📄 Provident Fund / 401k Statement</h3>
              <p className="settings-card-desc">Monthly employee and employer matching contribution statement.</p>
              <div className="compliance-stat">Total PF Fund: <strong>$22,540.00</strong></div>
              <button type="button" className="action-btn-secondary" style={{ marginTop: "12px" }}>
                Export ECR File (.csv)
              </button>
            </div>

            <div className="settings-card">
              <h3 className="settings-card-title">🏥 Health & Medical Insurance (ESI)</h3>
              <p className="settings-card-desc">Comprehensive group health insurance coverage deduction report.</p>
              <div className="compliance-stat">Total Insurance: <strong>$8,200.00</strong></div>
              <button type="button" className="action-btn-secondary" style={{ marginTop: "12px" }}>
                Download Return Sheet
              </button>
            </div>

            <div className="settings-card">
              <h3 className="settings-card-title">🏛️ Income Tax (TDS / Withholding)</h3>
              <p className="settings-card-desc">Government tax deducted at source ready for quarterly filing.</p>
              <div className="compliance-stat">Total TDS Withheld: <strong>$11,410.00</strong></div>
              <button type="button" className="action-btn-secondary" style={{ marginTop: "12px" }}>
                Generate Tax Challan
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

export default PayrollManagerDashboard;
