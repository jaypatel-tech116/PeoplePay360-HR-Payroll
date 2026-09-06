import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiClock,
  FiCalendar,
  FiSun,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
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
    { id: "dashboard", label: "Dashboard", icon: <FiGrid className="adm-nav-react-icon" /> },
    { id: "users-roles", label: "Stakeholders & Users", icon: <FiUsers className="adm-nav-react-icon" /> },
    { id: "employees", label: "Employees", icon: <FiUsers className="adm-nav-react-icon" /> },
    { id: "departments", label: "Departments", icon: <FiBriefcase className="adm-nav-react-icon" /> },
    { id: "contracts", label: "Contracts", icon: <FiFileText className="adm-nav-react-icon" /> },
    { id: "working-schedules", label: "Working Schedules", icon: <FiClock className="adm-nav-react-icon" /> },
    { id: "attendance", label: "Attendance", icon: <FiCalendar className="adm-nav-react-icon" /> },
    { id: "time-off", label: "Time Off", icon: <FiSun className="adm-nav-react-icon" /> },
    { id: "pay-cycles", label: "Payroll", icon: <FiDollarSign className="adm-nav-react-icon" /> },
    { id: "reports", label: "Reports", icon: <FiBarChart2 className="adm-nav-react-icon" /> },
    { id: "settings", label: "Settings", icon: <FiSettings className="adm-nav-react-icon" /> },
  ];

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setActiveTab("employee-detail");
  };

  return (
    <div className="adm-shell">
      {/* 1. Sidebar */}
      <aside className={`adm-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div
          className="adm-sidebar-brand"
          style={{
            justifyContent: "center",
            padding: "8px 10px"
          }}
        >
          {isSidebarCollapsed ? (
            <img
              src="/Logo.png"
              alt="PeoplePay360"
              style={{ height: "38px", width: "auto", maxWidth: "48px", objectFit: "contain" }}
            />
          ) : (
            <img
              src="/Logo.png"
              alt="PeoplePay360"
              style={{ height: "60px", width: "auto", maxWidth: "90%", objectFit: "contain" }}
            />
          )}
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
                  style={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <span className="adm-nav-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span className="adm-nav-text" style={{ marginLeft: "12px" }}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div
          className="adm-sidebar-footer"
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: isSidebarCollapsed ? "column" : "row",
            justifyContent: isSidebarCollapsed ? "center" : "space-between",
            gap: "8px",
            padding: isSidebarCollapsed ? "12px 6px" : "10px 12px"
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 0, width: isSidebarCollapsed ? "auto" : "100%" }}>
            <div
              className="adm-user-pill"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              style={{ width: "100%", boxSizing: "border-box" }}
              title="Admin"
            >
              <div className="adm-user-avatar">A</div>
              {!isSidebarCollapsed && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.15, flex: 1, minWidth: 0 }}>
                    <span className="adm-user-name" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                      Admin
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.75)" }}>
                      Administrator
                    </span>
                  </div>
                  <FiChevronDown className="adm-user-caret" />
                </>
              )}
            </div>

            {isProfileMenuOpen && (
              <div
                style={{
                  position: "fixed",
                  bottom: isSidebarCollapsed ? "16px" : "60px",
                  left: isSidebarCollapsed ? "78px" : "12px",
                  width: "200px",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                  border: "1px solid #e5e7eb",
                  zIndex: 9999,
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
                  <FiLogOut /> Sign Out
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="adm-collapse-toggle-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#ffffff",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0
            }}
          >
            {isSidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>
      </aside>

      {/* 2. Main Area without horizontal topbar */}
      <div className="adm-main">

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
