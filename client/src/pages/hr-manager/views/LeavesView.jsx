import React, { useState } from "react";
const cleanName = (n) => {
  if (!n) return "";
  const p = n.trim().split(/\s+/);
  return p.length === 2 && p[0].toLowerCase() === p[1].toLowerCase() ? p[0] : n.trim();
};
import hrApi from "../../../api/hr.api";
import { SkeletonKanban, SkeletonListPage } from "../../../components/ui/SkeletonLoader";

const LeavesView = ({
  leaveRequests = [],
  leavePipeline = { draft: [], toApprove: [], approved: [], rejected: [] },
  leaveSummary = {},
  leaveTypes = [],
  isLoading = false,
  onOpenRequestModal,
  onOpenTimeOffType,
  onViewLeave,
  onApprove,
  onReject,
  onRefresh,
}) => {
  const [requestSearch, setRequestSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All Leave Types");
  const [isProcessingId, setIsProcessingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Pipeline lists
  const draftList = leavePipeline.draft || [];
  const toApproveList = leavePipeline.toApprove || [];
  const approvedList = leavePipeline.approved || [];
  const rejectedList = leavePipeline.rejected || [];

  // Summary counts
  const totalCount = leaveRequests.length;
  const toApproveCount = leaveRequests.filter(
    (r) => (r.status || "").toLowerCase() === "pending" || (r.status || "").toLowerCase() === "to approve"
  ).length;
  const approvedCount = leaveRequests.filter(
    (r) => (r.status || "").toLowerCase() === "approved"
  ).length;
  const rejectedCount = leaveRequests.filter(
    (r) => (r.status || "").toLowerCase() === "rejected"
  ).length;

  const filterTabs = [
    { id: "All", label: `All (${totalCount})` },
    { id: "To Approve", label: `To Approve (${toApproveCount})` },
    { id: "Approved", label: `Approved (${approvedCount})` },
    { id: "Rejected", label: `Rejected (${rejectedCount})` },
  ];

  // Dynamic unique leave types for dropdown
  const uniqueLeaveTypes = [
    "All Leave Types",
    ...Array.from(
      new Set([
        ...leaveRequests.map((r) => r.leaveType).filter(Boolean),
        ...(leaveTypes || []).map((lt) => lt.name).filter(Boolean),
      ])
    ),
  ];


  // Immediate Approve
  const handleApprove = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setIsProcessingId(id);
      if (onApprove) {
        await onApprove({ id });
      } else {
        await hrApi.approveLeaveRequest(id);
        alert(`Leave request #${id} Approved successfully!`);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert("Failed to approve leave: " + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessingId(null);
    }
  };

  // Immediate Reject with reason prompt
  const handleReject = async (id, e) => {
    if (e) e.stopPropagation();
    const reason = prompt("Enter reason for leave rejection:", "Operational workload requirement");
    if (!reason) return;

    try {
      setIsProcessingId(id);
      if (onReject) {
        await onReject({ id, reason });
      } else {
        await hrApi.rejectLeaveRequest(id, reason);
        alert(`Leave request #${id} Rejected.`);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert("Failed to reject leave: " + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleExportCsv = () => {
    window.open(hrApi.getExportUrl("leave-requests"), "_blank");
  };

  // Filtered list
  const filteredRequests = leaveRequests.filter((r) => {
    // 1. Tab filter
    const s = (r.status || "").toLowerCase();
    if (activeTab === "To Approve" && s !== "pending" && s !== "to approve") return false;
    if (activeTab === "Approved" && s !== "approved") return false;
    if (activeTab === "Rejected" && s !== "rejected") return false;

    // 2. Leave type dropdown
    if (leaveTypeFilter !== "All Leave Types" && r.leaveType !== leaveTypeFilter) return false;

    // 3. Search query
    if (requestSearch) {
      const q = requestSearch.toLowerCase();
      const emp = (r.employee || "").toLowerCase();
      const code = (r.employee_code || "").toLowerCase();
      const dept = (r.department || "").toLowerCase();
      const type = (r.leaveType || "").toLowerCase();
      const reason = (r.reason || "").toLowerCase();
      const status = (r.status || "").toLowerCase();
      const matches =
        emp.includes(q) ||
        code.includes(q) ||
        dept.includes(q) ||
        type.includes(q) ||
        reason.includes(q) ||
        status.includes(q);
      if (!matches) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);
  const startIndex = (pageIndex - 1) * pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + pageSize);

  if (isLoading) {
    return viewMode === "kanban" ? (
      <SkeletonKanban cols={4} cardsPerCol={3} />
    ) : (
      <SkeletonListPage rows={7} cols={6} />
    );
  }

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

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* View Mode Switcher (List View / Kanban) */}
          <div
            style={{
              display: "inline-flex",
              background: "#f3f4f6",
              borderRadius: "6px",
              padding: "2px",
              border: "1px solid #e5e7eb",
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="Table / List View"
              style={{
                background: viewMode === "list" ? "#ffffff" : "transparent",
                color: viewMode === "list" ? "var(--hr-plum-primary)" : "#6b7280",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: viewMode === "list" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              <span>☰</span> List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              title="Kanban View"
              style={{
                background: viewMode === "kanban" ? "#ffffff" : "transparent",
                color: viewMode === "kanban" ? "var(--hr-plum-primary)" : "#6b7280",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: viewMode === "kanban" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              <span>☷</span> Kanban
            </button>
          </div>

          <button
            type="button"
            className="hr-btn-secondary"
            onClick={() => onOpenTimeOffType && onOpenTimeOffType(null)}
            title="Configure or add new Time Off Type"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
              fontSize: "0.82rem",
              padding: "8px 14px",
              borderRadius: "6px",
            }}
          >
            <span>⚙️</span> Time Off Types
          </button>

          <button
            type="button"
            className="hr-btn-primary"
            onClick={onOpenRequestModal}
          >
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span>
            <span>Request Leave</span>
          </button>
        </div>
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
                {leaveSummary?.approved ?? approvedCount}
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
                {leaveSummary?.pending ?? toApproveCount}
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
                {leaveSummary?.rejected ?? rejectedCount}
              </span>
            </div>
            <span className="hr-stat-subtext">Declined</span>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY VIEW: Table / List View */}
      {viewMode === "list" && (
        <div className="hr-section-card">
          {/* Sub-Filter Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "16px 20px 12px 20px",
              borderBottom: "1px solid var(--hr-border, #e5e7eb)",
              flexWrap: "wrap",
            }}
          >
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: activeTab === tab.id ? "none" : "1px solid #e5e7eb",
                  backgroundColor:
                    activeTab === tab.id ? "var(--hr-plum-primary, #714b67)" : "#ffffff",
                  color: activeTab === tab.id ? "#ffffff" : "#4b5563",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Section Controls Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              borderBottom: "1px solid var(--hr-border, #e5e7eb)",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <div className="hr-input-search-wrapper" style={{ width: "260px" }}>
                <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by employee, reason..."
                  value={requestSearch}
                  onChange={(e) => {
                    setRequestSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <select
                className="hr-btn-secondary"
                value={leaveTypeFilter}
                onChange={(e) => {
                  setLeaveTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ padding: "6px 12px" }}
              >
                {uniqueLeaveTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
                title="Refresh requests"
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
                  <th>Employee</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
                    >
                      No leave requests found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req) => {
                    const statusStr = (req.status || "").toLowerCase();
                    const isApproved = statusStr === "approved";
                    const isRejected = statusStr === "rejected";

                    return (
                      <tr
                        key={req.id}
                        className="hr-table-row-clickable"
                        onClick={() => onViewLeave && onViewLeave(req)}
                        title="Click to view details"
                      >
                        <td className="hr-emp-name-cell">
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                backgroundColor: "var(--hr-plum-primary, #714b67)",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {req.initials || "LV"}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.88rem" }}>
                                {cleanName(req.employee)}
                              </div>
                              {req.employee_code && (
                                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                  {req.employee_code}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: "0.85rem", color: "#374151" }}>
                          {req.formattedFromDate || req.fromDate}
                        </td>
                        <td style={{ fontSize: "0.85rem", color: "#374151" }}>
                          {req.formattedToDate || req.toDate}
                        </td>
                        <td style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          {req.appliedOn || "-"}
                        </td>
                        <td>
                          <span
                            className={`hr-badge ${
                              isApproved
                                ? "hr-badge-green"
                                : isRejected
                                ? "hr-badge-red"
                                : "hr-badge-amber"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredRequests.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                borderTop: "1px solid var(--hr-border, #e5e7eb)",
                fontSize: "0.85rem",
                color: "#6b7280",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <span>
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + pageSize, filteredRequests.length)} of{" "}
                {filteredRequests.length} leave requests
              </span>

              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <button
                  type="button"
                  className="hr-btn-secondary"
                  disabled={pageIndex <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{ padding: "4px 10px", minWidth: "32px" }}
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    style={{
                      padding: "4px 10px",
                      minWidth: "32px",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: p === pageIndex ? "none" : "1px solid #e5e7eb",
                      backgroundColor:
                        p === pageIndex ? "var(--hr-plum-primary, #714b67)" : "#ffffff",
                      color: p === pageIndex ? "#ffffff" : "#4b5563",
                    }}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  className="hr-btn-secondary"
                  disabled={pageIndex >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{ padding: "4px 10px", minWidth: "32px" }}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. OPTIONAL: Kanban View (If toggled by user) */}
      {viewMode === "kanban" && (
        <div className="hr-section-card">
          <div className="hr-kanban-board">
            {/* Column 1: Draft */}
            <div className="hr-kanban-col">
              <div className="hr-kanban-col-header hr-col-header-gray">
                <span>Draft</span>
                <span className="hr-kanban-count-badge">{draftList.length}</span>
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
                        <h4 className="hr-card-name">{cleanName(card.employee)}</h4>
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
                <span className="hr-kanban-count-badge">{toApproveList.length}</span>
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
                        <h4 className="hr-card-name">{cleanName(card.employee)}</h4>
                        <p className="hr-card-role">{card.leaveType}</p>
                      </div>
                    </div>
                    <div className="hr-card-bottom-row">
                      <span className="hr-card-date">
                        <span>📅</span> {card.dates}
                      </span>
                      <span style={{ color: "#6b7280" }}>⏱ {card.duration}</span>
                    </div>
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
                        className="hr-btn-approve"
                        style={{ flex: 1, justifyContent: "center" }}
                        disabled={isProcessingId === card.id}
                        onClick={(e) => handleApprove(card.id, e)}
                      >
                        ✓ Approve
                      </button>
                      <button
                        type="button"
                        className="hr-btn-reject"
                        style={{ flex: 1, justifyContent: "center" }}
                        disabled={isProcessingId === card.id}
                        onClick={(e) => handleReject(card.id, e)}
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
                <span className="hr-kanban-count-badge">{approvedList.length}</span>
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
                        <h4 className="hr-card-name">{cleanName(card.employee)}</h4>
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
                <span className="hr-kanban-count-badge">{rejectedList.length}</span>
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
                        <h4 className="hr-card-name">{cleanName(card.employee)}</h4>
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
      )}
    </div>
  );
};

export default LeavesView;
