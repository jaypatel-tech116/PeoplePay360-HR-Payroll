import React, { useState, useEffect } from "react";
import { getEmployeeSchedule, getEmployeeAttendance } from "../../../api/employee.api";
import { SkeletonListPage } from "../../../components/ui/SkeletonLoader";

const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ScheduleView = ({ checkedIn, onToggleCheckIn, refreshKey }) => {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [attRecords, setAttRecords] = useState([]);
  const [attData, setAttData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All Status");

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [schedRes, attRes] = await Promise.all([
          getEmployeeSchedule(),
          getEmployeeAttendance({ status: statusFilter }),
        ]);
        if (isMounted) {
          if (schedRes?.data?.schedule) setSchedule(schedRes.data.schedule);
          if (attRes?.data) {
            setAttData(attRes.data);
            setAttRecords(attRes.data.records || []);
          }
        }
      } catch (err) {
        console.warn("Failed to load schedule/attendance:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [refreshKey, checkedIn, statusFilter]);

  const getTodayDayName = () => {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
  };

  const todayDay = getTodayDayName();
  const days = schedule?.days || DAYS_FULL.map((d) => ({
    day: d, startTime: "09:00 AM", endTime: "06:00 PM", breakMinutes: 60,
    workingHours: ["Saturday", "Sunday"].includes(d) ? "0.00" : "8.00",
    status: ["Saturday", "Sunday"].includes(d) ? "Off" : "Working",
  }));

  const todayDetails = attData?.todayDetails || null;
  const todaySchedule = attData?.todaySchedule || null;

  if (loading) return <SkeletonListPage rows={7} cols={5} />;

  return (
    <div className="employee-schedule-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">My Schedule & Attendance</h1>
          <p className="odoo-page-subtitle">Your working schedule and attendance records</p>
        </div>
      </div>

      {/* Schedule Info + Today's Attendance: 2-col row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {/* Schedule Summary */}
        <div className="profile-section-card">
          <h3 className="profile-section-title"><span>📋</span> Schedule: {schedule?.name || "General (Mon - Fri)"}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              ["Weekly Hours", schedule?.weeklyHours || "40 Hours"],
              ["Working Days", schedule?.workingDays || "5 Days"],
              ["Daily Hours", schedule?.dailyHours || "8 Hours"],
              ["Break Time", schedule?.breakTime || "1 Hour"],
              ["Time Zone", schedule?.timeZone || "Asia/Kolkata"],
              ["Status", schedule?.status || "Active"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                <span style={{ color: "var(--odoo-text-muted)" }}>{label}</span>
                {label === "Status" ? (
                  <span className="odoo-badge odoo-badge-green">{value}</span>
                ) : (
                  <span style={{ fontWeight: 600 }}>{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Attendance Card */}
        <div className="profile-section-card">
          <h3 className="profile-section-title"><span>⏱️</span> Today's Attendance</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {todayDetails ? (
              <>
                {[
                  ["Date", todayDetails.currentDate],
                  ["Check In", todayDetails.checkIn],
                  ["Check Out", todayDetails.checkOut],
                  ["Worked Hours", todayDetails.workedHours],
                  ["Location", todayDetails.location],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                    <span style={{ color: "var(--odoo-text-muted)" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", alignItems: "center" }}>
                  <span style={{ color: "var(--odoo-text-muted)" }}>Status</span>
                  <span className={`odoo-badge ${todayDetails.status === "Present" ? "odoo-badge-green" : "odoo-badge-orange"}`}>
                    {todayDetails.status}
                  </span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", color: "var(--odoo-text-muted)", padding: "16px", fontSize: "0.85rem" }}>
                {checkedIn ? "You are currently checked in" : "Not checked in today"}
              </div>
            )}
            <button
              type="button"
              className="odoo-btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}
              onClick={() => onToggleCheckIn && onToggleCheckIn({ action: checkedIn ? "OUT" : "IN" })}
            >
              {checkedIn ? "↪ Check Out" : "⏱️ Check In"}
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Table */}
      <div className="odoo-card">
        <div className="odoo-card-header">
          <h3 className="odoo-card-title"><span>📅</span> Weekly Schedule</h3>
        </div>

        <div className="odoo-table-wrapper">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Break</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => {
                const isToday = d.day === todayDay;
                return (
                  <tr
                    key={d.day}
                    className={isToday ? "schedule-current-day" : ""}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedDay(isToday ? d : selectedDay?.day === d.day ? null : d)}
                  >
                    <td style={{ fontWeight: isToday ? 700 : 500 }}>{d.day}</td>
                    <td>{d.startTime}</td>
                    <td>{d.endTime}</td>
                    <td>{d.breakMinutes !== "-" ? `${d.breakMinutes} min` : "-"}</td>
                    <td>{d.workingHours} hrs</td>
                    <td>
                      <span className={`odoo-badge ${d.status === "Working" ? "odoo-badge-green" : ""}`}
                        style={d.status !== "Working" ? { backgroundColor: "#f3f4f6", color: "#6b7280" } : {}}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Inline Attendance Popup */}
        {selectedDay && selectedDay.day === todayDay && todayDetails && (
          <div className="schedule-att-popup">
            <div className="schedule-att-popup-header">
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                📋 Attendance Details — {selectedDay.day}
              </h4>
              <button className="schedule-att-popup-close" onClick={() => setSelectedDay(null)}>✕</button>
            </div>
            <div className="profile-field-grid">
              <div className="profile-field">
                <span className="profile-field-label">Check In</span>
                <span className="profile-field-value">{todayDetails.checkIn}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Check Out</span>
                <span className="profile-field-value">{todayDetails.checkOut}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Worked Hours</span>
                <span className="profile-field-value">{todayDetails.workedHours}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Status</span>
                <span className={`odoo-badge ${todayDetails.status === "Present" ? "odoo-badge-green" : "odoo-badge-orange"}`}>
                  {todayDetails.status}
                </span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Location</span>
                <span className="profile-field-value">{todayDetails.location}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Worked Today</span>
                <span className="profile-field-value" style={{ color: "var(--odoo-plum-primary)", fontWeight: 700 }}>
                  {todayDetails.workedToday}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div className="odoo-card" style={{ marginTop: "16px" }}>
        <div className="odoo-card-header">
          <h3 className="odoo-card-title"><span>📋</span> Attendance History</h3>
          <div style={{ display: "flex", gap: "10px" }}>
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
              {attRecords.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "var(--odoo-text-muted)", padding: "20px" }}>
                    No attendance records found
                  </td>
                </tr>
              )}
              {attRecords.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.checkIn}</td>
                  <td>{r.checkOut}</td>
                  <td>{r.hours}</td>
                  <td>
                    <span className={`odoo-badge ${r.status === "Present" ? "odoo-badge-green" : "odoo-badge-orange"}`}>
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

export default ScheduleView;
