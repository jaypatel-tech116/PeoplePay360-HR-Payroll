import React, { useState, useEffect } from "react";
import { getUsers, getRoles, createUser } from "../../../api/admin.api";
import { MOCK_USERS_LIST, MOCK_ROLES_LIST } from "../adminMockData";

export default function UsersAndRolesView() {
  const [activeSubTab, setActiveSubTab] = useState("users");
  const [users, setUsers] = useState(MOCK_USERS_LIST);
  const [roles, setRoles] = useState(MOCK_ROLES_LIST);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [editingItem, setEditingItem] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", fullName: "", role: "EMPLOYEE", password: "" });

  const loadData = async () => {
    try {
      const [uList, rList] = await Promise.all([getUsers(), getRoles()]);
      if (uList && uList.length > 0) {
        setUsers(uList.map((u) => ({
          id: u.id,
          name: u.full_name || u.email.split("@")[0],
          email: u.email,
          avatar: `${(u.full_name || u.email)[0].toUpperCase()}`,
          role: u.role === "ADMIN" ? "Administrator" : (u.role === "HR_MANAGER" ? "HR Manager" : (u.role === "EMPLOYEE" ? "Employee" : u.role)),
          dept: u.department_name || "General",
          lastActive: u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recently",
          status: u.is_active ? "Active" : "Inactive",
        })));
      }
      if (rList && rList.length > 0) {
        setRoles(rList.map((r) => ({
          id: r.id,
          name: r.name,
          usersCount: parseInt(r.user_count) || 1,
          desc: r.description || "System role",
        })));
      }
    } catch (err) {
      console.error("Error loading users and roles:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.email.trim()) return;
    try {
      await createUser({
        email: newUser.email.trim(),
        full_name: newUser.fullName.trim() || newUser.email.split("@")[0],
        role: newUser.role,
        password: newUser.password || "123456",
      });
      setIsAddUserOpen(false);
      setNewUser({ email: "", fullName: "", role: "EMPLOYEE", password: "" });
      await loadData();
    } catch (err) {
      alert("Failed to create user: " + (err.response?.data?.message || err.message));
    }
  };


  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "All Roles" && u.role !== roleFilter) return false;
    if (statusFilter !== "All Status" && u.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const filteredRoles = roles.filter((r) => {
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
  });

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Users & Roles</h1>
          <p className="adm-page-subtitle">Manage system users and their roles</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button type="button" className="adm-btn-primary" onClick={() => setIsAddUserOpen(true)}>
            <span>+</span> Add User
          </button>
          <button type="button" className="adm-btn-secondary" onClick={() => alert("Roles are system managed.")}>
            <span>+</span> Add Role
          </button>
        </div>
      </div>

      {/* 2. Sub-Tabs */}
      <div className="adm-pill-filters-bar">
        <button
          type="button"
          className={`adm-filter-pill ${activeSubTab === "users" ? "active" : ""}`}
          onClick={() => setActiveSubTab("users")}
        >
          Users ({users.length})
        </button>
        <button
          type="button"
          className={`adm-filter-pill ${activeSubTab === "roles" ? "active" : ""}`}
          onClick={() => setActiveSubTab("roles")}
        >
          Roles ({roles.length})
        </button>
      </div>

      {/* 3. Filters Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div className="adm-input-search-wrapper" style={{ width: "260px" }}>
          <span style={{ color: "var(--adm-text-light)" }}>🔍</span>
          <input
            type="text"
            placeholder={activeSubTab === "users" ? "Search by name or email..." : "Search roles..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeSubTab === "users" && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              className="adm-btn-secondary"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: "6px 12px" }}
            >
              <option value="All Roles">All Roles ⌵</option>
              <option value="Admin">Admin</option>
              <option value="HR Manager">HR Manager</option>
              <option value="HR Payroll User">HR Payroll User</option>
              <option value="Department Manager">Department Manager</option>
              <option value="Employee">Employee</option>
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

            <button type="button" className="adm-btn-secondary">
              <span>⚙️</span> Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Table Card (Users Tab) */}
      {activeSubTab === "users" && (
        <div className="adm-section-card">
          <div className="adm-table-responsive">
            <table className="adm-data-table">
              <thead>
                <tr>
                  <th style={{ width: "30px" }}>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id}>
                    <td style={{ color: "var(--adm-text-light)" }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{u.name}</td>
                    <td style={{ color: "var(--adm-text-muted)" }}>{u.email}</td>
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          backgroundColor: "#f3ebf4",
                          color: "var(--adm-plum-primary)",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{u.dept}</td>
                    <td>
                      <span
                        className={`adm-badge ${
                          u.status === "Active" ? "adm-badge-green" : "adm-badge-red"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--adm-text-muted)" }}>{u.lastLogin}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        <button
                          type="button"
                          className="adm-btn-secondary"
                          style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                          onClick={() => setEditingItem(u)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          style={{ background: "none", border: "none", color: "var(--adm-text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
                          onClick={() => alert(`Options for ${u.name}`)}
                        >
                          ⋮
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="adm-pagination-footer">
            <span>Showing 1 to {filteredUsers.length} of 8 users</span>
            <div className="adm-pagination-controls">
              <button type="button" className="adm-page-btn">‹</button>
              <button type="button" className="adm-page-btn active">1</button>
              <button type="button" className="adm-page-btn">›</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Table Card (Roles Tab) */}
      {activeSubTab === "roles" && (
        <div className="adm-section-card">
          <div className="adm-table-responsive">
            <table className="adm-data-table">
              <thead>
                <tr>
                  <th style={{ width: "30px" }}>#</th>
                  <th>Role Name</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th style={{ textAlign: "center" }}>Users Count</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((r, idx) => (
                  <tr key={r.id}>
                    <td style={{ color: "var(--adm-text-light)" }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{r.name}</td>
                    <td><code>{r.code}</code></td>
                    <td style={{ color: "var(--adm-text-muted)" }}>{r.desc}</td>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>{r.usersCount}</td>
                    <td>
                      <span className="adm-badge adm-badge-green">{r.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="adm-btn-secondary"
                        style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                        onClick={() => alert(`Edit role ${r.name}`)}
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingItem && (
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
          onClick={() => setEditingItem(null)}
        >
          <div
            className="adm-section-card"
            style={{ width: "100%", maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-section-header">
              <h3 className="adm-section-heading">Edit User Account: {editingItem.name}</h3>
              <button
                onClick={() => setEditingItem(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.85rem" }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px" }}>Email</label>
                <input
                  type="text"
                  readOnly
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", backgroundColor: "#f9fafb" }}
                  value={editingItem.email}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px" }}>Assigned Role</label>
                <select
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)" }}
                  defaultValue={editingItem.role}
                >
                  <option>Admin</option>
                  <option>HR Manager</option>
                  <option>HR Payroll Manager</option>
                  <option>HR Payroll User</option>
                  <option>Department Manager</option>
                  <option>Employee</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px" }}>Status</label>
                <select
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)" }}
                  defaultValue={editingItem.status}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--adm-border-subtle)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="adm-btn-secondary" onClick={() => setEditingItem(null)}>Cancel</button>
              <button
                className="adm-btn-primary"
                onClick={() => {
                  alert("User role updated successfully!");
                  setEditingItem(null);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add User Modal */}
      {isAddUserOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", width: "420px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--adm-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Add New User</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }} onClick={() => setIsAddUserOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px" }}>Full Name</label>
                  <input
                    type="text"
                    required
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", boxSizing: "border-box" }}
                    placeholder="e.g. John Doe"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px" }}>Email Address</label>
                  <input
                    type="email"
                    required
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", boxSizing: "border-box" }}
                    placeholder="e.g. john@company.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px" }}>Role</label>
                  <select
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", boxSizing: "border-box" }}
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="HR_PAYROLL_MANAGER">HR Payroll Manager</option>
                    <option value="HR_PAYROLL_USER">HR Payroll User</option>
                    <option value="EMPLOYEE">Employee</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "4px" }}>Password</label>
                  <input
                    type="password"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", boxSizing: "border-box" }}
                    placeholder="Default: 123456"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--adm-border-subtle)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="adm-btn-secondary" onClick={() => setIsAddUserOpen(false)}>Cancel</button>
                <button type="submit" className="adm-btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

