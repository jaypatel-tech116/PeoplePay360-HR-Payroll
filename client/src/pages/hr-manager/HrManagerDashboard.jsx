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
            >
              <span>Employees</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`hr-nav-item ${activeTab === "leaves" ? "active" : ""}`}
              onClick={() => handleTabChange("leaves")}
            >
              <span>Leaves</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`hr-nav-item ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => handleTabChange("attendance")}
            >
              <span>Attendance</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`hr-nav-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => handleTabChange("reports")}
            >
              <span>Reports</span>
            </button>
          </li>
        </ul>

        <div className="hr-sidebar-footer">
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
            {/* Messages badge (3) */}
            <button
              type="button"
              className="hr-icon-badge-btn"
              title="3 Unread Messages"
              onClick={() => alert("3 new messages from team members")}
            >
              💬
              <span className="hr-badge-count">3</span>
            </button>

            {/* Notifications badge (12) */}
            <button
              type="button"
              className="hr-icon-badge-btn"
              title="12 System Notifications"
              onClick={() => alert("12 notifications: 3 pending leave requests, 1 upcoming joiner")}
            >
              🔔
              <span className="hr-badge-count">12</span>
            </button>

            {/* User Pill */}
            <div style={{ position: "relative" }}>
              <div
                className="hr-user-pill"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="hr-user-avatar">{userInitials}</div>
                <span className="hr-user-name">{user?.name || "HR Manager"}</span>
                <span className="hr-user-caret">⌵</span>
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
                      {user?.name || "HR Manager"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                      {user?.email || "hr@gmail.com"}
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
                      color: "#374151",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleTabChange("employees");
                    }}
                  >
                    👥 Employees Directory
                  </button>
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

        {/* Dynamic Views */}
        {activeTab === "employees" && (
          <EmployeesView
            employees={employees}
            pipelineData={pipelineData}
            dashboardStats={dashboardStats}
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
