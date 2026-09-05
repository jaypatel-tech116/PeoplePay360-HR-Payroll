import React, { useState, useEffect } from "react";
import { getEmployeeAttendance } from "../../../api/employee.api";

const AttendanceView = ({ checkedIn, onToggleCheckIn, refreshKey }) => {
  const [selectedMonth, setSelectedMonth] = useState("Aug 2025");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAttendance = async () => {
      try {
        const res = await getEmployeeAttendance({
          month: selectedMonth,
          status: statusFilter,
        });
        if (isMounted && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn("Failed to load attendance records:", err);
      }
    };
    fetchAttendance();
    return () => {
      isMounted = false;
    };
  }, [selectedMonth, statusFilter, refreshKey, checkedIn]);

  const todayDetails = data?.todayDetails || {
    currentDate: new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" }),
    clock: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    checkIn: checkedIn ? "09:05 AM" : "--:--",
    checkOut: "--:--",
    workedHours: "-",
    status: checkedIn ? "Present" : "Not Checked In",
    location: "Bangalore Office",
    remarks: "-",
    workedToday: checkedIn ? "00h 12m" : "00h 00m",
    sinceText: checkedIn ? "Since 09:00 AM" : "Shift Completed",
  };

  const todaySchedule = data?.todaySchedule || {
    shift: "General (Mon - Fri)",
    startTime: "09:00 AM",
    endTime: "06:00 PM",
    breakTime: "60 minutes",
    expectedHours: "8.00",
  };

  const records = data?.records || [
    { id: 1, date: "26 Aug 2025", checkIn: "09:00 AM", checkOut: "-", hours: "-", status: "Present", location: "Bangalore Office" },
    { id: 2, date: "25 Aug 2025", checkIn: "09:15 AM", checkOut: "06:00 PM", hours: "8.75", status: "Present", location: "Bangalore Office" },
    { id: 3, date: "22 Aug 2025", checkIn: "09:00 AM", checkOut: "06:00 PM", hours: "9.00", status: "Present", location: "Bangalore Office" },
    { id: 4, date: "21 Aug 2025", checkIn: "09:30 AM", checkOut: "06:30 PM", hours: "8.50", status: "Late", location: "Bangalore Office" },
    { id: 5, date: "20 Aug 2025", checkIn: "09:00 AM", checkOut: "06:00 PM", hours: "9.00", status: "Present", location: "Bangalore Office" },
  ];

  return (
    <div className="employee-attendance-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">My Attendance</h1>
          <p className="odoo-page-subtitle">Check in / Check out and view your attendance records</p>
        </div>
      </div>

      {/* Top 3-Card Live Hero Row (Image 3) */}
      <div className="attendance-live-hero">
        {/* Card 1: Live Date & Clock */}
        <div className="attendance-time-card">
          <div className="attendance-time-icon">📅</div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--odoo-text-secondary)", fontWeight: 500 }}>
              {todayDetails.currentDate}
            </div>
            <div className="attendance-time-clock">
              {todayDetails.clock}
            </div>
            <div className="attendance-checked-in-status">
              <span>{checkedIn ? "You are checked in" : "You are checked out"}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Check In / Check Out Buttons */}
        <div className="attendance-actions-card">
          <div className="attendance-action-item">
            <button
              type="button"
              className={`attendance-btn-check ${!checkedIn ? "active" : "disabled"}`}
              onClick={!checkedIn ? onToggleCheckIn : undefined}
              disabled={checkedIn}
            >
              <span>➔</span>
              <span>Check In</span>
            </button>
            <span className="attendance-action-sub">
              {checkedIn ? `Checked in at ${todayDetails.checkIn}` : "Not checked in"}
            </span>
          </div>

          <div className="attendance-action-item">
            <button
              type="button"
              className={`attendance-btn-check ${checkedIn ? "active" : "disabled"}`}
              onClick={checkedIn ? onToggleCheckIn : undefined}
              disabled={!checkedIn}
            >
              <span>➔</span>
              <span>Check Out</span>
            </button>
            <span className="attendance-action-sub">
              {checkedIn ? "Last check out -- : --" : (todayDetails.checkOut !== "--:--" ? `Checked out at ${todayDetails.checkOut}` : "Last check out -- : --")}
            </span>
          </div>
        </div>

        {/* Card 3: Currently Working */}
        <div className="attendance-working-card">
          <div className="attendance-working-top">
            <span className="attendance-working-badge">
              {checkedIn ? "Currently Working" : "Off Duty"}
            </span>
          </div>
          <div className="attendance-working-body">
            <span className="attendance-working-icon">⏱️</span>
            <div>
              <div className="attendance-working-label">Worked Today</div>
              <div className="attendance-working-timer">
                {todayDetails.workedToday}
              </div>
              <div className="attendance-working-since">
                {todayDetails.sinceText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Today's Details + Schedule for Today */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Left: Today's Details */}
        <div className="odoo-card">
          <h3 className="odoo-card-title" style={{ marginBottom: "16px" }}>
            <span>📅</span> Today's Details
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Check In</span>
              <span style={{ fontWeight: 600 }}>{todayDetails.checkIn}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Check Out</span>
              <span style={{ fontWeight: 600 }}>{todayDetails.checkOut}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Worked Hours</span>
              <span style={{ fontWeight: 600 }}>{todayDetails.workedHours}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Status</span>
              <span className={`odoo-badge ${todayDetails.status === "Present" ? "odoo-badge-green" : "odoo-badge-orange"}`}>
                {todayDetails.status}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Location</span>
              <span style={{ fontWeight: 600 }}>{todayDetails.location}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Remarks</span>
              <span style={{ fontWeight: 600 }}>{todayDetails.remarks}</span>
            </div>
          </div>
        </div>

        {/* Right: Schedule for Today */}
        <div className="odoo-card">
          <h3 className="odoo-card-title" style={{ marginBottom: "16px" }}>
            <span>🕒</span> Schedule for Today
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Shift</span>
              <span style={{ fontWeight: 600 }}>{todaySchedule.shift}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Start Time</span>
              <span style={{ fontWeight: 600 }}>{todaySchedule.startTime}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>End Time</span>
              <span style={{ fontWeight: 600 }}>{todaySchedule.endTime}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Break Time</span>
              <span style={{ fontWeight: 600 }}>{todaySchedule.breakTime}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--odoo-text-muted)" }}>Expected Hours</span>
              <span style={{ fontWeight: 600 }}>{todaySchedule.expectedHours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Attendance Records Table */}
      <div className="odoo-card">
        <div className="odoo-card-header">
          <h3 className="odoo-card-title">
            <span>📅</span> Attendance Records
          </h3>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              className="odoo-filter-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="Aug 2025">Aug 2025</option>
              <option value="Sep 2026">Sep 2026</option>
              <option value="Jul 2025">Jul 2025</option>
            </select>

            <select
              className="odoo-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
            </select>
          </div>
        </div>

        <div className="odoo-table-wrapper">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Worked Hours</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.checkIn}</td>
                  <td>{r.checkOut}</td>
                  <td>{r.hours}</td>
                  <td>
                    <span
                      className={`odoo-badge ${
                        r.status === "Present"
                          ? "odoo-badge-green"
                          : "odoo-badge-orange"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{r.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
