import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import AlertBanner from '../components/AlertBanner';
import { ShieldCheck, UserCheck, ToggleLeft, ToggleRight, UserPlus, MoreVertical, Edit } from 'lucide-react';
import './UserManagementPage.css';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [u, r] = await Promise.all([api.getUsers(), api.getRoles()]);
      setUsers(u);
      setRoles(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, roleId) => {
    try {
      setError(null);
      await api.updateUserRole(userId, roleId);
      setSuccess('User role updated successfully.');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (userId, currentActive) => {
    try {
      setError(null);
      await api.toggleUserStatus(userId, !currentActive);
      setSuccess('User status updated.');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    {
      header: 'USER',
      accessor: 'name',
      render: (r) => (
        <div className="td-employee">
          <div className="td-avatar">{r.name.charAt(0).toUpperCase()}</div>
          <div className="td-emp-details">
            <span className="td-emp-name">{r.name}</span>
            <span className="td-emp-sub">{r.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'LINKED EMPLOYEE',
      accessor: 'employee_name',
      render: (r) => r.employee_name ? (
        <span className="badge badge-info"><UserCheck size={12} /> {r.employee_name}</span>
      ) : (
        <span className="text-muted text-xs">Unlinked</span>
      )
    },
    {
      header: 'ROLE',
      accessor: 'role_id',
      render: (r) => (
        <select
          className="form-select user-role-select"
          value={r.role_id}
          onChange={(e) => handleRoleChange(r.id, parseInt(e.target.value, 10))}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      )
    },
    {
      header: 'STATUS',
      accessor: 'is_active',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${r.is_active ? 'badge-success' : 'badge-neutral'}`}>
            <span className="status-dot"></span>
            {r.is_active ? 'Active' : 'Disabled'}
          </span>
          <button
            className={`btn-icon ${r.is_active ? 'text-success' : 'text-muted'}`}
            onClick={() => handleToggleStatus(r.id, r.is_active)}
            title="Toggle user access"
          >
            {r.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
        </div>
      )
    },
    {
      header: 'ACTIONS',
      accessor: 'id',
      align: 'right',
      render: (r) => (
        <div className="table-actions">
          <button className="btn-icon"><Edit size={16} /></button>
          <button className="btn-icon"><MoreVertical size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="breadcrumbs">
          <span>System Administration</span>
          <span>/</span>
          <span>User Management</span>
        </div>
        <div className="page-title-wrapper">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Manage system access, roles, and employee linkages.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary">
              <UserPlus size={16} />
              <span>Invite User</span>
            </button>
          </div>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      <div className="card mt-6">
        <div className="card-header border-b">
          <h3 className="card-title">System Users</h3>
        </div>
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={users}
            searchKey="name"
            searchPlaceholder="Search users by name or email..."
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
