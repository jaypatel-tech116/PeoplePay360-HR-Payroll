import React, { useState, useEffect, useMemo } from "react";
import hrApi from "../../../api/hr.api";
import { useAuth } from "../../../context/AuthContext";
import { SkeletonDashboard } from "../../../components/ui/SkeletonLoader";

/** Clean duplicate name bug (e.g. "tester1 tester1" -> "tester1") */
const cleanName = (name) => {
  if (!name) return "Employee";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
    return parts[0];
  }
  return name.trim();
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

const AttendanceView = () => {
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(new Date().getDate());

  const [summary, setSummary] = useState({
    total_employees: 0,
    present_today: 0,
    on_leave: 0,
    absent_today: 0,
    average_hours: "0.0 hrs",
    today_activity: [],
    month_days: [],
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
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real attendance data from database
  const loadAttendance = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "All Status") params.status = statusFilter;
      if (dateFilter === "TODAY") params.date = "today";
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [sumData, recData] = await Promise.all([
        hrApi.getAttendanceSummary(),
        hrApi.getAttendance(params),
      ]);
      setSummary(sumData || {});
      setRecordsData(Array.isArray(recData) ? recData : []);
    } catch (err) {
      console.error("Error loading attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [statusFilter, dateFilter]);

  // Today's formatted string for matching today's records
  const todayFormatted = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  // Determine logged-in HR manager's attendance today
  const hrEmployeeId = user?.employee_id || 2;
  const hrTodayRecord = useMemo(() => {
    return recordsData.find(
      (r) =>
        Number(r.employee_id) === Number(hrEmployeeId) &&
        (r.formattedDate === todayFormatted ||
          (r.date && new Date(r.date).toDateString() === new Date().toDateString()))
    );
  }, [recordsData, hrEmployeeId, todayFormatted]);

  const isHrCheckedIn = hrTodayRecord ? !hrTodayRecord.checkOut : false;
  const isHrCompletedToday = hrTodayRecord ? Boolean(hrTodayRecord.checkOut) : false;

  const handleCheckIn = async () => {
    try {
      await hrApi.createAttendance({
        employee_id: hrEmployeeId,
        status: "Present",
        check_in: new Date(),
        notes: "Bangalore Office",
      });
      alert("Checked in successfully at " + currentTime);
      await loadAttendance();
    } catch (err) {
      alert("Check in failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCheckOut = async () => {
    try {
      await hrApi.createAttendance({
        employee_id: hrEmployeeId,
        status: "Present",
        check_out: new Date(),
        notes: "Bangalore Office",
      });
      alert("Checked out successfully at " + currentTime);
      await loadAttendance();
    } catch (err) {
      alert("Check out failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleExportCsv = () => {
    window.open(hrApi.getExportUrl("attendance"), "_blank");
  };

  // Calendar cells generation for dynamic current month
  const calYear = currentCalendarDate.getFullYear();
  const calMonth = currentCalendarDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Monday-first

  // Days with attendance in current displayed month
  const attendedDaysSet = useMemo(() => {
    const set = new Set();
    // From summary.month_days if same month/year
    if (
      calMonth === new Date().getMonth() &&
      calYear === new Date().getFullYear() &&
      summary.month_days
    ) {
      summary.month_days.forEach((m) => set.add(Number(m.day)));
    }
    // Also parse from recordsData
    recordsData.forEach((r) => {
      if (r.date) {
        const d = new Date(r.date);
        if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
          set.add(d.getDate());
        }
      }
    });
    return set;
  }, [recordsData, summary.month_days, calMonth, calYear]);

  const calendarCells = useMemo(() => {
    const cells = [];
    const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

    // Leading other-month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, otherMonth: true });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const hasAtt = attendedDaysSet.has(day);
      cells.push({
        day,
        otherMonth: false,
        dot: hasAtt ? "present" : null,
        isSelected: day === selectedCalendarDay,
      });
    }

    // Trailing other-month days to fill 35 or 42 grid
    const remaining = 35 - cells.length;
    if (remaining > 0) {
      for (let i = 1; i <= remaining; i++) {
        cells.push({ day: i, otherMonth: true });
      }
    }
    return cells;
  }, [calYear, calMonth, daysInMonth, firstDayIndex, attendedDaysSet, selectedCalendarDay]);

  // Today activity list: from summary or from recordsData
  const todayActivityList = useMemo(() => {
    if (summary.today_activity && summary.today_activity.length > 0) {
      return summary.today_activity;
    }
    return recordsData.filter(
      (r) =>
        r.formattedDate === todayFormatted ||
        (r.date && new Date(r.date).toDateString() === new Date().toDateString())
    );
  }, [summary.today_activity, recordsData, todayFormatted]);

  // Client-side search & filtering for instant UI responsiveness
  const filteredRecords = useMemo(() => {
    return recordsData.filter((row) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const empName = (row.employee_name || "").toLowerCase();
        const empCode = (row.employee_code || "").toLowerCase();
        const dept = (row.department || "").toLowerCase();
        const loc = (row.location || "").toLowerCase();
        const rem = (row.remarks || "").toLowerCase();
        const dateStr = (row.formattedDate || "").toLowerCase();
        if (
          !empName.includes(q) &&
          !empCode.includes(q) &&
          !dept.includes(q) &&
          !loc.includes(q) &&
          !rem.includes(q) &&
          !dateStr.includes(q)
        ) {
          return false;
        }
      }

      if (dateFilter === "TODAY") {
        const isMatch =
          row.formattedDate === todayFormatted ||
          (row.date && new Date(row.date).toDateString() === new Date().toDateString());
        if (!isMatch) return false;
      } else if (dateFilter === "SEP2026") {
        if (!row.formattedDate?.includes("Sep 2026")) return false;
      } else if (dateFilter === "AUG2025") {
        if (!row.formattedDate?.includes("Aug 2025")) return false;
      }

      return true;
    });
  }, [recordsData, searchQuery, dateFilter, todayFormatted]);

  if (loading && recordsData.length === 0) return <SkeletonDashboard />;

  return (
    <div className="hr-content-body">
      {/* 1. Page Header */}
      <div className="hr-page-header">
        <div>
          <h1 className="hr-page-title">Attendance Management</h1>
          <p className="hr-page-subtitle">
            Live database tracking of employee check-in, check-out, and worked hours
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="hr-btn-secondary"
            onClick={() => loadAttendance()}
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="hr-btn-primary"
            onClick={handleExportCsv}
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
        </div>
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
              <span className="hr-stat-pill-green">Live</span>
            </div>
            <span className="hr-stat-subtext">Today's active workforce</span>
          </div>
        </div>
      </div>

      {/* 3. Middle 3 Cards Grid */}
      <div className="hr-attendance-grid-3">
        {/* Card 1: Check In / Check Out (HR Self Attendance) */}
        <div className="hr-punch-card">
          <div className="hr-punch-header">
            <div className="hr-section-icon" style={{ borderRadius: "50%" }}>
              🪪
            </div>
            <div>
              <h3 className="hr-punch-title">My Attendance</h3>
              <p className="hr-punch-subtitle">
                {user?.name || "HR Manager"} • Mark attendance for today
              </p>
            </div>
          </div>

          <div className="hr-punch-clock-container">
            <div className="hr-punch-time-big">{currentTime || "--:--:--"}</div>
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
                  backgroundColor: isHrCheckedIn
                    ? "#10b981"
                    : isHrCompletedToday
                    ? "#6b7280"
                    : "#ef4444",
                }}
              />
              <span
                style={{
                  color: isHrCheckedIn
                    ? "#059669"
                    : isHrCompletedToday
                    ? "#4b5563"
                    : "#ef4444",
                }}
              >
                {isHrCheckedIn
                  ? "You are checked in"
                  : isHrCompletedToday
                  ? "Attendance completed today"
                  : "You are checked out"}
              </span>
            </div>
          </div>

          <div className="hr-punch-actions-row">
            <button
              type="button"
              className={
                !isHrCheckedIn && !isHrCompletedToday
                  ? "hr-btn-checkin-active"
                  : "hr-btn-checkin-disabled"
              }
              onClick={handleCheckIn}
              disabled={isHrCheckedIn || isHrCompletedToday}
            >
              <span>➔</span> Check In
            </button>
            <button
              type="button"
              className={
                isHrCheckedIn
                  ? "hr-btn-checkout-active"
                  : "hr-btn-checkout-disabled"
              }
              onClick={handleCheckOut}
              disabled={!isHrCheckedIn}
            >
              <span>◼</span> Check Out
            </button>
          </div>

          <div className="hr-punch-footer-row">
            <div className="hr-punch-footer-col">
              <span className="hr-punch-footer-icon">🕒</span>
              <div className="hr-punch-footer-meta">
                <span className="hr-punch-footer-label">Check In Time</span>
                <span className="hr-punch-footer-val">
                  {hrTodayRecord?.checkIn || "--:--"}
                </span>
              </div>
            </div>
            <div className="hr-punch-footer-col">
              <span className="hr-punch-footer-icon">⏱</span>
              <div className="hr-punch-footer-meta">
                <span className="hr-punch-footer-label">Working Hours</span>
                <span className="hr-punch-footer-val">
                  {hrTodayRecord?.hours
                    ? `${hrTodayRecord.hours} hrs`
                    : isHrCheckedIn
                    ? "In progress"
                    : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Today's Live Attendance Feed */}
        <div className="hr-timeline-card">
          <div className="hr-timeline-header">
            <div>
              <h3 className="hr-timeline-title">Today's Attendance</h3>
              <span style={{ fontSize: "0.74rem", color: "#6b7280" }}>
                Live employee check-ins ({todayActivityList.length})
              </span>
            </div>
            <button
              type="button"
              className="hr-timeline-link"
              style={{ background: "none", border: "none", padding: 0 }}
              onClick={() => setDateFilter("TODAY")}
            >
              View Today ➔
            </button>
          </div>

          <div
            className="hr-timeline-list"
            style={{
              overflowY: todayActivityList.length > 3 ? "auto" : "visible",
              maxHeight: "220px",
              paddingRight: "4px",
            }}
          >
            {todayActivityList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 12px", color: "#9ca3af" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>⏱️</div>
                <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 500 }}>
                  No employee attendance records logged yet today.
                </p>
              </div>
            ) : (
              todayActivityList.map((act, idx) => {
                const empName = cleanName(act.employee_name);
                const isOut = Boolean(act.checkOut);
                return (
                  <div key={act.id || idx} className="hr-timeline-item">
                    <div className="hr-timeline-line" />
                    <div
                      className={`hr-timeline-dot ${
                        isOut ? "hr-dot-green" : "hr-dot-blue"
                      }`}
                    />
                    <div className="hr-timeline-content">
                      <div>
                        <div className="hr-timeline-label">
                          {empName}
                          <span
                            style={{
                              marginLeft: "6px",
                              fontSize: "0.72rem",
                              color: "#6b7280",
                              fontWeight: 500,
                            }}
                          >
                            ({act.employee_code || `EMP${act.employee_id}`})
                          </span>
                        </div>
                        <div className="hr-timeline-sub">
                          {act.department || "General"} • {act.location || "Bangalore Office"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className="hr-timeline-time">
                          {act.checkIn}
                          {isOut ? ` ➔ ${act.checkOut}` : ""}
                        </span>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: isOut ? "#059669" : "#0284c7",
                            marginTop: "2px",
                          }}
                        >
                          {isOut
                            ? `${act.hours || "0.00"} hrs`
                            : "🟢 Currently Working"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Card 3: Mini Calendar */}
        <div className="hr-calendar-card">
          <div className="hr-calendar-nav-row">
            <span className="hr-calendar-month">
              {currentCalendarDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className="hr-calendar-arrow-btn"
                onClick={() =>
                  setCurrentCalendarDate(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                  )
                }
              >
                ‹
              </button>
              <button
                type="button"
                className="hr-calendar-arrow-btn"
                onClick={() =>
                  setCurrentCalendarDate(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                  )
                }
              >
                ›
              </button>
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
                  cell.day === selectedCalendarDay && !cell.otherMonth ? "active-day" : ""
                }`}
                onClick={() => {
                  if (!cell.otherMonth) {
                    setSelectedCalendarDay(cell.day);
                  }
                }}
              >
                <span>{cell.day}</span>
                {cell.dot === "present" && (
                  <span className="hr-cal-day-dot hr-cal-dot-present" />
                )}
              </div>
            ))}
          </div>

          <div className="hr-cal-legend-row">
            <div className="hr-cal-legend-item">
              <span className="hr-green-dot" />
              <span>Attended</span>
            </div>
            <div className="hr-cal-legend-item">
              <span
                className="hr-green-dot"
                style={{ backgroundColor: "#0284c7" }}
              />
              <span>Working</span>
            </div>
            <div className="hr-cal-legend-item">
              <span
                className="hr-green-dot"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <span>On Leave</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: All Employee Attendance Records Table */}
      <div className="hr-section-card">
        <div className="hr-section-header">
          <div className="hr-section-title-group">
            <div className="hr-section-icon">📅</div>
            <div>
              <h2 className="hr-section-heading">Employee Attendance Records</h2>
              <p className="hr-section-subheading">
                All employee attendance entries fetched directly from database
              </p>
            </div>
          </div>

          <div className="hr-section-controls" style={{ flexWrap: "wrap", gap: "8px" }}>
            {/* Search Input */}
            <div className="hr-input-search-wrapper" style={{ minWidth: "220px" }}>
              <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>🔍</span>
              <input
                type="text"
                placeholder="Search employee, code, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Date Filter */}
            <select
              className="hr-btn-secondary"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ padding: "6px 12px" }}
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today Only</option>
              <option value="SEP2026">Sep 2026</option>
              <option value="AUG2025">Aug 2025</option>
            </select>

            {/* Status Filter */}
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

            <span
              style={{
                backgroundColor: "#f1f5f9",
                color: "#475569",
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "6px 10px",
                borderRadius: "6px",
                alignSelf: "center",
              }}
            >
              {filteredRecords.length} Records
            </span>
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
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: "center", padding: "36px", color: "#6b7280" }}
                  >
                    No attendance records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row) => {
                  const empName = cleanName(row.employee_name || `EMP-${row.employee_id}`);
                  const initials = getInitials(empName);
                  const isWorkingNow =
                    row.status === "Present" && row.checkIn && !row.checkOut;

                  return (
                    <tr key={row.id}>
                      <td className="hr-emp-name-cell">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            className="hr-card-avatar"
                            style={{
                              width: "32px",
                              height: "32px",
                              fontSize: "0.75rem",
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#111827" }}>
                              {empName}
                            </div>
                            <div style={{ fontSize: "0.74rem", color: "#6b7280" }}>
                              {row.employee_code || `EMP${row.employee_id}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{row.department || "General"}</td>
                      <td>{row.formattedDate || row.date}</td>
                      <td style={{ fontWeight: 600, color: "#111827" }}>
                        {row.checkIn || "--:--"}
                      </td>
                      <td
                        style={{
                          fontWeight: 600,
                          color: row.checkOut ? "#111827" : isWorkingNow ? "#0284c7" : "#9ca3af",
                        }}
                      >
                        {row.checkOut || (isWorkingNow ? "🟢 Working..." : "--:--")}
                      </td>
                      <td style={{ fontWeight: 600, color: "#111827" }}>
                        {row.hours !== undefined &&
                        row.hours !== null &&
                        parseFloat(row.hours) > 0
                          ? `${row.hours} hrs`
                          : isWorkingNow
                          ? "In progress"
                          : "--"}
                      </td>
                      <td>
                        <span
                          className={`hr-badge ${
                            row.status === "Present"
                              ? isWorkingNow
                                ? "hr-badge-blue"
                                : "hr-badge-green"
                              : row.status === "On Leave"
                              ? "hr-badge-purple"
                              : row.status === "Absent"
                              ? "hr-badge-red"
                              : "hr-badge-amber"
                          }`}
                        >
                          {isWorkingNow ? "Working" : row.status}
                        </span>
                      </td>
                      <td>{row.location || "Bangalore Office"}</td>
                      <td>{row.remarks || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
