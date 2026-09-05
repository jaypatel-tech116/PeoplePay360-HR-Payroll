import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PayrollDashboardView from "./views/PayrollDashboardView";
import EmployeesPayrollView from "./views/EmployeesPayrollView";
import EmployeeDetailsView from "./views/EmployeeDetailsView";
import PayCyclesView from "./views/PayCyclesView";
import ProcessPayrollView from "./views/ProcessPayrollView";
import PaySlipsListView from "./views/PaySlipsListView";
import PaySlipDocumentView from "./views/PaySlipDocumentView";
import PayrollReportsView from "./views/PayrollReportsView";
import PayrollSettingsView from "./views/PayrollSettingsView";
import AddEmployeePayrollModal from "./modals/AddEmployeePayrollModal";
import CreatePayCycleModal from "./modals/CreatePayCycleModal";
import AddComponentModal from "./modals/AddComponentModal";
import "./PayrollPortal.css";

const INITIAL_EMPLOYEES_PAYROLL = [
  { code: "EMP001", name: "Rahul Sharma", department: "Engineering", jobTitle: "Software Developer", employeeType: "Full Time", payrollStatus: "Active", joinedDate: "01 Sep 2023" },
  { code: "EMP002", name: "Priya Mehta", department: "HR", jobTitle: "HR Manager", employeeType: "Full Time", payrollStatus: "Active", joinedDate: "15 Jun 2022" },
  { code: "EMP003", name: "Vikram Rao", department: "Sales", jobTitle: "Sales Executive", employeeType: "Full Time", payrollStatus: "Active", joinedDate: "10 Jan 2023" },
  { code: "EMP004", name: "Sneha Iyer", department: "Product", jobTitle: "UI/UX Designer", employeeType: "Full Time", payrollStatus: "Active", joinedDate: "01 Mar 2024" },
  { code: "EMP005", name: "Aditya Gupta", department: "Engineering", jobTitle: "DevOps Engineer", employeeType: "Full Time", payrollStatus: "Active", joinedDate: "20 Feb 2024" },
  { code: "EMP006", name: "Neha Patel", department: "HR", jobTitle: "HR Executive", employeeType: "Full Time", payrollStatus: "Active", joinedDate: "15 Sep 2025" },
  { code: "EMP007", name: "Rohan Desai", department: "Marketing", jobTitle: "Marketing Specialist", employeeType: "Full Time", payrollStatus: "Inactive", joinedDate: "01 Oct 2024" },
  { code: "EMP008", name: "Meera Nair", department: "Finance", jobTitle: "Accountant", employeeType: "Full Time", payrollStatus: "Active", joinedDate: "08 Sep 2024" },
];

