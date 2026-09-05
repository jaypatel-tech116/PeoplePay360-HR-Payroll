import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

const PayCyclesListView = ({ onOpenCreateWizard, onSelectCycle }) => {
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("All Periods");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPayruns = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getPayruns();
      setPayruns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load payruns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayruns();
  }, []);

  const formattedPayruns = payruns.map((pr) => {
    const grossNum = parseFloat(pr.total_gross) || 0;
    const netNum = parseFloat(pr.total_net) || 0;

    const startStr = pr.period_start
      ? new Date(pr.period_start).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      : "";
    const endStr = pr.period_end
      ? new Date(pr.period_end).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "";
    const payDateStr = pr.pay_date
      ? new Date(pr.pay_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "-";

    return {
      id: pr.id,
      runNumber: pr.run_number || `PR-${pr.id}`,
      payrun: `${pr.month || ""} ${pr.year || ""}`.trim() || pr.run_number || "Payrun",
      period: startStr && endStr ? `${startStr} – ${endStr}` : "-",
      payDate: payDateStr,
      employees: pr.employee_count || 0,
      gross: "₹ " + grossNum.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      net: "₹ " + netNum.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      status: pr.status || "Draft",
      structure: pr.salary_structure_name || "Default Structure",
      raw: pr,
    };
  });

  // Extract unique periods for filter dropdown
  const uniquePeriods = ["All Periods", ...Array.from(new Set(formattedPayruns.map((p) => p.payrun).filter(Boolean)))];

  const filteredPayruns = formattedPayruns.filter((p) => {
    if (selectedMonth !== "All Periods" && p.payrun !== selectedMonth) return false;
    if (statusFilter !== "All Status" && p.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    const q = searchQuery.toLowerCase();
    return p.payrun.toLowerCase().includes(q) || p.runNumber.toLowerCase().includes(q);
  });

  return (
    <div className="mgr-content-body">
      {/* 1. Header & Actions */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Payruns</h1>
          <p className="mgr-page-subtitle">
            Create, process, validate and finalize payroll batches synchronized with database
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={fetchPayruns}
            title="Refresh payruns from database"
          >
            🔄 Refresh
          </button>
          <button
            type="button"
            className="mgr-btn-primary"
            onClick={onOpenCreateWizard}
          >
            <span>+</span> Create Payrun
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
                placeholder="Search payruns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="mgr-btn-secondary"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ padding: "6px 12px" }}
            >
              {uniquePeriods.map((period) => (
                <option key={period} value={period}>
                  {period}
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
              <option value="Draft">Draft</option>
              <option value="Computed">Computed</option>
              <option value="Validated">Validated</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
            Showing {filteredPayruns.length} of {payruns.length} payruns
          </span>
        </div>

        {/* 3. Table */}
        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading synchronized payrun batches from database...
          </div>
        )}

        {!loading && (
          <div className="mgr-table-container">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>#</th>
                  <th>Payrun</th>
                  <th>Period</th>
                  <th>Pay Date</th>
                  <th style={{ textAlign: "center" }}>Employees</th>
                  <th style={{ textAlign: "right" }}>Total Gross</th>
                  <th style={{ textAlign: "right" }}>Total Net</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayruns.map((c, index) => (
                  <tr
                    key={c.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelectCycle && onSelectCycle(c.raw || c)}
                  >
                    <td style={{ color: "#9ca3af" }}>{index + 1}</td>
                    <td style={{ fontWeight: 700, color: "#111827" }}>
                      <div>{c.payrun}</div>
                      <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{c.runNumber}</span>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "#4b5563" }}>{c.period}</td>
                    <td>{c.payDate}</td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{c.employees}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{c.gross}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--mgr-plum-primary)" }}>
                      {c.net}
                    </td>
                    <td>
                      <span
                        className={`mgr-badge ${
                          c.status === "Processing" || c.status === "Draft"
                            ? "mgr-badge-amber"
                            : c.status === "Completed" || c.status === "Paid"
                            ? "mgr-badge-green"
                            : c.status === "Validated"
                            ? "mgr-badge-purple"
                            : "mgr-badge-blue"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="hr-btn-view"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectCycle) onSelectCycle(c.raw || c);
                        }}
                      >
                        <span>⚙️</span> Manage
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredPayruns.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                      No payruns found matching the selected filters. Click "+ Create Payrun" to launch a new batch.
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

export default PayCyclesListView;
