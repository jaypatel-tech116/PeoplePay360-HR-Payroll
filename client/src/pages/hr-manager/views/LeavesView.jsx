import React, { useState } from "react";
import hrApi from "../../../api/hr.api";

const LeavesView = ({
  leaveRequests = [],
  leavePipeline = { draft: [], toApprove: [], approved: [], rejected: [] },
  leaveSummary = {},
  onOpenRequestModal,
  onViewLeave,
  onApprove,
  onReject,
  onRefresh,
}) => {
  const [requestSearch, setRequestSearch] = useState("");
  const [viewMode, setViewMode] = useState("kanban");
  const [selectedLeaveIds, setSelectedLeaveIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Normalize pipeline
  const draftList = leavePipeline.draft || [];
  const toApproveList = leavePipeline.toApprove || [];
  const approvedList = leavePipeline.approved || [];
  const rejectedList = leavePipeline.rejected || [];

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedLeaveIds.length === leaveRequests.length) {
      setSelectedLeaveIds([]);
    } else {
      setSelectedLeaveIds(leaveRequests.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedLeaveIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApprove = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setIsProcessing(true);
      if (onApprove) {
        await onApprove({ id });
      } else {
        await hrApi.approveLeaveRequest(id);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to approve leave: " + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id, e) => {
    if (e) e.stopPropagation();
    const reason = prompt("Enter reason for leave rejection:", "Operational workload");
    if (!reason) return;

    try {
      setIsProcessing(true);
      if (onReject) {
        await onReject({ id, reason });
      } else {
        await hrApi.rejectLeaveRequest(id, reason);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to reject leave: " + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCsv = () => {
    window.open(hrApi.getExportUrl("leave-requests"), "_blank");
  };

  // Filtered list
  const filteredRequests = leaveRequests.filter((r) => {
    const q = requestSearch.toLowerCase();
    const emp = (r.employee || "").toLowerCase();
    const type = (r.leaveType || "").toLowerCase();
    const status = (r.status || "").toLowerCase();
    return emp.includes(q) || type.includes(q) || status.includes(q);
  });

  return (
    <div className="hr-content-body">
      {/* 1. Page Header */}
      <div className="hr-page-header">
        <div>
          <h1 className="hr-page-title">Leaves</h1>
          <p className="hr-page-subtitle">
            Manage leave requests and track employee leave balance
          </p>
        </div>
        <button
          type="button"
          className="hr-btn-primary"
          onClick={onOpenRequestModal}
        >
          <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span>
          <span>Request Leave</span>
        </button>
      </div>

      {/* 2. Metrics Row from Real Database */}
      <div className="hr-stats-grid">
        {/* Total Requests */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-purple">📅</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Total Requests</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">
                {leaveSummary?.total_requests ?? leaveRequests.length}
              </span>
              <span className="hr-stat-pill-green">↑ 20%</span>
            </div>
            <span className="hr-stat-subtext">Recorded</span>
          </div>
        </div>

        {/* Approved */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-green">✓</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Approved</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">
                {leaveSummary?.approved ?? approvedList.length}
              </span>
            </div>
            <span className="hr-stat-subtext">Approved</span>
          </div>
        </div>

        {/* Pending */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-amber">⏱</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Pending</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">
                {leaveSummary?.pending ?? toApproveList.length}
              </span>
            </div>
            <span className="hr-stat-subtext">Awaiting Review</span>
          </div>
        </div>

        {/* Rejected */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-red">✕</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Rejected</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">
                {leaveSummary?.rejected ?? rejectedList.length}
              </span>
            </div>
            <span className="hr-stat-subtext">Declined</span>
          </div>
        </div>
      </div>

      {/* 3. Leaves KanBan Board */}
      <div className="hr-section-card">
        <div className="hr-kanban-board">
          {/* Column 1: Draft */}
          <div className="hr-kanban-col">
            <div className="hr-kanban-col-header hr-col-header-gray">
              <span>Draft</span>
              <span className="hr-kanban-count-badge">
                {draftList.length}
              </span>
            </div>
            <div className="hr-kanban-cards">
              {draftList.map((card) => (
                <div
                  key={card.id}
                  className="hr-pipeline-card"
                  onClick={() => onViewLeave(card)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="hr-card-top-row">
                    <div className="hr-card-avatar">{card.initials || "LV"}</div>
                    <div className="hr-card-emp-info">
                      <h4 className="hr-card-name">{card.employee}</h4>
                      <p className="hr-card-role">{card.leaveType}</p>
                    </div>
                  </div>
                  <div className="hr-card-bottom-row">
                    <span className="hr-card-date">
                      <span>📅</span> {card.dates}
                    </span>
                    <span style={{ color: "#6b7280" }}>⏱ {card.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: To Approve */}
          <div className="hr-kanban-col">
            <div className="hr-kanban-col-header hr-col-header-amber">
              <span>To Approve</span>
              <span className="hr-kanban-count-badge">
                {toApproveList.length}
              </span>
            </div>
            <div className="hr-kanban-cards">
              {toApproveList.map((card) => (
                <div
                  key={card.id}
                  className="hr-pipeline-card"
                  onClick={() => onViewLeave(card)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="hr-card-top-row">
                    <div className="hr-card-avatar">{card.initials || "LV"}</div>
                    <div className="hr-card-emp-info">
                      <h4 className="hr-card-name">{card.employee}</h4>
                      <p className="hr-card-role">{card.leaveType}</p>
                    </div>
                  </div>
                  <div className="hr-card-bottom-row">
                    <span className="hr-card-date">
                      <span>📅</span> {card.dates}
                    </span>
                    <span style={{ color: "#6b7280" }}>⏱ {card.duration}</span>
                  </div>
                  {/* Quick Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      marginTop: "10px",
                      paddingTop: "8px",
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={(e) => handleApprove(card.id, e)}
                      style={{
                        flex: 1,
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "5px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={(e) => handleReject(card.id, e)}
                      style={{
                        flex: 1,
                        background: "#fef2f2",
                        color: "#ef4444",
                        border: "1px solid #fecaca",
                        borderRadius: "6px",
                        padding: "5px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Approved */}
          <div className="hr-kanban-col">
            <div className="hr-kanban-col-header hr-col-header-green">
              <span>Approved</span>
              <span className="hr-kanban-count-badge">
                {approvedList.length}
              </span>
            </div>
            <div className="hr-kanban-cards">
              {approvedList.map((card) => (
                <div
                  key={card.id}
                  className="hr-pipeline-card"
                  onClick={() => onViewLeave(card)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="hr-card-top-row">
                    <div className="hr-card-avatar">{card.initials || "LV"}</div>
                    <div className="hr-card-emp-info">
                      <h4 className="hr-card-name">{card.employee}</h4>
                      <p className="hr-card-role">{card.leaveType}</p>
                    </div>
                  </div>
                  <div className="hr-card-bottom-row">
                    <span className="hr-card-date">
                      <span>📅</span> {card.dates}
                    </span>
                    <span style={{ color: "#6b7280" }}>⏱ {card.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Rejected */}
          <div className="hr-kanban-col">
            <div className="hr-kanban-col-header hr-col-header-red">
              <span>Rejected</span>
              <span className="hr-kanban-count-badge">
                {rejectedList.length}
              </span>
            </div>
            <div className="hr-kanban-cards">
              {rejectedList.map((card) => (
                <div
                  key={card.id}
                  className="hr-pipeline-card"
                  onClick={() => onViewLeave(card)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="hr-card-top-row">
                    <div className="hr-card-avatar">{card.initials || "LV"}</div>
                    <div className="hr-card-emp-info">
                      <h4 className="hr-card-name">{card.employee}</h4>
                      <p className="hr-card-role">{card.leaveType}</p>
                    </div>
                  </div>
                  <div className="hr-card-bottom-row">
                    <span className="hr-card-date">
                      <span>📅</span> {card.dates}
                    </span>
                    <span style={{ color: "#6b7280" }}>⏱ {card.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: All Leave Requests */}
      <div className="hr-section-card">
        <div className="hr-section-header">
          <div className="hr-section-title-group">
            <div className="hr-section-icon">📋</div>
            <div>
              <h2 className="hr-section-heading">All Leave Requests</h2>
            </div>
          </div>

          <div className="hr-section-controls">
            <div className="hr-input-search-wrapper">
              <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>🔍</span>
              <input
                type="text"
                placeholder="Search requests..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="hr-btn-secondary"
              onClick={handleExportCsv}
            >
              <span>📥</span> Export CSV
            </button>

            <button
              type="button"
              className="hr-btn-secondary"
              onClick={() => {
                if (onRefresh) onRefresh();
              }}
              title="Refresh"
            >
              <span>🔄</span> Refresh
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="hr-table-responsive">
          <table className="hr-data-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={
                      selectedLeaveIds.length === filteredRequests.length &&
                      filteredRequests.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Applied On</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                    No leave requests found. Click "+ Request Leave" to submit a leave.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedLeaveIds.includes(req.id)}
                        onChange={() => toggleSelectRow(req.id)}
                      />
                    </td>
                    <td className="hr-emp-name-cell">{req.employee}</td>
                    <td>{req.leaveType}</td>
                    <td>{req.formattedFromDate || req.fromDate}</td>
                    <td>{req.formattedToDate || req.toDate}</td>
                    <td>{req.duration}</td>
                    <td>
                      <span
                        className={`hr-badge ${
                          req.status === "Approved"
                            ? "hr-badge-green"
                            : req.status === "Rejected"
                            ? "hr-badge-red"
                            : "hr-badge-amber"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td>{req.appliedOn || "-"}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        {(req.status === "Pending" || req.status === "To Approve") && (
                          <>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={(e) => handleApprove(req.id, e)}
                              style={{
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              ✓ Approve
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={(e) => handleReject(req.id, e)}
                              style={{
                                background: "#fef2f2",
                                color: "#ef4444",
                                border: "1px solid #fecaca",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="hr-btn-view"
                          onClick={() => onViewLeave(req)}
                        >
                          <span>👁</span> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeavesView;
