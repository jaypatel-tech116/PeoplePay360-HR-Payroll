import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./PayrollManagerPortal.css";

// View components matching the HR Payroll Manager interface
import ManagerDashboardView from "./views/ManagerDashboardView";
import PayCyclesListView from "./views/PayCyclesListView";
import CreatePayCycleWizardView from "./views/CreatePayCycleWizardView";
import ProcessPayrollListView from "./views/ProcessPayrollListView";
import VerifyPayrollView from "./views/VerifyPayrollView";
import PayrollProcessingView from "./views/PayrollProcessingView";
import ProcessCompletedView from "./views/ProcessCompletedView";
import ManagerPaySlipsView from "./views/ManagerPaySlipsView";
import ManagerPaySlipDetailView from "./views/ManagerPaySlipDetailView";
import ManagerReportsView from "./views/ManagerReportsView";
import SalaryStructuresView from "./views/SalaryStructuresView";
import SalaryRulesView from "./views/SalaryRulesView";
import EmployeesKanbanView from "./views/EmployeesKanbanView";
import AttendancePayrollView from "./views/AttendancePayrollView";
import ContractsPayrollView from "./views/ContractsPayrollView";
import TimeOffPayrollView from "./views/TimeOffPayrollView";

const PayrollManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active navigation / sub-view state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedPaySlip, setSelectedPaySlip] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(null);

  // Handle logout
  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  // Structured Menu with Group Headers (MAIN, PAYROLL, CONFIGURATION, HR DATA)
  const menuSections = [
    {
      title: "MAIN",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "📊" },
      ],
    },
    {
      title: "PAYROLL",
      items: [
        { id: "pay-cycles", label: "Payruns", icon: "🔄" },
        { id: "pay-slips", label: "Payslips", icon: "📄" },
        { id: "reports", label: "Reports", icon: "📈" },
      ],
    },
    {
      title: "CONFIGURATION",
      items: [
        { id: "salary-structures", label: "Salary Structures", icon: "📐" },
        { id: "salary-rules", label: "Salary Rules", icon: "⚖️" },
      ],
    },
    {
      title: "HR DATA",
      items: [
        { id: "employees", label: "Employees", icon: "👥" },
        { id: "contracts", label: "Contracts", icon: "💼" },
        { id: "attendance", label: "Attendance", icon: "📅" },
        { id: "time-off", label: "Time Off", icon: "🌴" },
      ],
    },
  ];

  // Screen shortcuts for directly previewing all screens
  const screenShortcuts = [
    { id: "dashboard", label: "1. Dashboard" },
    { id: "pay-cycles", label: "2. Payruns" },
    { id: "create-cycle", label: "3. Create Payrun" },
    { id: "process-payroll", label: "4. Process Payrun" },
    { id: "verify-payroll", label: "5. Verify Payrun" },
    { id: "processing", label: "6. Processing" },
    { id: "completed", label: "7. Completed" },
    { id: "pay-slips", label: "8. Payslips" },
    { id: "payslip-detail", label: "9. Payslip Detail" },
    { id: "salary-structures", label: "10. Structures" },
    { id: "salary-rules", label: "11. Rules" },
    { id: "employees", label: "12. Employees" },
    { id: "contracts", label: "13. Contracts" },
    { id: "attendance", label: "14. Attendance" },
    { id: "time-off", label: "15. Time Off" },
    { id: "reports", label: "16. Reports" },
  ];

  // Helper to select a payslip and navigate to detail view
  const handleSelectPaySlip = (slip) => {
    setSelectedPaySlip(slip);
    setActiveTab("payslip-detail");
  };

  return (
    <div className="mgr-shell">
      {/* Sidebar matching Odoo Plum #714B67 design */}
      <aside className={`mgr-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="mgr-sidebar-brand">
          <div className="mgr-logo-text">
            {isSidebarCollapsed ? "P" : "PeoplePay360"}
          </div>
        </div>

        <div className="mgr-sidebar-menu-wrapper">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="mgr-sidebar-section">
              {!isSidebarCollapsed && (
                <div className="mgr-sidebar-section-title">{section.title}</div>
              )}
              <ul className="mgr-sidebar-menu">
                {section.items.map((item) => {
                  const isActive =
                    activeTab === item.id ||
                    (item.id === "pay-cycles" &&
                      ["pay-cycles", "create-cycle", "process-payroll", "verify-payroll", "processing", "completed"].includes(activeTab)) ||
                    (item.id === "pay-slips" && ["pay-slips", "payslip-detail"].includes(activeTab));

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`mgr-nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setActiveTab(item.id)}
                        title={item.label}
                      >
                        <span className="mgr-nav-icon-glyph">{item.icon}</span>
                        <span className="mgr-nav-text">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mgr-sidebar-footer">
          <button
            type="button"
            className="mgr-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? "→" : "←"}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="mgr-main">
        {/* Top Header Bar */}
        <header className="mgr-topbar">
          <div className="mgr-topbar-left">
            <span className="mgr-topbar-appname" style={{ fontSize: "0.95rem", fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>
              Payroll Administration
            </span>
            <div className="mgr-topbar-search-box">
              <span style={{ color: "rgba(255,255,255,0.7)" }}>🔍</span>
              <input
                type="text"
                className="mgr-topbar-search-input"
                placeholder="Search employees, payruns, reports..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="mgr-topbar-right">
            {/* Quick Screen Jumper */}
            <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backgroundColor: "rgba(0,0,0,0.25)",
                  color: "#ffffff",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  outline: "none",
                }}
                title="Jump to any screen directly"
              >
                {screenShortcuts.map((s) => (
                  <option key={s.id} value={s.id} style={{ background: "#58374f", color: "#fff" }}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications & Settings Icons */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "10px" }}>
              <button
                type="button"
                className="mgr-topbar-icon-btn"
                title="Notifications"
                onClick={() => alert("No new notifications at this time.")}
              >
                🔔
              </button>
              <button
                type="button"
                className="mgr-topbar-icon-btn"
                title="Settings"
                onClick={() => alert("Payroll Settings & Configuration")}
              >
                ⚙️
              </button>
            </div>

            {/* User Profile Pill */}
            <div style={{ position: "relative" }}>
              <div
                className="mgr-user-pill"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="mgr-user-avatar">HM</div>
                <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.15 }}>
                  <span className="mgr-user-name" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                    HR Payroll Manager
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.75)" }}>
                    Payroll Administration
                  </span>
                </div>
                <span className="mgr-user-caret">⌵</span>
              </div>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "46px",
                    width: "220px",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    border: "1px solid #e5e7eb",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "#111827" }}>
                      HR Payroll Manager
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--mgr-plum-primary)", fontWeight: 600, marginTop: "1px" }}>
                      Payroll Administration
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "2px" }}>
                      {user?.email || "payroll.mgr@peoplepay360.com"}
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

        {/* View Content Renderer */}
        <main>
          {activeTab === "dashboard" && (
            <ManagerDashboardView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === "pay-cycles" && (
            <PayCyclesListView
              onOpenCreateWizard={() => setActiveTab("create-cycle")}
              onSelectCycle={(cycle) => {
                setSelectedCycle(cycle);
                setActiveTab("process-payroll");
              }}
            />
          )}

          {activeTab === "create-cycle" && (
            <CreatePayCycleWizardView
              onBack={() => setActiveTab("pay-cycles")}
              onComplete={(createdRun) => {
                if (createdRun) setSelectedCycle(createdRun);
                setActiveTab("process-payroll");
              }}
            />
          )}

          {activeTab === "process-payroll" && (
            <ProcessPayrollListView
              cycle={selectedCycle}
              onBack={() => setActiveTab("pay-cycles")}
              onProceedToVerify={() => setActiveTab("verify-payroll")}
              onSelectPayslip={handleSelectPaySlip}
            />
          )}

          {activeTab === "verify-payroll" && (
            <VerifyPayrollView
              onBack={() => setActiveTab("process-payroll")}
              onProcessPayroll={() => setActiveTab("processing")}
            />
          )}

          {activeTab === "processing" && (
            <PayrollProcessingView
              onFinish={() => setActiveTab("completed")}
            />
          )}

          {activeTab === "completed" && (
            <ProcessCompletedView
              onViewPaySlips={() => setActiveTab("pay-slips")}
              onBackToDashboard={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "pay-slips" && (
            <ManagerPaySlipsView
              onSelectPaySlip={handleSelectPaySlip}
            />
          )}

          {activeTab === "payslip-detail" && (
            <ManagerPaySlipDetailView
              slip={selectedPaySlip}
              onBack={() => setActiveTab("pay-slips")}
            />
          )}

          {activeTab === "reports" && (
            <ManagerReportsView />
          )}

          {activeTab === "salary-structures" && (
            <SalaryStructuresView />
          )}

          {activeTab === "salary-rules" && (
            <SalaryRulesView />
          )}

          {activeTab === "employees" && (
            <EmployeesKanbanView />
          )}

          {activeTab === "contracts" && (
            <ContractsPayrollView />
          )}

          {activeTab === "attendance" && (
            <AttendancePayrollView />
          )}

          {activeTab === "time-off" && (
            <TimeOffPayrollView />
          )}
        </main>
      </div>
    </div>
  );
};

export default PayrollManagerDashboard;
