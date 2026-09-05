import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import hrApi from "../../api/hr.api";
import EmployeesView from "./views/EmployeesView";
import LeavesView from "./views/LeavesView";
import AttendanceView from "./views/AttendanceView";
import ReportsView from "./views/ReportsView";
import RequestLeaveModal from "./modals/RequestLeaveModal";
import NewEmployeeModal from "./modals/NewEmployeeModal";
import ViewEmployeeModal from "./modals/ViewEmployeeModal";
import ViewLeaveModal from "./modals/ViewLeaveModal";
import "./HrPortal.css";

const HrManagerDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState("employees");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Real Database States
  const [dashboardStats, setDashboardStats] = useState({
    total_employees: 0,
    active_employees: 0,
    onboarding: 0,
    on_leave: 0,
  });
  const [pipelineData, setPipelineData] = useState({
    new_joiners: [],
    active: [],
    on_leave: [],
    exiting: [],
  });
  const [employees, setEmployees] = useState([]);
  const [leavePipeline, setLeavePipeline] = useState({
    draft: [],
    toApprove: [],
    approved: [],
    rejected: [],
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({
    total_requests: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  // Modal states
  const [isRequestLeaveOpen, setIsRequestLeaveOpen] = useState(false);
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState("New Joiners");
  const [selectedEmployeeView, setSelectedEmployeeView] = useState(null);
  const [selectedLeaveView, setSelectedLeaveView] = useState(null);

  // Sync tab with URL parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["employees", "leaves", "attendance", "reports"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".hr-sidebar-user-container")) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  // Fetch all live data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, pipelineRes, empRes, leaveSumRes, leaveReqRes] = await Promise.allSettled([
        hrApi.getDashboardStats(),
        hrApi.getEmployeePipeline(),
        hrApi.getEmployees({ limit: 100 }),
        hrApi.getLeaveSummary(),
        hrApi.getLeaveRequests(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setDashboardStats(statsRes.value);
      }
      if (pipelineRes.status === "fulfilled" && pipelineRes.value) {
        setPipelineData(pipelineRes.value);
      }
      if (empRes.status === "fulfilled" && empRes.value) {
        const empList = empRes.value?.employees || (Array.isArray(empRes.value) ? empRes.value : []);
        setEmployees(empList);
      }
      if (leaveSumRes.status === "fulfilled" && leaveSumRes.value) {
        setLeaveSummary(leaveSumRes.value);
      }
      if (leaveReqRes.status === "fulfilled" && leaveReqRes.value) {
        const val = leaveReqRes.value;
        const list = val?.list || (Array.isArray(val) ? val : []);
        setLeaveRequests(list);
        if (val?.kanban) {
          setLeavePipeline(val.kanban);
        }
      }
    } catch (err) {
      console.error("Failed to load HR manager data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/hr-manager?tab=${tab}`, { replace: true });
  };

  // Onboard new employee callback
  const handleAddNewEmployee = async (newEmp) => {
    await fetchAllData();
    alert(`Employee "${newEmp?.name || newEmp?.full_name || 'New Employee'}" onboarded successfully!`);
  };

  // Move stage callback
  const handleMoveStage = async (empId, newStage) => {
    try {
      await hrApi.updateEmployeePipelineStage(empId, newStage);
      await fetchAllData();
    } catch (err) {
      alert("Failed to move employee stage: " + (err.response?.data?.message || err.message));
    }
  };

  // Open add employee with preselected column
  const handleOpenAddEmployeeForColumn = (columnName) => {
    setTargetColumn(columnName);
    setIsNewEmployeeOpen(true);
  };

  // Submit Leave Request handler
  const handleCreateLeaveRequest = async (newLeave) => {
    try {
      const empId = user?.employee_id || (employees[0]?.id || 1);
      const leaveTypeMap = {
        "Annual Leave": 1,
        "Paid Time Off": 1,
        "Sick Leave": 2,
        "Casual Leave": 3,
        "Personal Leave": 1,
        "Maternity Leave": 4,
      };
      const leave_type_id = leaveTypeMap[newLeave.leaveType] || 1;

      await hrApi.createLeaveRequest({
        employee_id: empId,
        leave_type_id,
        start_date: newLeave.fromDate,
        end_date: newLeave.toDate,
        reason: newLeave.reason,
        status: "Pending",
      });

      alert(`Leave request for ${newLeave.duration} submitted successfully!`);
      await fetchAllData();
    } catch (err) {
      alert("Failed to submit leave request: " + (err.response?.data?.message || err.message));
    }
  };

  // Approve leave
  const handleApproveLeave = async (leave) => {
    try {
      await hrApi.approveLeaveRequest(leave.id);
      alert(`Leave request #${leave.id} Approved successfully!`);
      await fetchAllData();
    } catch (err) {
      alert("Failed to approve leave: " + (err.response?.data?.message || err.message));
    }
  };

  // Reject leave
  const handleRejectLeave = async (leave) => {
    try {
      const reason = prompt("Enter reason for rejection:", "Operational requirement");
      if (!reason) return;
      await hrApi.rejectLeaveRequest(leave.id, reason);
      alert(`Leave request #${leave.id} Rejected.`);
      await fetchAllData();
    } catch (err) {
      alert("Failed to reject leave: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "HM";

  return (
    <div className="hr-shell">
      {/* 1. Left Odoo Plum Sidebar */}
      <aside className={`hr-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="hr-sidebar-brand">
          <span className="hr-logo-text">odoo</span>
        </div>

        <ul className="hr-sidebar-menu">
          <li>
            <button
              type="button"
              className={`hr-nav-item ${activeTab === "employees" ? "active" : ""}`}
              onClick={() => handleTabChange("employees")}
              title="Employees"
            >
              <span className="hr-nav-icon">👥</span>
              <span className="hr-nav-text">Employees</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`hr-nav-item ${activeTab === "leaves" ? "active" : ""}`}
              onClick={() => handleTabChange("leaves")}
              title="Leaves"
            >
              <span className="hr-nav-icon">🌴</span>
              <span className="hr-nav-text">Leaves</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`hr-nav-item ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => handleTabChange("attendance")}
              title="Attendance"
            >
              <span className="hr-nav-icon">⏱️</span>
              <span className="hr-nav-text">Attendance</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`hr-nav-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => handleTabChange("reports")}
              title="Reports"
            >
              <span className="hr-nav-icon">📈</span>
              <span className="hr-nav-text">Reports</span>
            </button>
          </li>
        </ul>

        <div className="hr-sidebar-footer">
          <div className="hr-sidebar-user-container">
            <div
              className="hr-user-pill hr-sidebar-user-pill"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              title={user?.name || "HR Manager"}
            >
              <div className="hr-user-avatar">{userInitials}</div>
              {!isSidebarCollapsed && (
                <>
                  <span className="hr-user-name">{user?.name || "HR Manager"}</span>
                  <span className="hr-user-caret">⌵</span>
                </>
              )}
            </div>

            {isProfileMenuOpen && (
              <div className="hr-sidebar-profile-dropdown">
                <div className="hr-profile-dropdown-header">
                  <div className="hr-profile-dropdown-name">
                    {user?.name || "HR Manager"}
                  </div>
                  <div className="hr-profile-dropdown-email">
                    {user?.email || "hr@gmail.com"}
                  </div>
                </div>
                <button
                  type="button"
                  className="hr-profile-dropdown-item"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    handleTabChange("employees");
                  }}
                >
                  <span>👥</span> Employees Directory
                </button>
                <button
                  type="button"
                  className="hr-profile-dropdown-item logout"
                  onClick={handleLogout}
                >
                  <span>↪</span> Sign Out
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="hr-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? "›" : "‹"}
          </button>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <div className="hr-main">
        {/* Topbar Header */}
        <header className="hr-topbar">
          <div className="hr-topbar-left">
            <span className="hr-topbar-appname">PeoplePay360</span>

            <div className="hr-topbar-search-box">
              <span className="hr-topbar-search-icon">🔍</span>
              <input
                type="text"
                className="hr-topbar-search-input"
                placeholder={
                  activeTab === "leaves"
                    ? "Search employees, leaves, departments..."
                    : "Search employees, contracts, leaves..."
                }
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="hr-topbar-right">
          </div>
        </header>

        {/* Dynamic Views */}
        {activeTab === "employees" && (
          <EmployeesView
            employees={employees}
            pipelineData={pipelineData}
            dashboardStats={dashboardStats}
            isLoading={isLoading}
            onOpenNewEmployee={() => setIsNewEmployeeOpen(true)}
            onViewEmployee={(emp) => setSelectedEmployeeView(emp)}
            onAddEmployeeToColumn={handleOpenAddEmployeeForColumn}
            onMoveStage={handleMoveStage}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === "leaves" && (
          <LeavesView
            leaveRequests={leaveRequests}
            leavePipeline={leavePipeline}
            leaveSummary={leaveSummary}
            isLoading={isLoading}
            onOpenRequestModal={() => setIsRequestLeaveOpen(true)}
            onViewLeave={(leave) => setSelectedLeaveView(leave)}
            onApprove={handleApproveLeave}
            onReject={handleRejectLeave}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === "attendance" && <AttendanceView />}

        {activeTab === "reports" && <ReportsView />}
      </div>

      {/* Popups & Modals */}
      <RequestLeaveModal
        isOpen={isRequestLeaveOpen}
        onClose={() => setIsRequestLeaveOpen(false)}
        onSubmit={handleCreateLeaveRequest}
      />

      <NewEmployeeModal
        isOpen={isNewEmployeeOpen}
        onClose={() => setIsNewEmployeeOpen(false)}
        onSuccess={handleAddNewEmployee}
        onAdd={handleAddNewEmployee}
      />

      <ViewEmployeeModal
        isOpen={!!selectedEmployeeView}
        onClose={() => setSelectedEmployeeView(null)}
        employee={selectedEmployeeView}
      />

      <ViewLeaveModal
        isOpen={!!selectedLeaveView}
        onClose={() => setSelectedLeaveView(null)}
        leave={selectedLeaveView}
        onApprove={handleApproveLeave}
        onReject={handleRejectLeave}
      />
    </div>
  );
};

export default HrManagerDashboard;
