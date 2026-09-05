import React, { useState, useEffect } from "react";
import { getEmployeeContract } from "../../../api/employee.api";
import { SkeletonCard, SkeletonTable } from "../../../components/ui/SkeletonLoader";

const ContractView = ({ refreshKey }) => {
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [activeContract, setActiveContract] = useState({
    contractReference: "CNT-EMP001",
    contractType: "Permanent",
    startDate: "01 Sep 2023",
    endDate: "31 Dec 2026",
    payFrequency: "Monthly",
    workingSchedule: "General (Mon - Fri)",
    salaryStructure: "Regular Monthly Salary",
    status: "Active",
    wage: "₹ 56,000.00",
    probationEndDate: "28 Feb 2024",
    currency: "INR",
    noticePeriod: "30 Days",
    department: "Engineering",
    jobPosition: "Software Developer",
    manager: "Priya Mehta",
    employeeType: "Full Time",
    createdOn: "28 Aug 2023",
    createdBy: "HR Manager",
    workingDays: "5 Days",
    dailyHours: "8 Hours",
    weeklyHours: "40 Hours",
    breakTime: "1 Hour",
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchContract = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeContract();
        if (isMounted && res?.data) {
          if (res.data.activeContract) setActiveContract(res.data.activeContract);
          if (res.data.history) setHistory(res.data.history);
        }
      } catch (err) {
        console.warn("Could not load contract details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchContract();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  if (loading) return (
    <div className="sk-dashboard-wrap">
      <SkeletonCard lines={6} titleWidth="40%" />
      <div className="sk-two-col" style={{ marginTop: "16px" }}>
        <SkeletonCard lines={5} /><SkeletonCard lines={5} />
      </div>
    </div>
  );

  // State 2: Contract History (Image 2 Bottom Right)
  if (showHistory) {
    return (
      <div className="employee-contract-history-view">
        {/* Header */}
        <div className="odoo-page-header">
          <div>
            <div className="odoo-breadcrumb">
              <span>My Contract</span>
              <span className="odoo-breadcrumb-sep">›</span>
              <span className="odoo-breadcrumb-current">Contract History</span>
            </div>
            <p className="odoo-page-subtitle">View the history of your contracts</p>
          </div>
          <button
            type="button"
            className="odoo-btn-secondary"
            onClick={() => setShowHistory(false)}
          >
            ← Back
          </button>
        </div>

        {/* Timeline List */}
        <div className="odoo-contract-timeline">
          {history.map((c) => (
            <div className="odoo-timeline-item" key={c.id}>
              <div className={`odoo-timeline-dot ${c.isCurrent ? "active" : "expired"}`} />
              <div className="odoo-timeline-card">
                <div className="odoo-timeline-card-header">
                  <div className="odoo-timeline-header-left">
                    <span className="odoo-timeline-code">{c.code}</span>
                    {c.isCurrent && <span className="odoo-timeline-tag">(Current Contract)</span>}
                    <span
                      className={`odoo-badge ${
                        c.status === "Active" ? "odoo-badge-green" : ""
                      }`}
                      style={
                        c.status !== "Active"
                          ? { backgroundColor: "#f3f4f6", color: "#6b7280" }
                          : {}
                      }
                    >
                      {c.status}
                    </span>
                    <span className="odoo-timeline-dates">{c.dateRange}</span>
                  </div>
                  <button
                    type="button"
                    className="odoo-table-action-btn"
                    onClick={() => setShowHistory(false)}
                  >
                    👁 View
                  </button>
                </div>

                <div className="odoo-timeline-grid">
                  <div className="odoo-timeline-grid-item">
                    <span>Contract Type</span>
                    <span>{c.contractType}</span>
                  </div>
                  <div className="odoo-timeline-grid-item">
                    <span>Salary Structure</span>
                    <span>{c.salaryStructure}</span>
                  </div>
                  <div className="odoo-timeline-grid-item">
                    <span>Wage</span>
                    <span>{c.wage}</span>
                  </div>
                  <div className="odoo-timeline-grid-item">
                    <span>Pay Frequency</span>
                    <span>{c.payFrequency}</span>
                  </div>
                  <div className="odoo-timeline-grid-item">
                    <span>Working Schedule</span>
                    <span>{c.workingSchedule}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // State 1: View Contract (Image 2 Bottom Left)
  return (
    <div className="employee-contract-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <div className="odoo-breadcrumb">
            <span>My Contract</span>
            <span className="odoo-breadcrumb-sep">›</span>
            <span className="odoo-breadcrumb-current">View Contract</span>
          </div>
          <p className="odoo-page-subtitle">View your employment contract details</p>
        </div>
        <button
          type="button"
          className="odoo-btn-primary"
          onClick={() => setShowHistory(true)}
        >
          View History
        </button>
      </div>

      {/* Grid: Contract Details (Left) + Additional Info & Schedule Summary (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Left Card: Contract Details */}
        <div className="odoo-card">
          <h3 className="odoo-card-title" style={{ marginBottom: "18px" }}>
            <span>💼</span> Contract Details
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px 18px",
              fontSize: "0.8rem",
            }}
          >
            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Contract Reference</span>
              <span style={{ fontWeight: 600 }}>{activeContract.contractReference}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Contract Type</span>
              <span style={{ fontWeight: 600 }}>{activeContract.contractType}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Start Date</span>
              <span style={{ fontWeight: 600 }}>{activeContract.startDate}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Pay Frequency</span>
              <span style={{ fontWeight: 600 }}>{activeContract.payFrequency}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>End Date</span>
              <span style={{ fontWeight: 600 }}>{activeContract.endDate}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Working Schedule</span>
              <span style={{ fontWeight: 600 }}>{activeContract.workingSchedule}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Salary Structure</span>
              <span style={{ fontWeight: 600 }}>{activeContract.salaryStructure}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Status</span>
              <span className="odoo-badge odoo-badge-green">{activeContract.status}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Wage (Monthly)</span>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>{activeContract.wage}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Probation End Date</span>
              <span style={{ fontWeight: 600 }}>{activeContract.probationEndDate}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Currency</span>
              <span style={{ fontWeight: 600 }}>{activeContract.currency}</span>
            </div>

            <div>
              <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "2px" }}>Notice Period</span>
              <span style={{ fontWeight: 600 }}>{activeContract.noticePeriod}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Additional Information & Schedule Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Card 1: Additional Information */}
          <div className="odoo-card">
            <h3 className="odoo-card-title" style={{ marginBottom: "14px" }}>
              <span>ℹ️</span> Additional Information
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Department</span>
                <span style={{ fontWeight: 600 }}>{activeContract.department}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Job Position</span>
                <span style={{ fontWeight: 600 }}>{activeContract.jobPosition}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Manager</span>
                <span style={{ fontWeight: 600 }}>{activeContract.manager}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Employee Type</span>
                <span style={{ fontWeight: 600 }}>{activeContract.employeeType}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Created On</span>
                <span style={{ fontWeight: 600 }}>{activeContract.createdOn}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Created By</span>
                <span style={{ fontWeight: 600 }}>{activeContract.createdBy}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Schedule Summary */}
          <div className="odoo-card">
            <h3 className="odoo-card-title" style={{ marginBottom: "14px" }}>
              <span>📅</span> Schedule Summary
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Working Days</span>
                <span style={{ fontWeight: 600 }}>{activeContract.workingDays}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Daily Hours</span>
                <span style={{ fontWeight: 600 }}>{activeContract.dailyHours}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Weekly Hours</span>
                <span style={{ fontWeight: 600 }}>{activeContract.weeklyHours}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>Break Time</span>
                <span style={{ fontWeight: 600 }}>{activeContract.breakTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractView;
