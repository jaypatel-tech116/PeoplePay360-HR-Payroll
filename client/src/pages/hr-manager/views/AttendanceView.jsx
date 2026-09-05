import React, { useState, useEffect } from "react";
import hrApi from "../../../api/hr.api";

const AttendanceView = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [monthFilter, setMonthFilter] = useState("Aug 2025");
  const [currentTime, setCurrentTime] = useState("09:12:45 AM");
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(26);

  const [summary, setSummary] = useState({
    total_employees: 10,
    present_today: 5,
    on_leave: 1,
    absent_today: 1,
    average_hours: "8.0 hrs",
  });
  const [recordsData, setRecordsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real attendance data from database
  const loadAttendance = async () => {
    try {
      setLoading(true);
      const [sumData, recData] = await Promise.all([
        hrApi.getAttendanceSummary(),
        hrApi.getAttendance({
          status: statusFilter !== "All Status" ? statusFilter : undefined,
        }),
      ]);
      setSummary(sumData || {});
      setRecordsData(recData || []);
    } catch (err) {
      console.error("Error loading attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [statusFilter]);

  const handleCheckIn = async () => {
    try {
      await hrApi.createAttendance({
        employee_id: 2, // Priya Mehta (HR Lead)
        status: "Present",
        check_in: new Date(),
      });
      setIsCheckedIn(true);
      alert("Checked in successfully at " + currentTime);
      loadAttendance();
    } catch (err) {
      alert("Check in failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCheckOut = async () => {
    try {
      await hrApi.createAttendance({
        employee_id: 2,
        status: "Present",
        check_out: new Date(),
      });
      setIsCheckedIn(false);
      alert("Checked out successfully at " + currentTime);
      loadAttendance();
    } catch (err) {
      alert("Check out failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleExportCsv = () => {
    window.open(hrApi.getExportUrl("attendance"), "_blank");
  };

  // Calendar cells setup
  const calendarCells = [
    { day: 28, otherMonth: true },
    { day: 29, otherMonth: true },
    { day: 30, otherMonth: true },
    { day: 31, otherMonth: true },
    { day: 1, dot: "present" },
    { day: 2 },
    { day: 3 },
    { day: 4, dot: "present" },
    { day: 5, dot: "present" },
    { day: 6, dot: "present" },
    { day: 7, dot: "present" },
    { day: 8, dot: "half" },
    { day: 9 },
    { day: 10 },
    { day: 11, dot: "present" },
    { day: 12, dot: "present" },
    { day: 13, dot: "absent" },
    { day: 14, dot: "present" },
    { day: 15, dot: "present" },
    { day: 16 },
    { day: 17 },
    { day: 18 },
    { day: 19 },
    { day: 20, dot: "present" },
    { day: 21, dot: "present" },
    { day: 22, dot: "present" },
    { day: 23 },
    { day: 24 },
    { day: 25 },
    { day: 26, isSelected: true },
    { day: 27 },
    { day: 28 },
    { day: 29 },
    { day: 30 },
    { day: 31 },
  ];

  return (
    <div className="hr-content-body">
      {/* 1. Page Header */}
      <div className="hr-page-header">
        <div>
          <h1 className="hr-page-title">Attendance</h1>
          <p className="hr-page-subtitle">
            Track employee check in/out and working hours
          </p>
        </div>
        <button
          type="button"
          className="hr-btn-secondary"
          onClick={() => loadAttendance()}
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Top 4 Metric Cards from Real Database */}
      <div className="hr-stats-grid">
        {/* Present Today */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-purple">👥</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Present Today</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">{summary.present_today ?? 0}</span>
              <span className="hr-stat-pill-green">
                {summary.total_employees > 0
                  ? `${Math.round((summary.present_today / summary.total_employees) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <span className="hr-stat-subtext">of {summary.total_employees} employees</span>
          </div>
        </div>

        {/* On Leave */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-amber">⏱</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">On Leave</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">{summary.on_leave ?? 0}</span>
              <span
                style={{
                  backgroundColor: "#fef3c7",
                  color: "#d97706",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {summary.total_employees > 0
                  ? `${Math.round((summary.on_leave / summary.total_employees) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <span className="hr-stat-subtext">of {summary.total_employees} employees</span>
          </div>
        </div>

        {/* Absent Today */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-blue">👤</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Absent Today</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">{summary.absent_today ?? 0}</span>
              <span
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {summary.total_employees > 0
                  ? `${Math.round((summary.absent_today / summary.total_employees) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <span className="hr-stat-subtext">of {summary.total_employees} employees</span>
          </div>
        </div>

        {/* Average Hours */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-purple">⏱</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Average Hours</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">{summary.average_hours || "8.0 hrs"}</span>
              <span className="hr-stat-pill-green">↑ 5%</span>
            </div>
            <span className="hr-stat-subtext">vs last week</span>
          </div>
        </div>
      </div>

      {/* 3. Middle 3 Cards Grid */}
      <div className="hr-attendance-grid-3">
        {/* Card 1: Check In / Check Out */}
        <div className="hr-punch-card">
          <div className="hr-punch-header">
            <div className="hr-section-icon" style={{ borderRadius: "50%" }}>
              🪪
            </div>
            <div>
              <h3 className="hr-punch-title">Check In / Check Out</h3>
              <p className="hr-punch-subtitle">Mark your attendance for today</p>
            </div>
          </div>

          <div className="hr-punch-clock-container">
            <div className="hr-punch-time-big">{currentTime}</div>
            <div className="hr-punch-date-sub">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="hr-punch-status-pill">
              <span
                className="hr-green-dot"
                style={{
                  backgroundColor: isCheckedIn ? "#10b981" : "#ef4444",
                }}
              />
              <span style={{ color: isCheckedIn ? "#059669" : "#ef4444" }}>
                {isCheckedIn ? "You are checked in" : "You are checked out"}
              </span>
            </div>
          </div>

          <div className="hr-punch-actions-row">
            <button
              type="button"
              className={isCheckedIn ? "hr-btn-checkin-disabled" : "hr-btn-checkin-active"}
              onClick={handleCheckIn}
              disabled={isCheckedIn}
            >
              <span>➔</span> Check In
            </button>
            <button
              type="button"
              className={isCheckedIn ? "hr-btn-checkout-active" : "hr-btn-checkout-disabled"}
              onClick={handleCheckOut}
              disabled={!isCheckedIn}
            >
              <span>◼</span> Check Out
            </button>
          </div>

          <div className="hr-punch-footer-row">
            <div className="hr-punch-footer-col">
              <span className="hr-punch-footer-icon">🕒</span>
              <div className="hr-punch-footer-meta">
                <span className="hr-punch-footer-label">Check In Time</span>
                <span className="hr-punch-footer-val">09:00 AM</span>
              </div>
            </div>
            <div className="hr-punch-footer-col">
              <span className="hr-punch-footer-icon">⏱</span>
              <div className="hr-punch-footer-meta">
                <span className="hr-punch-footer-label">Working Hours</span>
                <span className="hr-punch-footer-val">08h 30m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Today's Attendance Timeline */}
        <div className="hr-timeline-card">
          <div className="hr-timeline-header">
            <h3 className="hr-timeline-title">Today's Attendance</h3>
            <button
              type="button"
              className="hr-timeline-link"
              style={{ background: "none", border: "none", padding: 0 }}
              onClick={() => setStatusFilter("All Status")}
            >
              View All ➔
            </button>
          </div>

          <div className="hr-timeline-list">
            <div className="hr-timeline-item">
              <div className="hr-timeline-line" />
              <div className="hr-timeline-dot hr-dot-green" />
              <div className="hr-timeline-content">
                <div>
                  <div className="hr-timeline-label">Checked In</div>
                  <div className="hr-timeline-sub">Bangalore Office</div>
                </div>
                <span className="hr-timeline-time">09:00 AM</span>
              </div>
            </div>

            <div className="hr-timeline-item">
              <div className="hr-timeline-line" />
              <div className="hr-timeline-dot hr-dot-blue" />
              <div className="hr-timeline-content">
                <div>
                  <div className="hr-timeline-label">Working</div>
                  <div className="hr-timeline-sub">Currently working</div>
                </div>
                <span className="hr-timeline-time">09:00 AM - ...</span>
              </div>
            </div>

            <div className="hr-timeline-item">
              <div className="hr-timeline-line" />
              <div className="hr-timeline-dot hr-dot-hollow" />
              <div className="hr-timeline-content">
                <div>
                  <div className="hr-timeline-label">Check Out</div>
                  <div className="hr-timeline-sub">Pending</div>
                </div>
                <span className="hr-timeline-time">--:--</span>
              </div>
            </div>

            <div className="hr-timeline-item">
              <div className="hr-timeline-dot hr-dot-hollow" />
              <div className="hr-timeline-content">
                <div>
                  <div className="hr-timeline-label">Total Hours</div>
                  <div className="hr-timeline-sub">
                    Will be calculated after check out
                  </div>
                </div>
                <span className="hr-timeline-time">--</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Mini Calendar */}
        <div className="hr-calendar-card">
          <div className="hr-calendar-nav-row">
            <span className="hr-calendar-month">August 2025</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button type="button" className="hr-calendar-arrow-btn">‹</button>
              <button type="button" className="hr-calendar-arrow-btn">›</button>
            </div>
          </div>

          <div className="hr-cal-weekdays">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="hr-cal-days-grid">
            {calendarCells.map((cell, idx) => (
              <div
                key={idx}
                className={`hr-cal-day-cell ${cell.otherMonth ? "other-month" : ""} ${
                  cell.day === selectedCalendarDay ? "active-day" : ""
                }`}
                onClick={() => setSelectedCalendarDay(cell.day)}
              >
                <span>{cell.day}</span>
                {cell.dot === "present" && (
                  <span className="hr-cal-day-dot hr-cal-dot-present" />
                )}
                {cell.dot === "half" && (
                  <span className="hr-cal-day-dot hr-cal-dot-half" />
                )}
                {cell.dot === "absent" && (
                  <span className="hr-cal-day-dot hr-cal-dot-absent" />
                )}
                {cell.dot === "leave" && (
                  <span className="hr-cal-day-dot hr-cal-dot-leave" />
                )}
              </div>
            ))}
          </div>

          <div className="hr-cal-legend-row">
            <div className="hr-cal-legend-item">
              <span className="hr-green-dot" />
              <span>Present</span>
            </div>
            <div className="hr-cal-legend-item">
              <span
                className="hr-green-dot"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <span>Half Day</span>
            </div>
            <div className="hr-cal-legend-item">
              <span
                className="hr-green-dot"
                style={{ backgroundColor: "#ef4444" }}
              />
              <span>Absent</span>
            </div>
            <div className="hr-cal-legend-item">
              <span
                className="hr-green-dot"
                style={{ backgroundColor: "#a855f7" }}
              />
              <span>On Leave</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Attendance Records */}
      <div className="hr-section-card">
        <div className="hr-section-header">
          <div className="hr-section-title-group">
            <div className="hr-section-icon">📅</div>
            <div>
              <h2 className="hr-section-heading">Attendance Records</h2>
            </div>
          </div>

          <div className="hr-section-controls">
            <select
              className="hr-btn-secondary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "6px 12px" }}
            >
              <option value="All Status">All Status</option>
              <option value="Present">Present</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
            </select>

            <button
              type="button"
              className="hr-btn-secondary"
              onClick={handleExportCsv}
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        <div className="hr-table-responsive">
          <table className="hr-data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
                <th>Location</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {recordsData.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                    No attendance records found for this filter.
                  </td>
                </tr>
              ) : (
                recordsData.map((row) => (
                  <tr key={row.id}>
                    <td className="hr-emp-name-cell">
                      {row.employee_name || `EMP-${row.employee_id}`}
                    </td>
                    <td>{row.department || "General"}</td>
                    <td>{row.formattedDate || row.date}</td>
                    <td>{row.checkIn || "--"}</td>
                    <td>{row.checkOut || "--"}</td>
                    <td>{row.hours ? `${row.hours} hrs` : "--"}</td>
                    <td>
                      <span
                        className={`hr-badge ${
                          row.status === "Present"
                            ? "hr-badge-green"
                            : row.status === "On Leave"
                            ? "hr-badge-purple"
                            : row.status === "Absent"
                            ? "hr-badge-red"
                            : "hr-badge-amber"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>{row.location || "Bangalore Office"}</td>
                    <td>{row.remarks || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
