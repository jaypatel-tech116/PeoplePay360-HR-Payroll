import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import AlertBanner from '../components/AlertBanner';
import { Plus, Search, Building2, MoreVertical, Edit, Users } from 'lucide-react';
import './DepartmentsPage.css';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.getDepartments();
      setDepartments(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: 'DEPARTMENT',
      accessor: 'name',
      render: (row) => (
        <div className="td-department">
          <div className="dept-icon bg-primary-light text-primary">
            <Building2 size={20} />
          </div>
          <span className="font-medium text-main">{row.name}</span>
        </div>
      )
    },
    { 
      header: 'MANAGER', 
      accessor: 'manager',
      render: (row) => (
        <div className="td-manager">
          <div className="avatar-sm">
            {row.manager_name ? row.manager_name.charAt(0).toUpperCase() : 'N'}
          </div>
          <span>{row.manager_name || 'Not Assigned'}</span>
        </div>
      )
    },
    { 
      header: 'TOTAL EMPLOYEES', 
      accessor: 'employee_count',
      render: (row) => (
        <div className="td-count">
          <Users size={16} className="text-muted" />
          <span>{row.employee_count || 0}</span>
        </div>
      )
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (row) => (
        <span className="badge badge-success"><span className="status-dot"></span>Active</span>
      )
    },
    {
      header: 'ACTIONS',
      accessor: 'actions',
      render: (row) => (
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
          <span>HR Management</span>
          <span>/</span>
          <span>Departments</span>
        </div>
        <div className="page-title-wrapper">
          <div>
            <h1 className="page-title">Departments</h1>
            <p className="page-subtitle">Manage company structure, teams, and reporting lines.</p>
          </div>
          <button className="btn btn-primary">
            <Plus size={16} />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}

      <div className="card">
        <div className="emp-filter-bar">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search departments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={filteredDepartments}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
