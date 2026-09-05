import React, { useState, useEffect } from "react";
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
  getStakeholderStats,
  getDepartments,
} from "../../../api/admin.api";

export default function UsersAndRolesView() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleCode, setSelectedRoleCode] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals state
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // New User Form state
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    role: "EMPLOYEE",
    departmentId: "",
    designation: "",
    phone: "",
    password: "",
  });

  // Edit User Form state
  const [editFormData, setEditFormData] = useState({
    id: "",
    fullName: "",
    email: "",
    role: "EMPLOYEE",
    departmentId: "",
    designation: "",
    phone: "",
    isActive: true,
    password: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Load all live data from MySQL database
  const loadData = async () => {
    try {
      setLoading(true);
      const [uList, rList, dList, statsData] = await Promise.all([
        getUsers(),
        getRoles(),
        getDepartments(),
        getStakeholderStats(),
      ]);

      setUsers(uList || []);
      setRoles(rList || []);
      setDepartments(dList || []);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load stakeholder data:", err);
      setActionMessage("Error loading database records: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter users based on search, role, and status
  const filteredUsers = users.filter((u) => {
    if (selectedRoleCode !== "ALL" && u.role !== selectedRoleCode) {
      return false;
    }
    if (selectedStatus !== "ALL") {
      if (selectedStatus === "ACTIVE" && !u.is_active) return false;
      if (selectedStatus === "INACTIVE" && u.is_active) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (u.full_name || "").toLowerCase().includes(q);
      const matchEmail = (u.email || "").toLowerCase().includes(q);
      const matchCode = (u.employee_code || "").toLowerCase().includes(q);
      const matchDept = (u.department_name || "").toLowerCase().includes(q);
      const matchDesig = (u.designation || "").toLowerCase().includes(q);
      const matchRole = (u.role_name || u.role || "").toLowerCase().includes(q);
      return matchName || matchEmail || matchCode || matchDept || matchDesig || matchRole;
    }
    return true;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handle create new stakeholder
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.email.trim()) return;

    try {
      await createUser({
        full_name: newUser.fullName.trim() || newUser.email.split("@")[0],
        email: newUser.email.trim(),
        role: newUser.role,
        department_id: newUser.departmentId ? Number(newUser.departmentId) : null,
        designation: newUser.designation.trim() || null,
        phone: newUser.phone.trim() || null,
        password: newUser.password || "123456",
      });

      setIsAddUserOpen(false);
      setNewUser({
        fullName: "",
        email: "",
        role: "EMPLOYEE",
        departmentId: "",
        designation: "",
        phone: "",
        password: "",
      });
      setActionMessage("Stakeholder account created successfully.");
      await loadData();
    } catch (err) {
      alert("Failed to create stakeholder: " + (err.response?.data?.message || err.message));
    }
  };

  // Open Edit Modal
  const openEditModal = (u) => {
    setEditFormData({
      id: u.id,
      fullName: u.full_name || "",
      email: u.email || "",
      role: u.role || "EMPLOYEE",
      departmentId: u.department_id || "",
      designation: u.designation || "",
      phone: u.phone || "",
      isActive: Boolean(u.is_active),
      password: "",
    });
    setEditingUser(u);
  };

  // Handle update stakeholder
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editFormData.id) return;

    try {
      await updateUser(editFormData.id, {
        full_name: editFormData.fullName.trim(),
        email: editFormData.email.trim(),
        role: editFormData.role,
        department_id: editFormData.departmentId ? Number(editFormData.departmentId) : null,
        designation: editFormData.designation.trim() || null,
        phone: editFormData.phone.trim() || null,
        is_active: editFormData.isActive,
        password: editFormData.password.trim() || undefined,
      });

      setEditingUser(null);
      setActionMessage("Stakeholder account updated successfully.");
      await loadData();
    } catch (err) {
      alert("Failed to update stakeholder: " + (err.response?.data?.message || err.message));
    }
  };

  // Handle Soft Delete / Deactivate
  const handleDeactivate = async (u) => {
    const confirmDeactivate = window.confirm(
      `Deactivate account for "${u.full_name || u.email}" (${u.role_name || u.role})?\n\nThis will safely suspend account login while preserving all historic payroll batches, contracts, and attendance records.`
    );
    if (!confirmDeactivate) return;

    try {
      await deactivateUser(u.id);
      setActionMessage(`Account for ${u.full_name || u.email} deactivated successfully (soft delete).`);
      if (viewingUser && viewingUser.id === u.id) {
        setViewingUser(null);
      }
      await loadData();
    } catch (err) {
      alert("Failed to deactivate account: " + (err.response?.data?.message || err.message));
    }
  };

  // Handle Reactivate
  const handleActivate = async (u) => {
    try {
      await activateUser(u.id);
      setActionMessage(`Account for ${u.full_name || u.email} reactivated successfully.`);
      if (viewingUser && viewingUser.id === u.id) {
        setViewingUser(null);
      }
      await loadData();
    } catch (err) {
      alert("Failed to activate account: " + (err.response?.data?.message || err.message));
    }
  };

  // Get readable role name
  const getRoleLabel = (roleCode) => {
    switch (roleCode) {
      case "ADMIN":
        return "Administrator";
      case "HR_MANAGER":
        return "HR Manager";
      case "HR_PAYROLL_MANAGER":
        return "HR Payroll Manager";
      case "HR_PAYROLL_USER":
        return "HR Payroll User";
      case "EMPLOYEE":
        return "Employee";
      default:
        return roleCode;
    }
  };

  return (
    <div
      style={{
        padding: "24px 32px",
        backgroundColor: "#f9fafb",
        minHeight: "100%",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxSizing: "border-box",
        color: "#1f2937",
      }}
    >
      {/* 1. Page Header (Charcoal Border Box Design) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: "1px solid #d1d5db",
          boxSizing: "border-box",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#1f2937",
              letterSpacing: "-0.01em",
            }}
          >
            Stakeholders & System Users
          </h1>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "0.85rem",
              color: "#4b5563",
            }}
          >
            Manage all platform stakeholders (HR Manager, Employee, HR Payroll Manager, HR Payroll User, Administrator) with synchronized database access.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => loadData()}
            style={{
              padding: "7px 14px",
              backgroundColor: "#ffffff",
              color: "#1f2937",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            Refresh Data
          </button>
          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            style={{
              padding: "7px 16px",
              backgroundColor: "#1f2937",
              color: "#ffffff",
              border: "1px solid #1f2937",
              borderRadius: "4px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            Add Stakeholder
          </button>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          style={{
            padding: "10px 16px",
            marginBottom: "16px",
            backgroundColor: "#ffffff",
            border: "1px solid #1f2937",
            borderRadius: "4px",
            fontSize: "0.84rem",
            color: "#1f2937",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <span>{actionMessage}</span>
          <button
            type="button"
            onClick={() => setActionMessage("")}
            style={{
              background: "none",
              border: "none",
              color: "#4b5563",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Stakeholder KPI Summary Cards (Charcoal Border Boxes) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          onClick={() => {
            setSelectedRoleCode("ALL");
            setSelectedStatus("ALL");
            setCurrentPage(1);
          }}
          style={{
            backgroundColor: "#ffffff",
            border: selectedRoleCode === "ALL" && selectedStatus === "ALL" ? "2px solid #1f2937" : "1px solid #d1d5db",
            borderRadius: "4px",
            padding: "14px 16px",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "#4b5563", textTransform: "uppercase" }}>
            Total Stakeholders
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#1f2937", marginTop: "4px" }}>
            {stats?.summary?.totalUsers ?? users.length}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "2px" }}>
            All accounts in database
          </div>
        </div>

        <div
          onClick={() => {
            setSelectedRoleCode("HR_MANAGER");
            setCurrentPage(1);
          }}
          style={{
            backgroundColor: "#ffffff",
            border: selectedRoleCode === "HR_MANAGER" ? "2px solid #1f2937" : "1px solid #d1d5db",
            borderRadius: "4px",
            padding: "14px 16px",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "#4b5563", textTransform: "uppercase" }}>
            HR Managers
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#1f2937", marginTop: "4px" }}>
            {stats?.roles?.find((r) => r.code === "HR_MANAGER")?.totalCount ?? users.filter((u) => u.role === "HR_MANAGER").length}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "2px" }}>
            Human Resources staff
          </div>
        </div>

        <div
          onClick={() => {
            setSelectedRoleCode("HR_PAYROLL_MANAGER");
            setCurrentPage(1);
          }}
          style={{
            backgroundColor: "#ffffff",
            border: selectedRoleCode === "HR_PAYROLL_MANAGER" ? "2px solid #1f2937" : "1px solid #d1d5db",
            borderRadius: "4px",
            padding: "14px 16px",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "#4b5563", textTransform: "uppercase" }}>
            Payroll Managers
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#1f2937", marginTop: "4px" }}>
            {stats?.roles?.find((r) => r.code === "HR_PAYROLL_MANAGER")?.totalCount ?? users.filter((u) => u.role === "HR_PAYROLL_MANAGER").length}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "2px" }}>
            Payroll administrators
          </div>
        </div>

        <div
          onClick={() => {
            setSelectedRoleCode("HR_PAYROLL_USER");
            setCurrentPage(1);
          }}
          style={{
            backgroundColor: "#ffffff",
            border: selectedRoleCode === "HR_PAYROLL_USER" ? "2px solid #1f2937" : "1px solid #d1d5db",
            borderRadius: "4px",
            padding: "14px 16px",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "#4b5563", textTransform: "uppercase" }}>
            Payroll Users
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#1f2937", marginTop: "4px" }}>
            {stats?.roles?.find((r) => r.code === "HR_PAYROLL_USER")?.totalCount ?? users.filter((u) => u.role === "HR_PAYROLL_USER").length}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "2px" }}>
            Operational staff
          </div>
        </div>

        <div
          onClick={() => {
            setSelectedRoleCode("EMPLOYEE");
            setCurrentPage(1);
          }}
          style={{
            backgroundColor: "#ffffff",
            border: selectedRoleCode === "EMPLOYEE" ? "2px solid #1f2937" : "1px solid #d1d5db",
            borderRadius: "4px",
            padding: "14px 16px",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "#4b5563", textTransform: "uppercase" }}>
            Employees
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#1f2937", marginTop: "4px" }}>
            {stats?.roles?.find((r) => r.code === "EMPLOYEE")?.totalCount ?? users.filter((u) => u.role === "EMPLOYEE").length}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "2px" }}>
            Contracted personnel
          </div>
        </div>

        <div
          onClick={() => {
            setSelectedRoleCode("ADMIN");
            setCurrentPage(1);
          }}
          style={{
            backgroundColor: "#ffffff",
            border: selectedRoleCode === "ADMIN" ? "2px solid #1f2937" : "1px solid #d1d5db",
            borderRadius: "4px",
            padding: "14px 16px",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "#4b5563", textTransform: "uppercase" }}>
            Administrators
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#1f2937", marginTop: "4px" }}>
            {stats?.roles?.find((r) => r.code === "ADMIN")?.totalCount ?? users.filter((u) => u.role === "ADMIN").length}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "2px" }}>
            System root admins
          </div>
        </div>

        <div
          onClick={() => {
            setSelectedStatus(selectedStatus === "INACTIVE" ? "ALL" : "INACTIVE");
            setCurrentPage(1);
          }}
          style={{
            backgroundColor: "#ffffff",
            border: selectedStatus === "INACTIVE" ? "2px solid #1f2937" : "1px solid #d1d5db",
            borderRadius: "4px",
            padding: "14px 16px",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "#4b5563", textTransform: "uppercase" }}>
            Deactivated
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#1f2937", marginTop: "4px" }}>
            {stats?.summary?.deactivatedUsers ?? users.filter((u) => !u.is_active).length}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "2px" }}>
            Soft-deleted accounts
          </div>
        </div>
      </div>

      {/* 3. Role Selection Filter Tabs (Charcoal Border Boxes) */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "16px",
          boxSizing: "border-box",
        }}
      >
        {[
          { code: "ALL", label: "All Stakeholders" },
          { code: "HR_MANAGER", label: "HR Managers" },
          { code: "HR_PAYROLL_MANAGER", label: "Payroll Managers" },
          { code: "HR_PAYROLL_USER", label: "Payroll Users" },
          { code: "EMPLOYEE", label: "Employees" },
          { code: "ADMIN", label: "Administrators" },
        ].map((tab) => {
          const isActive = selectedRoleCode === tab.code;
          return (
            <button
              key={tab.code}
              type="button"
              onClick={() => {
                setSelectedRoleCode(tab.code);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: isActive ? "#1f2937" : "#ffffff",
                color: isActive ? "#ffffff" : "#1f2937",
                border: "1px solid #1f2937",
                borderRadius: "4px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Search and Status Filters (Charcoal Border Boxes) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
          padding: "14px 16px",
          backgroundColor: "#ffffff",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: "1 1 300px", minWidth: "260px" }}>
          <input
            type="text"
            placeholder="Search by name, email, employee code, department, or designation..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "0.85rem",
              color: "#1f2937",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "8px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              backgroundColor: "#ffffff",
              fontSize: "0.82rem",
              color: "#1f2937",
              fontWeight: 500,
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">Status: Active</option>
            <option value="INACTIVE">Status: Deactivated</option>
          </select>

          {(searchQuery || selectedRoleCode !== "ALL" || selectedStatus !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedRoleCode("ALL");
                setSelectedStatus("ALL");
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 14px",
                backgroundColor: "#ffffff",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.82rem",
                color: "#4b5563",
                fontWeight: 600,
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 5. Stakeholders Itemized Table (Charcoal Border Box Design) */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.84rem",
              color: "#1f2937",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #d1d5db",
                  color: "#4b5563",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                <th style={{ padding: "12px 14px", width: "40px" }}>#</th>
                <th style={{ padding: "12px 14px" }}>Stakeholder Name</th>
                <th style={{ padding: "12px 14px" }}>Email Address</th>
                <th style={{ padding: "12px 14px" }}>Role</th>
                <th style={{ padding: "12px 14px" }}>Department</th>
                <th style={{ padding: "12px 14px" }}>Designation</th>
                <th style={{ padding: "12px 14px" }}>Status</th>
                <th style={{ padding: "12px 14px" }}>Last Active</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                    Loading live stakeholder records from MySQL database...
                  </td>
                </tr>
              )}

              {!loading && paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                    No stakeholder records found matching the selected criteria.
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedUsers.map((u, index) => {
                  const globalIdx = (currentPage - 1) * pageSize + index + 1;
                  const isActive = Boolean(u.is_active);

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        backgroundColor: isActive ? "#ffffff" : "#fcfcfd",
                      }}
                    >
                      <td style={{ padding: "12px 14px", color: "#6b7280" }}>{globalIdx}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>
                          {u.full_name || u.email.split("@")[0]}
                        </div>
                        {u.employee_code && (
                          <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                            {u.employee_code}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#374151" }}>{u.email}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            border: "1px solid #d1d5db",
                            borderRadius: "3px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "#1f2937",
                            backgroundColor: "#f9fafb",
                            boxSizing: "border-box",
                          }}
                        >
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#374151" }}>
                        {u.department_name || "General"}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#4b5563" }}>
                        {u.designation || "Staff"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {isActive ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              border: "1px solid #1f2937",
                              borderRadius: "3px",
                              fontSize: "0.74rem",
                              fontWeight: 600,
                              color: "#1f2937",
                              backgroundColor: "#ffffff",
                              boxSizing: "border-box",
                            }}
                          >
                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              border: "1px solid #9ca3af",
                              borderRadius: "3px",
                              fontSize: "0.74rem",
                              fontWeight: 500,
                              color: "#6b7280",
                              backgroundColor: "#ffffff",
                              boxSizing: "border-box",
                            }}
                          >
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: "0.78rem" }}>
                        {u.last_login_at
                          ? new Date(u.last_login_at).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Never"}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            gap: "6px",
                            alignItems: "center",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setViewingUser(u)}
                            style={{
                              padding: "4px 8px",
                              border: "1px solid #d1d5db",
                              borderRadius: "3px",
                              backgroundColor: "#ffffff",
                              color: "#1f2937",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              cursor: "pointer",
                              boxSizing: "border-box",
                            }}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            style={{
                              padding: "4px 8px",
                              border: "1px solid #1f2937",
                              borderRadius: "3px",
                              backgroundColor: "#ffffff",
                              color: "#1f2937",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              boxSizing: "border-box",
                            }}
                          >
                            Edit
                          </button>
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(u)}
                              style={{
                                padding: "4px 8px",
                                border: "1px solid #9ca3af",
                                borderRadius: "3px",
                                backgroundColor: "#ffffff",
                                color: "#4b5563",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                boxSizing: "border-box",
                              }}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleActivate(u)}
                              style={{
                                padding: "4px 8px",
                                border: "1px solid #1f2937",
                                borderRadius: "3px",
                                backgroundColor: "#1f2937",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxSizing: "border-box",
                              }}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && filteredUsers.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              borderTop: "1px solid #d1d5db",
              backgroundColor: "#f9fafb",
              fontSize: "0.82rem",
              color: "#4b5563",
              flexWrap: "wrap",
              gap: "10px",
              boxSizing: "border-box",
            }}
          >
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} stakeholders
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: "4px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "3px",
                  backgroundColor: "#ffffff",
                  color: currentPage === 1 ? "#9ca3af" : "#1f2937",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "0.78rem",
                  boxSizing: "border-box",
                }}
              >
                Previous
              </button>

              <span
                style={{
                  padding: "4px 10px",
                  border: "1px solid #1f2937",
                  borderRadius: "3px",
                  backgroundColor: "#1f2937",
                  color: "#ffffff",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  boxSizing: "border-box",
                }}
              >
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: "4px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "3px",
                  backgroundColor: "#ffffff",
                  color: currentPage === totalPages ? "#9ca3af" : "#1f2937",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "0.78rem",
                  boxSizing: "border-box",
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. View Stakeholder Profile Modal (Charcoal Border Box Design) */}
      {viewingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #1f2937",
              borderRadius: "4px",
              width: "520px",
              maxWidth: "92vw",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #d1d5db",
                backgroundColor: "#f9fafb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxSizing: "border-box",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#1f2937" }}>
                Stakeholder Profile Details
              </h3>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "3px",
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "#4b5563",
                  fontWeight: 600,
                  boxSizing: "border-box",
                }}
              >
                Close
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxSizing: "border-box" }}>
              <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "8px", fontSize: "0.85rem" }}>
                <div style={{ color: "#6b7280", fontWeight: 600 }}>Full Name:</div>
                <div style={{ color: "#111827", fontWeight: 600 }}>{viewingUser.full_name || "Not specified"}</div>

                <div style={{ color: "#6b7280", fontWeight: 600 }}>Email Address:</div>
                <div style={{ color: "#111827" }}>{viewingUser.email}</div>

                <div style={{ color: "#6b7280", fontWeight: 600 }}>Role:</div>
                <div>
                  <span
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: "3px",
                      padding: "2px 8px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    {getRoleLabel(viewingUser.role)}
                  </span>
                </div>

                <div style={{ color: "#6b7280", fontWeight: 600 }}>Employee Code:</div>
                <div style={{ color: "#111827" }}>{viewingUser.employee_code || "Not linked"}</div>

                <div style={{ color: "#6b7280", fontWeight: 600 }}>Department:</div>
                <div style={{ color: "#111827" }}>{viewingUser.department_name || "General"}</div>

                <div style={{ color: "#6b7280", fontWeight: 600 }}>Designation:</div>
                <div style={{ color: "#111827" }}>{viewingUser.designation || "Staff"}</div>

                <div style={{ color: "#6b7280", fontWeight: 600 }}>Phone:</div>
                <div style={{ color: "#111827" }}>{viewingUser.phone || "Not recorded"}</div>

                <div style={{ color: "#6b7280", fontWeight: 600 }}>Account Status:</div>
                <div>
                  {viewingUser.is_active ? (
                    <span
                      style={{
                        border: "1px solid #1f2937",
                        borderRadius: "3px",
                        padding: "2px 8px",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      Active
                    </span>
                  ) : (
                    <span
                      style={{
                        border: "1px solid #9ca3af",
                        borderRadius: "3px",
                        padding: "2px 8px",
                        fontSize: "0.74rem",
                        fontWeight: 500,
                        color: "#6b7280",
                      }}
                    >
                      Deactivated (Soft-Deleted)
                    </span>
                  )}
                </div>

                <div style={{ color: "#6b7280", fontWeight: 600 }}>Created Date:</div>
                <div style={{ color: "#4b5563" }}>
                  {viewingUser.created_at
                    ? new Date(viewingUser.created_at).toLocaleString("en-GB")
                    : "Not available"}
                </div>

                <div style={{ color: "#6b7280", fontWeight: 600 }}>Last Login:</div>
                <div style={{ color: "#4b5563" }}>
                  {viewingUser.last_login_at
                    ? new Date(viewingUser.last_login_at).toLocaleString("en-GB")
                    : "No recorded login session"}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #d1d5db",
                backgroundColor: "#f9fafb",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                boxSizing: "border-box",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const userToEdit = viewingUser;
                  setViewingUser(null);
                  openEditModal(userToEdit);
                }}
                style={{
                  padding: "6px 14px",
                  border: "1px solid #1f2937",
                  borderRadius: "3px",
                  backgroundColor: "#ffffff",
                  color: "#1f2937",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                Edit Account
              </button>

              {viewingUser.is_active ? (
                <button
                  type="button"
                  onClick={() => handleDeactivate(viewingUser)}
                  style={{
                    padding: "6px 14px",
                    border: "1px solid #9ca3af",
                    borderRadius: "3px",
                    backgroundColor: "#ffffff",
                    color: "#4b5563",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  Deactivate Account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivate(viewingUser)}
                  style={{
                    padding: "6px 14px",
                    border: "1px solid #1f2937",
                    borderRadius: "3px",
                    backgroundColor: "#1f2937",
                    color: "#ffffff",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  Reactivate Account
                </button>
              )}

              <button
                type="button"
                onClick={() => setViewingUser(null)}
                style={{
                  padding: "6px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "3px",
                  backgroundColor: "#ffffff",
                  color: "#4b5563",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add New Stakeholder Modal (Charcoal Border Box Design) */}
      {isAddUserOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #1f2937",
              borderRadius: "4px",
              width: "480px",
              maxWidth: "92vw",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #d1d5db",
                backgroundColor: "#f9fafb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxSizing: "border-box",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#1f2937" }}>
                Add New Stakeholder / User
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "3px",
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "#4b5563",
                  fontWeight: 600,
                  boxSizing: "border-box",
                }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  maxHeight: "70vh",
                  overflowY: "auto",
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                    }}
                    placeholder="e.g. Ramesh Chandra"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                    }}
                    placeholder="e.g. ramesh@company.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Stakeholder Role *
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                      backgroundColor: "#ffffff",
                    }}
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="HR_PAYROLL_MANAGER">HR Payroll Manager</option>
                    <option value="HR_PAYROLL_USER">HR Payroll User</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Department
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                      backgroundColor: "#ffffff",
                    }}
                    value={newUser.departmentId}
                    onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                  >
                    <option value="">Select Department (Optional)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                    }}
                    placeholder="e.g. Senior Payroll Analyst"
                    value={newUser.designation}
                    onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                    }}
                    placeholder="+91 9876543210"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Password (Default: 123456)
                  </label>
                  <input
                    type="password"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                    }}
                    placeholder="Leave blank for default (123456)"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid #d1d5db",
                  backgroundColor: "#f9fafb",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  boxSizing: "border-box",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  style={{
                    padding: "7px 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "3px",
                    fontSize: "0.82rem",
                    color: "#4b5563",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "7px 16px",
                    backgroundColor: "#1f2937",
                    border: "1px solid #1f2937",
                    borderRadius: "3px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  Create Stakeholder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Edit Stakeholder Modal (Charcoal Border Box Design) */}
      {editingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #1f2937",
              borderRadius: "4px",
              width: "480px",
              maxWidth: "92vw",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #d1d5db",
                backgroundColor: "#f9fafb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxSizing: "border-box",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#1f2937" }}>
                Edit Stakeholder Account
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "3px",
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "#4b5563",
                  fontWeight: 600,
                  boxSizing: "border-box",
                }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  maxHeight: "70vh",
                  overflowY: "auto",
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                    }}
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                    }}
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Stakeholder Role *
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                      backgroundColor: "#ffffff",
                    }}
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  >
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="HR_PAYROLL_MANAGER">HR Payroll Manager</option>
                    <option value="HR_PAYROLL_USER">HR Payroll User</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Department
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                      backgroundColor: "#ffffff",
                    }}
                    value={editFormData.departmentId}
                    onChange={(e) => setEditFormData({ ...editFormData, departmentId: e.target.value })}
                  >
                    <option value="">Select Department (Optional)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                    }}
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                    }}
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Account Status
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                      backgroundColor: "#ffffff",
                    }}
                    value={editFormData.isActive ? "1" : "0"}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === "1" })}
                  >
                    <option value="1">Active Account</option>
                    <option value="0">Deactivated (Soft-Deleted)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#1f2937" }}>
                    Reset Password (Optional)
                  </label>
                  <input
                    type="password"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "3px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                      color: "#1f2937",
                      fontSize: "0.85rem",
                    }}
                    placeholder="Leave blank to preserve current password"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid #d1d5db",
                  backgroundColor: "#f9fafb",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  boxSizing: "border-box",
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: "7px 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "3px",
                    fontSize: "0.82rem",
                    color: "#4b5563",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "7px 16px",
                    backgroundColor: "#1f2937",
                    border: "1px solid #1f2937",
                    borderRadius: "3px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
