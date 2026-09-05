import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

export default function SalaryStructuresView() {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStructure, setSelectedStructure] = useState(null);

  const fetchStructures = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getSalaryStructures();
      const list = data?.structures || (Array.isArray(data) ? data : []);
      setStructures(list);
    } catch (err) {
      console.error("Failed to load salary structures:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const formattedStructures = structures.map((st) => ({
    id: st.id,
    name: st.name || "Structure",
    code: st.code || `SS00${st.id}`,
    description: st.description || "Salary structure configuration",
    componentsCount: parseInt(st.rule_count || st.rules?.length || 0, 10),
    employeesCount: parseInt(st.assigned_employees || st.employee_count || 0, 10),
    type: st.type || "FT",
    status: st.is_active ? "Active" : "Inactive",
    rules: (st.rules || []).map((r) => {
      const rawType = (r.calculation_type || r.computation_type || "").toUpperCase();
      let calcStr = "Fixed";
      if (rawType === "PERCENTAGE") calcStr = `Percentage (${parseFloat(r.percentage)}%)`;
      else if (rawType === "FORMULA") calcStr = `Formula: ${r.formula}`;

      let valStr = "-";
      if (rawType === "FIXED") {
        valStr = "₹ " + parseFloat(r.fixed_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
      } else if (rawType === "PERCENTAGE") {
        valStr = `${parseFloat(r.percentage)}% of ${r.base_rule_code || "BASIC"}`;
      } else if (rawType === "FORMULA") {
        valStr = r.formula;
      }

      return {
        seq: r.sequence,
        rule: r.name,
        code: r.code,
        category: r.category,
        calculation: calcStr,
        value: valStr,
        status: r.is_active ? "Active" : "Inactive",
      };
    }),
  }));

  const handleOpenRules = async (s) => {
    try {
      const rawRules = await payrollApi.getSalaryRules(s.id);
      const ruleList = Array.isArray(rawRules) ? rawRules : rawRules?.rules || [];
      const mappedRules = ruleList.map((r) => {
        const rawType = (r.calculation_type || r.computation_type || "").toUpperCase();
        let calcStr = "Fixed";
        if (rawType === "PERCENTAGE") calcStr = `Percentage (${parseFloat(r.percentage)}%)`;
        else if (rawType === "FORMULA") calcStr = `Formula: ${r.formula}`;

        let valStr = "-";
        if (rawType === "FIXED") {
          valStr = "₹ " + parseFloat(r.fixed_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
        } else if (rawType === "PERCENTAGE") {
          valStr = `${parseFloat(r.percentage)}% of ${r.base_rule_code || "BASIC"}`;
        } else if (rawType === "FORMULA") {
          valStr = r.formula;
        }

        return {
          seq: r.sequence,
          rule: r.name,
          code: r.code,
          category: r.category,
          calculation: calcStr,
          value: valStr,
          status: r.is_active ? "Active" : "Inactive",
        };
      });
      setSelectedStructure({ ...s, rules: mappedRules });
    } catch (err) {
      console.error("Failed to load rules for structure:", err);
      setSelectedStructure(s);
    }
  };

  const filteredStructures = formattedStructures.filter((s) => {
    const q = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <div className="mgr-content-body">
      {/* 1. Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Salary Structures</h1>
          <p className="mgr-page-subtitle">
            Configure component packages, rule execution sequences and salary tiers synchronized with database
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="mgr-btn-secondary"
            onClick={fetchStructures}
            title="Refresh structures"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* 2. Structures Table */}
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
          <div className="mgr-input-search-wrapper" style={{ width: "260px" }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search structures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
            Showing {filteredStructures.length} of {structures.length} structures
          </span>
        </div>

        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading salary structures from database...
          </div>
        )}

        {!loading && (
          <div className="mgr-table-container">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>#</th>
                  <th>Structure Name</th>
                  <th>Description</th>
                  <th style={{ textAlign: "center" }}>Components</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStructures.map((s, index) => (
                  <tr key={s.id}>
                    <td style={{ color: "#9ca3af" }}>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{s.name}</div>
                      <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{s.code}</span>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "#4b5563" }}>{s.description}</td>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>
                      <span
                        style={{
                          backgroundColor: "#f3ebf4",
                          color: "var(--mgr-plum-primary)",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontSize: "0.78rem",
                        }}
                      >
                        {s.componentsCount} rules
                      </span>
                    </td>
                    <td>
                      <span className="mgr-badge mgr-badge-purple">{s.type}</span>
                    </td>
                    <td>
                      <span className="mgr-badge mgr-badge-green">{s.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="hr-btn-view"
                        onClick={() => handleOpenRules(s)}
                      >
                        <span>⚖️</span> Rules ({s.componentsCount})
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredStructures.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                      No salary structures found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Structure Detail Modal */}
      {selectedStructure && (
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
          onClick={() => setSelectedStructure(null)}
        >
          <div
            className="mgr-section-card"
            style={{ maxWidth: "780px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "26px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "14px",
                marginBottom: "18px",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#111827" }}>
                  {selectedStructure.name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {selectedStructure.code} • {selectedStructure.description}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStructure(null)}
                style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#9ca3af" }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "10px 14px",
                fontSize: "0.8rem",
                color: "#475569",
                marginBottom: "16px",
              }}
            >
              ⚡ <strong>Sequential Execution:</strong> Rules are evaluated in strict sequence order (1 to N) by the AST parser.
            </div>

            <div className="mgr-table-container">
              <table className="mgr-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>Seq</th>
                    <th>Rule Component</th>
                    <th>Category</th>
                    <th>Calculation</th>
                    <th style={{ textAlign: "right" }}>Value / Formula</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStructure.rules.map((r) => (
                    <tr key={r.code}>
                      <td style={{ fontWeight: 700, color: "var(--mgr-plum-primary)" }}>{r.seq}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{r.rule}</div>
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
                      <td style={{ fontSize: "0.8rem", color: "#4b5563" }}>{r.calculation}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#111827" }}>
                        {r.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                className="mgr-btn-secondary"
                onClick={() => setSelectedStructure(null)}
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
