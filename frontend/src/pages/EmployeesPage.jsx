import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import KanbanBoard from '../components/KanbanBoard';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { LayoutGrid, List, Plus, Search, CheckCircle2, ShieldAlert, Users } from 'lucide-react';
import './EmployeesPage.css';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // New Employee Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department_id: '',
    job_position_id: '',
    working_schedule_id: '',
    employee_type: 'full_time',
    bank_account_number: '',
    ifsc_code: '',
    bank_verified: true,
    hire_date: new Date().toISOString().split('T')[0]
  });

  const [jobPositions, setJobPositions] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployees({
        department_id: departmentFilter,
        employee_type: typeFilter
      });
      setEmployees(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [departmentFilter, typeFilter]);

  useEffect(() => {
    // Load metadata for dropdowns
    api.getDepartments().then(setDepartments);
    api.getSchedules().then(setSchedules);
  }, []);

  const handleDeptChangeInModal = (deptId) => {
    setFormData({ ...formData, department_id: deptId, job_position_id: '' });
    if (deptId) {
      api.getJobPositions(deptId).then(setJobPositions);
    } else {
      setJobPositions([]);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await api.createEmployee(formData);
      setIsNewModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'full_name',
      render: (row) => (
        <div className="table-emp-cell">
          {row.photo_url ? (
            <img src={row.photo_url} alt={row.full_name} className="table-avatar" />
          ) : (
            <div className="table-avatar-fallback">
              {row.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="table-emp-info">
            <span className="table-emp-name">{row.full_name}</span>
            <span className="table-emp-email">{row.email}</span>
          </div>
        </div>
      )
    },
    { header: 'Department', accessor: 'department_name' },
    { header: 'Position', accessor: 'job_title' },
    {
      header: 'Type',
      accessor: 'employee_type',
      render: (row) => (
        <span className="badge badge-info">{row.employee_type.replace('_', ' ')}</span>
      )
    },
    {
      header: 'Active Wage',
      accessor: 'current_wage',
      render: (row) => (
        <span className="table-wage-text">
          {row.current_wage ? `₹${parseFloat(row.current_wage).toLocaleString()}` : '—'}
        </span>
      )
    },
    {
      header: 'Bank Status',
      accessor: 'bank_verified',
      render: (row) => (
        row.bank_account_number && row.bank_verified ? (
          <span className="badge badge-success">
            <CheckCircle2 size={12} /> Verified
          </span>
        ) : (
          <span className="badge badge-danger">
            <ShieldAlert size={12} /> Pending
          </span>
        )
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="employees-page-container">
      {/* Header with View Toggle & New Employee CTA */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>Employee Directory</h2>
          <span className="page-subtitle">Central hub for master employee profiles, contracts & schedules</span>
        </div>

        <div className="page-actions">
          {/* View Mode Toggle: Kanban vs List */}
          <div className="view-toggle-group">
            <button
              className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
            >
              <LayoutGrid size={16} />
              <span>Kanban</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Table List View"
            >
              <List size={16} />
              <span>List</span>
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              if (departments.length > 0 && !formData.department_id) {
                handleDeptChangeInModal(departments[0].id);
              }
              if (schedules.length > 0 && !formData.working_schedule_id) {
                setFormData((prev) => ({ ...prev, working_schedule_id: schedules[0].id }));
              }
              setIsNewModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>New Employee</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}

      {/* Filter Row */}
      <div className="emp-filter-row">
        <div className="filter-group">
          <label className="filter-label">Department:</label>
          <select
            className="form-select filter-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Employee Type:</label>
          <select
            className="form-select filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>
        </div>
      </div>

      {/* Main View: Kanban or DataTable */}
      {viewMode === 'kanban' ? (
        <KanbanBoard employees={employees} groupBy="department_name" />
      ) : (
        <DataTable
          columns={columns}
          data={employees}
          searchKey="full_name"
          searchPlaceholder="Search employees by name..."
          onRowClick={(row) => navigate(`/employees/${row.id}`)}
          pageSize={12}
        />
      )}

      {/* New Employee Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create New Employee Master"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateEmployee} className="employee-create-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Work Email *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hire Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={formData.department_id}
                onChange={(e) => handleDeptChangeInModal(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Job Position *</label>
              <select
                className="form-select"
                value={formData.job_position_id}
                onChange={(e) => setFormData({ ...formData, job_position_id: e.target.value })}
                required
              >
                <option value="">Select Position</option>
                {jobPositions.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Working Schedule *</label>
              <select
                className="form-select"
                value={formData.working_schedule_id}
                onChange={(e) => setFormData({ ...formData, working_schedule_id: e.target.value })}
                required
              >
                <option value="">Select Schedule</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.total_weekly_hours}h/wk)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Employee Type *</label>
              <select
                className="form-select"
                value={formData.employee_type}
                onChange={(e) => setFormData({ ...formData, employee_type: e.target.value })}
                required
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Bank Account Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.bank_account_number}
                onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                placeholder="e.g. 987654321001"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bank IFSC / Routing Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                placeholder="e.g. HDFC0001234"
              />
            </div>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Employee Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
