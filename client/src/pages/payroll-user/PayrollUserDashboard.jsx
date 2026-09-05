import React, { useState } from "react";
import PortalLayout from "../../components/layout/PortalLayout";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import "./PayrollUserDashboard.css";

const INITIAL_TIMESHEETS = [
  { id: 1, name: "James Wilson", code: "EMP-1042", totalDays: 22, payableDays: 22, lwp: 0, overtimeHours: 4, verified: true },
  { id: 2, name: "Olivia Taylor", code: "EMP-1033", totalDays: 22, payableDays: 22, lwp: 0, overtimeHours: 0, verified: true },
  { id: 3, name: "Ethan Brown", code: "EMP-1021", totalDays: 22, payableDays: 20, lwp: 2, overtimeHours: 0, verified: false },
  { id: 4, name: "Lucas Scott", code: "EMP-1055", totalDays: 22, payableDays: 21, lwp: 1, overtimeHours: 8, verified: true },
  { id: 5, name: "Mia Chen", code: "EMP-1060", totalDays: 22, payableDays: 22, lwp: 0, overtimeHours: 2, verified: false },
];

const MOCK_ADJUSTMENTS = [
  { id: 1, employee: "Lucas Scott", code: "EMP-1055", type: "Sales Performance Bonus", amount: "+$850.00", category: "Earning", note: "Q1 Target Achieved" },
  { id: 2, employee: "Ethan Brown", code: "EMP-1021", type: "Salary Advance Deduction", amount: "-$300.00", category: "Deduction", note: "Installment 2 of 3" },
  { id: 3, employee: "James Wilson", code: "EMP-1042", type: "On-Call Project Allowance", amount: "+$400.00", category: "Earning", note: "Weekend release support" },
];

