import React, { useState, useEffect } from "react";
import { getEmployeeSchedule, getEmployeeAttendance } from "../../../api/employee.api";
import { SkeletonCard, SkeletonTable } from "../../../components/ui/SkeletonLoader";

const ScheduleView = ({ refreshKey }) => {
  const [loading, setLoading] = useState(true);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [attData, setAttData] = useState([]);
  const [schedule, setSchedule] = useState({
    name: "General (Mon - Fri)",
    weeklyHours: "40 Hours",
    workingDays: "5 Days",
    dailyHours: "8 Hours",
    breakTime: "1 Hour",
    validFrom: "01 Sep 2023",
    status: "Active",
    description: "Standard full-time working schedule (Monday to Friday)",
    timeZone: "Asia/Kolkata",
    days: [
      { day: "Monday", startTime: "09:00 AM", endTime: "06:00 PM", breakMinutes: 60, workingHours: "8.00", status: "Working" },
      { day: "Tuesday", startTime: "09:00 AM", endTime: "06:00 PM", breakMinutes: 60, workingHours: "8.00", status: "Working" },
      { day: "Wednesday", startTime: "09:00 AM", endTime: "06:00 PM", breakMinutes: 60, workingHours: "8.00", status: "Working" },
      { day: "Thursday", startTime: "09:00 AM", endTime: "06:00 PM", breakMinutes: 60, workingHours: "8.00", status: "Working" },
      { day: "Friday", startTime: "09:00 AM", endTime: "06:00 PM", breakMinutes: 60, workingHours: "8.00", status: "Working" },
      { day: "Saturday", startTime: "-", endTime: "-", breakMinutes: "-", workingHours: "0.00", status: "Off" },
      { day: "Sunday", startTime: "-", endTime: "-", breakMinutes: "-", workingHours: "0.00", status: "Off" },
    ],
  });

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  useEffect(() => {
    let isMounted = true;
    const fetchScheduleAndAtt = async () => {
      try {
        setLoading(true);
        const [schRes, attRes] = await Promise.allSettled([
          getEmployeeSchedule(),
          getEmployeeAttendance({ limit: 10 }),
        ]);

        if (isMounted) {
          if (schRes.status === "fulfilled" && schRes.value?.data?.schedule) {
            setSchedule(schRes.value.data.schedule);
          }
          if (attRes.status === "fulfilled" && attRes.value?.data?.records) {
            setAttData(attRes.value.data.records);
          }
        }
      } catch (err) {
        console.warn("Could not load employee schedule or attendance:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchScheduleAndAtt();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  if (loading)
    return (
      <div className="sk-dashboard-wrap">
        <SkeletonCard lines={4} titleWidth="35%" />
        <div style={{ marginTop: "16px" }}>
          <SkeletonTable rows={7} cols={6} />
        </div>
      </div>
    );

  return (
    <div className="employee-schedule-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">My Schedule & Shift Timings</h1>
          <p className="odoo-page-subtitle">
            View your working schedule, shift timings, and daily attendance logs
          </p>
        </div>
        <div
          style={{
            background: "#ede6ed",
            color: "var(--odoo-plum-primary)",
            fontWeight: 700,
            fontSize: "0.85rem",
            padding: "8px 14px",
            borderRadius: "6px",
          }}
        >
          Today: {todayName}
        </div>
      </div>

      {/* Grid: Schedule Details (Left) & Weekly Working Hours (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2.2fr",
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "0.825rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Schedule Name</span>
              <span style={{ fontWeight: 600 }}>{schedule.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Weekly Hours</span>
              <span style={{ fontWeight: 600 }}>{schedule.weeklyHours}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Working Days</span>
              <span style={{ fontWeight: 600 }}>{schedule.workingDays}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Daily Shift</span>
              <span style={{ fontWeight: 600 }}>{schedule.dailyHours}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Break Time</span>
              <span style={{ fontWeight: 600 }}>{schedule.breakTime}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Timezone</span>
              <span style={{ fontWeight: 600 }}>{schedule.timeZone || "Asia/Kolkata"}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid var(--odoo-border)",
                paddingTop: "10px",
              }}
            >
              <span style={{ color: "var(--odoo-text-muted)" }}>Status</span>
              <span className="odoo-badge odoo-badge-green">{schedule.status}</span>
            </div>
          </div>
        </div>

        {/* Right: Weekly Working Hours */}
        <div className="odoo-card">
          <div className="odoo-card-header">
            <h3 className="odoo-card-title">
              <span>🗓️</span> Shift Schedule & Today's Highlight
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              Highlighting Current Day ({todayName})
            </span>
          </div>

          <div className="odoo-table-wrapper">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Shift Start</th>
                  <th>Shift End</th>
                  <th>Break</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.days.map((d, index) => {
                  const isToday = d.day.toLowerCase() === todayName.toLowerCase();
                  return (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: isToday ? "#f0fdf4" : "transparent",
                        borderLeft: isToday ? "4px solid #10b981" : "none",
                        fontWeight: isToday ? 600 : 400,
                      }}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>{d.day}</span>
                          {isToday && (
                            <span
                              style={{
                                backgroundColor: "#10b981",
                                color: "#ffffff",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              TODAY
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{d.startTime}</td>
                      <td>{d.endTime}</td>
                      <td>{d.breakMinutes === "-" ? "-" : `${d.breakMinutes} mins`}</td>
                      <td>{d.workingHours} hrs</td>
                      <td>
                        <span
                          className={`odoo-badge ${
                            d.status === "Working"
                              ? "odoo-badge-green"
                              : "odoo-badge-orange"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="odoo-table-action-btn"
                          style={isToday ? { backgroundColor: "#10b981", color: "#ffffff", border: "none" } : {}}
                          onClick={() => setSelectedDayDetails(d)}
                        >
                          👁 Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Attendance Details Popup Modal */}
      {selectedDayDetails && (
        <div
          className="odoo-modal-backdrop"
          onClick={() => setSelectedDayDetails(null)}
        >
          <div
            className="odoo-modal-card"
            style={{ maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="odoo-modal-header">
              <h3 className="odoo-modal-title">
                ⏱️ Attendance Details - {selectedDayDetails.day}
              </h3>
              <button
                type="button"
                className="odoo-modal-close"
                onClick={() => setSelectedDayDetails(null)}
              >
                ✕
              </button>
            </div>

            <div className="odoo-modal-body" style={{ fontSize: "0.85rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.74rem",
                      color: "#64748b",
                      display: "block",
                    }}
                  >
                    Configured Shift
                  </span>
                  <strong style={{ fontSize: "0.95rem", color: "#1e1b4b" }}>
                    {selectedDayDetails.startTime} - {selectedDayDetails.endTime}
                  </strong>
                </div>
                <span
                  className={`odoo-badge ${
                    selectedDayDetails.status === "Working"
                      ? "odoo-badge-green"
                      : "odoo-badge-orange"
                  }`}
                >
                  {selectedDayDetails.status}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    background: "#f1f5f9",
                    padding: "10px",
                    borderRadius: "6px",
                  }}
                >
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    Shift Duration
                  </span>
                  <strong
                    style={{ display: "block", fontSize: "0.95rem", color: "#111827" }}
                  >
                    {selectedDayDetails.workingHours} Hours
                  </strong>
                </div>

                <div
                  style={{
                    background: "#f1f5f9",
                    padding: "10px",
                    borderRadius: "6px",
                  }}
                >
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    Break Minutes
                  </span>
                  <strong
                    style={{ display: "block", fontSize: "0.95rem", color: "#111827" }}
                  >
                    {selectedDayDetails.breakMinutes === "-" ? "0" : selectedDayDetails.breakMinutes} Mins
                  </strong>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#1e1b4b",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Recent Punches for {selectedDayDetails.day}
                </span>

                {attData.length === 0 ? (
                  <div
                    style={{
                      padding: "12px",
                      background: "#f9fafb",
                      borderRadius: "6px",
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: "0.8rem",
                    }}
                  >
                    No attendance punches recorded yet for this day.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {attData.slice(0, 3).map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.8rem",
                          background: "#f8fafc",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <div>
                          <strong style={{ color: "#111827" }}>{r.date}</strong>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "#6b7280",
                              marginLeft: "8px",
                            }}
                          >
                            In: {r.checkIn} | Out: {r.checkOut}
                          </span>
                        </div>
                        <span className="odoo-badge odoo-badge-green">
                          {r.workedHours} hrs
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="odoo-modal-footer">
              <button
                type="button"
                className="odoo-btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => setSelectedDayDetails(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
