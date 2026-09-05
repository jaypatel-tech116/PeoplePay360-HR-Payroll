import React, { useState, useEffect } from "react";
import { getEmployeeLeaves } from "../../../api/employee.api";
import { SkeletonListPage } from "../../../components/ui/SkeletonLoader";

const LeavesView = ({ onOpenLeaveModal, refreshKey }) => {
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeLeaves({ status: statusFilter });
        if (isMounted && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn("Could not load employee leaves:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLeaves();
    return () => {
      isMounted = false;
    };
  }, [statusFilter, refreshKey]);

  const balance = data?.balance || {
    totalAllocated: 12,
    used: 3,
    remaining: 9,
  };

  const types = data?.types || {
    "Annual Leave": "12 Days",
    "Sick Leave": "10 Days",
    "Casual Leave": "6 Days",
    "Unpaid Leave": "-",
  };

  const requests = data?.requests || [
    { id: 1, from: "15 Sep 2025", to: "16 Sep 2025", type: "Annual Leave", days: 2, reason: "Family function", status: "Pending", appliedOn: "10 Sep 2025" },
    { id: 2, from: "10 Jul 2025", to: "10 Jul 2025", type: "Sick Leave", days: 1, reason: "Not feeling well", status: "Approved", appliedOn: "08 Jul 2025" },
    { id: 3, from: "12 Jun 2025", to: "13 Jun 2025", type: "Annual Leave", days: 2, reason: "Personal work", status: "Approved", appliedOn: "05 Jun 2025" },
    { id: 4, from: "05 Mar 2025", to: "05 Mar 2025", type: "Sick Leave", days: 1, reason: "Fever", status: "Rejected", appliedOn: "03 Mar 2025" },
  ];

  const ratio = balance.totalAllocated > 0 ? balance.remaining / balance.totalAllocated : 0.75;
  const strokeDashoffset = Math.round(238.76 * (1 - Math.min(1, Math.max(0, ratio))));

  if (loading) return <SkeletonListPage rows={5} cols={6} />;

  return (
    <div className="employee-leaves-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">My Leaves</h1>
          <p className="odoo-page-subtitle">View your leave balance and manage leave requests</p>
        </div>
        <button
          type="button"
          className="odoo-btn-primary"
          onClick={onOpenLeaveModal}
        >
          + Request Leave
        </button>
      </div>

      {/* Top 3 Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr 1.3fr",
          gap: "16px",
          marginBottom: "20px",
        }}
        className="odoo-leaves-top-grid"
      >
        {/* Card 1: Leave Balance Donut */}
        <div className="odoo-card">
          <h3 className="odoo-card-title" style={{ marginBottom: "12px" }}>
            <span>🌴</span> Leave Balance
          </h3>

          <div className="donut-container">
            <svg className="donut-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" className="donut-circle-bg" />
              <circle
                cx="50"
                cy="50"
                r="38"
                className="donut-circle-val"
                strokeDasharray="238.76"
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="donut-center-text">
              <span className="donut-big-num">{balance.remaining}</span>
              <span className="donut-sub-text">Days Remaining</span>
            </div>
          </div>

          <div className="donut-legend">
            <div className="donut-legend-item">
              <div className="donut-legend-left">
                <span className="donut-dot allocated" />
                <span>Total Allocated</span>
              </div>
              <strong>{balance.totalAllocated}</strong>
            </div>
            <div className="donut-legend-item">
              <div className="donut-legend-left">
                <span className="donut-dot used" />
                <span>Used</span>
              </div>
              <strong>{balance.used}</strong>
            </div>
            <div className="donut-legend-item">
              <div className="donut-legend-left">
                <span className="donut-dot remaining" />
                <span>Remaining</span>
              </div>
              <strong>{balance.remaining}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Leave Types */}
        <div className="odoo-card">
          <h3 className="odoo-card-title" style={{ marginBottom: "16px" }}>
            <span>🗂️</span> Leave Types
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.825rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ backgroundColor: "#f3ebf1", padding: "6px 8px", borderRadius: "6px" }}>📅</span>
                <span>Annual Leave</span>
              </div>
              <strong>{types["Annual Leave"] || "12 Days"}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ backgroundColor: "#e6f7ef", padding: "6px 8px", borderRadius: "6px" }}>📅</span>
                <span>Sick Leave</span>
              </div>
              <strong>{types["Sick Leave"] || "10 Days"}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ backgroundColor: "#fef3c7", padding: "6px 8px", borderRadius: "6px" }}>📅</span>
                <span>Casual Leave</span>
              </div>
              <strong>{types["Casual Leave"] || "6 Days"}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ backgroundColor: "#fee2e2", padding: "6px 8px", borderRadius: "6px" }}>📅</span>
                <span>Unpaid Leave</span>
              </div>
              <strong>{types["Unpaid Leave"] || "-"}</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Quick Actions */}
        <div className="odoo-card">
          <h3 className="odoo-card-title" style={{ marginBottom: "16px" }}>
            <span>⚡</span> Quick Actions
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                backgroundColor: "#f9fafb",
                border: "1px solid var(--odoo-border)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onClick={onOpenLeaveModal}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f3ebf1", color: "var(--odoo-plum-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>✈</span>
                <div>
                  <div style={{ fontSize: "0.825rem", fontWeight: 600 }}>Request Leave</div>
                  <div style={{ fontSize: "0.725rem", color: "var(--odoo-text-muted)" }}>Submit a new leave request</div>
                </div>
              </div>
              <span style={{ color: "var(--odoo-text-muted)" }}>›</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                backgroundColor: "#f9fafb",
                border: "1px solid var(--odoo-border)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onClick={() => alert(`You have ${requests.length} leave requests on record.`)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>⏱</span>
                <div>
                  <div style={{ fontSize: "0.825rem", fontWeight: 600 }}>View Leave History</div>
                  <div style={{ fontSize: "0.725rem", color: "var(--odoo-text-muted)" }}>Check your past leave requests</div>
                </div>
              </div>
              <span style={{ color: "var(--odoo-text-muted)" }}>›</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                backgroundColor: "#f9fafb",
                border: "1px solid var(--odoo-border)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onClick={() => alert("Company Leave Policy: 12 days annual leave, 10 days sick leave, 6 days casual leave.")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>📑</span>
                <div>
                  <div style={{ fontSize: "0.825rem", fontWeight: 600 }}>Check Leave Policy</div>
                  <div style={{ fontSize: "0.725rem", color: "var(--odoo-text-muted)" }}>View company leave policies</div>
                </div>
              </div>
              <span style={{ color: "var(--odoo-text-muted)" }}>›</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: My Leave Requests */}
      <div className="odoo-card">
        <div className="odoo-card-header">
          <h3 className="odoo-card-title">
            <span>📅</span> My Leave Requests
          </h3>

          <select
            className="odoo-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="odoo-table-wrapper">
          <table className="odoo-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>From</th>
                <th>To</th>
                <th>Leave Type</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, index) => (
                <tr key={r.id || index}>
                  <td>{index + 1}</td>
                  <td>{r.from}</td>
                  <td>{r.to}</td>
                  <td>{r.type}</td>
                  <td>{r.days}</td>
                  <td>{r.reason}</td>
                  <td>
                    <span
                      className={`odoo-badge ${
                        r.status === "Approved"
                          ? "odoo-badge-green"
                          : r.status === "Pending"
                          ? "odoo-badge-orange"
                          : "odoo-badge-red"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{r.appliedOn}</td>
                  <td>
                    <button
                      type="button"
                      className="odoo-table-action-btn"
                      onClick={() => alert(`Leave Details:\nFrom: ${r.from}\nTo: ${r.to}\nType: ${r.type}\nReason: ${r.reason}\nStatus: ${r.status}`)}
                    >
                      👁 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeavesView;
