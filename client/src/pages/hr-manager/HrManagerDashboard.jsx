import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiUsers, FiCalendar, FiClock, FiBarChart2, FiLogOut, FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import hrApi from "../../api/hr.api";
import EmployeesView from "./views/EmployeesView";
import LeavesView from "./views/LeavesView";
import AttendanceView from "./views/AttendanceView";
import ReportsView from "./views/ReportsView";
import RequestLeaveModal from "./modals/RequestLeaveModal";
import NewEmployeeModal from "./modals/NewEmployeeModal";
import ViewEmployeeModal from "./modals/ViewEmployeeModal";
import ViewLeaveModal from "./modals/ViewLeaveModal";
import TimeOffTypeModal from "./modals/TimeOffTypeModal";
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
  const [leaveTypes, setLeaveTypes] = useState([]);

  // Modal states
  const [isRequestLeaveOpen, setIsRequestLeaveOpen] = useState(false);
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState("New Joiners");
  const [selectedEmployeeView, setSelectedEmployeeView] = useState(null);
  const [selectedLeaveView, setSelectedLeaveView] = useState(null);
  const [isTimeOffTypeOpen, setIsTimeOffTypeOpen] = useState(false);
  const [selectedTimeOffType, setSelectedTimeOffType] = useState(null);

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
      const [statsRes, pipelineRes, empRes, leaveSumRes, leaveReqRes, leaveTypesRes] =
        await Promise.allSettled([
          hrApi.getDashboardStats(),
          hrApi.getEmployeePipeline(),
          hrApi.getEmployees({ limit: 100 }),
          hrApi.getLeaveSummary(),
          hrApi.getLeaveRequests(),
          hrApi.getLeaveTypes(),
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
      if (leaveTypesRes.status === "fulfilled" && leaveTypesRes.value) {
        const types = Array.isArray(leaveTypesRes.value)
          ? leaveTypesRes.value
          : leaveTypesRes.value?.leave_types || [];
        setLeaveTypes(types);
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
      alert("Failed to update employee stage: " + (err.response?.data?.message || err.message));
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
      const matched = (leaveTypes || []).find(
        (lt) => lt.name?.toLowerCase() === newLeave.leaveType?.toLowerCase()
      );
      const leave_type_id = newLeave.leave_type_id || matched?.id || 1;

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
      const reason =
        leave?.rejectionReason !== undefined
          ? leave.rejectionReason
          : prompt("Enter reason for rejection:", "Operational requirement");
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
        <div className="hr-sidebar-brand" style={{ justifyContent: "center", padding: "8px 10px" }}>
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

        <ul className="hr-sidebar-menu">
          <li>
            <button
              type="button"
              className={`hr-nav-item ${activeTab === "employees" ? "active" : ""}`}
              onClick={() => handleTabChange("employees")}
              title="Employees"
            >
              <FiUsers className="hr-nav-react-icon" style={{ fontSize: "1.2rem" }} />
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
              <FiCalendar className="hr-nav-react-icon" style={{ fontSize: "1.2rem" }} />
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
              <FiClock className="hr-nav-react-icon" style={{ fontSize: "1.2rem" }} />
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
              <FiBarChart2 className="hr-nav-react-icon" style={{ fontSize: "1.2rem" }} />
              <span className="hr-nav-text">Reports</span>
            </button>
          </li>
        </ul>

        <div
          className="hr-sidebar-footer"
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: isSidebarCollapsed ? "column" : "row",
            justifyContent: isSidebarCollapsed ? "center" : "space-between",
            gap: "8px",
            padding: isSidebarCollapsed ? "12px 6px" : "10px 12px"
          }}
        >
          <div className="hr-sidebar-user-container" style={{ flex: 1, minWidth: 0, width: isSidebarCollapsed ? "auto" : "100%" }}>
            <div
              className="hr-user-pill hr-sidebar-user-pill"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              title={user?.name || "HR Manager"}
            >
              <div className="hr-user-avatar">{userInitials}</div>
              {!isSidebarCollapsed && (
                <>
                  <div className="hr-user-details-box" style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.15, flex: 1, minWidth: 0 }}>
                    <span className="hr-user-name" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff" }}>
                      {user?.name || "HR Manager"}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.75)" }}>
                      HR Manager
                    </span>
                  </div>
                  <FiChevronDown className="hr-user-caret" />
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
                    {user?.name || "HR Manager"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    {user?.email || "hr@gmail.com"}
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
            className="hr-collapse-toggle-btn"
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

      {/* 2. Main Content Canvas without topbar */}
      <div className="hr-main">

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
            leaveTypes={leaveTypes}
            isLoading={isLoading}
            onOpenRequestModal={() => setIsRequestLeaveOpen(true)}
            onOpenTimeOffType={(type) => {
              setSelectedTimeOffType(type);
              setIsTimeOffTypeOpen(true);
            }}
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
        leaveTypes={leaveTypes}
      />

      <TimeOffTypeModal
        isOpen={isTimeOffTypeOpen}
        onClose={() => {
          setIsTimeOffTypeOpen(false);
          setSelectedTimeOffType(null);
        }}
        leaveType={selectedTimeOffType}
        onSaved={fetchAllData}
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
