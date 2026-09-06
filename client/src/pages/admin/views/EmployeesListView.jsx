import React, { useState, useEffect } from "react";
import { getEmployees, getDepartments } from "../../../api/admin.api";
import { MOCK_EMPLOYEES } from "../adminMockData";
import { SkeletonListPage } from "../../../components/ui/SkeletonLoader";
import NewEmployeeModal from "../../hr-manager/modals/NewEmployeeModal";
import EditEmployeeModal from "../modals/EditEmployeeModal";

export default function EmployeesListView({ onSelectEmployee }) {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [departments, setDepartments] = useState([]);
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  const loadData = async () => {
    try {
      const [empList, deptList] = await Promise.all([
        getEmployees(),
        getDepartments(),
      ]);
      if (deptList) setDepartments(deptList);
      if (empList && empList.length > 0) {
        const formatted = empList.map((e) => ({
          id: e.id,
          code: e.employee_code,
          name: `${e.first_name} ${e.last_name}`,
          avatar: `${(e.first_name || "E")[0]}${(e.last_name || "")[0] || ""}`,
          department: e.department_name || "Engineering",
          jobTitle: e.designation || "Staff",
          employmentType: e.employee_type === "FULL_TIME" ? "Full Time" : (e.employee_type || "Full Time"),
          status: e.status === "ACTIVE" ? "Active" : (e.status || "Active"),
          email: e.email,
          phone: e.phone || "+91 98765 43210",
          joiningDate: e.joining_date ? new Date(e.joining_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "01 Sep 2023",
          raw: e,
        }));
        setEmployees(formatted);
      }
    } catch (err) {
      console.error("Error loading employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = employees.filter((emp) => {
    if (deptFilter !== "All Departments" && emp.department !== deptFilter) return false;
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.code.toLowerCase().includes(q) ||
      (emp.email && emp.email.toLowerCase().includes(q))
    );
  });

  if (loading) return <SkeletonListPage rows={8} cols={6} />;

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Employees</h1>
          <p className="adm-page-subtitle">Manage all employees in the organization</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button type="button" className="adm-btn-primary" onClick={() => setIsAddModalOpen(true)}>
            Onboard Employee
          </button>
        </div>
      </div>

      {/* 2. Filters Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="adm-btn-secondary"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Departments">All Departments ⌵</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="adm-input-search-wrapper" style={{ width: "260px" }}>
            <span style={{ color: "var(--adm-text-light)" }}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, code or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. Table */}
      <div className="adm-section-card">
        <div className="adm-table-responsive">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Job Title</th>
                <th>Joining Date</th>
                <th style={{ textAlign: "right", paddingRight: "24px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: "var(--adm-plum-light)",
                          color: "var(--adm-plum-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        {emp.avatar}
                      </div>
                      <div style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{emp.name}</div>
                    </div>
                  </td>
                  <td style={{ color: "var(--adm-text-light)", fontSize: "0.82rem" }}>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.jobTitle}</td>
                  <td style={{ color: "var(--adm-text-muted)" }}>{emp.joiningDate}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", paddingRight: "12px" }}>
                      <button
                        type="button"
                        className="adm-btn-secondary"
                        style={{ padding: "4px 12px", fontSize: "0.78rem", fontWeight: 600, color: "#334155" }}
                        onClick={() => onSelectEmployee(emp)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="adm-btn-secondary"
                        style={{
                          padding: "4px 12px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "#714B67",
                          borderColor: "#714B67",
                          backgroundColor: "rgba(113, 75, 103, 0.05)"
                        }}
                        onClick={() => {
                          setEditingEmp(emp);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--adm-text-muted)" }}>
                    No employees found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Onboard Employee Modal */}
      <NewEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={async () => {
          setIsAddModalOpen(false);
          await loadData();
        }}
      />

      {/* 5. Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={editingEmp}
        onSuccess={async () => {
          setIsEditModalOpen(false);
          await loadData();
        }}
      />
    </div>
  );
}
