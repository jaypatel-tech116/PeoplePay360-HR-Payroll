import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import AlertBanner from '../components/AlertBanner';
import { ShieldCheck, UserCheck, ToggleLeft, ToggleRight, Settings } from 'lucide-react';
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
      header: 'User Account',
      accessor: 'name',
      render: (r) => (
        <div>
          <strong>{r.name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.email}</div>
        </div>
      )
    },
    {
      header: 'Linked Employee',
      accessor: 'employee_name',
      render: (r) => r.employee_name || 'No Linked Profile'
    },
    {
      header: 'Role Assignment',
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
      header: 'Account Status',
      accessor: 'is_active',
      render: (r) => (
        <button
          className={`btn-status-toggle ${r.is_active ? 'active' : 'inactive'}`}
          onClick={() => handleToggleStatus(r.id, r.is_active)}
          title="Click to toggle user access"
        >
          {r.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          <span>{r.is_active ? 'Active' : 'Disabled'}</span>
        </button>
      )
    }
  ];

  return (
    <div className="user-management-container">
      <div className="page-header">
        <div className="page-title-group">
          <h2>User Management & System Access Control</h2>
          <span className="page-subtitle">Assign 5-tier role privileges (Employee, HR Manager, HR Payroll User, HR Payroll Manager, Admin)</span>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search users..."
      />
    </div>
  );
}
