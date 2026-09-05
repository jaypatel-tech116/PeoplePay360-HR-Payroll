const { pool } = require("../config/mysqlDb");

/**
 * Calculates daily working hours from time string (HH:MM:SS)
 * @param {string} start - e.g. "09:00:00"
 * @param {string} end - e.g. "18:00:00"
 * @param {number} breakMinutes - e.g. 60
 * @returns {number}
 */
function calculateDailyHours(start, end, breakMinutes = 0) {
  if (!start || !end) return 0;

  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);

  let totalMinutes = (eH * 60 + eM) - (sH * 60 + sM) - (breakMinutes || 0);
  if (totalMinutes < 0) totalMinutes = 0;

  return parseFloat((totalMinutes / 60).toFixed(2));
}

/**
 * Calculates weekly working hours from an employee working schedule record
 * @param {Object} schedule
 * @returns {number}
 */
function calculateWeeklyHours(schedule) {
  if (!schedule) return 40.0;

  const breakMins = schedule.break_minutes || 0;
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  let totalWeekly = 0;
  for (const day of days) {
    const start = schedule[`${day}_start`];
    const end = schedule[`${day}_end`];
    totalWeekly += calculateDailyHours(start, end, breakMins);
  }

  return parseFloat(totalWeekly.toFixed(2));
}

/**
 * Checks if a specific date is a scheduled working day according to the schedule
 * @param {Date} date
 * @param {Object} schedule
 * @returns {boolean}
 */
function isScheduledWorkingDay(date, schedule) {
  if (!schedule) {
    // Default Mon-Fri standard schedule if none assigned
    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = dayNames[date.getDay()];

  const start = schedule[`${dayName}_start`];
  const end = schedule[`${dayName}_end`];

  return Boolean(start && end);
}

/**
 * Counts the actual scheduled working days in a date range for a schedule
 * @param {string|Date} periodStart
 * @param {string|Date} periodEnd
 * @param {Object} schedule
 * @returns {number}
 */
function getScheduledWorkDays(periodStart, periodEnd, schedule) {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  let count = 0;
  const curr = new Date(start);

  while (curr <= end) {
    if (isScheduledWorkingDay(curr, schedule)) {
      count++;
    }
    curr.setDate(curr.getDate() + 1);
  }

  return count;
}

/**
 * Aggregates complete payroll period attendance and leave metrics for an employee
 * 
 * @param {number|string} employeeId
 * @param {string|Date} periodStart
 * @param {string|Date} periodEnd
 * @param {number|string|null} scheduleId
 * @returns {Promise<Object>}
 */
async function getEmployeeAttendanceSummary(employeeId, periodStart, periodEnd, scheduleId = null) {
  const pStart = typeof periodStart === "string" ? periodStart.split("T")[0] : new Date(periodStart).toISOString().split("T")[0];
  const pEnd = typeof periodEnd === "string" ? periodEnd.split("T")[0] : new Date(periodEnd).toISOString().split("T")[0];

  // 1. Fetch schedule
  let schedule = null;
  if (scheduleId) {
    const [sRows] = await pool.query(`SELECT * FROM working_schedules WHERE id = ?;`, [scheduleId]);
    schedule = sRows[0] || null;
  } else {
    // Check if employee has an assigned schedule
    const [empRows] = await pool.query(`
      SELECT s.* FROM employees e 
      JOIN working_schedules s ON e.schedule_id = s.id 
      WHERE e.id = ?;
    `, [employeeId]);
    schedule = empRows[0] || null;
  }

  // Calculate scheduled working days in period (e.g. 22 days out of 31 for August 2026)
  const scheduledDays = getScheduledWorkDays(pStart, pEnd, schedule) || 26;

  // 2. Fetch attendance logs in period
  const [attRows] = await pool.query(`
    SELECT * FROM attendance
    WHERE employee_id = ?
      AND attendance_date >= ?
      AND attendance_date <= ?;
  `, [employeeId, pStart, pEnd]);

  let presentDays = 0;
  let halfDays = 0;
  let loggedAbsentDays = 0;
  let totalWorkedHours = 0;
  let totalOvertimeHours = 0;

  for (const a of attRows) {
    totalWorkedHours += parseFloat(a.worked_hours || 0);
    totalOvertimeHours += parseFloat(a.overtime_hours || 0);

    const status = String(a.status || "").toUpperCase();
    if (status === "PRESENT") {
      presentDays += 1;
    } else if (status === "HALF DAY" || status === "HALF_DAY") {
      halfDays += 1;
      presentDays += 0.5;
    } else if (status === "ABSENT") {
      loggedAbsentDays += 1;
    }
  }

  // 3. Fetch approved leaves in period
  const [leaves] = await pool.query(`
    SELECT lr.*, lt.is_paid, lt.affects_payroll
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.employee_id = ?
      AND lr.status = 'Approved'
      AND lr.start_date <= ?
      AND lr.end_date >= ?;
  `, [employeeId, pEnd, pStart]);

  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0; // LOP

  for (const l of leaves) {
    const lDays = parseFloat(l.days) || 0;
    if (l.is_paid && !l.affects_payroll) {
      paidLeaveDays += lDays;
    } else {
      unpaidLeaveDays += lDays; // Loss of Pay (LOP)
    }
  }

  // Determine effective worked days & LOP:
  // If complete daily attendance logs exist for all scheduled days, use logged presence.
  // Otherwise, default standard contracted working schedule minus unexcused absences, half-days, and unpaid leaves.
  const lopDays = parseFloat((unpaidLeaveDays + loggedAbsentDays + (halfDays * 0.5)).toFixed(2));

  let effectiveWorkedDays = 0;
  if (attRows.length >= scheduledDays && presentDays > 0) {
    effectiveWorkedDays = presentDays;
  } else {
    // Standard contract full schedule presence minus LOP and paid leaves
    effectiveWorkedDays = Math.max(0, parseFloat((scheduledDays - lopDays - paidLeaveDays).toFixed(2)));
  }

  const payableDays = Math.max(0, parseFloat((effectiveWorkedDays + paidLeaveDays).toFixed(2)));

  return {
    scheduled_days: scheduledDays,
    worked_days: effectiveWorkedDays,
    present_days: presentDays,
    half_days: halfDays,
    logged_absent_days: loggedAbsentDays,
    paid_leave_days: paidLeaveDays,
    unpaid_leave_days: unpaidLeaveDays,
    lop_days: lopDays,
    paid_days: payableDays,
    worked_hours: parseFloat(totalWorkedHours.toFixed(2)),
    overtime_hours: parseFloat(totalOvertimeHours.toFixed(2)),
  };
}

module.exports = {
  calculateDailyHours,
  calculateWeeklyHours,
  getScheduledWorkDays,
  getEmployeeAttendanceSummary,
};
