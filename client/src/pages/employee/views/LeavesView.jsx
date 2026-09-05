import React, { useState, useEffect } from "react";
import { getEmployeeLeaves, submitLeaveRequest } from "../../../api/employee.api";
import { SkeletonListPage } from "../../../components/ui/SkeletonLoader";

const LeavesView = ({ refreshKey }) => {
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showForm, setShowForm] = useState(false);
  const [balance, setBalance] = useState({ totalAllocated: 0, used: 0, remaining: 0 });
  const [typesBreakdown, setTypesBreakdown] = useState([]);
  const [requests, setRequests] = useState([]);
  const [modal, setModal] = useState(null);

  // Form state
  const [form, setForm] = useState({
    type: "Annual Leave",
    fromDate: "",
    toDate: "",
    days: 1,
    reason: "",
  });

  // Over-balance warning
  const [overBalanceWarning, setOverBalanceWarning] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeLeaves({ status: statusFilter });
        if (isMounted && res?.data) {
          setBalance(res.data.balance || { totalAllocated: 0, used: 0, remaining: 0 });
          setTypesBreakdown(res.data.typesBreakdown || []);
          setRequests(res.data.requests || []);
        }
      } catch (err) {
        console.warn("Failed to load leaves:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLeaves();
    return () => { isMounted = false; };
  }, [statusFilter, refreshKey]);

  // Calculate days between dates
  const calcDays = (from, to) => {
    if (!from || !to) return 0;
    const d1 = new Date(from);
    const d2 = new Date(to);
    if (isNaN(d1) || isNaN(d2) || d2 < d1) return 0;
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleDateChange = (field, value) => {
    const updated = { ...form, [field]: value };
    if (updated.fromDate && updated.toDate) {
      const days = calcDays(updated.fromDate, updated.toDate);
      updated.days = days;

      // Check over-balance
      setOverBalanceWarning(days > balance.remaining);
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate) {
      setModal({ type: "error", title: "Missing Dates", message: "Please select both From and To dates." });
      return;
    }

    // Confirm over-balance submission
    if (overBalanceWarning) {
      setModal({
        type: "warning",
        title: "Over-Balance Warning",
        message: `You are requesting ${form.days} days but only have ${balance.remaining} days remaining. The extra ${form.days - balance.remaining} day(s) may result in a salary deduction. Do you want to proceed?`,
        confirmAction: submitRequest,
      });
      return;
    }

    await submitRequest();
  };

  const submitRequest = async () => {
    setModal(null);
    try {
      await submitLeaveRequest({
        type: form.type,
        fromDate: form.fromDate,
        toDate: form.toDate,
        days: form.days,
        reason: form.reason,
      });
      setModal({ type: "success", title: "Leave Submitted!", message: "Your leave request has been submitted for approval." });
      setShowForm(false);
      setForm({ type: "Annual Leave", fromDate: "", toDate: "", days: 1, reason: "" });
      setOverBalanceWarning(false);

      // Refresh data
      const res = await getEmployeeLeaves({ status: statusFilter });
      if (res?.data) {
        setBalance(res.data.balance || balance);
        setTypesBreakdown(res.data.typesBreakdown || typesBreakdown);
        setRequests(res.data.requests || requests);
      }
    } catch (err) {
      console.error("Submit leave error:", err);
      setModal({ type: "error", title: "Failed", message: "Could not submit leave request. Please try again." });
    }
  };

  // Themed Modal Component
  const ThemedModal = () => {
    if (!modal) return null;
    return (
      <div className="themed-modal-backdrop" onClick={() => setModal(null)}>
        <div className="themed-modal" onClick={(e) => e.stopPropagation()}>
          <div className="themed-modal-body">
            <div className={`themed-modal-icon ${modal.type}`}>
              {modal.type === "success" ? "✓" : modal.type === "warning" ? "⚠" : "✕"}
            </div>
            <div className="themed-modal-title">{modal.title}</div>
            <div className="themed-modal-message">{modal.message}</div>
          </div>
          <div className="themed-modal-actions">
            {modal.confirmAction ? (
              <>
                <button className="odoo-btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button className="odoo-btn-primary" onClick={modal.confirmAction}>Yes, Proceed</button>
              </>
            ) : (
              <button className="odoo-btn-primary" onClick={() => setModal(null)}>OK</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <SkeletonListPage rows={6} cols={5} />;

  return (
    <div className="employee-leaves-view">
      <ThemedModal />

      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">My Leaves</h1>
          <p className="odoo-page-subtitle">Manage your leave balance and requests</p>
        </div>
        <button
          type="button"
          className="odoo-btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Cancel" : "✈ Request Leave"}
        </button>
      </div>

      {/* Leave Balance Stats */}
      <div className="leave-balance-stats">
        <div className="leave-stat-card total">
          <span className="leave-stat-value">{balance.totalAllocated}</span>
          <span className="leave-stat-label">Total Available</span>
        </div>
        <div className="leave-stat-card taken">
          <span className="leave-stat-value">{balance.used}</span>
          <span className="leave-stat-label">Taken</span>
        </div>
        <div className="leave-stat-card remaining">
          <span className="leave-stat-value">{balance.remaining}</span>
          <span className="leave-stat-label">Remaining</span>
        </div>
        <div className="leave-stat-card requestable">
          <span className="leave-stat-value">{Math.max(0, balance.remaining)}</span>
          <span className="leave-stat-label">Can Request</span>
        </div>
      </div>

      {/* Per-Type Breakdown */}
      {typesBreakdown.length > 0 && (
        <div className="odoo-card" style={{ marginBottom: "16px" }}>
          <div className="odoo-card-header">
            <h3 className="odoo-card-title"><span>📊</span> Leave Type Breakdown</h3>
          </div>
          <div className="odoo-table-wrapper">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Allocated</th>
                  <th>Used</th>
                  <th>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {typesBreakdown.map((t, i) => (
                  <tr key={i}>
                    <td><strong>{t.name}</strong></td>
                    <td>{t.allocated}</td>
                    <td>{t.used}</td>
                    <td>
                      <span className={`odoo-badge ${t.remaining > 0 ? "odoo-badge-green" : "odoo-badge-red"}`}>
                        {t.remaining}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inline Leave Request Form */}
      {showForm && (
        <div className="inline-leave-form">
          <div className="inline-leave-form-header">
            <div className="inline-leave-form-title">
              <span className="odoo-leave-icon-box">✈</span>
              <h3>New Leave Request</h3>
            </div>
          </div>

          {/* Over-balance Warning Banner */}
          {overBalanceWarning && (
            <div className="leave-overbalance-warning">
              <span className="warning-icon">⚠️</span>
              <div className="warning-text">
                <strong>Over-Balance Warning:</strong> You are requesting <strong>{form.days}</strong> days but only have <strong>{balance.remaining}</strong> remaining.
                The extra <strong>{form.days - balance.remaining}</strong> day(s) may result in a <strong>salary deduction</strong>.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="odoo-form-group">
                <label className="odoo-form-label">Leave Type</label>
                <select className="odoo-form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {typesBreakdown.length > 0 ? typesBreakdown.map((t) => (
                    <option key={t.name} value={t.name}>{t.name} ({t.remaining} remaining)</option>
                  )) : (
                    <>
                      <option value="Annual Leave">Annual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Unpaid Leave">Unpaid Leave</option>
                    </>
                  )}
                </select>
              </div>
              <div className="odoo-form-group">
                <label className="odoo-form-label">Number of Days</label>
                <input type="number" className="odoo-form-input" value={form.days} readOnly style={{ backgroundColor: "#f9fafb" }} />
              </div>
              <div className="odoo-form-group">
                <label className="odoo-form-label">From Date</label>
                <input type="date" className="odoo-form-input" value={form.fromDate} onChange={(e) => handleDateChange("fromDate", e.target.value)} required />
              </div>
              <div className="odoo-form-group">
                <label className="odoo-form-label">To Date</label>
                <input type="date" className="odoo-form-input" value={form.toDate} onChange={(e) => handleDateChange("toDate", e.target.value)} required />
              </div>
              <div className="odoo-form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="odoo-form-label">Reason</label>
                <textarea className="odoo-form-textarea" rows="3" placeholder="Provide a reason for your leave request..." value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                <div className="odoo-char-count">{form.reason.length} / 500</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button type="button" className="odoo-btn-secondary" onClick={() => { setShowForm(false); setOverBalanceWarning(false); }}>Cancel</button>
              <button type="submit" className="odoo-btn-primary">📤 Submit Request</button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Request History */}
      <div className="odoo-card">
        <div className="odoo-card-header">
          <h3 className="odoo-card-title"><span>📋</span> Leave Request History</h3>
          <select className="odoo-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "var(--odoo-text-muted)", padding: "24px" }}>
                    No leave requests found
                  </td>
                </tr>
              )}
              {requests.map((r, i) => (
                <tr key={r.id || i}>
                  <td>{r.from}</td>
                  <td>{r.to}</td>
                  <td>{r.type}</td>
                  <td>{r.days}</td>
                  <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason}</td>
                  <td>
                    <span className={`odoo-badge ${
                      r.status === "Approved" ? "odoo-badge-green" :
                      r.status === "Pending" ? "odoo-badge-orange" :
                      "odoo-badge-red"
                    }`}>{r.status}</span>
                  </td>
                  <td>{r.appliedOn}</td>
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
