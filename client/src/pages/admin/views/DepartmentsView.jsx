import React, { useState, useEffect } from "react";
import { getDepartments, createDepartment } from "../../../api/admin.api";
import { MOCK_DEPARTMENTS } from "../adminMockData";
import { SkeletonListPage } from "../../../components/ui/SkeletonLoader";

export default function DepartmentsView() {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", description: "" });

  const loadData = async () => {
    try {
      const data = await getDepartments();
      if (data && data.length > 0) {
        setDepartments(data.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description || "Organizational department",
          employeeCount: parseInt(d.employee_count) || 0,
          status: d.is_active ? "Active" : "Inactive",
        })));
      }
    } catch (err) {
      console.error("Error loading departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDept.name.trim()) return;
    try {
      const code = newDept.name.trim().slice(0, 4).toUpperCase() + Math.floor(10 + Math.random() * 89);
      await createDepartment({
        name: newDept.name.trim(),
        code,
        description: newDept.description || "Organizational department",
      });
      setIsModalOpen(false);
      setNewDept({ name: "", description: "" });
      await loadData();
    } catch (err) {
      alert("Failed to add department: " + (err.response?.data?.message || err.message));
    }
  };


  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <SkeletonListPage rows={6} cols={5} />;

  return (
    <div className="adm-content-body">
      {/* 1. Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Departments</h1>
          <p className="adm-page-subtitle">Manage organizational departments</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button type="button" className="adm-btn-secondary" onClick={() => alert("Exporting departments...")}>
            <span>📤</span> Export
          </button>
          <button type="button" className="adm-btn-primary" onClick={() => setIsModalOpen(true)}>
            <span>+</span> Add Department
          </button>
        </div>
      </div>

      {/* 2. Main Card */}
      <div className="adm-section-card">
        <div className="adm-section-header">
          <div className="adm-input-search-wrapper" style={{ width: "260px" }}>
            <span style={{ color: "var(--adm-text-light)" }}>🔍</span>
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="adm-table-responsive">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Name</th>
                <th>Description</th>
                <th style={{ textAlign: "center" }}>Employee Count</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dept, index) => (
                <tr key={dept.id}>
                  <td style={{ color: "var(--adm-text-light)" }}>{index + 1}</td>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-dark)" }}>{dept.name}</td>
                  <td style={{ color: "var(--adm-text-muted)" }}>{dept.description}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{dept.employeeCount}</td>
                  <td>
                    <span className="adm-badge adm-badge-green">{dept.status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--adm-text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
                      onClick={() => alert(`Options for ${dept.name}`)}
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
          <span>Showing 1 to {filtered.length} of {departments.length} departments</span>
          <div className="adm-pagination-controls">
            <button type="button" className="adm-page-btn">‹</button>
            <button type="button" className="adm-page-btn active">1</button>
            <button type="button" className="adm-page-btn">›</button>
          </div>
        </div>
      </div>

      {/* Add Department Modal */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="adm-section-card"
            style={{ width: "100%", maxWidth: "450px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-section-header">
              <h3 className="adm-section-heading">Add Department</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddDepartment} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "4px" }}>
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem" }}
                  placeholder="e.g. Quality Assurance"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--adm-text-body)", display: "block", marginBottom: "4px" }}>
                  Description
                </label>
                <textarea
                  rows="3"
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--adm-border)", fontSize: "0.82rem", resize: "none" }}
                  placeholder="Department responsibilities..."
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <button type="button" className="adm-btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
