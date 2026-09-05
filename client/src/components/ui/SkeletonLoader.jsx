import React from "react";
import "./SkeletonLoader.css";

// ── Generic shimmer box ────────────────────────────────────────────────────────
export const SkeletonBox = ({ width = "100%", height = "16px", borderRadius = "4px", style = {} }) => (
  <div
    className="sk-box"
    style={{ width, height, borderRadius, ...style }}
  />
);

// ── Stat card skeleton (header number + label) ────────────────────────────────
export const SkeletonStatCard = ({ count = 4 }) => (
  <div className="sk-stat-grid" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="sk-stat-card">
        <div className="sk-stat-icon sk-box" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <SkeletonBox width="55%" height="12px" />
          <SkeletonBox width="40%" height="24px" />
          <SkeletonBox width="70%" height="10px" />
        </div>
      </div>
    ))}
  </div>
);

// ── Table skeleton (header + rows) ────────────────────────────────────────────
export const SkeletonTable = ({ rows = 6, cols = 5 }) => (
  <div className="sk-table-wrap">
    {/* header */}
    <div className="sk-table-row sk-table-header">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBox key={i} width={i === 0 ? "30px" : "100%"} height="12px" borderRadius="3px" />
      ))}
    </div>
    {/* body rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="sk-table-row">
        <SkeletonBox width="30px" height="30px" borderRadius="50%" />
        {Array.from({ length: cols - 1 }).map((_, c) => (
          <SkeletonBox
            key={c}
            width={`${55 + (c * 7) % 35}%`}
            height="13px"
            borderRadius="3px"
          />
        ))}
      </div>
    ))}
  </div>
);

// ── Card skeleton (title + content lines) ────────────────────────────────────
export const SkeletonCard = ({ lines = 4, titleWidth = "40%" }) => (
  <div className="sk-card">
    <SkeletonBox width={titleWidth} height="16px" style={{ marginBottom: "14px" }} />
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBox key={i} width={`${100 - i * 12}%`} height="12px" style={{ marginBottom: "10px" }} />
    ))}
  </div>
);

// ── Profile header skeleton ───────────────────────────────────────────────────
export const SkeletonProfileHeader = () => (
  <div className="sk-profile-header">
    <div className="sk-avatar sk-box" />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
      <SkeletonBox width="35%" height="20px" />
      <SkeletonBox width="25%" height="13px" />
      <SkeletonBox width="45%" height="12px" />
    </div>
  </div>
);

// ── Kanban columns skeleton ───────────────────────────────────────────────────
export const SkeletonKanban = ({ cols = 4, cardsPerCol = 3 }) => (
  <div className="sk-kanban">
    {Array.from({ length: cols }).map((_, ci) => (
      <div key={ci} className="sk-kanban-col">
        <SkeletonBox width="55%" height="14px" style={{ marginBottom: "6px" }} />
        <SkeletonBox width="25%" height="11px" style={{ marginBottom: "14px" }} />
        {Array.from({ length: cardsPerCol }).map((_, ci2) => (
          <div key={ci2} className="sk-kanban-card">
            <div className="sk-kanban-card-top">
              <SkeletonBox width="32px" height="32px" borderRadius="50%" />
              <div style={{ flex: 1 }}>
                <SkeletonBox width="65%" height="13px" style={{ marginBottom: "6px" }} />
                <SkeletonBox width="45%" height="11px" />
              </div>
            </div>
            <SkeletonBox width="40%" height="11px" style={{ marginTop: "8px" }} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

// ── Dashboard skeleton: stats + two-column ────────────────────────────────────
export const SkeletonDashboard = () => (
  <div className="sk-dashboard-wrap">
    {/* page title */}
    <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <SkeletonBox width="28%" height="22px" />
      <SkeletonBox width="18%" height="13px" />
    </div>
    {/* stat cards row */}
    <SkeletonStatCard count={4} />
    {/* two-column grid */}
    <div className="sk-two-col" style={{ marginTop: "24px" }}>
      <SkeletonCard lines={5} titleWidth="50%" />
      <SkeletonCard lines={5} titleWidth="40%" />
    </div>
    {/* full-width table */}
    <div className="sk-card" style={{ marginTop: "20px" }}>
      <SkeletonBox width="30%" height="15px" style={{ marginBottom: "16px" }} />
      <SkeletonTable rows={5} cols={5} />
    </div>
  </div>
);

// ── List page skeleton: filters + table ──────────────────────────────────────
export const SkeletonListPage = ({ rows = 8, cols = 6 }) => (
  <div className="sk-dashboard-wrap">
    {/* header bar */}
    <div className="sk-list-header">
      <SkeletonBox width="22%" height="20px" />
      <div className="sk-list-actions">
        <SkeletonBox width="140px" height="34px" borderRadius="6px" />
        <SkeletonBox width="100px" height="34px" borderRadius="6px" />
      </div>
    </div>
    {/* filter bar */}
    <div className="sk-filter-bar">
      <SkeletonBox width="220px" height="34px" borderRadius="6px" />
      <SkeletonBox width="150px" height="34px" borderRadius="6px" />
      <SkeletonBox width="130px" height="34px" borderRadius="6px" />
      <SkeletonBox width="130px" height="34px" borderRadius="6px" />
    </div>
    {/* table */}
    <div className="sk-card">
      <SkeletonTable rows={rows} cols={cols} />
    </div>
  </div>
);

// ── Reports skeleton ──────────────────────────────────────────────────────────
export const SkeletonReports = () => (
  <div className="sk-dashboard-wrap">
    <div style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
      <SkeletonBox width="28%" height="20px" />
      <SkeletonBox width="100px" height="32px" borderRadius="6px" />
    </div>
    <SkeletonStatCard count={4} />
    <div className="sk-two-col" style={{ marginTop: "20px" }}>
      {/* chart placeholder */}
      <div className="sk-card">
        <SkeletonBox width="40%" height="14px" style={{ marginBottom: "12px" }} />
        <div className="sk-chart-bars">
          {[55, 70, 45, 80, 60, 90, 50].map((h, i) => (
            <div key={i} className="sk-bar sk-box" style={{ height: `${h}px` }} />
          ))}
        </div>
      </div>
      <div className="sk-card">
        <SkeletonBox width="35%" height="14px" style={{ marginBottom: "12px" }} />
        <SkeletonTable rows={5} cols={3} />
      </div>
    </div>
  </div>
);

export default SkeletonDashboard;
