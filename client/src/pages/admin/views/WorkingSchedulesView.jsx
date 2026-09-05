import React, { useState, useEffect } from "react";
import { getWorkingSchedules } from "../../../api/admin.api";
import { MOCK_WORKING_SCHEDULES } from "../adminMockData";

export default function WorkingSchedulesView() {
  const [schedules, setSchedules] = useState(MOCK_WORKING_SCHEDULES);
  const [activePill, setActivePill] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      const data = await getWorkingSchedules();
      if (data && data.length > 0) {
        setSchedules(data.map((s) => ({
          id: s.id,
          name: s.name,
          hoursPerWeek: `${parseFloat(s.weekly_hours || 40).toFixed(0)} hrs/week`,
          workingDays: "5 days (Mon-Fri)",
          workTime: `${s.monday_start ? s.monday_start.slice(0, 5) : "09:00"} - ${s.monday_end ? s.monday_end.slice(0, 5) : "18:00"}`,
          description: s.description || "Standard full-time working schedule",
          assignedEmployees: parseInt(s.assigned_employees) || 0,
          status: s.is_active ? "Active" : "Inactive",
        })));
      }
    } catch (err) {
      console.error("Error loading working schedules:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCount = schedules.length;
  const standardCount = schedules.filter((s) => s.name.includes("Standard") || s.name.includes("General") || s.name.includes("Part Time")).length;
  const flexibleCount = schedules.filter((s) => s.name.includes("Flexible")).length;
  const shiftCount = schedules.filter((s) => s.name.includes("Shift") || s.name.includes("Night") || s.name.includes("Morning")).length;

  const pills = [
    { id: "All", label: `All (${totalCount})` },
    { id: "Standard", label: `Standard (${standardCount})` },
    { id: "Flexible", label: `Flexible (${flexibleCount})` },
    { id: "Shift", label: `Shift (${shiftCount})` },
  ];


  const filtered = schedules.filter((s) => {
    if (activePill === "Standard" && !s.name.includes("Standard") && !s.name.includes("Part Time")) return false;
    if (activePill === "Flexible" && !s.name.includes("Flexible")) return false;
    if (activePill === "Shift" && !s.name.includes("Shift")) return false;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Working Schedules</h1>
          <p className="adm-page-subtitle">Manage employee working schedules</p>
        </div>

        <button type="button" className="adm-btn-primary" onClick={() => alert("Add Schedule modal")}>
          <span>+</span> Add Schedule
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

      {/* 3. Search & Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div className="adm-input-search-wrapper" style={{ width: "260px" }}>
          <span style={{ color: "var(--adm-text-light)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search schedules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button type="button" className="adm-btn-secondary">
          <span>⚙️</span> Filters
        </button>
      </div>

      {/* 4. Table Card */}
      <div className="adm-section-card">
        <div className="adm-table-responsive">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Name</th>
                <th>Working Hours</th>
                <th>Working Days</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr key={s.id}>
                  <td style={{ color: "var(--adm-text-light)" }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{s.name}</td>
                  <td>{s.hours}</td>
                  <td>{s.days}</td>
                  <td style={{ color: "var(--adm-text-muted)" }}>{s.description}</td>
                  <td>
                    <span className="adm-badge adm-badge-green">{s.status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--adm-text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
                      onClick={() => alert(`Options for schedule ${s.name}`)}
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
          <span>Showing 1 to {filtered.length} of 6 schedules</span>
          <div className="adm-pagination-controls">
            <button type="button" className="adm-page-btn">‹</button>
            <button type="button" className="adm-page-btn active">1</button>
            <button type="button" className="adm-page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
