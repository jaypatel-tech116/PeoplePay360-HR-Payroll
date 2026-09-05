import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";
import AddEditSalaryRuleModal from "../modals/AddEditSalaryRuleModal";

export default function SalaryRulesView({ readOnly = false }) {
  const [rules, setRules] = useState([]);
  const [structures, setStructures] = useState([]);
  const [selectedStructureId, setSelectedStructureId] = useState("");
  const [loading, setLoading] = useState(true);
  const [activePill, setActivePill] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [componentFilter, setComponentFilter] = useState("All Components");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRule, setSelectedRule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState(null);
  const pageSize = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rulesData, structsData] = await Promise.all([
        payrollApi.getSalaryRules(selectedStructureId ? Number(selectedStructureId) : null),
        payrollApi.getSalaryStructures(),
      ]);

      const rawList = rulesData?.rules || (Array.isArray(rulesData) ? rulesData : []);
      // Deduplicate rules by code if "All Structures" is selected so duplicate entries never appear
      const seenCodes = new Set();
      const dedupedList = [];
      for (const r of rawList) {
        const uniqueKey = selectedStructureId ? `${r.salary_structure_id}-${r.code}` : r.code;
        if (!seenCodes.has(uniqueKey)) {
          seenCodes.add(uniqueKey);
          dedupedList.push(r);
        }
      }
      setRules(dedupedList);

      const structList = structsData?.structures || (Array.isArray(structsData) ? structsData : []);
      setStructures(structList);
    } catch (err) {
      console.error("Failed to load salary rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStructureId]);

  // Format rules cleanly matching Hackathon Screen 14 specification
  const formattedRules = rules.map((r) => {
    const rawCategory = (r.category || "").toUpperCase();
    let compType = "Earning";
    if (rawCategory === "ALLOWANCE") compType = "Allowance";
    else if (rawCategory === "DEDUCTION") compType = "Deduction";
    else if (rawCategory === "OTHER" || rawCategory === "CONTRIBUTION") compType = "Other";

    const rawCalc = (r.calculation_type || "").toUpperCase();
    let calcType = "Fixed";
    if (rawCalc === "PERCENTAGE") calcType = "Percentage";
    else if (rawCalc === "FORMULA") calcType = "Formula";

    let defVal = r.default_value;
    if (!defVal || defVal === "-") {
      if (rawCalc === "PERCENTAGE") {
        defVal = r.percentage ? `${parseFloat(r.percentage)}%` : "-";
      } else if (rawCalc === "FIXED") {
        defVal = r.fixed_amount !== null && r.fixed_amount !== undefined
          ? Number(r.fixed_amount).toLocaleString("en-IN")
          : "-";
      } else {
        defVal = "-";
      }
    }

    return {
      id: r.id,
      sequence: r.sequence,
      name: r.name,
      code: r.code,
      category: r.category,
      compType,
      calcType,
      defaultValue: defVal,
      fixedAmount: r.fixed_amount,
      percentage: r.percentage,
      formula: r.formula,
      quantity: r.quantity,
      salary_structure_id: r.salary_structure_id,
      structureName: r.structure_name || "Default Structure (Full Time)",
      status: r.is_active ? "Active" : "Inactive",
      description: r.description || `Configured ${r.name} calculation parameter for payroll engine.`,
      rawRule: r,
    };
  });

  const handleDeleteRule = async (r) => {
    if (!window.confirm(`Are you sure you want to delete salary rule "${r.name}" (${r.code})?`)) {
      return;
    }
    try {
      await payrollApi.deleteSalaryRule(r.id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete salary rule.");
    }
  };

  // Calculate Pill Counts
  const totalCount = formattedRules.length;
  const earningsCount = formattedRules.filter(
    (r) => r.compType === "Earning" || r.compType === "Allowance"
  ).length;
  const deductionsCount = formattedRules.filter(
    (r) => r.compType === "Deduction"
  ).length;
  const otherCount = formattedRules.filter(
    (r) => r.compType === "Other"
  ).length;

  const pills = [
    { id: "All", label: `All (${totalCount})` },
    { id: "Earnings", label: `Earnings (${earningsCount})` },
    { id: "Deductions", label: `Deductions (${deductionsCount})` },
    { id: "Other", label: `Other (${otherCount})` },
  ];

  // Filter Rules
  const filtered = formattedRules.filter((r) => {
    // 1. Pill Filter
    if (activePill === "Earnings" && r.compType !== "Earning" && r.compType !== "Allowance") {
      return false;
    }
    if (activePill === "Deductions" && r.compType !== "Deduction") {
      return false;
    }
    if (activePill === "Other" && r.compType !== "Other") {
      return false;
    }

    // 2. Component Type Dropdown Filter
    if (componentFilter !== "All Components" && r.compType !== componentFilter) {
      return false;
    }

    // 3. Status Filter
    if (statusFilter !== "All Status" && r.status !== statusFilter) {
      return false;
    }

    // 4. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches =
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.compType.toLowerCase().includes(q) ||
        r.calcType.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  // Pagination Calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);
  const startIndex = (pageIndex - 1) * pageSize;
  const paginatedRules = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="mgr-content-body">
      {/* 1. Header (Screen 14 Hackathon Specification) */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Salary Rules</h1>
          <p className="mgr-page-subtitle">Manage salary rules and components</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={fetchData}
            title="Refresh salary rules"
          >
            🔄 Refresh
          </button>
          {!readOnly && (
            <button
              type="button"
              className="mgr-btn-primary"
              onClick={() => {
                setRuleToEdit(null);
                setIsModalOpen(true);
              }}
            >
              <span>+</span> Add Rule
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Filter Pills (Screen 14: All, Earnings, Deductions, Other) */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          borderBottom: "1px solid var(--mgr-border)",
          paddingBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        {pills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => {
              setActivePill(pill.id);
              setCurrentPage(1);
            }}
            style={{
              padding: "7px 16px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: activePill === pill.id ? "none" : "1px solid var(--mgr-border)",
              backgroundColor:
                activePill === pill.id ? "var(--mgr-plum-primary)" : "var(--mgr-card-bg, #ffffff)",
              color: activePill === pill.id ? "#ffffff" : "#4b5563",
              transition: "all 0.15s ease",
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* 3. Section Card with Filters & Table */}
      <div className="mgr-section-card">
        {/* Filter Bar */}
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
          {/* Search Box */}
          <div className="mgr-input-search-wrapper" style={{ width: "260px" }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by rule name or code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Controls: Structure, Component Type, Status */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Structure Filter Dropdown */}
            <select
              className="mgr-btn-secondary"
              value={selectedStructureId}
              onChange={(e) => {
                setSelectedStructureId(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "6px 12px", minWidth: "160px" }}
            >
              <option value="">All Structures ⌵</option>
              {structures.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>

            {/* Component Type Dropdown */}
            <select
              className="mgr-btn-secondary"
              value={componentFilter}
              onChange={(e) => {
                setComponentFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "6px 12px" }}
            >
              <option value="All Components">All Components ⌵</option>
              <option value="Earning">Earning</option>
              <option value="Allowance">Allowance</option>
              <option value="Deduction">Deduction</option>
              <option value="Other">Other</option>
            </select>

            {/* Status Dropdown */}
            <select
              className="mgr-btn-secondary"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ padding: "6px 12px" }}
            >
              <option value="All Status">All Status ⌵</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading salary calculation rules from database...
          </div>
        )}

        {/* Rules Table (Screen 14 Layout) */}
        {!loading && (
          <div className="mgr-table-container">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Rule Name</th>
                  <th>Code</th>
                  <th>Component Type</th>
                  <th>Calculation Type</th>
                  <th>Default Value</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRules.map((r, idx) => (
                  <tr key={r.id}>
                    <td style={{ color: "#6b7280", fontWeight: 600 }}>
                      {startIndex + idx + 1}
                    </td>
                    <td style={{ fontWeight: 600, color: "#111827" }}>
                      {r.name}
                    </td>
                    <td>
                      <code style={{ fontSize: "0.82rem", background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>
                        {r.code}
                      </code>
                    </td>
                    <td>
                      <span
                        className={`mgr-badge ${
                          r.compType === "Earning"
                            ? "mgr-badge-green"
                            : r.compType === "Allowance"
                            ? "mgr-badge-blue"
                            : r.compType === "Deduction"
                            ? "mgr-badge-red"
                            : "mgr-badge-purple"
                        }`}
                      >
                        {r.compType}
                      </span>
                    </td>
                    <td style={{ color: "#4b5563", fontSize: "0.85rem" }}>
                      {r.calcType}
                    </td>
                    <td style={{ fontWeight: 600, color: "#111827", fontSize: "0.85rem" }}>
                      {r.defaultValue}
                    </td>
                    <td>
                      <span
                        className={`mgr-badge ${
                          r.status === "Active" ? "mgr-badge-green" : "mgr-badge-red"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {readOnly ? (
                        <button
                          type="button"
                          className="hr-btn-view"
                          style={{
                            padding: "4px 12px",
                            fontSize: "0.78rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                          onClick={() => {
                            setRuleToEdit(r.rawRule || r);
                            setIsModalOpen(true);
                          }}
                          title="View rule details"
                        >
                          <span>👁️</span> View
                        </button>
                      ) : (
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                          <button
                            type="button"
                            className="hr-btn-view"
                            style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                            onClick={() => {
                              setRuleToEdit(r.rawRule || r);
                              setIsModalOpen(true);
                            }}
                            title="Edit rule"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            style={{
                              padding: "4px 8px",
                              fontSize: "0.78rem",
                              border: "1px solid #fecaca",
                              background: "#fef2f2",
                              color: "#dc2626",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                            onClick={() => handleDeleteRule(r)}
                            title="Delete rule"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}
                    >
                      No salary rules found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Pagination Footer matching Hackathon Image 4 */}
        {!loading && filtered.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              borderTop: "1px solid var(--mgr-border)",
              fontSize: "0.85rem",
              color: "#6b7280",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <span>
              Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} salary rules
            </span>

            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                type="button"
                className="mgr-btn-secondary"
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
                    border: p === pageIndex ? "none" : "1px solid var(--mgr-border)",
                    backgroundColor:
                      p === pageIndex ? "var(--mgr-plum-primary)" : "var(--mgr-card-bg, #ffffff)",
                    color: p === pageIndex ? "#ffffff" : "#4b5563",
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                className="mgr-btn-secondary"
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

      {/* 5. Detail Modal */}
      {selectedRule && (
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
          onClick={() => setSelectedRule(null)}
        >
          <div
            className="mgr-section-card"
            style={{ maxWidth: "540px", width: "100%", padding: "24px" }}
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
                {selectedRule.name} (<code>{selectedRule.code}</code>)
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRule(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Component Type:</span>
                <strong>{selectedRule.compType}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Category:</span>
                <span className="mgr-badge mgr-badge-purple">{selectedRule.category}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Calculation Method:</span>
                <strong>{selectedRule.calcType}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Default Value:</span>
                <strong>{selectedRule.defaultValue}</strong>
              </div>

              {selectedRule.fixedAmount && parseFloat(selectedRule.fixedAmount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b7280" }}>Fixed Amount:</span>
                  <strong>₹ {Number(selectedRule.fixedAmount).toLocaleString("en-IN")}</strong>
                </div>
              )}

              {selectedRule.percentage && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b7280" }}>Percentage:</span>
                  <strong>{parseFloat(selectedRule.percentage)}%</strong>
                </div>
              )}

              {selectedRule.formula && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b7280" }}>Formula:</span>
                  <code style={{ fontSize: "0.82rem", background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>
                    {selectedRule.formula}
                  </code>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Status:</span>
                <span
                  className={`mgr-badge ${
                    selectedRule.status === "Active" ? "mgr-badge-green" : "mgr-badge-red"
                  }`}
                >
                  {selectedRule.status}
                </span>
              </div>

              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "10px", color: "#6b7280" }}>
                {selectedRule.description}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
                paddingTop: "12px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                type="button"
                className="mgr-btn-secondary"
                onClick={() => setSelectedRule(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Odoo-style Interactive Salary Rule Form Modal */}
      <AddEditSalaryRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rule={ruleToEdit}
        structures={structures}
        onSaved={fetchData}
        readOnly={readOnly}
      />
    </div>
  );
}
