import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./PayrollManagerPortal.css";

// View components matching the 16 screens in the reference image
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

const PayrollManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active navigation / sub-view state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedPaySlip, setSelectedPaySlip] = useState(null);

  // Handle logout
  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  // Nav menu items matching sidebar from image
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "pay-cycles", label: "Pay Cycles", icon: "🔄" },
    { id: "pay-slips", label: "Pay Slips", icon: "📄" },
    { id: "reports", label: "Reports", icon: "📈" },
    { id: "salary-structures", label: "Salary Structures", icon: "📐" },
    { id: "salary-rules", label: "Salary Rules", icon: "⚖️" },
    { id: "employees", label: "Employees", icon: "👥" },
    { id: "attendance", label: "Attendance", icon: "📅" },
  ];

  // Screen shortcuts for directly previewing all 16 screens from composite image
  const screenShortcuts = [
    { id: "dashboard", label: "1. Dashboard" },
    { id: "pay-cycles", label: "2. Pay Cycles" },
    { id: "create-cycle", label: "4-5. Create Pay Cycle" },
    { id: "process-payroll", label: "6. Process Payroll" },
    { id: "verify-payroll", label: "7. Verify Payroll" },
    { id: "processing", label: "8. Processing" },
    { id: "completed", label: "9. Completed" },
    { id: "pay-slips", label: "10. Pay Slips" },
    { id: "payslip-detail", label: "11. Payslip Detail" },
    { id: "salary-structures", label: "13. Structures" },
    { id: "salary-rules", label: "14. Rules" },
    { id: "employees", label: "15. Employees" },
    { id: "attendance", label: "16. Attendance" },
    { id: "reports", label: "18. Reports" },
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

        <ul className="mgr-sidebar-menu">
          {menuItems.map((item) => {
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
                  <span className="mgr-nav-icon">{item.icon}</span>
                  <span className="mgr-nav-text">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

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
            <span className="mgr-topbar-appname">PeoplePay360</span>
            <div className="mgr-topbar-search-box">
              <span style={{ color: "rgba(255,255,255,0.7)" }}>🔍</span>
              <input
                type="text"
                className="mgr-topbar-search-input"
                placeholder="Search employees, pay cycles, reports..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="mgr-topbar-right">
            {/* Quick Screen Jumper */}
            <div style={{ display: "flex", alignItems: "center", marginRight: "6px" }}>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "5px",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backgroundColor: "rgba(0,0,0,0.2)",
                  color: "#ffffff",
                  fontSize: "0.76rem",
                  cursor: "pointer",
                  outline: "none",
                }}
                title="Jump to any of the 16 screens directly"
              >
                {screenShortcuts.map((s) => (
                  <option key={s.id} value={s.id} style={{ background: "#58374f", color: "#fff" }}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile Pill */}
            <div style={{ position: "relative" }}>
              <div
                className="mgr-user-pill"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="mgr-user-avatar">HM</div>
                <span className="mgr-user-name">HR Payroll Manager</span>
                <span className="mgr-user-caret">⌵</span>
              </div>

              {/* Profile Dropdown */}
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
                      {user?.name || "HR Payroll Manager"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
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
              onSelectCycle={() => setActiveTab("process-payroll")}
            />
          )}

          {activeTab === "create-cycle" && (
            <CreatePayCycleWizardView
              onBack={() => setActiveTab("pay-cycles")}
              onComplete={() => setActiveTab("process-payroll")}
            />
          )}

          {activeTab === "process-payroll" && (
            <ProcessPayrollListView
              onProceedToVerify={() => setActiveTab("verify-payroll")}
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

          {activeTab === "attendance" && (
            <AttendancePayrollView />
          )}
        </main>
      </div>
    </div>
  );
};

export default PayrollManagerDashboard;
