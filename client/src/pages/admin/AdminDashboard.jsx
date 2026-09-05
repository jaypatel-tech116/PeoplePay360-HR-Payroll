import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminPortal.css";

// 16 Views matching all screens from reference images
import AdminOverviewView from "./views/AdminOverviewView";
import EmployeesListView from "./views/EmployeesListView";
import EmployeeDetailsView from "./views/EmployeeDetailsView";
import DepartmentsView from "./views/DepartmentsView";
import ContractsView from "./views/ContractsView";
import WorkingSchedulesView from "./views/WorkingSchedulesView";
import AttendanceView from "./views/AttendanceView";
import TimeOffRequestsView from "./views/TimeOffRequestsView";
import PayCyclesView from "./views/PayCyclesView";
import CreatePayCycleWizard from "./views/CreatePayCycleWizard";
import PaySlipsView from "./views/PaySlipsView";
import PayrollReportsView from "./views/PayrollReportsView";
import SalaryStructuresView from "./views/SalaryStructuresView";
import SalaryRulesView from "./views/SalaryRulesView";
import UsersAndRolesView from "./views/UsersAndRolesView";
import SettingsView from "./views/SettingsView";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  // Sidebar primary navigation menu
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "employees", label: "Employees", icon: "👥" },
    { id: "departments", label: "Departments", icon: "🏢" },
    { id: "contracts", label: "Contracts", icon: "📄" },
    { id: "working-schedules", label: "Working Schedules", icon: "⏰" },
    { id: "attendance", label: "Attendance", icon: "📅" },
    { id: "time-off", label: "Time Off", icon: "🏖️" },
    { id: "pay-cycles", label: "Payroll", icon: "💵" },
    { id: "reports", label: "Reports", icon: "📈" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  // Direct 16-Screen Quick Jumper
  const screenShortcuts = [
    { id: "dashboard", label: "1. Dashboard (Overview)" },
    { id: "employees", label: "2. Employees (List)" },
    { id: "employee-detail", label: "3. Employee Details" },
    { id: "departments", label: "4. Departments" },
    { id: "contracts", label: "5. Contracts" },
    { id: "working-schedules", label: "6. Working Schedules" },
    { id: "attendance", label: "7. Attendance" },
    { id: "time-off", label: "8. Time Off Requests" },
    { id: "pay-cycles", label: "9. Pay Cycles" },
    { id: "create-cycle", label: "10. Create Pay Cycle" },
    { id: "pay-slips", label: "11. Pay Slips" },
    { id: "reports", label: "12. Payroll Reports" },
    { id: "salary-structures", label: "13. Salary Structures" },
    { id: "salary-rules", label: "14. Salary Rules" },
    { id: "users-roles", label: "15. Users & Roles" },
    { id: "settings", label: "16. Settings" },
  ];

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setActiveTab("employee-detail");
  };

  return (
    <div className="adm-shell">
      {/* 1. Sidebar */}
      <aside className={`adm-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="adm-sidebar-brand">
          <div className="adm-logo-text">
            {isSidebarCollapsed ? "P" : "PeoplePay360"}
          </div>
        </div>

        <ul className="adm-sidebar-menu">
          {menuItems.map((item) => {
            const isActive =
              activeTab === item.id ||
              (item.id === "employees" && activeTab === "employee-detail") ||
              (item.id === "pay-cycles" &&
                ["pay-cycles", "create-cycle", "pay-slips", "salary-structures", "salary-rules"].includes(activeTab)) ||
              (item.id === "settings" && ["settings", "users-roles"].includes(activeTab));

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`adm-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                >
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="adm-sidebar-footer">
          <button
            type="button"
            className="adm-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? "→" : "←"}
          </button>
        </div>
      </aside>

      {/* 2. Main Area */}
      <div className="adm-main">
        {/* Topbar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <span className="adm-topbar-appname">PeoplePay360</span>
            <div className="adm-topbar-search-box">
              <span style={{ color: "rgba(255,255,255,0.7)" }}>🔍</span>
              <input
                type="text"
                className="adm-topbar-search-input"
                placeholder="Search employees, payroll, leaves..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="adm-topbar-right">
            {/* Quick Screen Jumper */}
            <div style={{ display: "flex", alignItems: "center", marginRight: "4px" }}>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "5px",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backgroundColor: "rgba(0,0,0,0.22)",
                  color: "#ffffff",
                  fontSize: "0.76rem",
                  cursor: "pointer",
                  outline: "none",
                }}
                title="Jump directly to any of the 16 Admin screens"
              >
                {screenShortcuts.map((s) => (
                  <option key={s.id} value={s.id} style={{ background: "#58374f", color: "#fff" }}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Bell */}
            <button type="button" className="adm-icon-badge-btn" title="Notifications">
              <span>🔔</span>
              <span className="adm-badge-count">12</span>
            </button>

            {/* Quick Messages */}
            <button type="button" className="adm-icon-badge-btn" title="Messages">
              <span>✉️</span>
            </button>

            {/* Admin User Profile Pill */}
            <div style={{ position: "relative" }}>
              <div
                className="adm-user-pill"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="adm-user-avatar">A</div>
                <span className="adm-user-name">Admin</span>
                <span className="adm-user-caret">⌵</span>
              </div>

              {isProfileMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "40px",
                    width: "200px",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    border: "1px solid #e5e7eb",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>
                      {user?.name || "System Administrator"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      {user?.email || "admin@company.com"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      color: "#dc2626",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. Sub-Module Secondary Bar for Payroll & Settings */}
        {["pay-cycles", "create-cycle", "pay-slips", "salary-structures", "salary-rules"].includes(activeTab) && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderBottom: "1px solid var(--adm-border)",
              padding: "0 28px",
              display: "flex",
              gap: "16px",
            }}
          >
            {[
              { id: "pay-cycles", label: "Pay Cycles" },
              { id: "pay-slips", label: "Pay Slips" },
              { id: "salary-structures", label: "Salary Structures" },
              { id: "salary-rules", label: "Salary Rules" },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveTab(sub.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "12px 4px",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: activeTab === sub.id ? "var(--adm-plum-primary)" : "var(--adm-text-muted)",
                  borderBottom: activeTab === sub.id ? "2.5px solid var(--adm-plum-primary)" : "2.5px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {["settings", "users-roles"].includes(activeTab) && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderBottom: "1px solid var(--adm-border)",
              padding: "0 28px",
              display: "flex",
              gap: "16px",
            }}
          >
            {[
              { id: "settings", label: "System Configuration" },
              { id: "users-roles", label: "Users & Roles" },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveTab(sub.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "12px 4px",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: activeTab === sub.id ? "var(--adm-plum-primary)" : "var(--adm-text-muted)",
                  borderBottom: activeTab === sub.id ? "2.5px solid var(--adm-plum-primary)" : "2.5px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* 4. Active View Rendering */}
        <main>
          {activeTab === "dashboard" && (
            <AdminOverviewView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === "employees" && (
            <EmployeesListView onSelectEmployee={handleSelectEmployee} />
          )}

          {activeTab === "employee-detail" && (
            <EmployeeDetailsView
              employee={selectedEmployee}
              onBack={() => setActiveTab("employees")}
            />
          )}

          {activeTab === "departments" && (
            <DepartmentsView />
          )}

          {activeTab === "contracts" && (
            <ContractsView />
          )}

          {activeTab === "working-schedules" && (
            <WorkingSchedulesView />
          )}

          {activeTab === "attendance" && (
            <AttendanceView />
          )}

          {activeTab === "time-off" && (
            <TimeOffRequestsView />
          )}

          {activeTab === "pay-cycles" && (
            <PayCyclesView onCreateNewCycle={() => setActiveTab("create-cycle")} />
          )}

          {activeTab === "create-cycle" && (
            <CreatePayCycleWizard
              onBack={() => setActiveTab("pay-cycles")}
              onComplete={() => setActiveTab("pay-cycles")}
            />
          )}

          {activeTab === "pay-slips" && (
            <PaySlipsView />
          )}

          {activeTab === "reports" && (
            <PayrollReportsView />
          )}

          {activeTab === "salary-structures" && (
            <SalaryStructuresView />
          )}

          {activeTab === "salary-rules" && (
            <SalaryRulesView />
          )}

          {activeTab === "users-roles" && (
            <UsersAndRolesView />
          )}

          {activeTab === "settings" && (
            <SettingsView />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
