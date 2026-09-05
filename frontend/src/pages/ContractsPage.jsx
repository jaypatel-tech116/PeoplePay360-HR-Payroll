import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { Plus, FileText, CheckCircle2, AlertCircle, Edit, Trash2 } from 'lucide-react';
import './ContractsPage.css';

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [structures, setStructures] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContractId, setEditingContractId] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    department_id: '',
    job_position_id: '',
    wage: '',
    salary_structure_id: '',
    working_schedule_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'active'
  });

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await api.getContracts();
      setContracts(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
    api.getEmployees().then(setEmployees);
    api.getDepartments().then(setDepartments);
    api.getSalaryStructures().then(setStructures);
    api.getSchedules().then(setSchedules);
  }, []);

  const handleEmployeeSelect = (empId) => {
    const emp = employees.find((e) => e.id === parseInt(empId, 10));
    if (emp) {
      setFormData({
        ...formData,
        employee_id: emp.id,
        department_id: emp.department_id,
        job_position_id: emp.job_position_id,
        working_schedule_id: emp.working_schedule_id
      });
      if (emp.department_id) {
        api.getJobPositions(emp.department_id).then(setPositions);
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingContractId(null);
    setFormData({
      employee_id: employees.length > 0 ? employees[0].id : '',
      department_id: employees.length > 0 ? employees[0].department_id : '',
      job_position_id: employees.length > 0 ? employees[0].job_position_id : '',
      wage: '60000',
      salary_structure_id: structures.length > 0 ? structures[0].id : '',
      working_schedule_id: schedules.length > 0 ? schedules[0].id : '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      status: 'active'
    });
    if (employees.length > 0 && employees[0].department_id) {
      api.getJobPositions(employees[0].department_id).then(setPositions);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      if (editingContractId) {
        await api.updateContract(editingContractId, formData);
        setSuccess('Contract updated successfully.');
      } else {
        await api.createContract(formData);
        setSuccess('New contract created successfully.');
      }
      setIsModalOpen(false);
      fetchContracts();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employee_name',
      render: (r) => (
        <div>
          <strong>{r.employee_name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.department_name}</div>
        </div>
      )
    },
    {
      header: 'Monthly Wage',
      accessor: 'wage',
      render: (r) => (
        <span className="font-mono font-bold" style={{ color: 'var(--color-primary)' }}>
          ₹{parseFloat(r.wage).toLocaleString('en-IN')}
        </span>
      )
    },
    { header: 'Structure', accessor: 'structure_name' },
    { header: 'Schedule', accessor: 'schedule_name' },
    {
      header: 'Validity Period',
      accessor: 'start_date',
      render: (r) => (
        <span>
          {r.start_date} → {r.end_date || 'Open-Ended'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => (
        <span className={`badge ${r.status === 'active' ? 'badge-success' : r.status === 'expired' ? 'badge-warning' : 'badge-neutral'}`}>
          {r.status === 'active' && <CheckCircle2 size={12} />}
          {r.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      align: 'right',
      render: (r) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setEditingContractId(r.id);
            setFormData({
              employee_id: r.employee_id,
              department_id: r.department_id,
              job_position_id: r.job_position_id,
              wage: r.wage,
              salary_structure_id: r.salary_structure_id,
              working_schedule_id: r.working_schedule_id,
              start_date: r.start_date ? r.start_date.split('T')[0] : '',
              end_date: r.end_date ? r.end_date.split('T')[0] : '',
              status: r.status
            });
            if (r.department_id) {
              api.getJobPositions(r.department_id).then(setPositions);
            }
            setIsModalOpen(true);
          }}
        >
          <Edit size={13} />
          <span>Edit</span>
        </button>
      )
    }
  ];

  return (
    <div className="contracts-page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h2>Contract Management</h2>
          <span className="page-subtitle">Historical contract tracking with period-based active resolution</span>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>New Contract</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      <DataTable
        columns={columns}
        data={contracts}
        searchKey="employee_name"
        searchPlaceholder="Search by employee name..."
        pageSize={10}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContractId ? 'Edit Contract' : 'Create New Contract'}
        maxWidth="640px"
      >
        <form onSubmit={handleSubmit} className="contract-form">
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select
              className="form-select"
              value={formData.employee_id}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              disabled={!!editingContractId}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name} ({e.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Contract Wage (₹ / Month) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.wage}
                onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Salary Structure *</label>
              <select
                className="form-select"
                value={formData.salary_structure_id}
                onChange={(e) => setFormData({ ...formData, salary_structure_id: e.target.value })}
                required
              >
                {structures.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
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
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.total_weekly_hours}h/wk)</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date (Leave blank for open-ended)</label>
              <input
                type="date"
                className="form-input"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="contract-guard-notice">
            <AlertCircle size={15} />
            <span>
              <strong>Overlap Constraint Guard:</strong> The system validates that an employee cannot have two active contracts covering overlapping dates.
            </span>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingContractId ? 'Save Changes' : 'Create Contract'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
