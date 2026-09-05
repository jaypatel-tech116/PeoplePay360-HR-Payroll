import React, { useState, useEffect } from "react";
import { getContracts } from "../../../api/admin.api";
import { MOCK_CONTRACTS } from "../adminMockData";
import { SkeletonListPage } from "../../../components/ui/SkeletonLoader";

export default function ContractsView() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState(MOCK_CONTRACTS);
  const [activePill, setActivePill] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [typeFilter, setTypeFilter] = useState("All Contract Types");

  const loadData = async () => {
    try {
      const data = await getContracts();
      if (data && data.length > 0) {
        setContracts(data.map((c) => ({
          id: c.id,
          code: c.contract_number,
          name: c.employee_name || "Employee",
          avatar: `${(c.employee_name || "E")[0]}`,
          jobTitle: c.designation || "Staff",
          dept: c.department_name || "Engineering",
          type: c.contract_type || "Permanent",
          wage: `₹ ${Number(c.wage || 50000).toLocaleString("en-IN")}.00`,
          start: c.start_date ? new Date(c.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "01 Sep 2023",
          end: c.end_date ? new Date(c.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-",
          status: c.status === "ACTIVE" ? "Active" : (c.status === "EXPIRED" ? "Expired" : "Terminated"),
        })));
      }
    } catch (err) {
      console.error("Error loading contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCount = contracts.length;
  const activeCount = contracts.filter((c) => c.status === "Active").length;
  const expiredCount = contracts.filter((c) => c.status === "Expired").length;
  const terminatedCount = contracts.filter((c) => c.status === "Terminated").length;

  const pills = [
    { id: "All", label: `All (${totalCount})` },
    { id: "Active", label: `Active (${activeCount})` },
    { id: "Expired", label: `Expired (${expiredCount})` },
    { id: "Terminated", label: `Terminated (${terminatedCount})` },
  ];


  const filtered = contracts.filter((c) => {
    if (activePill !== "All" && c.status !== activePill) return false;
    if (deptFilter !== "All Departments" && c.dept !== deptFilter) return false;
    if (typeFilter !== "All Contract Types" && c.type !== typeFilter) return false;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  if (loading) return <SkeletonListPage rows={7} cols={6} />;

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Contracts</h1>
          <p className="adm-page-subtitle">Manage employee contracts</p>
        </div>

        <button type="button" className="adm-btn-primary" onClick={() => alert("Add Contract modal")}>
          <span>+</span> Add Contract
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

      {/* 3. Filter Bar */}
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
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Departments">All Departments ⌵</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
          </select>

          <select
            className="adm-btn-secondary"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Contract Types">All Contract Types ⌵</option>
            <option value="Permanent">Permanent</option>
            <option value="Fixed Term">Fixed Term</option>
            <option value="Probation">Probation</option>
            <option value="Contract">Contract</option>
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
                <th>Department</th>
                <th>Contract Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={c.id}>
                  <td style={{ color: "var(--adm-text-light)" }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{c.code}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{c.name}</td>
                  <td>{c.dept}</td>
                  <td>{c.type}</td>
                  <td>{c.start}</td>
                  <td>{c.end}</td>
                  <td>
                    <span
                      className={`adm-badge ${
                        c.status === "Active" ? "adm-badge-green" : "adm-badge-red"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--adm-text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
                      onClick={() => alert(`Options for contract ${c.code}`)}
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-pagination-footer">
          <span>Showing 1 to {filtered.length} of 28 contracts</span>
          <div className="adm-pagination-controls">
            <button type="button" className="adm-page-btn">‹</button>
            <button type="button" className="adm-page-btn active">1</button>
            <button type="button" className="adm-page-btn">2</button>
            <button type="button" className="adm-page-btn">3</button>
            <button type="button" className="adm-page-btn">4</button>
            <button type="button" className="adm-page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