const PayrollUserDashboard = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active view tab state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Data states
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES_PAYROLL);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPaySlip, setSelectedPaySlip] = useState(null);

  // Modals state
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isCreateCycleOpen, setIsCreateCycleOpen] = useState(false);
  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);

  // Read tab from query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (
      tabParam &&
      [
        "dashboard",
        "employees",
        "employee-details",
        "pay-cycles",
        "process-payroll",
        "payslips",
        "payslip-detail",
        "reports",
        "settings",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/payroll-user?tab=${tab}`, { replace: true });
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    handleTabChange("employee-details");
  };

  const handleSelectPaySlip = (slip) => {
    setSelectedPaySlip(slip);
    handleTabChange("payslip-detail");
  };

  const handleAddEmployee = (newEmp) => {
    setEmployees((prev) => [newEmp, ...prev]);
    alert(`Employee ${newEmp.name} (${newEmp.code}) added to payroll system!`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="pay-shell">
      {/* 1. Left Sidebar */}
      <aside className={`pay-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="pay-sidebar-brand">
          <span className="pay-logo-text">odoo</span>
        </div>

        <ul className="pay-sidebar-menu">
          <li>
            <button
              type="button"
              className={`pay-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => handleTabChange("dashboard")}
              title="Dashboard"
            >
              <span className="pay-nav-icon">📊</span>
              <span className="pay-nav-text">Dashboard</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`pay-nav-item ${
                activeTab === "employees" || activeTab === "employee-details"
                  ? "active"
                  : ""
              }`}
              onClick={() => handleTabChange("employees")}
              title="Employees"
            >
              <span className="pay-nav-icon">👥</span>
              <span className="pay-nav-text">Employees</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className="pay-nav-item"
              onClick={() => navigate("/hr-manager?tab=leaves")}
              title="Leaves"
            >
              <span className="pay-nav-icon">🌴</span>
              <span className="pay-nav-text">Leaves</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className="pay-nav-item"
              onClick={() => navigate("/hr-manager?tab=attendance")}
              title="Attendance"
            >
              <span className="pay-nav-icon">⏱️</span>
              <span className="pay-nav-text">Attendance</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`pay-nav-item ${
                [
                  "dashboard",
                  "pay-cycles",
                  "process-payroll",
                  "payslips",
                  "payslip-detail",
                  "settings",
                ].includes(activeTab)
                  ? "active"
                  : ""
              }`}
              onClick={() => handleTabChange("dashboard")}
              title="Payroll"
            >
              <span className="pay-nav-icon">💰</span>
              <span className="pay-nav-text">Payroll</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`pay-nav-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => handleTabChange("reports")}
              title="Reports"
            >
              <span className="pay-nav-icon">📈</span>
              <span className="pay-nav-text">Reports</span>
            </button>
          </li>
        </ul>

        <div className="pay-sidebar-footer">
          <button
            type="button"
            className="pay-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? "›" : "‹"}
          </button>
        </div>
      </aside>

      {/* 2. Main Content */}
      <div className="pay-main">
        {/* Topbar */}
        <header className="pay-topbar">
          <div className="pay-topbar-left">
            <span className="pay-topbar-appname">PeoplePay360</span>

            {/* Sub-nav quick switcher for the 9 screens */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "14px" }}>
              <button
                type="button"
                className={`pay-subtab-btn ${activeTab === "dashboard" ? "active" : ""}`}
                style={{ padding: "4px 10px", fontSize: "0.74rem" }}
                onClick={() => handleTabChange("dashboard")}
              >
                Overview
              </button>
              <button
                type="button"
                className={`pay-subtab-btn ${activeTab === "pay-cycles" ? "active" : ""}`}
                style={{ padding: "4px 10px", fontSize: "0.74rem" }}
                onClick={() => handleTabChange("pay-cycles")}
              >
                Pay Cycles
              </button>
              <button
                type="button"
                className={`pay-subtab-btn ${activeTab === "process-payroll" ? "active" : ""}`}
                style={{ padding: "4px 10px", fontSize: "0.74rem" }}
                onClick={() => handleTabChange("process-payroll")}
              >
                Process Wizard
              </button>
              <button
                type="button"
                className={`pay-subtab-btn ${
                  activeTab === "payslips" || activeTab === "payslip-detail"
                    ? "active"
                    : ""
                }`}
                style={{ padding: "4px 10px", fontSize: "0.74rem" }}
                onClick={() => handleTabChange("payslips")}
              >
                Pay Slips
              </button>
              <button
                type="button"
                className={`pay-subtab-btn ${activeTab === "settings" ? "active" : ""}`}
                style={{ padding: "4px 10px", fontSize: "0.74rem" }}
                onClick={() => handleTabChange("settings")}
              >
                Settings
              </button>
            </div>
          </div>

          <div className="pay-topbar-right">
            <div style={{ position: "relative" }}>
              <div
                className="pay-user-pill"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="pay-user-avatar">HM</div>
                <span className="pay-user-name">HR Manager</span>
                <span className="pay-user-caret">⌵</span>
              </div>

              {isProfileMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "44px",
                    right: 0,
                    width: "200px",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e2e8f0",
                    padding: "8px 0",
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: "8px 16px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>
                      HR Payroll User
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                      payroll@peoplepay360.com
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 16px",
                      background: "none",
                      border: "none",
                      fontSize: "0.82rem",
                      color: "#ef4444",
                      cursor: "pointer",
                    }}
                    onClick={handleLogout}
                  >
                    ↪ Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. Screen Views Dispatcher */}
        {activeTab === "dashboard" && (
          <PayrollDashboardView
            onNavigateTab={handleTabChange}
            onSelectEmployee={handleSelectEmployee}
          />
        )}

        {activeTab === "employees" && (
          <EmployeesPayrollView
            employees={employees}
            onOpenAddModal={() => setIsAddEmployeeOpen(true)}
            onSelectEmployee={handleSelectEmployee}
          />
        )}

        {activeTab === "employee-details" && (
          <EmployeeDetailsView
            employee={selectedEmployee}
            onBack={() => handleTabChange("employees")}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === "pay-cycles" && (
          <PayCyclesView
            onOpenCreateModal={() => setIsCreateCycleOpen(true)}
            onSelectCycle={() => handleTabChange("process-payroll")}
          />
        )}

        {activeTab === "process-payroll" && (
          <ProcessPayrollView
            onBack={() => handleTabChange("pay-cycles")}
            onComplete={() => handleTabChange("pay-cycles")}
          />
        )}

        {activeTab === "payslips" && (
          <PaySlipsListView
            onSelectPaySlip={handleSelectPaySlip}
          />
        )}

        {activeTab === "payslip-detail" && (
          <PaySlipDocumentView
            slip={selectedPaySlip}
            onBack={() => handleTabChange("payslips")}
          />
        )}

        {activeTab === "reports" && <PayrollReportsView />}

        {activeTab === "settings" && (
          <PayrollSettingsView
            onOpenAddComponent={() => setIsAddComponentOpen(true)}
          />
        )}
      </div>

      {/* 4. Modals */}
      <AddEmployeePayrollModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        onAdd={handleAddEmployee}
      />

      <CreatePayCycleModal
        isOpen={isCreateCycleOpen}
        onClose={() => setIsCreateCycleOpen(false)}
        onCreate={(c) => {
          alert(`Pay cycle for ${c.month} ${c.year} created!`);
          handleTabChange("process-payroll");
        }}
      />

      <AddComponentModal
        isOpen={isAddComponentOpen}
        onClose={() => setIsAddComponentOpen(false)}
        onAdd={(comp) => {
          alert(`Component "${comp.name}" added successfully!`);
        }}
      />
    </div>
  );
};

export default PayrollUserDashboard;
