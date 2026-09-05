import React, { useState, useEffect } from "react";
import { getTimeOffRequests, updateTimeOffStatus } from "../../../api/admin.api";
import { MOCK_TIME_OFF } from "../adminMockData";

export default function TimeOffRequestsView() {
  const [requests, setRequests] = useState(MOCK_TIME_OFF);
  const [activePill, setActivePill] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Leave Types");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const loadData = async () => {
    try {
      const data = await getTimeOffRequests();
      if (data && data.length > 0) {
        setRequests(data.map((r) => ({
          id: r.id,
          code: r.employee_code || "EMP001",
          name: r.employee_name || "Employee",
          type: r.leave_type_name || "Annual Leave",
          from: r.start_date ? new Date(r.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-",
          to: r.end_date ? new Date(r.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-",
          days: parseFloat(r.days) || 1,
          status: r.status || "Pending",
        })));
      }
    } catch (err) {
      console.error("Error loading leave requests:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await updateTimeOffStatus(id, { status: "Approved" });
      await loadData();
    } catch (err) {
      alert("Failed to approve leave: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    try {
      await updateTimeOffStatus(id, { status: "Rejected" });
      await loadData();
    } catch (err) {
      alert("Failed to reject leave: " + (err.response?.data?.message || err.message));
    }
  };

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  const pills = [
    { id: "All", label: `All (${totalCount})` },
    { id: "Pending", label: `Pending (${pendingCount})` },
    { id: "Approved", label: `Approved (${approvedCount})` },
    { id: "Rejected", label: `Rejected (${rejectedCount})` },
  ];


  const filtered = requests.filter((r) => {
    if (activePill !== "All" && r.status !== activePill) return false;
    if (typeFilter !== "All Leave Types" && r.type !== typeFilter) return false;
    if (statusFilter !== "All Status" && r.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
  });

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Time Off Requests</h1>
          <p className="adm-page-subtitle">Manage employee leave requests</p>
        </div>

        <button type="button" className="adm-btn-primary" onClick={() => alert("New Leave Request modal")}>
          <span>+</span> New Request
        </button>
      </div>

      {/* 2. Sub-Filter Pills */}
      <div className="adm-pill-filters-bar">
        {pills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            className={`adm-filter-pill ${activePill === pill.id ? "active" : ""}`}
            onClick={() => setActivePill(pill.id)}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* 3. Filters Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div className="adm-input-search-wrapper" style={{ width: "260px" }}>
          <span style={{ color: "var(--adm-text-light)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by employee name, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="adm-btn-secondary"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Leave Types">All Leave Types ⌵</option>
            <option value="Annual Leave">Annual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Maternity Leave">Maternity Leave</option>
            <option value="Paternity Leave">Paternity Leave</option>
          </select>

          <select
            className="adm-btn-secondary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Status">All Status ⌵</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button type="button" className="adm-btn-secondary">
            <span>⚙️</span> Filters
          </button>
        </div>
      </div>

      {/* 4. Table Card */}
      <div className="adm-section-card">
        <div className="adm-table-responsive">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th style={{ textAlign: "center" }}>Days</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--adm-text-light)" }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{r.code}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{r.name}</td>
                  <td>{r.type}</td>
                  <td>{r.from}</td>
                  <td>{r.to}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{r.days}</td>
                  <td>
                    <span
                      className={`adm-badge ${
                        r.status === "Approved"
                          ? "adm-badge-green"
                          : r.status === "Rejected"
                          ? "adm-badge-red"
                          : "adm-badge-amber"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {r.status === "Pending" ? (
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="adm-badge adm-badge-green"
                          style={{ cursor: "pointer", border: "none", padding: "4px 8px" }}
                          onClick={() => handleApprove(r.id)}
                          title="Approve Leave"
                        >
                          ✓ Approve
                        </button>
                        <button
                          type="button"
                          className="adm-badge adm-badge-red"
                          style={{ cursor: "pointer", border: "none", padding: "4px 8px" }}
                          onClick={() => handleReject(r.id)}
                          title="Reject Leave"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--adm-text-light)" }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-pagination-footer">
          <span>Showing 1 to {filtered.length} of 12 leave requests</span>
          <div className="adm-pagination-controls">
            <button type="button" className="adm-page-btn">‹</button>
            <button type="button" className="adm-page-btn active">1</button>
            <button type="button" className="adm-page-btn">2</button>
            <button type="button" className="adm-page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
