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

const DashboardView = ({
  onNavigate,
  checkedIn,
  onToggleCheckIn,
  onOpenLeaveModal,
  refreshKey,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    fullName: "Rahul Sharma",
    initials: "RS",
    employeeCode: "EMP001",
    department: "Engineering",
    jobPosition: "Software Developer",
    employeeType: "Full Time",
    manager: "Priya Mehta",
    email: "rahul.sharma@company.com",
    phone: "+91 98765 43210",
    workSchedule: "General (Mon - Fri)",
    dateOfBirth: "15 Jan 2000",
    status: "Active",
    joiningDate: "01 Sep 2023",
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

  const recentAtt = data?.recentAttendance || [
    { id: 1, date: "26 Aug 2025", checkIn: "09:00 AM", checkOut: "06:00 PM", workedHours: "9.00", status: "Present" },
    { id: 2, date: "25 Aug 2025", checkIn: "09:15 AM", checkOut: "06:00 PM", workedHours: "8.75", status: "Present" },
    { id: 3, date: "22 Aug 2025", checkIn: "09:00 AM", checkOut: "06:00 PM", workedHours: "9.00", status: "Present" },
    { id: 4, date: "21 Aug 2025", checkIn: "09:30 AM", checkOut: "06:00 PM", workedHours: "8.50", status: "Late" },
    { id: 5, date: "20 Aug 2025", checkIn: "09:00 AM", checkOut: "06:00 PM", workedHours: "9.00", status: "Present" },
  ];

  const recentLeaves = data?.recentLeaves || [
    { id: 1, from: "15 Sep 2025", to: "16 Sep 2025", type: "Annual Leave", days: 2, status: "Pending" },
    { id: 2, from: "10 Jul 2025", to: "10 Jul 2025", type: "Sick Leave", days: 1, status: "Approved" },
    { id: 3, from: "12 Jun 2025", to: "13 Jun 2025", type: "Annual Leave", days: 2, status: "Approved" },
    { id: 4, from: "05 Mar 2025", to: "05 Mar 2025", type: "Sick Leave", days: 1, status: "Rejected" },
  ];

  // Donut calculations: 2 * PI * 38 = 238.76
  const ratio = lb.totalAllocated > 0 ? lb.remaining / lb.totalAllocated : 0.75;
  const strokeDashoffset = Math.round(238.76 * (1 - Math.min(1, Math.max(0, ratio))));

  const currentDateText = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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



          {/* 3-Column Middle Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 1.25fr 1fr",
              gap: "16px",
              marginBottom: "20px",
            }}
            className="odoo-3col-grid"
          >
            {/* Column 1: Full Month Attendance (Replaced My Profile per requirements) */}
            <div className="odoo-card">
              <div className="odoo-card-header">
                <h3 className="odoo-card-title">
                  <span>⏱️</span> Full Month Attendance
                </h3>
                <span
                  className="odoo-view-all-link"
                  onClick={() => onNavigate("attendance")}
                >
                  View Attendance
                </span>
              </div>

              <div style={{ padding: "4px 0 12px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                    background: "#f8fafc",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--odoo-text-muted)",
                        display: "block",
                      }}
                    >
                      Monthly Punctuality
                    </span>
                    <strong
                      style={{
                        fontSize: "1.1rem",
                        color: "var(--odoo-plum-primary)",
                      }}
                    >
                      {data?.monthAttendance?.rate || "96.5%"}
                    </strong>
                  </div>
                  <span
                    className="odoo-badge odoo-badge-green"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {data?.monthAttendance?.rate ? "Good Record" : "Active Month"}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    fontSize: "0.8rem",
                  }}
                >
                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "10px",
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#64748b",
                        display: "block",
                      }}
                    >
                      Present Days
                    </span>
                    <strong style={{ fontSize: "1rem", color: "#059669" }}>
                      {data?.monthAttendance?.present ?? 22} Days
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "10px",
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#64748b",
                        display: "block",
                      }}
                    >
                      On Leave
                    </span>
                    <strong style={{ fontSize: "1rem", color: "#d97706" }}>
                      {data?.monthAttendance?.onLeave ?? 2} Days
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "10px",
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#64748b",
                        display: "block",
                      }}
                    >
                      Absent Days
                    </span>
                    <strong style={{ fontSize: "1rem", color: "#dc2626" }}>
                      {data?.monthAttendance?.absent ?? 0} Days
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "10px",
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#64748b",
                        display: "block",
                      }}
                    >
                      Total Hours Worked
                    </span>
                    <strong style={{ fontSize: "1rem", color: "#1e1b4b" }}>
                      {data?.monthAttendance?.totalHours || "176.5 hrs"}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="odoo-btn-secondary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "14px",
                  }}
                  onClick={() => onNavigate("attendance")}
                >
                  ⏱️ Open Attendance Portal
                </button>
              </div>
            </div>

            {/* Column 2: Today's Attendance & Recent Attendance */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Today's Attendance */}
              <div className="odoo-card">
                <div className="odoo-card-header">
                  <h3 className="odoo-card-title">Today's Attendance</h3>
                  <span
                    className={`odoo-badge ${
                      checkedIn ? "odoo-badge-green" : "odoo-badge-orange"
                    }`}
                  >
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.25rem",
                        color: "var(--odoo-plum-primary)",
                      }}
                    >
                      ⏱️
                    </span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                        {att.checkInTime}
                      </div>
                      <div
                        style={{
                          fontSize: "0.725rem",
                          color: "var(--odoo-text-muted)",
                        }}
                      >
                        Check In
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "center",
                      borderLeft: "1px solid var(--odoo-border)",
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: "var(--odoo-text-muted)",
                        }}
                      >
                        {att.checkOutTime}
                      </div>
                      <div
                        style={{
                          fontSize: "0.725rem",
                          color: "var(--odoo-text-muted)",
                        }}
                      >
                        Check Out
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="odoo-btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() =>
                    onToggleCheckIn &&
                    onToggleCheckIn({ action: checkedIn ? "OUT" : "IN" })
                  }
                >
                  {checkedIn ? "↪ Check Out" : "⏱️ Check In"}
                </button>
              </div>

              {/* Recent Attendance */}
              <div className="odoo-card" style={{ flex: 1 }}>
                <div className="odoo-card-header">
                  <h3 className="odoo-card-title">Recent Attendance</h3>
                  <span
                    className="odoo-view-all-link"
                    onClick={() => onNavigate("attendance")}
                  >
                    View All
                  </span>
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
                      </tr>
                    </thead>
                    <tbody>
                      {recentAtt.map((r, i) => (
                        <tr key={r.id || i}>
                          <td>{r.date}</td>
                          <td>{r.checkIn}</td>
                          <td>{r.checkOut}</td>
                          <td>{r.workedHours}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Column 3: Leave Balance & My Leave Requests */}
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
                    <span className="donut-sub-text">
                      Remaining of {lb.totalAllocated} Days
                    </span>
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
                        <th>Leave Type</th>
                        <th>Days</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
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
