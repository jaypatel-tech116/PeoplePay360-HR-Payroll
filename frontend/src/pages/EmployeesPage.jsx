import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { Plus, Search, CheckCircle2, ShieldAlert, Users, MoreVertical, Edit, Eye } from 'lucide-react';
import './EmployeesPage.css';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter employees by search query
  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: 'EMPLOYEE',
      accessor: 'full_name',
      render: (row) => (
        <div className="td-employee">
          {row.photo_url ? (
            <img src={row.photo_url} alt={row.full_name} className="td-avatar" />
          ) : (
            <div className="td-avatar">
              {row.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="td-emp-details">
            <span className="td-emp-name">{row.full_name}</span>
            <span className="td-emp-sub">{row.email}</span>
          </div>
        </div>
      )
    },
    { header: 'DEPARTMENT', accessor: 'department_name' },
    { header: 'ROLE', accessor: 'job_title' },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
          {row.status === 'active' && <span className="status-dot"></span>}
          {row.status}
        </span>
      )
    },
    { 
      header: 'JOIN DATE', 
      accessor: 'hire_date',
      render: (row) => new Date(row.hire_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    },
    {
      header: 'ACTIONS',
      accessor: 'actions',
      render: (row) => (
        <div className="table-actions">
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); navigate(`/employees/${row.id}`); }}>
            <Eye size={16} />
          </button>
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); navigate(`/employees/${row.id}`); }}>
            <Edit size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="breadcrumbs">
          <span>HR Management</span>
          <span>/</span>
          <span>Employees</span>
        </div>
        <div className="page-title-wrapper">
          <div>
            <h1 className="page-title">Employees</h1>
            <p className="page-subtitle">Manage your workforce, view profiles, and update details.</p>
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
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}

      <div className="card">
        {/* Filter Bar */}
        <div className="emp-filter-bar">
          <div className="search-wrapper flex-1">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search employees..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-dropdowns">
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

        {/* Data Table */}
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={filteredEmployees}
            onRowClick={(row) => navigate(`/employees/${row.id}`)}
            pageSize={10}
          />
        </div>
      </div>

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
            <button type="button" className="btn btn-outline" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Employee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
