import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

const ManagerPaySlipsView = ({ onSelectPaySlip }) => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getPayslips();
      setPayslips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load payslips for manager view:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const formattedSlips = payslips.map((s) => {
    const grossNum = parseFloat(s.gross_amount) || 0;
    const netNum = parseFloat(s.net_amount) || 0;
    const dedNum = parseFloat(s.deduction_amount) || 0;

    const startStr = s.period_start
      ? new Date(s.period_start).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      : "";
    const endStr = s.period_end
      ? new Date(s.period_end).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "";

    return {
      id: s.id,
      code: s.employee_code || `EMP${s.employee_id}`,
      name: s.employee_name || "Employee",
      dept: s.department_name || "General",
      role: s.designation || "Staff Member",
      period: startStr && endStr ? `${startStr} – ${endStr}` : "-",
      gross: "₹ " + grossNum.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      deduction: "₹ " + dedNum.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      net: "₹ " + netNum.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      status: s.payment_status === "PAID" ? "Paid" : s.status || "Computed",
      paymentStatus: s.payment_status || "UNPAID",
      pdfUrl: payrollApi.getPayslipPdfUrl(s.id),
      raw: s,
    };
  });

  const uniqueDepts = ["All Departments", ...Array.from(new Set(formattedSlips.map((s) => s.dept).filter(Boolean)))];

  const filteredSlips = formattedSlips.filter((s) => {
    if (deptFilter !== "All Departments" && s.dept !== deptFilter) return false;
    if (statusFilter !== "All Status" && s.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <div className="mgr-content-body">
      {/* 1. Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Payslips</h1>
          <p className="mgr-page-subtitle">
            View, audit and download employee payslips synchronized with database
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={fetchPayslips}
            title="Refresh payslips"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="mgr-section-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            padding: "16px 20px",
            borderBottom: "1px solid var(--mgr-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div className="mgr-input-search-wrapper" style={{ width: "240px" }}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search employee, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <option value="Paid">Paid</option>
              <option value="Validated">Validated</option>
              <option value="Computed">Computed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
            Showing {filteredSlips.length} of {payslips.length} payslips
          </span>
        </div>

        {/* 3. Table */}
        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading payslips from database...
          </div>
        )}

        {!loading && (
          <div className="mgr-table-container">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Period</th>
                  <th style={{ textAlign: "right" }}>Gross</th>
                  <th style={{ textAlign: "right" }}>Deductions</th>
                  <th style={{ textAlign: "right" }}>Net Salary</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Statement</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlips.map((s, index) => (
                  <tr
                    key={s.id || index}
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelectPaySlip && onSelectPaySlip(s.raw || s)}
                  >
                    <td style={{ color: "#9ca3af" }}>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{s.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                        {s.code} • {s.role}
                      </div>
                    </td>
                    <td>{s.dept}</td>
                    <td style={{ fontSize: "0.82rem", color: "#4b5563" }}>{s.period}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{s.gross}</td>
                    <td style={{ textAlign: "right", color: "#dc2626" }}>{s.deduction}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--mgr-plum-primary)" }}>
                      {s.net}
                    </td>
                    <td>
                      <span
                        className={`mgr-badge ${
                          s.status === "Paid"
                            ? "mgr-badge-green"
                            : s.status === "Validated"
                            ? "mgr-badge-purple"
                            : "mgr-badge-blue"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <a
                        href={s.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hr-btn-view"
                        style={{ textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>📄</span> PDF
                      </a>
                    </td>
                  </tr>
                ))}

                {filteredSlips.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                      No payslips found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPaySlipsView;
