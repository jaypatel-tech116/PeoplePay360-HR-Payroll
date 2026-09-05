import React, { useState } from "react";
import PortalLayout from "../../components/layout/PortalLayout";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import "./HrManagerDashboard.css";

const INITIAL_LEAVE_QUEUE = [
  { id: 201, employee: "Ethan Brown", code: "EMP-1021", department: "Marketing", type: "Sick Leave", dates: "Mar 06 - Mar 07 (2 Days)", reason: "Viral fever", applied: "Mar 05" },
  { id: 202, employee: "Olivia Taylor", code: "EMP-1033", department: "Product", type: "Casual Leave", dates: "Mar 10 (1 Day)", reason: "Personal errand", applied: "Mar 04" },
  { id: 203, employee: "James Wilson", code: "EMP-1042", department: "Engineering", type: "Vacation", dates: "Apr 10 - Apr 15 (4 Days)", reason: "Annual family trip", applied: "Mar 03" },
  { id: 204, employee: "Lucas Scott", code: "EMP-1055", department: "Sales", type: "Casual Leave", dates: "Mar 18 (1 Day)", reason: "Home maintenance", applied: "Mar 02" },
];

const MOCK_DIRECTORY = [
  { id: 1, name: "James Wilson", code: "EMP-1042", email: "james.w@peoplepay360.com", department: "Engineering", designation: "Senior Engineer", joined: "Jan 15, 2023", status: "Active" },
  { id: 2, name: "Olivia Taylor", code: "EMP-1033", email: "olivia.t@peoplepay360.com", department: "Product", designation: "Product Designer", joined: "May 10, 2023", status: "Active" },
  { id: 3, name: "Ethan Brown", code: "EMP-1021", email: "ethan.b@peoplepay360.com", department: "Marketing", designation: "Growth Lead", joined: "Aug 01, 2022", status: "Active" },
  { id: 4, name: "Lucas Scott", code: "EMP-1055", email: "lucas.s@peoplepay360.com", department: "Sales", designation: "Account Exec", joined: "Nov 20, 2024", status: "Active" },
  { id: 5, name: "Mia Chen", code: "EMP-1060", email: "mia.c@peoplepay360.com", department: "Human Resources", designation: "HR Generalist", joined: "Feb 01, 2025", status: "Active" },
];

const HrManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("approvals");
  const [leaveQueue, setLeaveQueue] = useState(INITIAL_LEAVE_QUEUE);
  const [directorySearch, setDirectorySearch] = useState("");

  const handleApprove = (id) => {
    setLeaveQueue((prev) => prev.filter((item) => item.id !== id));
    alert(`Leave request #${id} Approved successfully!`);
  };

  const handleReject = (id) => {
    setLeaveQueue((prev) => prev.filter((item) => item.id !== id));
    alert(`Leave request #${id} Rejected.`);
  };

  const approvalColumns = [
    {
      key: "employee",
      header: "Applicant",
      render: (row) => (
        <div>
          <div className="emp-table-name">{row.employee}</div>
          <div className="emp-table-sub">{row.code} • {row.department}</div>
        </div>
      ),
    },
    { key: "type", header: "Leave Type" },
    { key: "dates", header: "Duration / Range" },
    { key: "reason", header: "Reason" },
    { key: "applied", header: "Submission Date" },
    {
      key: "actions",
      header: "Action Decision",
      render: (row) => (
        <div className="table-action-btns">
          <button
            type="button"
            className="btn-approve"
            onClick={() => handleApprove(row.id)}
          >
            ✓ Approve
          </button>
          <button
            type="button"
            className="btn-reject"
            onClick={() => handleReject(row.id)}
          >
            ✕ Reject
          </button>
        </div>
      ),
    },
  ];

  const directoryColumns = [
    {
      key: "name",
      header: "Employee",
      render: (row) => (
        <div>
          <div className="emp-table-name">{row.name}</div>
          <div className="emp-table-sub">{row.email}</div>
        </div>
      ),
    },
    { key: "code", header: "EMP Code", width: "120px" },
    { key: "department", header: "Department" },
    { key: "designation", header: "Designation" },
    { key: "joined", header: "Joining Date" },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge variant="success" size="sm">{row.status}</Badge>,
    },
  ];

  const filteredDirectory = MOCK_DIRECTORY.filter(
    (e) =>
      e.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      e.department.toLowerCase().includes(directorySearch.toLowerCase()) ||
      e.code.toLowerCase().includes(directorySearch.toLowerCase())
  );

  return (
    <PortalLayout title="HR Operations Portal">
      {/* Metrics Row */}
      <div className="stats-grid">
        <StatCard
          title="Total Workforce"
          value="94 Staff"
          subtitle="Across 5 active departments"
          icon="👥"
          variant="primary"
          trend="+2 new hires"
        />
        <StatCard
          title="Today's Attendance"
          value="92.4%"
          subtitle="87 present, 7 on leave"
          icon="✅"
          variant="success"
          trend="High presence"
        />
        <StatCard
          title="Pending Approvals"
          value={`${leaveQueue.length} Requests`}
          subtitle="Awaiting your decision"
          icon="⏳"
          variant={leaveQueue.length > 0 ? "warning" : "success"}
        />
        <StatCard
          title="Onboarding Pipeline"
          value="3 Hires"
          subtitle="Starting next Monday"
          icon="🚀"
          variant="info"
        />
      </div>

      {/* Tabs */}
      <div className="admin-tabs-bar">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "approvals" ? "active" : ""}`}
          onClick={() => setActiveTab("approvals")}
        >
          📬 Leave Approvals Queue ({leaveQueue.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "directory" ? "active" : ""}`}
          onClick={() => setActiveTab("directory")}
        >
          📇 Employee Directory ({MOCK_DIRECTORY.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          📊 Department Attendance Matrix
        </button>
      </div>

      {/* Tab 1: Approvals */}
      {activeTab === "approvals" && (
        <div className="tab-content">
          <DataTable
            title="Pending Leave Applications"
            subtitle="Review employee leave requests and grant approvals."
            columns={approvalColumns}
            data={leaveQueue}
            emptyMessage="All clear! No pending leave applications to review."
          />
        </div>
      )}

      {/* Tab 2: Directory */}
      {activeTab === "directory" && (
        <div className="tab-content">
          <DataTable
            title="Company Staff Directory"
            subtitle="View employee employment status, departments, and titles."
            columns={directoryColumns}
            data={filteredDirectory}
            actions={
              <div className="admin-search-wrapper">
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Filter by name, code, dept..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-create-user"
                  onClick={() => alert("Open Onboard Employee Modal")}
                >
                  + Add Employee
                </button>
              </div>
            }
          />
        </div>
      )}

      {/* Tab 3: Attendance Matrix */}
      {activeTab === "attendance" && (
        <div className="tab-content">
          <div className="settings-grid">
            <div className="settings-card">
              <h3 className="settings-card-title">Engineering Department</h3>
              <p className="settings-card-desc">40 Present / 2 On Leave (95.2% Attendance)</p>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: "95%" }} />
              </div>
            </div>
            <div className="settings-card">
              <h3 className="settings-card-title">Product & Design</h3>
              <p className="settings-card-desc">15 Present / 1 On Leave (93.7% Attendance)</p>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: "93%" }} />
              </div>
            </div>
            <div className="settings-card">
              <h3 className="settings-card-title">Sales & Marketing</h3>
              <p className="settings-card-desc">21 Present / 3 On Leave (87.5% Attendance)</p>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: "87%" }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

export default HrManagerDashboard;
