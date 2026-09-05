import React, { useState, useEffect } from "react";
import { getEmployeeDashboard } from "../../../api/employee.api";
import { SkeletonDashboard } from "../../../components/ui/SkeletonLoader";

const cleanName = (name) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
    return parts[0];
  }
  return name;
};

const getInitials = (name) => {
  const cleaned = cleanName(name);
  if (!cleaned) return "EM";
  const parts = cleaned.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
};

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DashboardView = ({
  onNavigate,
  checkedIn,
  onToggleCheckIn,
  onOpenLeaveModal,
  refreshKey,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);

  // Month navigation state initialized to current month/year
  const [navDate, setNavDate] = useState(new Date());

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeDashboard();
        if (isMounted && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn("Failed to load employee dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const emp = data?.employee || {
    fullName: "Employee",
    initials: "EM",
    employeeCode: "EMP001",
    department: "Engineering",
    jobPosition: "Software Developer",
  };

  const displayName = cleanName(emp.fullName);

  const att = data?.todayAttendance || {
    checkInTime: checkedIn ? "09:05 AM" : "--:--",
    checkOutTime: "--:--",
  };

  const lb = data?.leaveBalance || {
    totalAllocated: 12,
    used: 3,
    remaining: 9,
  };

  const recentLeaves = data?.recentLeaves || [];
  const calendarAttendance = data?.calendarAttendance || [];
  const calendarLeaves = data?.calendarLeaves || [];

  // Donut calculations: 2 * PI * 38 = 238.76
  const ratio = lb.totalAllocated > 0 ? lb.remaining / lb.totalAllocated : 0.75;
  const strokeDashoffset = Math.round(238.76 * (1 - Math.min(1, Math.max(0, ratio))));

  const currentDateText = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    setNavDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Build calendar grid to match exact Odoo calendar spec (Monday-start grid)
  const buildCalendarCells = () => {
    const year = navDate.getFullYear();
    const month = navDate.getMonth(); // 0-indexed

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Attendance map
    const attMap = {};
    calendarAttendance.forEach((a) => {
      if (a.date) attMap[a.date] = a;
    });

    // Leave date set
    const leaveDates = new Set();
    calendarLeaves.forEach((l) => {
      if (l.startDate && l.endDate) {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          leaveDates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
        }
      }
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday-first indexing: JS getDay() is 0 (Sun), 1 (Mon)... 6 (Sat)
    const firstDayRaw = new Date(year, month, 1).getDay();
    const firstDayIndex = (firstDayRaw + 6) % 7; // 0 = Mon, ..., 6 = Sun

    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // 1. Trailing days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        type: "prev",
        day: prevMonthDays - i,
      });
    }

    // 2. Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dateObj = new Date(year, month, day);
      const dayOfWeek = dateObj.getDay();
      const isToday = dateStr === todayStr;
      const isFuture = dateObj > today;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let status = "working"; // Default working weekday
      let attData = null;

      if (attMap[dateStr]) {
        attData = attMap[dateStr];
        status = "attended";
      } else if (leaveDates.has(dateStr)) {
        status = "leave";
      } else if (isWeekend) {
        status = "weekend";
      } else if (isFuture) {
        status = "future";
      } else {
        // Past working day with record = attended, without = working/attended fallback
        status = "attended";
      }

      cells.push({
        type: "current",
        day,
        dateStr,
        status,
        isToday,
        attData,
      });
    }

    // 3. Leading days for next month to complete 35 cells (or 42 if > 35)
    const targetCellCount = cells.length > 35 ? 42 : 35;
    let nextDay = 1;
    while (cells.length < targetCellCount) {
      cells.push({
        type: "next",
        day: nextDay++,
      });
    }

    return cells;
  };

  const calendarCells = !loading ? buildCalendarCells() : [];

  return (
    <div className="employee-dashboard-view">
      {loading && <SkeletonDashboard />}
      {!loading && (
        <>
          {/* Header */}
          <div className="odoo-page-header">
            <div>
              <h1 className="odoo-page-title">Welcome, {displayName} 👋</h1>
              <p className="odoo-page-subtitle">Here's your personal overview</p>
            </div>
            <div className="odoo-header-date">{currentDateText}</div>
          </div>

          {/* 2-Column Dashboard Layout */}
          <div className="dashboard-2col">
            {/* Left Column: Today's Attendance + Calendar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Today's Attendance */}
              <div className="odoo-card">
                <div className="odoo-card-header">
                  <h3 className="odoo-card-title">Today's Attendance</h3>
                  <span className={`odoo-badge ${checkedIn ? "odoo-badge-green" : "odoo-badge-orange"}`}>
                    {checkedIn ? "Checked In" : "Checked Out"}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    textAlign: "center",
                    padding: "8px 0 16px 0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.25rem", color: "var(--odoo-plum-primary)" }}>⏱️</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                        {att.checkInTime}
                      </div>
                      <div style={{ fontSize: "0.725rem", color: "var(--odoo-text-muted)" }}>
                        Check In
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", borderLeft: "1px solid var(--odoo-border)" }}>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--odoo-text-muted)" }}>
                        {att.checkOutTime}
                      </div>
                      <div style={{ fontSize: "0.725rem", color: "var(--odoo-text-muted)" }}>
                        Check Out
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="odoo-btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => onToggleCheckIn && onToggleCheckIn({ action: checkedIn ? "OUT" : "IN" })}
                >
                  {checkedIn ? "↪ Check Out" : "⏱️ Check In"}
                </button>
              </div>

              {/* Exact Odoo Calendar Match from Image */}
              <div className="odoo-card odoo-calendar-card">
                {/* Header with Title + Navigation Arrows */}
                <div className="odoo-cal-header">
                  <h2 className="odoo-cal-title">
                    {MONTH_NAMES[navDate.getMonth()]} {navDate.getFullYear()}
                  </h2>
                  <div className="odoo-cal-nav">
                    <button
                      type="button"
                      className="odoo-cal-nav-btn"
                      onClick={handlePrevMonth}
                      title="Previous Month"
                    >
                      &lt;
                    </button>
                    <button
                      type="button"
                      className="odoo-cal-nav-btn"
                      onClick={handleNextMonth}
                      title="Next Month"
                    >
                      &gt;
                    </button>
                  </div>
                </div>

                {/* Days of Week Row */}
                <div className="odoo-cal-days-header">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="odoo-cal-day-name">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="odoo-cal-grid">
                  {calendarCells.map((cell, idx) => {
                    if (cell.type === "prev" || cell.type === "next") {
                      return (
                        <div key={`out-${cell.type}-${idx}`} className="odoo-cal-cell out-of-month">
                          {cell.day}
                        </div>
                      );
                    }

                    const isHighlighted = cell.isToday; // Solid purple circle pill for active/today day
                    return (
                      <div
                        key={cell.dateStr}
                        className="odoo-cal-cell current-month"
                        onMouseEnter={() => cell.attData && setHoveredDay(cell.dateStr)}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        <div className={`odoo-cal-day-num ${isHighlighted ? "highlighted-pill" : ""}`}>
                          {cell.day}
                        </div>

                        {/* Dot indicator matching legend */}
                        {!isHighlighted && cell.status === "attended" && <span className="odoo-cal-dot green" />}
                        {!isHighlighted && cell.status === "working" && <span className="odoo-cal-dot blue" />}
                        {!isHighlighted && cell.status === "leave" && <span className="odoo-cal-dot orange" />}

                        {/* Hover Details Popup */}
                        {hoveredDay === cell.dateStr && cell.attData && (
                          <div className="att-calendar-tooltip">
                            <div>In: {cell.attData.checkIn}</div>
                            <div>Out: {cell.attData.checkOut}</div>
                            <div>Hours: {cell.attData.workedHours}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer Legend */}
                <div className="odoo-cal-legend">
                  <div className="odoo-cal-legend-item">
                    <span className="odoo-cal-dot green" />
                    <span>Attended</span>
                  </div>
                  <div className="odoo-cal-legend-item">
                    <span className="odoo-cal-dot blue" />
                    <span>Working</span>
                  </div>
                  <div className="odoo-cal-legend-item">
                    <span className="odoo-cal-dot orange" />
                    <span>On Leave</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Leave Balance & Leave Requests */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Leave Balance Donut */}
              <div className="odoo-card">
                <div className="odoo-card-header">
                  <h3 className="odoo-card-title">Leave Balance</h3>
                  <span
                    className="odoo-view-all-link"
                    onClick={() => onNavigate("leaves")}
                  >
                    View All
                  </span>
                </div>

                <div className="donut-container">
                  <svg className="donut-svg" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" className="donut-circle-bg" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="donut-circle-val"
                      strokeDasharray="238.76"
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className="donut-center-text">
                    <span className="donut-big-num">{lb.remaining}</span>
                    <span className="donut-sub-text">Remaining of {lb.totalAllocated} Days</span>
                  </div>
                </div>

                <div className="donut-legend">
                  <div className="donut-legend-item">
                    <div className="donut-legend-left">
                      <span className="donut-dot allocated" />
                      <span>Total Allocated</span>
                    </div>
                    <strong>{lb.totalAllocated}</strong>
                  </div>
                  <div className="donut-legend-item">
                    <div className="donut-legend-left">
                      <span className="donut-dot used" />
                      <span>Used</span>
                    </div>
                    <strong>{lb.used}</strong>
                  </div>
                  <div className="donut-legend-item">
                    <div className="donut-legend-left">
                      <span className="donut-dot remaining" />
                      <span>Remaining</span>
                    </div>
                    <strong>{lb.remaining}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="odoo-btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={onOpenLeaveModal}
                >
                  ✈ Request Leave
                </button>
              </div>

              {/* My Leave Requests */}
              <div className="odoo-card" style={{ flex: 1 }}>
                <div className="odoo-card-header">
                  <h3 className="odoo-card-title">My Leave Requests</h3>
                  <span
                    className="odoo-view-all-link"
                    onClick={() => onNavigate("leaves")}
                  >
                    View All
                  </span>
                </div>

                <div className="odoo-table-wrapper">
                  <table className="odoo-table">
                    <thead>
                      <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Type</th>
                        <th>Days</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLeaves.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", color: "var(--odoo-text-muted)", padding: "20px" }}>
                            No leave requests found
                          </td>
                        </tr>
                      )}
                      {recentLeaves.map((l, i) => (
                        <tr key={l.id || i}>
                          <td>{l.from}</td>
                          <td>{l.to}</td>
                          <td>{l.type}</td>
                          <td>{l.days}</td>
                          <td>
                            <span
                              className={`odoo-badge ${
                                l.status === "Approved"
                                  ? "odoo-badge-green"
                                  : l.status === "Pending"
                                  ? "odoo-badge-orange"
                                  : "odoo-badge-red"
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardView;
