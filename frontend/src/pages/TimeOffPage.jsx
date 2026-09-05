import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Check,
  X
} from 'lucide-react';
import './TimeOffPage.css';

export default function TimeOffPage() {
  const { user } = useAuth();
  const [subView, setSubView] = useState('requests'); // 'requests' | 'allocations' | 'types'

  const [requests, setRequests] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [types, setTypes] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  // Form states
  const [reqForm, setReqForm] = useState({
    employee_id: '',
    time_off_type_id: '',
    date_from: new Date().toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    duration: 1,
    reason: ''
  });

  const [allocForm, setAllocForm] = useState({
    employee_id: '',
    time_off_type_id: '',
    allocated_amount: 10,
    valid_from: '2026-01-01',
    valid_to: '2026-12-31'
  });

  const [typeForm, setTypeForm] = useState({
    name: '',
    unit: 'days',
    requires_allocation: true,
    approval_required: true,
    affects_payroll: false
  });

  const canManage = ['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(user.role);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [reqs, allocs, typs, emps] = await Promise.all([
        api.getTimeOffRequests(),
        api.getTimeOffAllocations(),
        api.getTimeOffTypes(),
        api.getEmployees()
      ]);
      setRequests(reqs);
      setAllocations(allocs);
      setTypes(typs);
      setEmployees(emps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [subView]);

  const handleApproveRequest = async (reqId) => {
    try {
      setError(null);
      setSuccess(null);
      const res = await api.approveTimeOffRequest(reqId);
      setSuccess(res.message);
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRefuseRequest = async (reqId) => {
    try {
      setError(null);
      setSuccess(null);
      const res = await api.refuseTimeOffRequest(reqId);
      setSuccess(res.message);
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await api.createTimeOffRequest({
        ...reqForm,
        employee_id: user.role === 'Employee' ? user.employee_id : reqForm.employee_id
      });
      setSuccess('Leave request submitted successfully.');
      setIsRequestModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateAlloc = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await api.createTimeOffAllocation(allocForm);
      setSuccess('Leave allocation granted.');
      setIsAllocModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateType = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await api.createTimeOffType(typeForm);
      setSuccess('New leave type configured.');
      setIsTypeModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="timeoff-page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>Time Off Operations</h2>
          <span className="page-subtitle">Leave requests, atomic balance consumption & type configuration</span>
        </div>

        <div className="page-actions">
          {subView === 'requests' && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setReqForm({
                  employee_id: user.employee_id || (employees[0]?.id || ''),
                  time_off_type_id: types[0]?.id || '',
                  date_from: new Date().toISOString().split('T')[0],
                  date_to: new Date().toISOString().split('T')[0],
                  duration: 1,
                  reason: ''
                });
                setIsRequestModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Submit Leave Request</span>
            </button>
          )}

          {subView === 'allocations' && canManage && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setAllocForm({
                  employee_id: employees[0]?.id || '',
                  time_off_type_id: types[0]?.id || '',
                  allocated_amount: 10,
                  valid_from: '2026-01-01',
                  valid_to: '2026-12-31'
                });
                setIsAllocModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Grant Leave Allocation</span>
            </button>
          )}

          {subView === 'types' && canManage && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setTypeForm({
                  name: '',
                  unit: 'days',
                  requires_allocation: true,
                  approval_required: true,
                  affects_payroll: false
                });
                setIsTypeModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>New Leave Type</span>
            </button>
          )}
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      {/* Sub-view switcher tabs (A4) */}
      <div className="detail-tab-nav">
        <button
          className={`tab-link ${subView === 'requests' ? 'active' : ''}`}
          onClick={() => setSubView('requests')}
        >
          Time Off Requests ({requests.length})
        </button>
        <button
          className={`tab-link ${subView === 'allocations' ? 'active' : ''}`}
          onClick={() => setSubView('allocations')}
        >
          Allocations & Balances ({allocations.length})
        </button>
        {canManage && (
          <button
            className={`tab-link ${subView === 'types' ? 'active' : ''}`}
            onClick={() => setSubView('types')}
          >
            Leave Types Configuration ({types.length})
          </button>
        )}
      </div>

      {/* Sub-view 1: Requests */}
      {subView === 'requests' && (
        <DataTable
          columns={[
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
            { header: 'Leave Type', accessor: 'leave_type_name' },
            {
              header: 'Dates',
              accessor: 'date_from',
              render: (r) => (
                <span>
                  {r.date_from ? String(r.date_from).split('T')[0] : '—'} → {r.date_to ? String(r.date_to).split('T')[0] : '—'}
                </span>
              )
            },
            {
              header: 'Duration',
              accessor: 'duration',
              render: (r) => <span className="font-bold">{parseFloat(r.duration)} {r.unit}</span>
            },
            {
              header: 'Reason',
              accessor: 'reason',
              render: (r) => <span>{r.reason || '—'}</span>
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (r) => (
                <span className={`badge ${r.status === 'approved' ? 'badge-success' : r.status === 'submitted' ? 'badge-warning' : 'badge-danger'}`}>
                  {r.status}
                </span>
              )
            },
            {
              header: 'Decided By',
              accessor: 'approved_by_name',
              render: (r) => r.approved_by_name || 'Pending Approval'
            },
            {
              header: 'Actions',
              accessor: 'id',
              align: 'right',
              render: (r) => (
                canManage && r.status === 'submitted' ? (
                  <div className="action-button-group">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleApproveRequest(r.id)}
                      title="Atomically verify allocation balance & deduct"
                    >
                      <Check size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRefuseRequest(r.id)}
                    >
                      <X size={14} />
                      <span>Refuse</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-muted text-xs">—</span>
                )
              )
            }
          ]}
          data={requests}
          searchKey="employee_name"
          searchPlaceholder="Search requests by employee..."
        />
      )}

      {/* Sub-view 2: Allocations */}
      {subView === 'allocations' && (
        <DataTable
          columns={[
            {
              header: 'Employee',
              accessor: 'employee_name',
              render: (r) => <strong>{r.employee_name}</strong>
            },
            { header: 'Leave Type', accessor: 'leave_type_name' },
            {
              header: 'Allocated',
              accessor: 'allocated_amount',
              render: (r) => `${r.allocated_amount} ${r.unit}`
            },
            {
              header: 'Taken',
              accessor: 'taken_amount',
              render: (r) => `${r.taken_amount} ${r.unit}`
            },
            {
              header: 'Remaining Balance',
              accessor: 'remaining_amount',
              render: (r) => (
                <strong style={{ color: r.remaining_amount > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {r.remaining_amount} {r.unit}
                </strong>
              )
            },
            {
              header: 'Validity Period',
              accessor: 'valid_from',
              render: (r) => `${r.valid_from ? String(r.valid_from).split('T')[0] : '—'} to ${r.valid_to ? String(r.valid_to).split('T')[0] : '—'}`
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (r) => <span className="badge badge-success">{r.status}</span>
            }
          ]}
          data={allocations}
          searchKey="employee_name"
          searchPlaceholder="Search allocations by employee..."
        />
      )}

      {/* Sub-view 3: Types */}
      {subView === 'types' && (
        <DataTable
          columns={[
            { header: 'Leave Type Name', accessor: 'name' },
            { header: 'Unit', accessor: 'unit', render: (r) => <span className="badge badge-info">{r.unit}</span> },
            {
              header: 'Requires Allocation?',
              accessor: 'requires_allocation',
              render: (r) => r.requires_allocation ? 'Yes (Deducts Balance)' : 'No (Unrestricted)'
            },
            {
              header: 'Approval Workflow',
              accessor: 'approval_required',
              render: (r) => r.approval_required ? 'Required (HR Sign-off)' : 'Auto-approved'
            },
            {
              header: 'Payroll Impact',
              accessor: 'affects_payroll',
              render: (r) => (
                <span className={`badge ${r.affects_payroll ? 'badge-danger' : 'badge-neutral'}`}>
                  {r.affects_payroll ? 'Unpaid / Deducts Pay' : 'Paid Leave'}
                </span>
              )
            }
          ]}
          data={types}
          searchKey="name"
          searchPlaceholder="Search leave types..."
        />
      )}

      {/* Modal: New Leave Request */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Submit Time Off Request"
        maxWidth="540px"
      >
        <form onSubmit={handleCreateRequest} className="timeoff-modal-form">
          {user.role !== 'Employee' && (
            <div className="form-group">
              <label className="form-label">Employee *</label>
              <select
                className="form-select"
                value={reqForm.employee_id}
                onChange={(e) => setReqForm({ ...reqForm, employee_id: e.target.value })}
                required
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.full_name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Leave Type *</label>
            <select
              className="form-select"
              value={reqForm.time_off_type_id}
              onChange={(e) => setReqForm({ ...reqForm, time_off_type_id: e.target.value })}
              required
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">From Date *</label>
              <input
                type="date"
                className="form-input"
                value={reqForm.date_from}
                onChange={(e) => setReqForm({ ...reqForm, date_from: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">To Date *</label>
              <input
                type="date"
                className="form-input"
                value={reqForm.date_to}
                onChange={(e) => setReqForm({ ...reqForm, date_to: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Duration (Days / Hours) *</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              className="form-input"
              value={reqForm.duration}
              onChange={(e) => setReqForm({ ...reqForm, duration: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Notes</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={reqForm.reason}
              onChange={(e) => setReqForm({ ...reqForm, reason: e.target.value })}
              placeholder="e.g. Medical doctor consultation"
            />
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsRequestModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Leave Allocation */}
      <Modal
        isOpen={isAllocModalOpen}
        onClose={() => setIsAllocModalOpen(false)}
        title="Grant Time Off Allocation"
        maxWidth="540px"
      >
        <form onSubmit={handleCreateAlloc} className="timeoff-modal-form">
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select
              className="form-select"
              value={allocForm.employee_id}
              onChange={(e) => setAllocForm({ ...allocForm, employee_id: e.target.value })}
              required
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Leave Type *</label>
            <select
              className="form-select"
              value={allocForm.time_off_type_id}
              onChange={(e) => setAllocForm({ ...allocForm, time_off_type_id: e.target.value })}
              required
            >
              {types.filter((t) => t.requires_allocation).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Allocated Amount *</label>
            <input
              type="number"
              className="form-input"
              value={allocForm.allocated_amount}
              onChange={(e) => setAllocForm({ ...allocForm, allocated_amount: e.target.value })}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Valid From *</label>
              <input
                type="date"
                className="form-input"
                value={allocForm.valid_from}
                onChange={(e) => setAllocForm({ ...allocForm, valid_from: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Valid To *</label>
              <input
                type="date"
                className="form-input"
                value={allocForm.valid_to}
                onChange={(e) => setAllocForm({ ...allocForm, valid_to: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAllocModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Grant Allocation
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Leave Type */}
      <Modal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        title="Configure New Time Off Type"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateType} className="timeoff-modal-form">
          <div className="form-group">
            <label className="form-label">Type Name *</label>
            <input
              type="text"
              className="form-input"
              value={typeForm.name}
              onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
              placeholder="e.g. Parental Leave"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit</label>
            <select
              className="form-select"
              value={typeForm.unit}
              onChange={(e) => setTypeForm({ ...typeForm, unit: e.target.value })}
            >
              <option value="days">Days</option>
              <option value="hours">Hours</option>
            </select>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="req_alloc"
              checked={typeForm.requires_allocation}
              onChange={(e) => setTypeForm({ ...typeForm, requires_allocation: e.target.checked })}
            />
            <label htmlFor="req_alloc" className="checkbox-label">Requires Prior Allocation</label>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="aff_payroll"
              checked={typeForm.affects_payroll}
              onChange={(e) => setTypeForm({ ...typeForm, affects_payroll: e.target.checked })}
            />
            <label htmlFor="aff_payroll" className="checkbox-label">
              Affects Payroll (Unpaid Leave / Loss of Pay)
            </label>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsTypeModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Type
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
