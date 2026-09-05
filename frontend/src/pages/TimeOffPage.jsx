import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  Plus,
  Check,
  X,
  Search,
  MoreVertical,
  Edit,
  Eye,
  CalendarDays,
  FileCheck2,
  UserX,
  CalendarClock
} from 'lucide-react';
import './TimeOffPage.css';

export default function TimeOffPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'requests' | 'allocations' | 'types'

  const [requests, setRequests] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [types, setTypes] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  
  // View Request Modal
  const [viewRequestModalOpen, setViewRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

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
  }, [activeTab]);

  const handleApproveRequest = async (reqId) => {
    try {
      setError(null);
      setSuccess(null);
      const res = await api.approveTimeOffRequest(reqId);
      setSuccess(res.message);
      setViewRequestModalOpen(false);
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
      setViewRequestModalOpen(false);
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

  const pendingCount = requests.filter(r => r.status === 'submitted').length;
  const approvedMonthCount = requests.filter(r => r.status === 'approved').length; // Simplify for UI
  const absentCount = 2; // Dummy stat for UI matching

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="breadcrumbs">
          <span>HR Management</span>
          <span>/</span>
          <span>Leave Management</span>
        </div>
        <div className="page-title-wrapper">
          <div>
            <h1 className="page-title">Leave Management</h1>
            <p className="page-subtitle">Track, review, and manage employee time off across the organization.</p>
          </div>
          <div className="header-actions">
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
              <span>New Leave Request</span>
            </button>
          </div>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
          Requests {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'allocations' ? 'active' : ''}`} onClick={() => setActiveTab('allocations')}>
          Allocations
        </button>
        {canManage && (
          <button className={`tab-btn ${activeTab === 'types' ? 'active' : ''}`} onClick={() => setActiveTab('types')}>
            Leave Types
          </button>
        )}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="tab-pane">
          <div className="kpi-grid">
            <div className="card kpi-card">
              <div className="kpi-icon-wrap bg-warning-light text-warning">
                <Clock size={24} />
              </div>
              <div className="kpi-details">
                <p className="kpi-label">Pending Requests</p>
                <h3 className="kpi-value">{pendingCount}</h3>
                <p className="kpi-trend text-muted">Requires action</p>
              </div>
            </div>
            <div className="card kpi-card">
              <div className="kpi-icon-wrap bg-success-light text-success">
                <FileCheck2 size={24} />
              </div>
              <div className="kpi-details">
                <p className="kpi-label">Approved</p>
                <h3 className="kpi-value">{approvedMonthCount}</h3>
                <p className="kpi-trend text-muted">This month</p>
              </div>
            </div>
            <div className="card kpi-card">
              <div className="kpi-icon-wrap bg-danger-light text-danger">
                <UserX size={24} />
              </div>
              <div className="kpi-details">
                <p className="kpi-label">Absent Today</p>
                <h3 className="kpi-value">{absentCount}</h3>
                <p className="kpi-trend text-muted">On approved leave</p>
              </div>
            </div>
            <div className="card kpi-card">
              <div className="kpi-icon-wrap bg-info-light text-info">
                <CalendarDays size={24} />
              </div>
              <div className="kpi-details">
                <p className="kpi-label">Upcoming Leaves</p>
                <h3 className="kpi-value">
                  {requests.filter(r => r.status === 'approved' && new Date(r.date_from) > new Date()).length}
                </h3>
                <p className="kpi-trend text-muted">Next 7 days</p>
              </div>
            </div>
          </div>

          <div className="card mt-6">
            <div className="card-header">
              <h3 className="card-title">Upcoming Leaves</h3>
            </div>
            <div className="card-body p-0">
              <DataTable
                columns={[
                  {
                    header: 'EMPLOYEE',
                    accessor: 'employee_name',
                    render: (row) => (
                      <div className="td-employee">
                        <div className="td-avatar">{row.employee_name.charAt(0).toUpperCase()}</div>
                        <div className="td-emp-details">
                          <span className="td-emp-name">{row.employee_name}</span>
                          <span className="td-emp-sub">{row.department_name}</span>
                        </div>
                      </div>
                    )
                  },
                  { header: 'LEAVE TYPE', accessor: 'leave_type_name' },
                  { header: 'FROM', accessor: 'date_from', render: (r) => new Date(r.date_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                  { header: 'TO', accessor: 'date_to', render: (r) => new Date(r.date_to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                  { header: 'DURATION', accessor: 'duration', render: (r) => <span className="font-medium">{parseFloat(r.duration)} {r.unit}</span> }
                ]}
                data={requests.filter(r => r.status === 'approved' && new Date(r.date_from) > new Date()).slice(0, 5)}
                pageSize={5}
              />
            </div>
          </div>
        </div>
      )}

      {/* REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="card tab-pane">
          <div className="emp-filter-bar">
            <div className="search-wrapper flex-1">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search requests..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="card-body p-0">
            <DataTable
              columns={[
                {
                  header: 'EMPLOYEE',
                  accessor: 'employee_name',
                  render: (row) => (
                    <div className="td-employee">
                      <div className="td-avatar">{row.employee_name.charAt(0).toUpperCase()}</div>
                      <div className="td-emp-details">
                        <span className="td-emp-name">{row.employee_name}</span>
                        <span className="td-emp-sub">{row.department_name}</span>
                      </div>
                    </div>
                  )
                },
                { header: 'LEAVE TYPE', accessor: 'leave_type_name' },
                { header: 'DATES', accessor: 'date_from', render: (r) => <span>{new Date(r.date_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(r.date_to).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span> },
                { header: 'DURATION', accessor: 'duration', render: (r) => <span className="font-medium">{parseFloat(r.duration)} {r.unit}</span> },
                {
                  header: 'STATUS',
                  accessor: 'status',
                  render: (r) => {
                    const statusClass = r.status === 'approved' ? 'badge-success' : r.status === 'submitted' ? 'badge-warning' : 'badge-danger';
                    return (
                      <span className={`badge ${statusClass}`}>
                        <span className="status-dot"></span>
                        {r.status === 'submitted' ? 'Pending' : r.status.replace(/^\w/, c => c.toUpperCase())}
                      </span>
                    );
                  }
                },
                {
                  header: 'ACTIONS',
                  accessor: 'id',
                  render: (r) => (
                    <div className="table-actions">
                      <button className="btn-icon" onClick={() => { setSelectedRequest(r); setViewRequestModalOpen(true); }}><Eye size={16} /></button>
                      <button className="btn-icon"><MoreVertical size={16} /></button>
                    </div>
                  )
                }
              ]}
              data={requests.filter(r => r.employee_name.toLowerCase().includes(searchQuery.toLowerCase()))}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* ALLOCATIONS TAB */}
      {activeTab === 'allocations' && (
        <div className="card tab-pane">
          <div className="emp-filter-bar">
            <div className="search-wrapper flex-1">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search allocations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {canManage && (
              <button
                className="btn btn-outline"
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
                <span>Grant Allocation</span>
              </button>
            )}
          </div>
          <div className="card-body p-0">
            <DataTable
              columns={[
                {
                  header: 'EMPLOYEE',
                  accessor: 'employee_name',
                  render: (row) => (
                    <div className="td-employee">
                      <div className="td-avatar">{row.employee_name.charAt(0).toUpperCase()}</div>
                      <span className="td-emp-name">{row.employee_name}</span>
                    </div>
                  )
                },
                { header: 'LEAVE TYPE', accessor: 'leave_type_name' },
                { header: 'ALLOCATED', accessor: 'allocated_amount', render: (r) => `${r.allocated_amount} ${r.unit}` },
                { header: 'TAKEN', accessor: 'taken_amount', render: (r) => `${r.taken_amount} ${r.unit}` },
                {
                  header: 'REMAINING',
                  accessor: 'remaining_amount',
                  render: (r) => (
                    <span className="font-bold text-main">
                      {r.remaining_amount} {r.unit}
                    </span>
                  )
                },
                { header: 'VALID TO', accessor: 'valid_to', render: (r) => new Date(r.valid_to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                {
                  header: 'ACTIONS',
                  accessor: 'id',
                  render: (r) => (
                    <div className="table-actions">
                      <button className="btn-icon"><Edit size={16} /></button>
                      <button className="btn-icon"><MoreVertical size={16} /></button>
                    </div>
                  )
                }
              ]}
              data={allocations.filter(a => a.employee_name.toLowerCase().includes(searchQuery.toLowerCase()))}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* TYPES TAB */}
      {activeTab === 'types' && (
        <div className="card tab-pane">
          <div className="emp-filter-bar">
            <div className="search-wrapper flex-1">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search leave types..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {canManage && (
              <button
                className="btn btn-outline"
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
                <span>Add Leave Type</span>
              </button>
            )}
          </div>
          <div className="card-body p-0">
            <DataTable
              columns={[
                { header: 'LEAVE TYPE NAME', accessor: 'name', render: (r) => <span className="font-medium text-main">{r.name}</span> },
                { header: 'UNIT', accessor: 'unit', render: (r) => <span className="badge badge-neutral">{r.unit}</span> },
                {
                  header: 'REQUIRES ALLOCATION',
                  accessor: 'requires_allocation',
                  render: (r) => r.requires_allocation ? 'Yes' : 'No'
                },
                {
                  header: 'APPROVAL',
                  accessor: 'approval_required',
                  render: (r) => r.approval_required ? 'Required' : 'Auto'
                },
                {
                  header: 'PAYROLL IMPACT',
                  accessor: 'affects_payroll',
                  render: (r) => (
                    <span className={`badge ${r.affects_payroll ? 'badge-danger' : 'badge-success'}`}>
                      <span className="status-dot"></span>
                      {r.affects_payroll ? 'Unpaid' : 'Paid'}
                    </span>
                  )
                },
                {
                  header: 'ACTIONS',
                  accessor: 'id',
                  render: (r) => (
                    <div className="table-actions">
                      <button className="btn-icon"><Edit size={16} /></button>
                      <button className="btn-icon"><MoreVertical size={16} /></button>
                    </div>
                  )
                }
              ]}
              data={types.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* Modals ... (Keeping same form structures but styling differently) */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="New Leave Request" maxWidth="500px">
        <form onSubmit={handleCreateRequest} className="timeoff-modal-form">
          {user.role !== 'Employee' && (
            <div className="form-group">
              <label className="form-label">Employee</label>
              <select className="form-select" value={reqForm.employee_id} onChange={(e) => setReqForm({ ...reqForm, employee_id: e.target.value })} required>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.full_name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select className="form-select" value={reqForm.time_off_type_id} onChange={(e) => setReqForm({ ...reqForm, time_off_type_id: e.target.value })} required>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>
              ))}
            </select>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input type="date" className="form-input" value={reqForm.date_from} onChange={(e) => setReqForm({ ...reqForm, date_from: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input type="date" className="form-input" value={reqForm.date_to} onChange={(e) => setReqForm({ ...reqForm, date_to: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Duration</label>
            <input type="number" step="0.5" min="0.5" className="form-input" value={reqForm.duration} onChange={(e) => setReqForm({ ...reqForm, duration: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea className="form-textarea" rows={3} value={reqForm.reason} onChange={(e) => setReqForm({ ...reqForm, reason: e.target.value })} />
          </div>
          <div className="modal-footer-actions">
            <button type="button" className="btn btn-outline" onClick={() => setIsRequestModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Request</button>
          </div>
        </form>
      </Modal>

      {/* Review Request Modal */}
      {selectedRequest && (
        <Modal isOpen={viewRequestModalOpen} onClose={() => setViewRequestModalOpen(false)} title="Leave Request Details" maxWidth="500px">
          <div className="request-details-modal">
            <div className="req-emp-header">
              <div className="td-avatar" style={{width: 48, height: 48, fontSize: '1.25rem'}}>{selectedRequest.employee_name.charAt(0).toUpperCase()}</div>
              <div>
                <h3 style={{margin: 0, fontSize: '1.0625rem'}}>{selectedRequest.employee_name}</h3>
                <p className="text-muted" style={{margin: 0, fontSize: '0.875rem'}}>{selectedRequest.department_name}</p>
              </div>
            </div>
            
            <div className="details-grid mt-6">
              <div className="detail-field">
                <span className="detail-label">Leave Type</span>
                <span className="detail-value">{selectedRequest.leave_type_name}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Duration</span>
                <span className="detail-value">{parseFloat(selectedRequest.duration)} {selectedRequest.unit}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">{new Date(selectedRequest.date_from).toLocaleDateString()}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">End Date</span>
                <span className="detail-value">{new Date(selectedRequest.date_to).toLocaleDateString()}</span>
              </div>
              <div className="detail-field" style={{gridColumn: 'span 2'}}>
                <span className="detail-label">Reason</span>
                <span className="detail-value">{selectedRequest.reason || 'No reason provided.'}</span>
              </div>
            </div>

            {canManage && selectedRequest.status === 'submitted' && (
              <div className="modal-footer-actions mt-6">
                <button className="btn btn-outline" style={{borderColor: 'var(--danger)', color: 'var(--danger)'}} onClick={() => handleRefuseRequest(selectedRequest.id)}>
                  Reject Request
                </button>
                <button className="btn btn-success" onClick={() => handleApproveRequest(selectedRequest.id)}>
                  Approve Request
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Allocation and Type Modals can remain simple as before, updating styling... */}
      {/* Type Modal */}
      <Modal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} title="New Leave Type" maxWidth="500px">
        <form onSubmit={handleCreateType} className="timeoff-modal-form">
          <div className="form-group">
            <label className="form-label">Type Name</label>
            <input type="text" className="form-input" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Unit</label>
            <select className="form-select" value={typeForm.unit} onChange={(e) => setTypeForm({ ...typeForm, unit: e.target.value })}>
              <option value="days">Days</option>
              <option value="hours">Hours</option>
            </select>
          </div>
          <div className="checkbox-row mt-4">
            <input type="checkbox" id="req_alloc" checked={typeForm.requires_allocation} onChange={(e) => setTypeForm({ ...typeForm, requires_allocation: e.target.checked })} />
            <label htmlFor="req_alloc" className="checkbox-label">Requires Prior Allocation</label>
          </div>
          <div className="checkbox-row">
            <input type="checkbox" id="aff_payroll" checked={typeForm.affects_payroll} onChange={(e) => setTypeForm({ ...typeForm, affects_payroll: e.target.checked })} />
            <label htmlFor="aff_payroll" className="checkbox-label">Affects Payroll (Unpaid)</label>
          </div>
          <div className="modal-footer-actions mt-6">
            <button type="button" className="btn btn-outline" onClick={() => setIsTypeModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Type</button>
          </div>
        </form>
      </Modal>

      {/* Alloc Modal */}
      <Modal isOpen={isAllocModalOpen} onClose={() => setIsAllocModalOpen(false)} title="Grant Allocation" maxWidth="500px">
        <form onSubmit={handleCreateAlloc} className="timeoff-modal-form">
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select className="form-select" value={allocForm.employee_id} onChange={(e) => setAllocForm({ ...allocForm, employee_id: e.target.value })} required>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select className="form-select" value={allocForm.time_off_type_id} onChange={(e) => setAllocForm({ ...allocForm, time_off_type_id: e.target.value })} required>
              {types.filter(t => t.requires_allocation).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Allocated Amount</label>
            <input type="number" className="form-input" value={allocForm.allocated_amount} onChange={(e) => setAllocForm({ ...allocForm, allocated_amount: e.target.value })} required />
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Valid From</label>
              <input type="date" className="form-input" value={allocForm.valid_from} onChange={(e) => setAllocForm({ ...allocForm, valid_from: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Valid To</label>
              <input type="date" className="form-input" value={allocForm.valid_to} onChange={(e) => setAllocForm({ ...allocForm, valid_to: e.target.value })} required />
            </div>
          </div>
          <div className="modal-footer-actions mt-6">
            <button type="button" className="btn btn-outline" onClick={() => setIsAllocModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Grant Allocation</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
