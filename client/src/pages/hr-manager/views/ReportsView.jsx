import React, { useState, useEffect } from "react";
import hrApi from "../../../api/hr.api";

const ReportsView = () => {
  const [activeSubtab, setActiveSubtab] = useState("attendance");
  const [selectedMonth, setSelectedMonth] = useState("Aug 2025");
  const [overviewFilter, setOverviewFilter] = useState("This Month");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic report state
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [leaveReport, setLeaveReport] = useState(null);
  const [employeeReport, setEmployeeReport] = useState(null);
  const [departmentReport, setDepartmentReport] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      const [attRes, leaveRes, empRes, deptRes] = await Promise.allSettled([
        hrApi.getAttendanceReport(),
        hrApi.getLeaveReport(),
        hrApi.getEmployeeReport(),
        hrApi.getDepartmentReport(),
      ]);

      if (attRes.status === "fulfilled" && attRes.value) {
        setAttendanceReport(attRes.value);
      }
      if (leaveRes.status === "fulfilled" && leaveRes.value) {
        setLeaveReport(leaveRes.value);
      }
      if (empRes.status === "fulfilled" && empRes.value) {
        setEmployeeReport(empRes.value);
      }
      if (deptRes.status === "fulfilled" && deptRes.value) {
        setDepartmentReport(deptRes.value || []);
      }
    } catch (err) {
      console.error("Failed to load HR reports data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (type = "attendance") => {
    window.open(hrApi.getExportUrl(type), "_blank");
  };

  // Fallback / dynamic attendance numbers
  const totalEmployees = attendanceReport?.totalEmployees || 48;
  const presentCount = attendanceReport?.present || 38;
  const onLeaveCount = attendanceReport?.onLeave || 4;
  const absentCount = attendanceReport?.absent || 6;
  const halfDayCount = attendanceReport?.halfDay || 2;

  const presentPct = Math.round((presentCount / (totalEmployees || 1)) * 100);
  const onLeavePct = Math.round((onLeaveCount / (totalEmployees || 1)) * 100);
  const absentPct = Math.round((absentCount / (totalEmployees || 1)) * 100);
  const halfDayPct = Math.round((halfDayCount / (totalEmployees || 1)) * 100);

  // Detailed rows for attendance
  const detailedList = attendanceReport?.detailed || [
    { id: 1, code: "EMP001", name: "Rahul Sharma", department: "Engineering", presentDays: 20, absentDays: 3, onLeave: 2, halfDay: 1, totalWorkingDays: 26, attendancePct: "88%" },
    { id: 2, code: "EMP002", name: "Priya Mehta", department: "Human Resources", presentDays: 21, absentDays: 2, onLeave: 1, halfDay: 2, totalWorkingDays: 26, attendancePct: "92%" },
    { id: 3, code: "EMP003", name: "Vikram Rao", department: "Sales", presentDays: 19, absentDays: 4, onLeave: 2, halfDay: 1, totalWorkingDays: 26, attendancePct: "80%" },
    { id: 4, code: "EMP004", name: "Sneha Iyer", department: "Product", presentDays: 18, absentDays: 5, onLeave: 2, halfDay: 1, totalWorkingDays: 26, attendancePct: "76%" },
    { id: 5, code: "EMP005", name: "Aditya Gupta", department: "Engineering", presentDays: 22, absentDays: 2, onLeave: 1, halfDay: 1, totalWorkingDays: 26, attendancePct: "92%" },
  ];

  const deptWiseList = attendanceReport?.departmentWise || [
    { department: "Engineering", attendancePct: "92%" },
    { department: "Human Resources", attendancePct: "85%" },
    { department: "Sales", attendancePct: "78%" },
    { department: "Product", attendancePct: "76%" },
    { department: "Marketing", attendancePct: "70%" },
    { department: "Customer Success", attendancePct: "68%" },
  ];

  const filteredDetailed = detailedList.filter((r) => {
    const q = searchEmployee.toLowerCase();
    return (
      (r.name || "").toLowerCase().includes(q) ||
      (r.code || "").toLowerCase().includes(q) ||
      (r.department || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="hr-content-body">
      {/* 1. Header */}
      <div className="hr-page-header">
        <div>
          <h1 className="hr-page-title">Reports</h1>
          <p className="hr-page-subtitle">
            Insights and analytics for your workforce
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="hr-btn-secondary"
            onClick={() => handleExport(activeSubtab === "leave" ? "leave-requests" : activeSubtab === "attendance" ? "attendance" : "employees")}
          >
            <span>📥</span>
            <span>Export Report</span>
          </button>
          <select
            className="hr-btn-secondary"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "7px 12px" }}
          >
            <option value="Aug 2025">📅 Aug 2025</option>
            <option value="Jul 2025">📅 Jul 2025</option>
            <option value="Jun 2025">📅 Jun 2025</option>
          </select>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div className="hr-stats-grid">
        {/* Total Employees */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-purple">👥</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Total Employees</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">{totalEmployees}</span>
              <span className="hr-stat-pill-green">↑ 12%</span>
            </div>
            <span className="hr-stat-subtext">Active Workforce</span>
          </div>
        </div>

        {/* Present (Avg) */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-green">✓</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Present (Avg)</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">{presentCount}</span>
              <span className="hr-stat-pill-green">{presentPct}%</span>
            </div>
            <span className="hr-stat-subtext">of total employees</span>
          </div>
        </div>

        {/* On Leave (Avg) */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-amber">⏱</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">On Leave (Avg)</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">{onLeaveCount}</span>
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
                {onLeavePct}%
              </span>
            </div>
            <span className="hr-stat-subtext">of total employees</span>
          </div>
        </div>

        {/* Absent (Avg) */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-red">👤</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Absent (Avg)</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">{absentCount}</span>
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
                {absentPct}%
              </span>
            </div>
            <span className="hr-stat-subtext">of total employees</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tabs Bar */}
      <div className="hr-subtabs-bar">
        <button
          type="button"
          className={`hr-subtab-btn ${activeSubtab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveSubtab("attendance")}
        >
          Attendance Report
        </button>
        <button
          type="button"
          className={`hr-subtab-btn ${activeSubtab === "leave" ? "active" : ""}`}
          onClick={() => setActiveSubtab("leave")}
        >
          Leave Report
        </button>
        <button
          type="button"
          className={`hr-subtab-btn ${activeSubtab === "employee" ? "active" : ""}`}
          onClick={() => setActiveSubtab("employee")}
        >
          Employee Report
        </button>
        <button
          type="button"
          className={`hr-subtab-btn ${activeSubtab === "department" ? "active" : ""}`}
          onClick={() => setActiveSubtab("department")}
        >
          Department Report
        </button>
        <button
          type="button"
          className={`hr-subtab-btn ${activeSubtab === "payroll" ? "active" : ""}`}
          onClick={() => setActiveSubtab("payroll")}
        >
          Payroll Report
        </button>
      </div>

      {/* 4. Subtab Content: Attendance */}
      {activeSubtab === "attendance" && (
        <>
          {/* Middle Analytics 3 Cards Grid */}
          <div className="hr-analytics-grid">
            {/* Card 1: Attendance Overview (Donut Chart) */}
            <div className="hr-analytics-card">
              <div className="hr-analytics-card-header">
                <div>
                  <h3 className="hr-analytics-title">Attendance Overview</h3>
                  <p className="hr-analytics-subtitle">
                    Employee attendance status for {selectedMonth}
                  </p>
                </div>
                <select
                  className="hr-btn-secondary"
                  value={overviewFilter}
                  onChange={(e) => setOverviewFilter(e.target.value)}
                  style={{ padding: "4px 8px", fontSize: "0.74rem" }}
                >
                  <option value="This Month">This Month ⌵</option>
                  <option value="Last Month">Last Month ⌵</option>
                </select>
              </div>

              <div className="hr-donut-wrapper">
                <div className="hr-donut-svg-container">
                  <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%" }}>
                    {/* Background Ring */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="3.6"
                    />
                    {/* Present - Green */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.6"
                      strokeDasharray={`${presentPct}, 100`}
                      strokeDashoffset="0"
                    />
                    {/* On Leave - Orange */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.6"
                      strokeDasharray={`${onLeavePct}, 100`}
                      strokeDashoffset={`-${presentPct}`}
                    />
                    {/* Absent - Red */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3.6"
                      strokeDasharray={`${absentPct}, 100`}
                      strokeDashoffset={`-${presentPct + onLeavePct}`}
                    />
                  </svg>
                  <div className="hr-donut-center-text">
                    <span className="hr-donut-center-num">{totalEmployees}</span>
                    <span className="hr-donut-center-sub">Employees</span>
                  </div>
                </div>

                <div className="hr-donut-legend-list">
                  <div className="hr-donut-legend-item">
                    <span className="hr-donut-legend-label">
                      <span
                        className="hr-green-dot"
                        style={{ backgroundColor: "#10b981" }}
                      />
                      Present
                    </span>
                    <span className="hr-donut-legend-val">
                      {presentCount} ({presentPct}%)
                    </span>
                  </div>

                  <div className="hr-donut-legend-item">
                    <span className="hr-donut-legend-label">
                      <span
                        className="hr-green-dot"
                        style={{ backgroundColor: "#f59e0b" }}
                      />
                      On Leave
                    </span>
                    <span className="hr-donut-legend-val">
                      {onLeaveCount} ({onLeavePct}%)
                    </span>
                  </div>

                  <div className="hr-donut-legend-item">
                    <span className="hr-donut-legend-label">
                      <span
                        className="hr-green-dot"
                        style={{ backgroundColor: "#ef4444" }}
                      />
                      Absent
                    </span>
                    <span className="hr-donut-legend-val">
                      {absentCount} ({absentPct}%)
                    </span>
                  </div>

                  <div className="hr-donut-legend-item">
                    <span className="hr-donut-legend-label">
                      <span
                        className="hr-green-dot"
                        style={{ backgroundColor: "#8b5cf6" }}
                      />
                      Half Day
                    </span>
                    <span className="hr-donut-legend-val">
                      {halfDayCount} ({halfDayPct}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Daily Attendance Trend (Dual Line Chart) */}
            <div className="hr-analytics-card">
              <div className="hr-analytics-card-header">
                <div>
                  <h3 className="hr-analytics-title">Daily Attendance Trend</h3>
                  <p className="hr-analytics-subtitle">
                    Present vs Absent employees
                  </p>
                </div>
              </div>

              <div className="hr-line-chart-container">
                <svg
                  className="hr-line-chart-svg"
                  viewBox="0 0 320 120"
                  preserveAspectRatio="none"
                >
                  {/* Horizontal Grid lines */}
                  <line x1="24" y1="10" x2="310" y2="10" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="24" y1="35" x2="310" y2="35" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="24" y1="60" x2="310" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="24" y1="85" x2="310" y2="85" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="24" y1="110" x2="310" y2="110" stroke="#e2e8f0" strokeWidth="1" />

                  {/* Y Axis text */}
                  <text x="5" y="14" fontSize="8" fill="#94a3b8">50</text>
                  <text x="5" y="39" fontSize="8" fill="#94a3b8">40</text>
                  <text x="5" y="64" fontSize="8" fill="#94a3b8">30</text>
                  <text x="5" y="89" fontSize="8" fill="#94a3b8">10</text>
                  <text x="10" y="112" fontSize="8" fill="#94a3b8">0</text>

                  {/* Green Present Line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    points="
                      35,42 
                      55,30 
                      75,40 
                      95,36 
                      115,28 
                      135,30 
                      155,26 
                      175,34 
                      195,31 
                      215,24 
                      235,30 
                      255,28 
                      275,35 
                      295,24
                    "
                  />
                  {[
                    [35, 42], [55, 30], [75, 40], [95, 36], [115, 28],
                    [135, 30], [155, 26], [175, 34], [195, 31], [215, 24],
                    [235, 30], [255, 28], [275, 35], [295, 24]
                  ].map(([x, y], i) => (
                    <circle key={`g-${i}`} cx={x} cy={y} r="2.5" fill="#10b981" />
                  ))}

                  {/* Red Absent Line */}
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    points="
                      35,98 
                      55,92 
                      75,95 
                      95,94 
                      115,96 
                      135,93 
                      155,90 
                      175,95 
                      195,92 
                      215,95 
                      235,94 
                      255,96 
                      275,93 
                      295,96
                    "
                  />
                  {[
                    [35, 98], [55, 92], [75, 95], [95, 94], [115, 96],
                    [135, 93], [155, 90], [175, 95], [195, 92], [215, 95],
                    [235, 94], [255, 96], [275, 93], [295, 96]
                  ].map(([x, y], i) => (
                    <circle key={`r-${i}`} cx={x} cy={y} r="2.5" fill="#ef4444" />
                  ))}
                </svg>

                {/* X-axis labels */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0 10px 0 24px", fontSize: "0.7rem", color: "#94a3b8" }}>
                  <span>1 Aug</span>
                  <span>7 Aug</span>
                  <span>14 Aug</span>
                  <span>21 Aug</span>
                  <span>28 Aug</span>
                </div>

                <div className="hr-line-chart-legend">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="hr-green-dot" style={{ backgroundColor: "#10b981" }} />
                    <span>Present</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="hr-green-dot" style={{ backgroundColor: "#ef4444" }} />
                    <span>Absent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Department Wise Attendance (Progress Bars) */}
            <div className="hr-analytics-card">
              <div className="hr-analytics-card-header">
                <div>
                  <h3 className="hr-analytics-title">Department Wise Attendance</h3>
                  <p className="hr-analytics-subtitle">
                    Present employees by department
                  </p>
                </div>
              </div>

              <div className="hr-dept-progress-list">
                {deptWiseList.map((dept, index) => {
                  const pct = parseInt(dept.attendancePct) || 80;
                  return (
                    <div key={index} className="hr-dept-progress-item">
                      <span className="hr-dept-name">{dept.department}</span>
                      <div className="hr-dept-bar-track">
                        <div className="hr-dept-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="hr-dept-percentage">{dept.attendancePct || `${pct}%`}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Detailed Attendance Report Table */}
          <div className="hr-section-card">
            <div className="hr-section-header">
              <div className="hr-section-title-group">
                <div>
                  <h2 className="hr-section-heading">Detailed Attendance Report</h2>
                  <p className="hr-section-subheading">
                    View detailed employee attendance records
                  </p>
                </div>
              </div>

              <div className="hr-section-controls">
                <div className="hr-input-search-wrapper">
                  <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="hr-btn-secondary"
                  onClick={() => handleExport("attendance")}
                >
                  <span>📥</span> Export CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="hr-table-responsive">
              <table className="hr-data-table">
                <thead>
                  <tr>
                    <th style={{ width: "30px" }}>#</th>
                    <th>Employee Code</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Present Days</th>
                    <th>Absent Days</th>
                    <th>On Leave ▾</th>
                    <th>Half Day ▾</th>
                    <th>Total Working Days</th>
                    <th>Attendance %</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDetailed.map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td style={{ color: "#9ca3af" }}>{idx + 1}</td>
                      <td>{row.code}</td>
                      <td className="hr-emp-name-cell">{row.name}</td>
                      <td>{row.department || row.dept || "-"}</td>
                      <td>{row.presentDays || row.present || 0}</td>
                      <td>{row.absentDays || row.absent || 0}</td>
                      <td>{row.onLeave || 0}</td>
                      <td>{row.halfDay || 0}</td>
                      <td>{row.totalWorkingDays || row.total || 26}</td>
                      <td>
                        <span
                          className={`hr-badge ${
                            (parseInt(row.attendancePct || row.pct) >= 80)
                              ? "hr-badge-green"
                              : "hr-badge-amber"
                          }`}
                        >
                          {row.attendancePct || `${row.pct}%`}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="hr-btn-view"
                          onClick={() =>
                            alert(
                              `Detailed Attendance Audit for ${row.name} (${row.code}):\nPresent: ${row.presentDays || row.present} days\nAbsent: ${row.absentDays || row.absent} days\nOn Leave: ${row.onLeave} days\nAttendance: ${row.attendancePct || row.pct}%`
                            )
                          }
                        >
                          <span>👁</span> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="hr-pagination-footer">
              <span>Showing 1 to {filteredDetailed.length} of {totalEmployees} employees</span>
              <div className="hr-pagination-controls">
                <button
                  type="button"
                  className="hr-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`hr-page-btn ${currentPage === 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
                <button
                  type="button"
                  className="hr-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 5. Subtab Content: Leave Report */}
      {activeSubtab === "leave" && (
        <div className="hr-section-card">
          <div className="hr-section-header">
            <div>
              <h2 className="hr-section-heading">Leave Breakdown & Consumption</h2>
              <p className="hr-section-subheading">
                Distribution of employee leaves across leave categories
              </p>
            </div>
            <button
              type="button"
              className="hr-btn-secondary"
              onClick={() => handleExport("leave-requests")}
            >
              <span>📥</span> Export Leaves CSV
            </button>
          </div>

          <div className="hr-stats-grid" style={{ marginBottom: "20px" }}>
            <div className="hr-stat-card">
              <div className="hr-stat-icon-wrapper hr-stat-icon-green">✓</div>
              <div className="hr-stat-info">
                <span className="hr-stat-label">Approved Requests</span>
                <span className="hr-stat-value">{leaveReport?.approved || 8}</span>
              </div>
            </div>
            <div className="hr-stat-card">
              <div className="hr-stat-icon-wrapper hr-stat-icon-amber">⏱</div>
              <div className="hr-stat-info">
                <span className="hr-stat-label">Pending Approval</span>
                <span className="hr-stat-value">{leaveReport?.pending || 3}</span>
              </div>
            </div>
            <div className="hr-stat-card">
              <div className="hr-stat-icon-wrapper hr-stat-icon-red">✕</div>
              <div className="hr-stat-info">
                <span className="hr-stat-label">Rejected Requests</span>
                <span className="hr-stat-value">{leaveReport?.rejected || 1}</span>
              </div>
            </div>
          </div>

          <div className="hr-table-responsive">
            <table className="hr-data-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Total Requests</th>
                  <th>Total Days Taken</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(leaveReport?.leaveByType || [
                  { leave_type: "Paid Time Off", count: 6, total_days: 18 },
                  { leave_type: "Sick Leave", count: 4, total_days: 8 },
                  { leave_type: "Casual Leave", count: 2, total_days: 2 },
                ]).map((lt, i) => (
                  <tr key={i}>
                    <td className="hr-emp-name-cell">{lt.leave_type}</td>
                    <td>{lt.count}</td>
                    <td>{lt.total_days} days</td>
                    <td><span className="hr-badge hr-badge-green">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Subtab Content: Employee Report */}
      {activeSubtab === "employee" && (
        <div className="hr-section-card">
          <div className="hr-section-header">
            <div>
              <h2 className="hr-section-heading">Employee Lifecycle & Type Distribution</h2>
              <p className="hr-section-subheading">
                Workforce distribution across onboarding pipelines and contract types
              </p>
            </div>
            <button
              type="button"
              className="hr-btn-secondary"
              onClick={() => handleExport("employees")}
            >
              <span>📥</span> Export Employees CSV
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="hr-analytics-card">
              <h3 className="hr-analytics-title" style={{ marginBottom: "12px" }}>By Pipeline Stage</h3>
              <div className="hr-dept-progress-list">
                {(employeeReport?.stages || [
                  { pipeline_stage: "ACTIVE", count: 8 },
                  { pipeline_stage: "NEW_JOINER", count: 2 },
                  { pipeline_stage: "ON_LEAVE", count: 1 },
                  { pipeline_stage: "EXITING", count: 1 },
                ]).map((st, i) => (
                  <div key={i} className="hr-dept-progress-item">
                    <span className="hr-dept-name">{st.pipeline_stage}</span>
                    <span className="hr-stat-value" style={{ fontSize: "1rem" }}>{st.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hr-analytics-card">
              <h3 className="hr-analytics-title" style={{ marginBottom: "12px" }}>By Employment Type</h3>
              <div className="hr-dept-progress-list">
                {(employeeReport?.employeeTypes || [
                  { employee_type: "FULL_TIME", count: 10 },
                  { employee_type: "PART_TIME", count: 1 },
                  { employee_type: "CONTRACT", count: 1 },
                ]).map((et, i) => (
                  <div key={i} className="hr-dept-progress-item">
                    <span className="hr-dept-name">{et.employee_type}</span>
                    <span className="hr-stat-value" style={{ fontSize: "1rem" }}>{et.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Subtab Content: Department Report */}
      {activeSubtab === "department" && (
        <div className="hr-section-card">
          <div className="hr-section-header">
            <div>
              <h2 className="hr-section-heading">Department Strength & Headcount</h2>
              <p className="hr-section-subheading">
                Active department records and employee distribution
              </p>
            </div>
            <button
              type="button"
              className="hr-btn-secondary"
              onClick={() => handleExport("employees")}
            >
              <span>📥</span> Export CSV
            </button>
          </div>

          <div className="hr-table-responsive">
            <table className="hr-data-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Code</th>
                  <th>Total Employees</th>
                  <th>Active Employees</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {departmentReport.map((dept) => (
                  <tr key={dept.id}>
                    <td className="hr-emp-name-cell">{dept.name}</td>
                    <td>{dept.code || "-"}</td>
                    <td>{dept.total_employees || 0}</td>
                    <td>{dept.active_employees || 0}</td>
                    <td><span className="hr-badge hr-badge-green">Operational</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Subtab Content: Payroll Report */}
      {activeSubtab === "payroll" && (
        <div className="hr-section-card" style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>💰</div>
          <h2 className="hr-section-heading" style={{ marginBottom: "8px" }}>
            Payroll Reports & Salary Structures
          </h2>
          <p className="hr-section-subheading" style={{ maxWidth: "540px", margin: "0 auto 16px" }}>
            Salary slip computation, payrun approvals, and compensation analytics are managed in the dedicated Payroll Module.
          </p>
          <span className="hr-badge hr-badge-green">Integrated with Employee Contracts</span>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
