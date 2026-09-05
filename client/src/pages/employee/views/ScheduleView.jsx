import React, { useState, useEffect } from "react";
import { getEmployeeSchedule } from "../../../api/employee.api";

const ScheduleView = ({ refreshKey }) => {
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

  useEffect(() => {
    let isMounted = true;
    const fetchSchedule = async () => {
      try {
        const res = await getEmployeeSchedule();
        if (isMounted && res?.data?.schedule) {
          setSchedule(res.data.schedule);
        }
      } catch (err) {
        console.warn("Could not load employee schedule:", err);
      }
    };
    fetchSchedule();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

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
              <span style={{ color: "var(--odoo-text-muted)" }}>Daily Hours</span>
              <span style={{ fontWeight: 600 }}>{schedule.dailyHours}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Break Time</span>
              <span style={{ fontWeight: 600 }}>{schedule.breakTime}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Valid From</span>
              <span style={{ fontWeight: 600 }}>{schedule.validFrom}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Status</span>
              <span className="odoo-badge odoo-badge-green">{schedule.status}</span>
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
                {schedule.days.map((d, index) => (
                  <tr key={index}>
                    <td>{d.day}</td>
                    <td>{d.startTime}</td>
                    <td>{d.endTime}</td>
                    <td>{d.breakMinutes}</td>
                    <td>{d.workingHours}</td>
                    <td>
                      <span
                        className={`odoo-badge ${
                          d.status === "Working"
                            ? "odoo-badge-green"
                            : "odoo-badge-red"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
              {schedule.description}
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
              {schedule.timeZone}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
