import React, { useState } from "react";
import PortalLayout from "../../components/layout/PortalLayout";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import "./AdminDashboard.css";

const MOCK_USERS = [
  { id: 1, name: "Alexander Wright", email: "admin@peoplepay360.com", role: "ADMIN", department: "IT & Admin", status: "Active" },
  { id: 2, name: "Sophia Martinez", email: "sophia.hr@peoplepay360.com", role: "HR_MANAGER", department: "Human Resources", status: "Active" },
  { id: 3, name: "Liam Patel", email: "liam.payroll@peoplepay360.com", role: "PAYROLL_MANAGER", department: "Finance", status: "Active" },
  { id: 4, name: "Emma Davis", email: "emma.ops@peoplepay360.com", role: "PAYROLL_USER", department: "Finance & Payroll", status: "Active" },
  { id: 5, name: "James Wilson", email: "james.w@peoplepay360.com", role: "EMPLOYEE", department: "Engineering", status: "Active" },
  { id: 6, name: "Olivia Taylor", email: "olivia.t@peoplepay360.com", role: "EMPLOYEE", department: "Product & Design", status: "Active" },
  { id: 7, name: "Ethan Brown", email: "ethan.b@peoplepay360.com", role: "EMPLOYEE", department: "Marketing", status: "Inactive" },
];

const MOCK_AUDITS = [
  { id: 101, timestamp: "Today, 10:42 AM", user: "Alexander Wright", action: "User Role Modified", detail: "Assigned PAYROLL_MANAGER to liam.payroll@peoplepay360.com", status: "Success" },
  { id: 102, timestamp: "Today, 09:15 AM", user: "Liam Patel", action: "Payroll Run Approved", detail: "February 2026 Batch Approved ($142,500 total payout)", status: "Success" },
  { id: 103, timestamp: "Yesterday, 04:30 PM", user: "Sophia Martinez", action: "Employee Onboarded", detail: "Added Olivia Taylor to Product & Design", status: "Success" },
  { id: 104, timestamp: "Yesterday, 01:10 PM", user: "Security Watchdog", action: "Automated Backup", detail: "PostgreSQL Database snapshot created successfully", status: "Success" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleBadgeVariant = (role) => {
    switch (role) {
      case "ADMIN": return "danger";
      case "HR_MANAGER": return "success";
      case "PAYROLL_MANAGER": return "warning";
      case "PAYROLL_USER": return "primary";
      default: return "neutral";
    }
  };

  const userColumns = [
    {
      key: "name",
      header: "User / Name",
      render: (row) => (
        <div className="user-cell">
          <div className="user-cell-avatar">{row.name.charAt(0)}</div>
          <div>
            <div className="user-cell-name">{row.name}</div>
            <div className="user-cell-email">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "System Role",
      render: (row) => (
        <Badge variant={roleBadgeVariant(row.role)}>
          {row.role.replace("_", " ")}
        </Badge>
      ),
    },
    { key: "department", header: "Department" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === "Active" ? "success" : "neutral"} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="table-action-btns">
          <button
            type="button"
            className="action-btn-secondary"
            onClick={() => alert(`Edit role modal for ${row.name}`)}
          >
            Edit Role
          </button>
        </div>
      ),
    },
  ];

  const auditColumns = [
    { key: "timestamp", header: "Timestamp", width: "160px" },
    { key: "user", header: "Actor", width: "180px" },
    { key: "action", header: "Action Event", width: "200px" },
    { key: "detail", header: "Description / Payload" },
    {
      key: "status",
      header: "Result",
      width: "100px",
      render: (row) => <Badge variant="success" size="sm">{row.status}</Badge>,
    },
  ];

  return (
    <PortalLayout title="Admin Control Center">
      {/* Metric Cards Row */}
      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={users.length}
          subtitle="Across 5 system roles"
          icon="👥"
          variant="primary"
          trend="+3 this week"
        />
        <StatCard
          title="Active System Roles"
          value="5 Roles"
          subtitle="Admin, HR, Payroll, Employee"
          icon="🛡️"
          variant="info"
        />
        <StatCard
          title="System Health"
          value="99.99%"
          subtitle="All microservices operational"
          icon="⚡"
          variant="success"
          trend="Operational"
        />
        <StatCard
          title="Security Alerts"
          value="0 Issues"
          subtitle="Audit trail active"
          icon="🔒"
          variant="success"
        />
      </div>

      {/* Tabs Navigation */}
      <div className="admin-tabs-bar">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 User & Role Management
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          ⚙️ Company & Department Settings
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "audits" ? "active" : ""}`}
          onClick={() => setActiveTab("audits")}
        >
          📜 System Audit Logs
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === "users" && (
        <div className="tab-content">
          <DataTable
            title="System Accounts & RBAC Assignment"
            subtitle="Manage roles, permissions, and active statuses across your organization."
            columns={userColumns}
            data={filteredUsers}
            actions={
              <div className="admin-search-wrapper">
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search user, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-create-user"
                  onClick={() => alert("Open New User Modal")}
                >
                  + Add New User
                </button>
              </div>
            }
          />
        </div>
      )}

      {/* Tab 2: Company Settings */}
      {activeTab === "settings" && (
        <div className="tab-content">
          <div className="settings-grid">
            <div className="settings-card">
              <h3 className="settings-card-title">🏢 Organization Details</h3>
              <p className="settings-card-desc">Configure company metadata for official tax and payslip headers.</p>
              <div className="settings-form-row">
                <label className="settings-label">Company Legal Name</label>
                <input type="text" className="settings-input" defaultValue="PeoplePay360 Global Pvt. Ltd." />
              </div>
              <div className="settings-form-row">
                <label className="settings-label">Default Currency</label>
                <input type="text" className="settings-input" defaultValue="USD ($)" />
              </div>
              <div className="settings-form-row">
                <label className="settings-label">Standard Work Week</label>
                <input type="text" className="settings-input" defaultValue="Monday to Friday (40 Hours)" />
              </div>
              <button type="button" className="btn-save-settings">Save Organization Info</button>
            </div>

            <div className="settings-card">
              <h3 className="settings-card-title">🗂️ Active Departments</h3>
              <p className="settings-card-desc">Organizational units for payroll grouping and leave approvals.</p>
              <ul className="department-list">
                <li><span>Human Resources</span> <Badge variant="neutral" size="sm">4 Staff</Badge></li>
                <li><span>Engineering & IT</span> <Badge variant="neutral" size="sm">42 Staff</Badge></li>
                <li><span>Finance & Payroll</span> <Badge variant="neutral" size="sm">8 Staff</Badge></li>
                <li><span>Product & Design</span> <Badge variant="neutral" size="sm">16 Staff</Badge></li>
                <li><span>Sales & Marketing</span> <Badge variant="neutral" size="sm">24 Staff</Badge></li>
              </ul>
              <button type="button" className="action-btn-secondary" style={{ marginTop: "16px", width: "100%" }}>
                + Add Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === "audits" && (
        <div className="tab-content">
          <DataTable
            title="System Security & Action Logs"
            subtitle="Immutable chronological trail of role updates, payroll approvals, and logins."
            columns={auditColumns}
            data={MOCK_AUDITS}
          />
        </div>
      )}
    </PortalLayout>
  );
};

export default AdminDashboard;
