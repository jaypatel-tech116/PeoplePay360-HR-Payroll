import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

export default function SalaryRulesView() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedRule, setSelectedRule] = useState(null);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getSalaryRules();
      const list = data?.rules || (Array.isArray(data) ? data : []);
      setRules(list);
    } catch (err) {
      console.error("Failed to load salary rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const formattedRules = rules.map((r) => {
    const rawType = (r.calculation_type || r.computation_type || "").toUpperCase();
    let calcType = "Fixed";
    let defaultVal = "₹ " + parseFloat(r.fixed_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    if (rawType === "PERCENTAGE") {
      calcType = "Percentage";
      defaultVal = `${parseFloat(r.percentage)}% of ${r.base_rule_code || "BASIC"}`;
    } else if (rawType === "FORMULA") {
      calcType = "Formula";
      defaultVal = r.formula;
    }

    return {
      id: r.id,
      ruleName: r.name,
      code: r.code,
      category: r.category,
      sequence: r.sequence,
      calculationType: calcType,
      defaultValue: defaultVal,
      status: r.is_active ? "Active" : "Inactive",
      description: r.description || `Rule ${r.name} configured for payroll computation.`,
      calculationDetail: {
        type: calcType,
        percentage: rawType === "PERCENTAGE" ? `${parseFloat(r.percentage)}%` : null,
        baseRule: r.base_rule_code,
        formula: r.formula,
        fixedAmount: rawType === "FIXED" ? defaultVal : null,
      },
    };
  });

  const uniqueCategories = [
    "All Categories",
    ...Array.from(new Set(formattedRules.map((r) => r.category).filter(Boolean))),
  ];

  const filteredRules = formattedRules.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      r.ruleName.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);
    const matchesCategory =
      categoryFilter === "All Categories" || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mgr-content-body">
      {/* 1. Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Salary Rules</h1>
          <p className="mgr-page-subtitle">
            Configure dynamic calculation formulas, percentages and statutory deduction parameters synchronized with database
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={fetchRules}
            title="Refresh rules"
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
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--mgr-border)",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="mgr-input-search-wrapper" style={{ width: "240px" }}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search rule name, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="mgr-btn-secondary"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: "6px 12px" }}
            >
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
            Showing {filteredRules.length} of {rules.length} rules
          </span>
        </div>

        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading salary calculation rules from database...
          </div>
        )}

        {!loading && (
          <div className="mgr-table-container">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>Seq</th>
                  <th>Rule Name</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Calculation Type</th>
                  <th style={{ textAlign: "right" }}>Value / Formula</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((r) => (
                  <tr key={r.code}>
                    <td style={{ fontWeight: 700, color: "var(--mgr-plum-primary)" }}>{r.sequence}</td>
                    <td style={{ fontWeight: 600, color: "#111827" }}>{r.ruleName}</td>
                    <td>
                      <code>{r.code}</code>
                    </td>
                    <td>
                      <span
                        className={`mgr-badge ${
                          r.category === "Earnings"
                            ? "mgr-badge-green"
                            : r.category === "Deduction"
                            ? "mgr-badge-red"
                            : "mgr-badge-purple"
                        }`}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td style={{ color: "#4b5563", fontSize: "0.82rem" }}>{r.calculationType}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#111827", fontSize: "0.82rem" }}>
                      {r.defaultValue}
                    </td>
                    <td>
                      <span className="mgr-badge mgr-badge-green">{r.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="hr-btn-view"
                        onClick={() => setSelectedRule(r)}
                      >
                        <span>👁</span> View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredRules.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                      No salary rules found matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
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
                Rule: {selectedRule.ruleName} (<code>{selectedRule.code}</code>)
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRule(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#9ca3af" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 18px", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Category</span>
                <strong>{selectedRule.category}</strong>
              </div>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Execution Sequence</span>
                <strong>{selectedRule.sequence}</strong>
              </div>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Computation Type</span>
                <span>{selectedRule.calculationType}</span>
              </div>
              <div>
                <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Computed Parameter</span>
                <strong style={{ color: "var(--mgr-plum-primary)" }}>{selectedRule.defaultValue}</strong>
              </div>
            </div>

            <div style={{ marginTop: "16px", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.74rem", color: "#6b7280", display: "block" }}>Description & Guidance</span>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.84rem", color: "#374151" }}>
                {selectedRule.description}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
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
    </div>
  );
}
