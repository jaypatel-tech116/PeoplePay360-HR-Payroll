import React, { useState } from "react";
import hrApi from "../../../api/hr.api";
import { SkeletonKanban, SkeletonListPage } from "../../../components/ui/SkeletonLoader";

/** Remove duplicate word if first and last name are the same (legacy data bug fix) */
const cleanName = (name) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
    return parts[0];
  }
  return name.trim();
};


const EmployeesView = ({
  employees = [],
  pipelineData = {},
  dashboardStats = {},
  isLoading = false,
  onOpenNewEmployee,
  onViewEmployee,
  onAddEmployeeToColumn,
  onMoveStage,
  onRefresh,
}) => {
  const [pipelineSearch, setPipelineSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [viewMode, setViewMode] = useState("kanban");
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Normalize pipeline lists
  const newJoinersList = pipelineData.new_joiners || pipelineData.newJoiners || [];
  const activeList = pipelineData.active || [];
  const onLeaveList = pipelineData.on_leave || pipelineData.onLeave || [];
  const exitingList = pipelineData.exiting || [];

  // Select all checkboxes toggle
  const toggleSelectAll = () => {
    if (selectedRowIds.length === employees.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(employees.map((e) => e.code || e.id));
    }
  };

  const toggleSelectRow = (code) => {
    setSelectedRowIds((prev) =>
      prev.includes(code) ? prev.filter((id) => id !== code) : [...prev, code]
    );
  };

  // Filtered employees table
  const filteredEmployees = employees.filter((emp) => {
    const q = tableSearch.toLowerCase();
    const name = emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`;
    const code = emp.code || emp.employee_code || "";
    const dept = emp.department || "";
    const role = emp.jobPosition || emp.designation || "";
    return (
      name.toLowerCase().includes(q) ||
      code.toLowerCase().includes(q) ||
      dept.toLowerCase().includes(q) ||
      role.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    window.open(hrApi.getExportUrl("employees"), "_blank");
  };

  const handleStageMove = async (empId, newStage) => {
    try {
      setActiveMenuId(null);
      if (onMoveStage) {
        await onMoveStage(empId, newStage);
      } else {
        await hrApi.updateEmployeePipelineStage(empId, newStage);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert("Failed to move employee stage: " + (err.response?.data?.message || err.message));
    }
  };

  if (isLoading) return viewMode === "kanban" ? <SkeletonKanban cols={4} cardsPerCol={3} /> : <SkeletonListPage rows={8} cols={6} />;

  return (
    <div className="hr-content-body">
      {/* 1. Page Header */}
      <div className="hr-page-header">
        <div>
          <h1 className="hr-page-title">Employees</h1>
          <p className="hr-page-subtitle">
            Manage your employees across their lifecycle
          </p>
        </div>
        <button
          type="button"
          className="hr-btn-primary"
          onClick={onOpenNewEmployee}
        >
          <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span>
          <span>New Employee</span>
        </button>
      </div>

      {/* 2. Top 4 Metric KPI Cards from Real Database */}
      <div className="hr-stats-grid">
        {/* Card 1: Total Employees */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-purple">👥</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Total Employees</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">
                {dashboardStats?.total_employees ?? employees.length ?? 0}
              </span>
              <span className="hr-stat-pill-green">↑ 12%</span>
            </div>
            <span className="hr-stat-subtext">Active Workforce</span>
          </div>
        </div>

        {/* Card 2: Onboarding */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-blue">👤</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Onboarding</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">
                {dashboardStats?.onboarding ?? newJoinersList.length ?? 0}
              </span>
            </div>
            <span className="hr-stat-subtext">In Progress</span>
          </div>
        </div>

        {/* Card 3: Active Employees */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-green">👥</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">Active Employees</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">
                {dashboardStats?.active_employees ?? activeList.length ?? 0}
              </span>
            </div>
            <span className="hr-stat-subtext">Operational</span>
          </div>
        </div>

        {/* Card 4: On Leave */}
        <div className="hr-stat-card">
          <div className="hr-stat-icon-wrapper hr-stat-icon-red">📅</div>
          <div className="hr-stat-info">
            <span className="hr-stat-label">On Leave</span>
            <div className="hr-stat-row">
              <span className="hr-stat-value">
                {dashboardStats?.on_leave ?? onLeaveList.length ?? 0}
              </span>
            </div>
            <span className="hr-stat-subtext">Currently</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Employee Pipeline */}
      <div className="hr-section-card">
        <div className="hr-section-header">
          <div className="hr-section-title-group">
            <div className="hr-section-icon">👥</div>
            <div>
              <h2 className="hr-section-heading">Employee Pipeline</h2>
              <p className="hr-section-subheading">
                Track employees across different stages
              </p>
            </div>
          </div>

          <div className="hr-section-controls">
            <div className="hr-input-search-wrapper">
              <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>🔍</span>
              <input
                type="text"
                placeholder="Search by name, email..."
                value={pipelineSearch}
                onChange={(e) => setPipelineSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="hr-btn-secondary"
              onClick={() => {
                if (onRefresh) onRefresh();
              }}
              title="Refresh Pipeline"
            >
              <span>🔄</span> Refresh
            </button>

            <div className="hr-view-toggles">
              <button
                type="button"
                className={`hr-view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                ⊞
              </button>
              <button
                type="button"
                className={`hr-view-toggle-btn ${viewMode === "kanban" ? "active" : ""}`}
                onClick={() => setViewMode("kanban")}
                title="Kanban Board"
              >
                ▦
              </button>
              <button
                type="button"
                className={`hr-view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* KanBan Board Columns */}
        <div className="hr-kanban-board">
          {/* Column 1: New Joiners */}
          <div className="hr-kanban-col">
            <div className="hr-kanban-col-header hr-col-header-blue">
              <span>New Joiners</span>
              <span className="hr-kanban-count-badge">
                {newJoinersList.length}
              </span>
            </div>
            <div className="hr-kanban-cards">
              {newJoinersList
                .filter(
                  (c) =>
                    !pipelineSearch ||
                    c.name.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
                    (c.role && c.role.toLowerCase().includes(pipelineSearch.toLowerCase()))
                )
                .map((card) => (
                  <div
                    key={card.id || card.code}
                    className="hr-pipeline-card"
                    onClick={() =>
                      onViewEmployee({
                        code: card.code || card.id,
                        name: card.name,
                        jobPosition: card.role,
                        department: card.dept,
                        status: "New Joiner",
                        joiningDate: card.date,
                        employeeType: "Full Time",
                      })
                    }
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    <div className="hr-card-top-row">
                      <div className="hr-card-avatar">{card.initials}</div>
                      <div className="hr-card-emp-info">
                        <h4 className="hr-card-name">{cleanName(card.name)}</h4>
                        <p className="hr-card-role">{card.role}</p>
                        <p className="hr-card-dept">{card.dept}</p>
                      </div>
                      <div style={{ position: "relative" }}>
                        <button
                          type="button"
                          className="hr-card-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === card.id ? null : card.id);
                          }}
                        >
                          ⋮
                        </button>
                        {activeMenuId === card.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "24px",
                              background: "#fff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              padding: "4px 0",
                              zIndex: 20,
                              width: "140px",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ fontSize: "10px", padding: "4px 10px", color: "#9ca3af", fontWeight: 700 }}>
                              MOVE STAGE:
                            </div>
                            <button
                              type="button"
                              style={{ width: "100%", padding: "6px 10px", textAlign: "left", background: "none", border: "none", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => handleStageMove(card.id, "ACTIVE")}
                            >
                              ➡️ Active
                            </button>
                            <button
                              type="button"
                              style={{ width: "100%", padding: "6px 10px", textAlign: "left", background: "none", border: "none", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => handleStageMove(card.id, "ON_LEAVE")}
                            >
                              ➡️ On Leave
                            </button>
                            <button
                              type="button"
                              style={{ width: "100%", padding: "6px 10px", textAlign: "left", background: "none", border: "none", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => handleStageMove(card.id, "EXITING")}
                            >
                              ➡️ Exiting
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="hr-card-bottom-row">
                      <span className="hr-card-date">
                        <span>📅</span> {card.date}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            <button
              type="button"
              className="hr-kanban-add-btn"
              onClick={() => onAddEmployeeToColumn("New Joiners")}
            >
              + Add Employee
            </button>
          </div>

          {/* Column 2: Active */}
          <div className="hr-kanban-col">
            <div className="hr-kanban-col-header hr-col-header-green">
              <span>Active</span>
              <span className="hr-kanban-count-badge">
                {activeList.length}
              </span>
            </div>
            <div className="hr-kanban-cards">
              {activeList
                .filter(
                  (c) =>
                    !pipelineSearch ||
                    c.name.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
                    (c.role && c.role.toLowerCase().includes(pipelineSearch.toLowerCase()))
                )
                .map((card) => (
                  <div
                    key={card.id || card.code}
                    className="hr-pipeline-card"
                    onClick={() =>
                      onViewEmployee({
                        code: card.code || card.id,
                        name: card.name,
                        jobPosition: card.role,
                        department: card.dept,
                        status: "Active",
                        joiningDate: card.date || "Active",
                        employeeType: "Full Time",
                      })
                    }
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    <div className="hr-card-top-row">
                      <div className="hr-card-avatar">{card.initials}</div>
                      <div className="hr-card-emp-info">
                        <h4 className="hr-card-name">{cleanName(card.name)}</h4>
                        <p className="hr-card-role">{card.role}</p>
                        <p className="hr-card-dept">{card.dept}</p>
                      </div>
                      <div style={{ position: "relative" }}>
                        <button
                          type="button"
                          className="hr-card-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === card.id ? null : card.id);
                          }}
                        >
                          ⋮
                        </button>
                        {activeMenuId === card.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "24px",
                              background: "#fff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              padding: "4px 0",
                              zIndex: 20,
                              width: "140px",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ fontSize: "10px", padding: "4px 10px", color: "#9ca3af", fontWeight: 700 }}>
                              MOVE STAGE:
                            </div>
                            <button
                              type="button"
                              style={{ width: "100%", padding: "6px 10px", textAlign: "left", background: "none", border: "none", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => handleStageMove(card.id, "ON_LEAVE")}
                            >
                              ➡️ On Leave
                            </button>
                            <button
                              type="button"
                              style={{ width: "100%", padding: "6px 10px", textAlign: "left", background: "none", border: "none", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => handleStageMove(card.id, "EXITING")}
                            >
                              ➡️ Exiting
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="hr-card-bottom-row">
                      <span className="hr-badge hr-badge-green">Active</span>
                    </div>
                  </div>
                ))}
            </div>
            <button
              type="button"
              className="hr-kanban-add-btn"
              onClick={() => onAddEmployeeToColumn("Active")}
            >
              + Add Employee
            </button>
          </div>

          {/* Column 3: On Leave */}
          <div className="hr-kanban-col">
            <div className="hr-kanban-col-header hr-col-header-amber">
              <span>On Leave</span>
              <span className="hr-kanban-count-badge">
                {onLeaveList.length}
              </span>
            </div>
            <div className="hr-kanban-cards">
              {onLeaveList
                .filter(
                  (c) =>
                    !pipelineSearch ||
                    c.name.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
                    (c.role && c.role.toLowerCase().includes(pipelineSearch.toLowerCase()))
                )
                .map((card) => (
                  <div
                    key={card.id || card.code}
                    className="hr-pipeline-card"
                    onClick={() =>
                      onViewEmployee({
                        code: card.code || card.id,
                        name: card.name,
                        jobPosition: card.role,
                        department: card.dept,
                        status: "On Leave",
                        joiningDate: card.date || "On Leave",
                        employeeType: "Full Time",
                      })
                    }
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    <div className="hr-card-top-row">
                      <div className="hr-card-avatar">{card.initials}</div>
                      <div className="hr-card-emp-info">
                        <h4 className="hr-card-name">{cleanName(card.name)}</h4>
                        <p className="hr-card-role">{card.role}</p>
                        <p className="hr-card-dept">{card.dept}</p>
                      </div>
                      <span className="hr-badge hr-badge-amber">
                        {card.leaveType || "On Leave"}
                      </span>
                      <div style={{ position: "relative" }}>
                        <button
                          type="button"
                          className="hr-card-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === card.id ? null : card.id);
                          }}
                        >
                          ⋮
                        </button>
                        {activeMenuId === card.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "24px",
                              background: "#fff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              padding: "4px 0",
                              zIndex: 20,
                              width: "140px",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ fontSize: "10px", padding: "4px 10px", color: "#9ca3af", fontWeight: 700 }}>
                              MOVE STAGE:
                            </div>
                            <button
                              type="button"
                              style={{ width: "100%", padding: "6px 10px", textAlign: "left", background: "none", border: "none", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => handleStageMove(card.id, "ACTIVE")}
                            >
                              ➡️ Return to Active
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="hr-card-bottom-row">
                      <span className="hr-card-date">
                        <span>📅</span> {card.date}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            <button
              type="button"
              className="hr-kanban-add-btn"
              onClick={() => onAddEmployeeToColumn("On Leave")}
            >
              + Add Employee
            </button>
          </div>

          {/* Column 4: Exiting */}
          <div className="hr-kanban-col">
            <div className="hr-kanban-col-header hr-col-header-red">
              <span>Exiting</span>
              <span className="hr-kanban-count-badge">
                {exitingList.length}
              </span>
            </div>
            <div className="hr-kanban-cards">
              {exitingList
                .filter(
                  (c) =>
                    !pipelineSearch ||
                    c.name.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
                    (c.role && c.role.toLowerCase().includes(pipelineSearch.toLowerCase()))
                )
                .map((card) => (
                  <div
                    key={card.id || card.code}
                    className="hr-pipeline-card"
                    onClick={() =>
                      onViewEmployee({
                        code: card.code || card.id,
                        name: card.name,
                        jobPosition: card.role,
                        department: card.dept,
                        status: card.badge || "Exiting",
                        joiningDate: card.date,
                        employeeType: "Full Time",
                      })
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div className="hr-card-top-row">
                      <div className="hr-card-avatar">{card.initials}</div>
                      <div className="hr-card-emp-info">
                        <h4 className="hr-card-name">{cleanName(card.name)}</h4>
                        <p className="hr-card-role">{card.role}</p>
                        <p className="hr-card-dept">{card.dept}</p>
                      </div>
                      <span className="hr-badge hr-badge-red">{card.badge || "Exiting"}</span>
                    </div>
                    <div className="hr-card-bottom-row">
                      <span className="hr-card-date">
                        <span>📅</span> {card.date}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            <button
              type="button"
              className="hr-kanban-add-btn"
              onClick={() => onAddEmployeeToColumn("Exiting")}
            >
              + Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: All Employees */}
      <div className="hr-section-card">
        <div className="hr-section-header">
          <div className="hr-section-title-group">
            <div className="hr-section-icon">👥</div>
            <div>
              <h2 className="hr-section-heading">All Employees</h2>
              <p className="hr-section-subheading">
                Complete list of your employees
              </p>
            </div>
          </div>

          <div className="hr-section-controls">
            <div className="hr-input-search-wrapper">
              <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>🔍</span>
              <input
                type="text"
                placeholder="Search employees..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="hr-btn-secondary"
              onClick={handleExportCsv}
            >
              <span>📥</span> Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="hr-table-responsive">
          <table className="hr-data-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={
                      selectedRowIds.length === filteredEmployees.length &&
                      filteredEmployees.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Job Position</th>
                <th>Employee Type</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                    No employees found. Click "+ New Employee" to onboard your first employee.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.code || emp.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRowIds.includes(emp.code || emp.id)}
                        onChange={() => toggleSelectRow(emp.code || emp.id)}
                      />
                    </td>
                    <td>{emp.code || emp.employee_code}</td>
                    <td className="hr-emp-name-cell">{cleanName(emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`)}</td>
                    <td>{emp.department || emp.department_name || "-"}</td>
                    <td>{emp.jobPosition || emp.designation || "-"}</td>
                    <td>{emp.employeeType || emp.employee_type || "Full Time"}</td>
                    <td>{emp.formattedJoiningDate || emp.joiningDate || "-"}</td>
                    <td>
                      <span
                        className={`hr-badge ${
                          emp.status === "ACTIVE" || emp.status === "Active"
                            ? "hr-badge-green"
                            : "hr-badge-amber"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="hr-btn-view"
                        onClick={() => onViewEmployee(emp)}
                      >
                        <span>👁</span> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeesView;
