import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiGrid,
  FiRotateCw,
  FiFileText,
  FiBarChart2,
  FiSliders,
  FiCheckSquare,
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiSun,
  FiLogOut,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import "../payroll-manager/PayrollManagerPortal.css";

// View components matching the unified PeoplePay360 payroll interface
import ManagerDashboardView from "../payroll-manager/views/ManagerDashboardView";
import PayCyclesListView from "../payroll-manager/views/PayCyclesListView";
import CreatePayCycleWizardView from "../payroll-manager/views/CreatePayCycleWizardView";
import ProcessPayrollListView from "../payroll-manager/views/ProcessPayrollListView";
import VerifyPayrollView from "../payroll-manager/views/VerifyPayrollView";
import PayrollProcessingView from "../payroll-manager/views/PayrollProcessingView";
import ProcessCompletedView from "../payroll-manager/views/ProcessCompletedView";
import ManagerPaySlipsView from "../payroll-manager/views/ManagerPaySlipsView";
import ManagerPaySlipDetailView from "../payroll-manager/views/ManagerPaySlipDetailView";
import ManagerReportsView from "../payroll-manager/views/ManagerReportsView";
import SalaryStructuresView from "../payroll-manager/views/SalaryStructuresView";
import SalaryRulesView from "../payroll-manager/views/SalaryRulesView";
import EmployeesKanbanView from "../payroll-manager/views/EmployeesKanbanView";
import AttendancePayrollView from "../payroll-manager/views/AttendancePayrollView";
import ContractsPayrollView from "../payroll-manager/views/ContractsPayrollView";
import TimeOffPayrollView from "../payroll-manager/views/TimeOffPayrollView";

const PayrollUserDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active navigation / sub-view state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedPaySlip, setSelectedPaySlip] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(null);

  // Read URL query parameter for tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Handle logout
  const handleLogout = async () => {
    if (logout) await logout();
    navigate("/login");
  };

  // Structured Menu with Group Headers (MAIN, PAYROLL, CONFIGURATION, HR DATA)
  const menuSections = [
    {
      title: "MAIN",
      items: [
        { id: "dashboard", label: "Dashboard", icon: <FiGrid className="mgr-nav-react-icon" /> },
      ],
    },
    {
      title: "PAYROLL",
      items: [
        { id: "pay-cycles", label: "Payruns", icon: <FiRotateCw className="mgr-nav-react-icon" /> },
        { id: "pay-slips", label: "Payslips", icon: <FiFileText className="mgr-nav-react-icon" /> },
        { id: "reports", label: "Reports", icon: <FiBarChart2 className="mgr-nav-react-icon" /> },
      ],
    },
    {
      title: "CONFIGURATION",
      items: [
        { id: "salary-structures", label: "Salary Structures", icon: <FiSliders className="mgr-nav-react-icon" /> },
        { id: "salary-rules", label: "Salary Rules", icon: <FiCheckSquare className="mgr-nav-react-icon" /> },
      ],
    },
    {
      title: "HR DATA",
      items: [
        { id: "employees", label: "Employees", icon: <FiUsers className="mgr-nav-react-icon" /> },
        { id: "contracts", label: "Contracts", icon: <FiBriefcase className="mgr-nav-react-icon" /> },
        { id: "attendance", label: "Attendance", icon: <FiCalendar className="mgr-nav-react-icon" /> },
        { id: "time-off", label: "Time Off", icon: <FiSun className="mgr-nav-react-icon" /> },
      ],
    },
  ];

  // Helper to select a payslip and navigate to detail view
  const handleSelectPaySlip = (slip) => {
    setSelectedPaySlip(slip);
    setActiveTab("payslip-detail");
  };

  const displayName = user?.full_name || user?.name || "HR Payroll User";
  const displayRole = user?.role_name || "HR Payroll User";
  const displayEmail = user?.email || "payuser@peoplepay360.com";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "HU";

  return (
    <div className="mgr-shell">
      {/* Sidebar matching Odoo Plum #714B67 design */}
      <aside className={`mgr-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div
          className="mgr-sidebar-brand"
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

        <div className="mgr-sidebar-menu-wrapper">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="mgr-sidebar-section">
              {!isSidebarCollapsed && <div className="mgr-sidebar-section-title">{section.title}</div>}
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
                        <span className="mgr-nav-icon-glyph" style={{ display: "inline-flex", alignItems: "center" }}>{item.icon}</span>
                        <span className="mgr-nav-text">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mgr-sidebar-footer"
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
              className="mgr-user-pill"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              style={{ width: "100%", boxSizing: "border-box" }}
              title={displayName}
            >
              <div className="mgr-user-avatar">{userInitials}</div>
              {!isSidebarCollapsed && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.15, flex: 1, minWidth: 0 }}>
                    <span className="mgr-user-name" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                      {displayName}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.75)" }}>
                      {displayRole}
                    </span>
                  </div>
                  <FiChevronDown className="mgr-user-caret" />
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: isSidebarCollapsed ? "10px" : 0,
                  width: "190px",
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
                    {displayName}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--mgr-plum-primary)", fontWeight: 600, marginTop: "1px" }}>
                    {displayRole}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "2px" }}>
                    {displayEmail}
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
            className="mgr-collapse-toggle-btn"
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

      {/* Main Container without horizontal topbar */}
      <div className="mgr-main">

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

          {/* Configuration Views rendered in READ-ONLY mode for HR Payroll User */}
          {activeTab === "salary-structures" && (
            <SalaryStructuresView readOnly={true} />
          )}

          {activeTab === "salary-rules" && (
            <SalaryRulesView readOnly={true} />
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

export default PayrollUserDashboard;
