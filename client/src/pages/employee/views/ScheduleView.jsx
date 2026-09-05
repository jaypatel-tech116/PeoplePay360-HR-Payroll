import React from "react";

const ScheduleView = () => {
  return (
    <div className="employee-schedule-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">My Schedule</h1>
          <p className="odoo-page-subtitle">View your working schedule and timings</p>
        </div>
      </div>

      {/* Grid: Schedule Details (Left) & Weekly Working Hours (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
          marginBottom: "20px",
        }}
        className="odoo-schedule-layout"
      >
        {/* Left: Schedule Details */}
        <div className="odoo-card">
          <h3 className="odoo-card-title" style={{ marginBottom: "16px" }}>
            <span>📅</span> Schedule Details
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Schedule Name</span>
              <span style={{ fontWeight: 600 }}>General (Mon - Fri)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Weekly Hours</span>
              <span style={{ fontWeight: 600 }}>40 Hours</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Working Days</span>
              <span style={{ fontWeight: 600 }}>5 Days</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Daily Hours</span>
              <span style={{ fontWeight: 600 }}>8 Hours</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Break Time</span>
              <span style={{ fontWeight: 600 }}>1 Hour</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Valid From</span>
              <span style={{ fontWeight: 600 }}>01 Sep 2023</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Status</span>
              <span className="odoo-badge odoo-badge-green">Active</span>
            </div>
          </div>
        </div>

        {/* Right: Weekly Working Hours */}
        <div className="odoo-card">
          <h3 className="odoo-card-title" style={{ marginBottom: "16px" }}>
            <span>📅</span> Weekly Working Hours
          </h3>

          <div className="odoo-table-wrapper">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Break (Minutes)</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Monday</td>
                  <td>09:00 AM</td>
                  <td>06:00 PM</td>
                  <td>60</td>
                  <td>8.00</td>
                  <td><span className="odoo-badge odoo-badge-green">Working</span></td>
                </tr>
                <tr>
                  <td>Tuesday</td>
                  <td>09:00 AM</td>
                  <td>06:00 PM</td>
                  <td>60</td>
                  <td>8.00</td>
                  <td><span className="odoo-badge odoo-badge-green">Working</span></td>
                </tr>
                <tr>
                  <td>Wednesday</td>
                  <td>09:00 AM</td>
                  <td>06:00 PM</td>
                  <td>60</td>
                  <td>8.00</td>
                  <td><span className="odoo-badge odoo-badge-green">Working</span></td>
                </tr>
                <tr>
                  <td>Thursday</td>
                  <td>09:00 AM</td>
                  <td>06:00 PM</td>
                  <td>60</td>
                  <td>8.00</td>
                  <td><span className="odoo-badge odoo-badge-green">Working</span></td>
                </tr>
                <tr>
                  <td>Friday</td>
                  <td>09:00 AM</td>
                  <td>06:00 PM</td>
                  <td>60</td>
                  <td>8.00</td>
                  <td><span className="odoo-badge odoo-badge-green">Working</span></td>
                </tr>
                <tr>
                  <td>Saturday</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>0.00</td>
                  <td><span className="odoo-badge odoo-badge-red">Off</span></td>
                </tr>
                <tr>
                  <td>Sunday</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>0.00</td>
                  <td><span className="odoo-badge odoo-badge-red">Off</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom: Schedule Information */}
      <div className="odoo-card">
        <h3 className="odoo-card-title" style={{ marginBottom: "14px" }}>
          <span>ℹ️</span> Schedule Information
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "0.8rem" }}>
          <div>
            <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "4px" }}>Description</span>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid var(--odoo-border)",
                borderRadius: "6px",
                padding: "8px 12px",
                fontWeight: 500,
              }}
            >
              Standard full-time working schedule (Monday to Friday)
            </div>
          </div>

          <div>
            <span style={{ color: "var(--odoo-text-muted)", display: "block", marginBottom: "4px" }}>Time Zone</span>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid var(--odoo-border)",
                borderRadius: "6px",
                padding: "8px 12px",
                fontWeight: 500,
              }}
            >
              Asia/Kolkata
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
