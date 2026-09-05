import React, { useState, useEffect } from "react";
import { getEmployeeContract } from "../../../api/employee.api";
import { SkeletonCard } from "../../../components/ui/SkeletonLoader";

const ContractView = ({ refreshKey }) => {
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [activeContract, setActiveContract] = useState({});
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
    return () => { isMounted = false; };
  }, [refreshKey]);

  if (loading) return (
    <div className="sk-dashboard-wrap">
      <SkeletonCard lines={6} titleWidth="40%" />
      <div className="sk-two-col" style={{ marginTop: "16px" }}>
        <SkeletonCard lines={5} /><SkeletonCard lines={5} />
      </div>
    </div>
  );

  // Contract History View
  if (showHistory) {
    return (
      <div className="employee-contract-history-view">
        <div className="odoo-page-header">
          <div>
            <div className="odoo-breadcrumb">
              <span>My Contract</span>
              <span className="odoo-breadcrumb-sep">›</span>
              <span className="odoo-breadcrumb-current">Contract History</span>
            </div>
            <p className="odoo-page-subtitle">View the history of your contracts</p>
          </div>
          <button type="button" className="odoo-btn-secondary" onClick={() => setShowHistory(false)}>← Back</button>
        </div>

        <div className="odoo-contract-timeline">
          {history.map((c) => (
            <div className="odoo-timeline-item" key={c.id}>
              <div className={`odoo-timeline-dot ${c.isCurrent ? "active" : "expired"}`} />
              <div className="odoo-timeline-card">
                <div className="odoo-timeline-card-header">
                  <div className="odoo-timeline-header-left">
                    <span className="odoo-timeline-code">{c.code}</span>
                    {c.isCurrent && <span className="odoo-timeline-tag">(Current)</span>}
                    <span className={`odoo-badge ${c.status === "Active" ? "odoo-badge-green" : ""}`}
                      style={c.status !== "Active" ? { backgroundColor: "#f3f4f6", color: "#6b7280" } : {}}>
                      {c.status}
                    </span>
                    <span className="odoo-timeline-dates">{c.dateRange}</span>
                  </div>
                </div>
                <div className="odoo-timeline-grid">
                  <div className="odoo-timeline-grid-item"><span>Type</span><span>{c.contractType}</span></div>
                  <div className="odoo-timeline-grid-item"><span>Structure</span><span>{c.salaryStructure}</span></div>
                  <div className="odoo-timeline-grid-item"><span>Wage</span><span>{c.wage}</span></div>
                  <div className="odoo-timeline-grid-item"><span>Frequency</span><span>{c.payFrequency}</span></div>
                  <div className="odoo-timeline-grid-item"><span>Schedule</span><span>{c.workingSchedule}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main Contract View - Modern Design
  return (
    <div className="employee-contract-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">My Contract</h1>
          <p className="odoo-page-subtitle">View your employment contract details</p>
        </div>
        <button type="button" className="odoo-btn-primary" onClick={() => setShowHistory(true)}>📋 View History</button>
      </div>

      {/* Status Header */}
      <div className="contract-status-header">
        <div className="contract-status-icon">📄</div>
        <div className="contract-status-text">
          <h3>{activeContract.contractReference || "Contract"}</h3>
          <p>{activeContract.contractType || "Permanent"} • {activeContract.startDate} — {activeContract.endDate}</p>
        </div>
        <span className="odoo-badge odoo-badge-green" style={{ marginLeft: "auto" }}>{activeContract.status || "Active"}</span>
      </div>

      {/* Grid: Contract Details + Side Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px", alignItems: "start" }}>
        {/* Left: Contract Details */}
        <div className="profile-section-card">
          <h3 className="profile-section-title"><span>💼</span> Contract Details</h3>
          <div className="profile-field-grid">
            <div className="profile-field">
              <span className="profile-field-label">Contract Reference</span>
              <span className="profile-field-value">{activeContract.contractReference}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Contract Type</span>
              <span className="profile-field-value">{activeContract.contractType}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Start Date</span>
              <span className="profile-field-value">{activeContract.startDate}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">End Date</span>
              <span className="profile-field-value">{activeContract.endDate}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Salary Structure</span>
              <span className="profile-field-value">{activeContract.salaryStructure}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Pay Frequency</span>
              <span className="profile-field-value">{activeContract.payFrequency}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Working Schedule</span>
              <span className="profile-field-value">{activeContract.workingSchedule}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Wage (Monthly)</span>
              <span className="profile-field-value" style={{ fontSize: "1rem", color: "var(--odoo-plum-primary)" }}>{activeContract.wage}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Probation End Date</span>
              <span className="profile-field-value">{activeContract.probationEndDate}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Currency</span>
              <span className="profile-field-value">{activeContract.currency}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Notice Period</span>
              <span className="profile-field-value">{activeContract.noticePeriod}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Status</span>
              <span className="odoo-badge odoo-badge-green">{activeContract.status}</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Additional Info */}
          <div className="profile-section-card">
            <h3 className="profile-section-title"><span>ℹ️</span> Additional Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                ["Department", activeContract.department],
                ["Job Position", activeContract.jobPosition],
                ["Manager", activeContract.manager],
                ["Employee Type", activeContract.employeeType],
                ["Created On", activeContract.createdOn],
                ["Created By", activeContract.createdBy],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--odoo-text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Summary */}
          <div className="profile-section-card">
            <h3 className="profile-section-title"><span>📅</span> Schedule Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                ["Working Days", activeContract.workingDays],
                ["Daily Hours", activeContract.dailyHours],
                ["Weekly Hours", activeContract.weeklyHours],
                ["Break Time", activeContract.breakTime],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--odoo-text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractView;