const PayrollUserDashboard = () => {
  const [activeTab, setActiveTab] = useState("timesheets");
  const [timesheets, setTimesheets] = useState(INITIAL_TIMESHEETS);
  const [draftSubmitted, setDraftSubmitted] = useState(false);

  const toggleVerify = (id) => {
    setTimesheets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, verified: !t.verified } : t))
    );
  };

  const handleCompileDraft = () => {
    setDraftSubmitted(true);
    alert("March 2026 Payroll Draft has been compiled and sent to the HR Payroll Manager for review!");
  };

  const timesheetColumns = [
    {
      key: "name",
      header: "Employee",
      render: (row) => (
        <div>
          <div className="emp-table-name">{row.name}</div>
          <div className="emp-table-sub">{row.code}</div>
        </div>
      ),
    },
    { key: "totalDays", header: "Total Working Days" },
    { key: "payableDays", header: "Payable Days" },
    {
      key: "lwp",
      header: "Loss of Pay (LWP)",
      render: (row) => (
        <span style={{ color: row.lwp > 0 ? "var(--color-danger)" : "inherit", fontWeight: row.lwp > 0 ? "bold" : "normal" }}>
          {row.lwp} Days
        </span>
      ),
    },
    { key: "overtimeHours", header: "Overtime (Hrs)" },
    {
      key: "verified",
      header: "Validation Status",
      render: (row) => (
        <Badge variant={row.verified ? "success" : "warning"}>
          {row.verified ? "Verified" : "Pending Check"}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (row) => (
        <button
          type="button"
          className="action-btn-secondary"
          onClick={() => toggleVerify(row.id)}
        >
          {row.verified ? "Undo" : "✓ Mark Verified"}
        </button>
      ),
    },
  ];

  const adjustmentColumns = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => (
        <div>
          <div className="emp-table-name">{row.employee}</div>
          <div className="emp-table-sub">{row.code}</div>
        </div>
      ),
    },
    { key: "type", header: "Adjustment Component" },
    {
      key: "category",
      header: "Type",
      render: (row) => (
        <Badge variant={row.category === "Earning" ? "success" : "danger"} size="sm">
          {row.category}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => <strong>{row.amount}</strong>,
    },
    { key: "note", header: "Remarks / Approval Note" },
  ];

  const verifiedCount = timesheets.filter((t) => t.verified).length;

  return (
    <PortalLayout title="Payroll Operations & Data Entry">
      {/* Metrics Row */}
      <div className="stats-grid">
        <StatCard
          title="Verified Timesheets"
          value={`${verifiedCount} / ${timesheets.length}`}
          subtitle={`${timesheets.length - verifiedCount} remaining to audit`}
          icon="🕒"
          variant={verifiedCount === timesheets.length ? "success" : "warning"}
        />
        <StatCard
          title="Unpaid Leaves (LWP)"
          value="3 Days"
          subtitle="Deductions calculated automatically"
          icon="📉"
          variant="info"
        />
        <StatCard
          title="Variable Pay Adjustments"
          value="$950.00"
          subtitle="3 manual entries logged"
          icon="✏️"
          variant="primary"
        />
        <StatCard
          title="Cycle Draft Status"
          value={draftSubmitted ? "Submitted" : "Draft In Progress"}
          subtitle="March 2026 period"
          icon="🚀"
          variant={draftSubmitted ? "success" : "warning"}
        />
      </div>

      {/* Tabs */}
      <div className="admin-tabs-bar">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "timesheets" ? "active" : ""}`}
          onClick={() => setActiveTab("timesheets")}
        >
          🕒 Monthly Timesheet Inputs
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "adjustments" ? "active" : ""}`}
          onClick={() => setActiveTab("adjustments")}
        >
          ✏️ Variable Pay & Deductions
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "compile" ? "active" : ""}`}
          onClick={() => setActiveTab("compile")}
        >
          🚀 Compile & Submit Draft
        </button>
      </div>

      {/* Tab 1: Timesheets */}
      {activeTab === "timesheets" && (
        <div className="tab-content">
          <DataTable
            title="Attendance & Timesheet Verification"
            subtitle="Verify payable days, loss-of-pay deductions, and overtime hours before compiling draft payroll."
            columns={timesheetColumns}
            data={timesheets}
          />
        </div>
      )}

      {/* Tab 2: Adjustments */}
      {activeTab === "adjustments" && (
        <div className="tab-content">
          <DataTable
            title="Manual Earnings & Salary Advances"
            subtitle="Add one-off commissions, project stipends, or loan repayments for this month's calculation."
            columns={adjustmentColumns}
            data={MOCK_ADJUSTMENTS}
            actions={
              <button
                type="button"
                className="btn-create-user"
                onClick={() => alert("Open Add Adjustment Modal")}
              >
                + Add Adjustment
              </button>
            }
          />
        </div>
      )}

      {/* Tab 3: Compile */}
      {activeTab === "compile" && (
        <div className="tab-content">
          <div className="compile-card">
            <h3 className="settings-card-title">📦 March 2026 Draft Summary</h3>
            <p className="settings-card-desc">
              All monthly inputs have been audited. Review the gross-to-net compilation below before forwarding to the Payroll Manager.
            </p>

            <div className="compile-breakdown">
              <div className="compile-row">
                <span>Total Headcount</span>
                <strong>94 Active Employees</strong>
              </div>
              <div className="compile-row">
                <span>Gross Compensation</span>
                <strong>$287,950.00</strong>
              </div>
              <div className="compile-row">
                <span>Variable Additions (Bonuses / Overtime)</span>
                <strong style={{ color: "var(--color-success)" }}>+$1,250.00</strong>
              </div>
              <div className="compile-row">
                <span>Total Deductions (Taxes + PF + LWP)</span>
                <strong style={{ color: "var(--color-danger)" }}>-$42,150.00</strong>
              </div>
              <div className="compile-row total">
                <span>Net Disbursement Payout</span>
                <strong className="compile-net">$245,800.00</strong>
              </div>
            </div>

            <div className="compile-actions">
              {draftSubmitted ? (
                <div className="compile-success-badge">
                  ✅ Draft Batch successfully forwarded to Liam Patel (Payroll Manager) for final approval!
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-compile-submit"
                  onClick={handleCompileDraft}
                >
                  🚀 Compile & Submit to Payroll Manager
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

export default PayrollUserDashboard;
