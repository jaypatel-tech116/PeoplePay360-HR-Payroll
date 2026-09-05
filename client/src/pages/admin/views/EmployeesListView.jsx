import React, { useState, useEffect } from "react";
import { getEmployees, createEmployee, getDepartments } from "../../../api/admin.api";
import { MOCK_EMPLOYEES } from "../adminMockData";
import { SkeletonListPage } from "../../../components/ui/SkeletonLoader";

export default function EmployeesListView({ onSelectEmployee }) {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [departments, setDepartments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [typeFilter, setTypeFilter] = useState("All Employment Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({
    code: `EMP00${employees.length + 1}`,
    name: "",
    department: "Engineering",
    jobTitle: "",
    employmentType: "Full Time",
    status: "Active",
    email: "",
    phone: "",
  });

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

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((e) => e.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmp.name.trim() || !newEmp.email.trim()) return;

    const parts = newEmp.name.trim().split(" ");
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ") || "Employee";

    // Find dept id
    const matchedDept = departments.find((d) => d.name === newEmp.department);
    const departmentId = matchedDept ? matchedDept.id : 1;

    try {
      await createEmployee({
        employee_code: newEmp.code || `EMP${Math.floor(100 + Math.random() * 900)}`,
        first_name: firstName,
        last_name: lastName,
        email: newEmp.email,
        phone: newEmp.phone || null,
        department_id: departmentId,
        designation: newEmp.jobTitle || "Team Member",
        employee_type: newEmp.employmentType === "Part Time" ? "PART_TIME" : "FULL_TIME",
        joining_date: new Date().toISOString().split("T")[0],
      });
      setIsAddModalOpen(false);
      await loadData();
      setNewEmp({
        code: `EMP00${employees.length + 2}`,
        name: "",
        department: "Engineering",
        jobTitle: "",
        employmentType: "Full Time",
        status: "Active",
        email: "",
        phone: "",
      });
    } catch (err) {
      alert("Failed to add employee: " + (err.response?.data?.message || err.message));
    }
  };


  const filtered = employees.filter((emp) => {
    if (deptFilter !== "All Departments" && emp.department !== deptFilter) return false;
    if (typeFilter !== "All Employment Types" && emp.employmentType !== typeFilter) return false;
    if (statusFilter !== "All Status" && emp.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.code.toLowerCase().includes(q) ||
      (emp.email && emp.email.toLowerCase().includes(q))
    );
  });

  if (loading) return <SkeletonListPage rows={8} cols={7} />;

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Employees</h1>
          <p className="adm-page-subtitle">Manage all employees in the organization</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button type="button" className="adm-btn-secondary" onClick={() => alert("Import CSV modal")}>
            <span>📥</span> Import
          </button>
          <button type="button" className="adm-btn-secondary" onClick={() => alert("Exporting employees to CSV...")}>
            <span>📤</span> Export
          </button>
          <button type="button" className="adm-btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <span>+</span> Add Employee
          </button>
        </div>
      </div>

      {/* 2. Filters Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <select
            className="adm-btn-secondary"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Departments">All Departments ⌵</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
          </select>

          <select
            className="adm-btn-secondary"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Employment Types">All Employment Types ⌵</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
          </select>

          <select
            className="adm-btn-secondary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 12px" }}
          >
            <option value="All Status">All Status ⌵</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="adm-input-search-wrapper" style={{ width: "260px" }}>
          <span style={{ color: "var(--adm-text-light)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, code, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Employees Table */}
      <div className="adm-section-card">
        <div className="adm-table-responsive">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th style={{ width: "24px" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === employees.length && employees.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th style={{ width: "30px" }}>#</th>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Job Title</th>
                <th>Employment Type</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, index) => (
                <tr
                  key={emp.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(emp.id)}
                      onChange={() => toggleSelectOne(emp.id)}
                    />
                  </td>
                  <td style={{ color: "var(--adm-text-light)" }}>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{emp.code}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>{emp.jobTitle}</td>
                  <td>{emp.employmentType}</td>
                  <td>
                    <span
                      className={`adm-badge ${
                        emp.status === "Active" ? "adm-badge-green" : "adm-badge-red"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--adm-text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
                      onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-pagination-footer">
          <span>Showing 1 to {filtered.length} of 48 employees</span>
          <div className="adm-pagination-controls">
            <button type="button" className="adm-page-btn">‹</button>
            <button type="button" className="adm-page-btn active">1</button>
            <button type="button" className="adm-page-btn">2</button>
            <button type="button" className="adm-page-btn">3</button>
            <button type="button" className="adm-page-btn">4</button>
            <button type="button" className="adm-page-btn">5</button>
            <button type="button" className="adm-page-btn">›</button>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="adm-section-card"
            style={{ width: "100%", maxWidth: "540px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-section-header">
              <h3 className="adm-section-heading">Add New Employee</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddEmployee} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "4px" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                    placeholder="e.g. Ananya Roy"
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "4px" }}>
                    Employee Code
                  </label>
                  <input
                    type="text"
                    readOnly
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem", backgroundColor: "#f9fafb" }}
                    value={newEmp.code}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "4px" }}>
                    Department
                  </label>
                  <select
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                  >
                    <option>Engineering</option>
                    <option>HR</option>
                    <option>Sales</option>
                    <option>Product</option>
                    <option>Marketing</option>
                    <option>Finance</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "4px" }}>
                    Job Title
                  </label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                    placeholder="e.g. Frontend Engineer"
                    value={newEmp.jobTitle}
                    onChange={(e) => setNewEmp({ ...newEmp, jobTitle: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "4px" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                    placeholder="name@company.com"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "4px" }}>
                    Phone
                  </label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                    placeholder="+91 98765 00000"
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="adm-btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
