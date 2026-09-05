import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

export default function ContractsPayrollView() {
  const [contracts, setContracts] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, expired: 0, terminated: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedContract, setSelectedContract] = useState(null);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getContracts();
      // data might be { contracts, counts } or an array of contracts
      if (Array.isArray(data)) {
        setContracts(data);
        setCounts({
          total: data.length,
          active: data.filter((c) => c.status === "ACTIVE").length,
          expired: data.filter((c) => c.status === "EXPIRED").length,
          terminated: data.filter((c) => c.status === "TERMINATED").length,
        });
      } else if (data?.contracts) {
        setContracts(data.contracts);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to fetch contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const formattedContracts = contracts.map((c) => {
    const wageNum = parseFloat(c.wage) || 50000;
    const startStr = c.start_date
      ? new Date(c.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "-";
    const endStr = c.end_date
      ? new Date(c.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "Indefinite";

    return {
      id: c.id,
      ref: c.contract_number || `CNT-${c.employee_code || c.id}`,
      code: c.employee_code || `EMP${c.employee_id}`,
      employee: c.employee_name || "Employee",
      dept: c.department_name || "General",
      role: c.designation || "Staff Member",
      structure: c.salary_structure_name || "Default Structure (Full Time)",
      wage: "₹ " + wageNum.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      frequency: c.pay_frequency ? c.pay_frequency.charAt(0) + c.pay_frequency.slice(1).toLowerCase() : "Monthly",
      schedule: "General (Mon - Fri)",
      startDate: startStr,
      endDate: endStr,
      status: c.status === "ACTIVE" ? "Active" : c.status === "EXPIRED" ? "Expired" : "Terminated",
      noticePeriod: "30 Days",
      probationEnd: "-",
    };
  });

  const uniqueDepts = ["All Departments", ...Array.from(new Set(formattedContracts.map((c) => c.dept).filter(Boolean)))];

  const filteredContracts = formattedContracts.filter((c) => {
    if (deptFilter !== "All Departments" && c.dept !== deptFilter) return false;
    if (statusFilter !== "All Status" && c.status !== statusFilter) return false;
    const q = searchTerm.toLowerCase();
    return (
      c.employee.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.ref.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mgr-content-body">
      {/* 1. Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Contracts</h1>
          <p className="mgr-page-subtitle">
            Manage employee compensation contracts, wage terms and salary structures synchronized with database
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={fetchContracts}
            title="Refresh contracts from database"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="mgr-kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="mgr-kpi-card">
          <span className="mgr-kpi-title">Total Contracts</span>
          <div className="mgr-kpi-val">{counts.total || contracts.length}</div>
          <span className="mgr-kpi-sub">Total database contracts</span>
        </div>
        <div className="mgr-kpi-card">
          <span className="mgr-kpi-title">Active Contracts</span>
          <div className="mgr-kpi-val" style={{ color: "#059669" }}>
            {counts.active}
          </div>
          <span className="mgr-kpi-sub">Payroll eligible contracts</span>
        </div>
        <div className="mgr-kpi-card">
          <span className="mgr-kpi-title">Expired Contracts</span>
          <div className="mgr-kpi-val" style={{ color: "#d97706" }}>
            {counts.expired}
          </div>
          <span className="mgr-kpi-sub">Requires renewal</span>
        </div>
        <div className="mgr-kpi-card">
          <span className="mgr-kpi-title">Terminated</span>
          <div className="mgr-kpi-val" style={{ color: "#dc2626" }}>
            {counts.terminated}
          </div>
          <span className="mgr-kpi-sub">Completed contracts</span>
        </div>
      </div>

      {/* 3. Filters & Table */}
      <div className="mgr-section-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--mgr-border)",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="mgr-input-search-wrapper" style={{ width: "260px" }}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search contract ref, employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="mgr-btn-secondary"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ padding: "6px 12px" }}
            >
              {uniqueDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="mgr-btn-secondary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "6px 12px" }}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
          <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
            Showing {filteredContracts.length} of {contracts.length} contracts
          </span>
        </div>

        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading synchronized contract records from database...
          </div>
        )}

        {!loading && (
          <div className="mgr-table-container">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>#</th>
                  <th>Contract Ref</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Salary Structure</th>
                  <th style={{ textAlign: "right" }}>Wage</th>
                  <th>Validity</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((c, index) => (
                  <tr key={c.id || index}>
                    <td style={{ color: "#9ca3af" }}>{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>
                      <code>{c.ref}</code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{c.employee}</div>
                      <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                        {c.code} • {c.role}
                      </div>
                    </td>
                    <td>{c.dept}</td>
                    <td style={{ fontSize: "0.8rem", color: "#4b5563" }}>{c.structure}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#111827" }}>{c.wage}</td>
                    <td style={{ fontSize: "0.78rem" }}>
                      {c.startDate} - {c.endDate}
                    </td>
                    <td>
                      <span
                        className={`mgr-badge ${
                          c.status === "Active" ? "mgr-badge-green" : "mgr-badge-red"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="hr-btn-view"
                        onClick={() => setSelectedContract(c)}
                      >
                        <span>👁</span> View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredContracts.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                      No contracts matching filter criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedContract && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setSelectedContract(null)}
        >
          <div
            className="mgr-section-card"
            style={{ maxWidth: "560px", width: "100%", padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                Contract: {selectedContract.ref}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedContract(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#9ca3af" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 18px", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Employee</span>
                <strong>
                  {selectedContract.employee} ({selectedContract.code})
                </strong>
              </div>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Department & Role</span>
                <span>
                  {selectedContract.dept} • {selectedContract.role}
                </span>
              </div>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Salary Structure</span>
                <span>{selectedContract.structure}</span>
              </div>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Monthly Wage</span>
                <strong style={{ color: "#111827", fontSize: "0.95rem" }}>{selectedContract.wage}</strong>
              </div>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Pay Frequency</span>
                <span>{selectedContract.frequency}</span>
              </div>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Working Schedule</span>
                <span>{selectedContract.schedule}</span>
              </div>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Validity</span>
                <span>
                  {selectedContract.startDate} to {selectedContract.endDate}
                </span>
              </div>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Status</span>
                <span className="mgr-badge mgr-badge-green">{selectedContract.status}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "14px",
              }}
            >
              <button
                type="button"
                className="mgr-btn-secondary"
                onClick={() => setSelectedContract(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
