import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import SmartButton from '../components/SmartButton';
import AlertBanner from '../components/AlertBanner';
import DataTable from '../components/DataTable';
import {
  FileText,
  Clock,
  Calendar,
  Save,
  ArrowLeft
} from 'lucide-react';
import './EmployeeDetailPage.css';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [counts, setCounts] = useState({ contracts: 0, attendance: 0, timeOffRequests: 0, allocations: 0 });
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'contracts' | 'attendance' | 'time-off'
  const [subData, setSubData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dropdowns
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [managers, setManagers] = useState([]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const [empRes, countRes] = await Promise.all([
        api.getEmployeeById(id),
        api.getEmployeeCounts(id)
      ]);
      setEmployee(empRes);
      setCounts(countRes);
      if (empRes.department_id) {
        api.getJobPositions(empRes.department_id).then(setPositions);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
    api.getDepartments().then(setDepartments);
    api.getSchedules().then(setSchedules);
    api.getEmployees().then((res) => setManagers(res.filter((e) => e.id !== parseInt(id, 10))));
  }, [id]);

  const handleSmartButtonClick = async (tabName) => {
    setActiveTab(tabName);
    try {
      if (tabName === 'contracts') {
        const res = await api.getEmployeeContracts(id);
        setSubData(res);
      } else if (tabName === 'attendance') {
        const res = await api.getEmployeeAttendance(id);
        setSubData(res);
      } else if (tabName === 'time-off') {
        const res = await api.getEmployeeTimeOff(id);
        setSubData(res);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await api.updateEmployee(id, employee);
      setSuccess('Employee master record updated successfully.');
      fetchEmployeeDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !employee) {
    return <div className="detail-loading">Loading employee profile...</div>;
  }

  return (
    <div className="employee-detail-container">
      {/* Top Header */}
      <div className="detail-header-bar">
        <div className="detail-header-left">
          <button className="back-nav-btn" onClick={() => navigate('/employees')}>
            <ArrowLeft size={16} />
            <span>Employees</span>
          </button>
          <div className="header-emp-title">
            <h2>{employee.full_name}</h2>
            <span className="badge badge-info">{employee.job_title || 'Position Not Assigned'}</span>
          </div>
        </div>

        {/* Smart Button Bar (A1 / B2) */}
        <div className="smart-button-bar">
          <SmartButton
            icon={FileText}
            count={counts.contracts}
            label="Contracts"
            active={activeTab === 'contracts'}
            onClick={() => handleSmartButtonClick('contracts')}
          />
          <SmartButton
            icon={Clock}
            count={counts.attendance}
            label="Attendance"
            active={activeTab === 'attendance'}
            onClick={() => handleSmartButtonClick('attendance')}
          />
          <SmartButton
            icon={Calendar}
            count={counts.timeOffRequests}
            label="Time Off"
            active={activeTab === 'time-off'}
            onClick={() => handleSmartButtonClick('time-off')}
          />
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      {/* Sub-view switcher tabs */}
      <div className="detail-tab-nav">
        <button
          className={`tab-link ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          General Information
        </button>
        <button
          className={`tab-link ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => handleSmartButtonClick('contracts')}
        >
          Contracts ({counts.contracts})
        </button>
        <button
          className={`tab-link ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => handleSmartButtonClick('attendance')}
        >
          Attendance ({counts.attendance})
        </button>
        <button
          className={`tab-link ${activeTab === 'time-off' ? 'active' : ''}`}
          onClick={() => handleSmartButtonClick('time-off')}
        >
          Time Off ({counts.timeOffRequests})
        </button>
      </div>

      {/* Tab 1: Profile Master Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdate} className="card employee-form-card">
          <div className="form-card-top">
            <div className="avatar-preview-box">
              {employee.photo_url ? (
                <img src={employee.photo_url} alt={employee.full_name} className="large-avatar-img" />
              ) : (
                <div className="large-avatar-fallback">
                  {employee.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="form-top-fields">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={employee.full_name}
                  onChange={(e) => setEmployee({ ...employee, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={employee.email}
                    onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={employee.phone || ''}
                    onChange={(e) => setEmployee({ ...employee, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section-divider" />
          <h4 className="form-section-title">Job & Organization Setup</h4>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={employee.department_id || ''}
                onChange={(e) => {
                  const dId = e.target.value;
                  setEmployee({ ...employee, department_id: dId, job_position_id: '' });
                  if (dId) api.getJobPositions(dId).then(setPositions);
                }}
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
                value={employee.job_position_id || ''}
                onChange={(e) => setEmployee({ ...employee, job_position_id: e.target.value })}
                required
              >
                <option value="">Select Position</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Manager</label>
              <select
                className="form-select"
                value={employee.manager_id || ''}
                onChange={(e) => setEmployee({ ...employee, manager_id: e.target.value || null })}
              >
                <option value="">No Manager (Executive)</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Working Schedule *</label>
              <select
                className="form-select"
                value={employee.working_schedule_id || ''}
                onChange={(e) => setEmployee({ ...employee, working_schedule_id: e.target.value })}
                required
              >
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.total_weekly_hours}h/wk)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Employee Type (User Correction #1)</label>
              <select
                className="form-select"
                value={employee.employee_type}
                onChange={(e) => setEmployee({ ...employee, employee_type: e.target.value })}
                required
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Employment Status</label>
              <select
                className="form-select"
                value={employee.status}
                onChange={(e) => setEmployee({ ...employee, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div className="form-section-divider" />
          <h4 className="form-section-title">Bank Details & Verification (User Correction #2)</h4>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Bank Account Number</label>
              <input
                type="text"
                className="form-input"
                value={employee.bank_account_number || ''}
                onChange={(e) => setEmployee({ ...employee, bank_account_number: e.target.value })}
                placeholder="Enter bank account number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank IFSC / Routing Code</label>
              <input
                type="text"
                className="form-input"
                value={employee.ifsc_code || ''}
                onChange={(e) => setEmployee({ ...employee, ifsc_code: e.target.value })}
                placeholder="e.g. HDFC0001234"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank Verification Status</label>
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="bank_verified"
                  checked={employee.bank_verified || false}
                  onChange={(e) => setEmployee({ ...employee, bank_verified: e.target.checked })}
                />
                <label htmlFor="bank_verified" className="checkbox-label">
                  Mark Bank Account as Verified
                </label>
              </div>
              <span className="form-helper">
                Unverified bank details generate warnings on Payslips during computation.
              </span>
            </div>
          </div>

          <div className="form-actions-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving Changes...' : 'Save Employee Master'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Contracts Sub-View */}
      {activeTab === 'contracts' && (
        <div className="card">
          <div className="sub-header">
            <h4>Contract History for {employee.full_name}</h4>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/contracts')}>
              Manage All Contracts
            </button>
          </div>
          <DataTable
            columns={[
              { header: 'Wage', accessor: 'wage', render: (r) => `₹${parseFloat(r.wage).toLocaleString()}` },
              { header: 'Structure', accessor: 'structure_name' },
              { header: 'Schedule', accessor: 'schedule_name' },
              { header: 'Start Date', accessor: 'start_date' },
              { header: 'End Date', accessor: 'end_date', render: (r) => r.end_date || 'Open-Ended' },
              {
                header: 'Status',
                accessor: 'status',
                render: (r) => (
                  <span className={`badge ${r.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                    {r.status}
                  </span>
                )
              }
            ]}
            data={subData}
            pageSize={5}
          />
        </div>
      )}

      {/* Tab 3: Attendance Sub-View */}
      {activeTab === 'attendance' && (
        <div className="card">
          <div className="sub-header">
            <h4>Attendance Records for {employee.full_name}</h4>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/attendance')}>
              View Attendance Terminal
            </button>
          </div>
          <DataTable
            columns={[
              { header: 'Check In', accessor: 'check_in', render: (r) => new Date(r.check_in).toLocaleString() },
              { header: 'Check Out', accessor: 'check_out', render: (r) => r.check_out ? new Date(r.check_out).toLocaleString() : 'Open / Missing' },
              { header: 'Worked Hours', accessor: 'worked_hours', render: (r) => `${r.worked_hours || 0} hrs` },
              {
                header: 'Status',
                accessor: 'status',
                render: (r) => (
                  <span className={`badge ${r.status === 'normal' ? 'badge-success' : r.status === 'late' ? 'badge-warning' : 'badge-danger'}`}>
                    {r.status}
                  </span>
                )
              }
            ]}
            data={subData}
            pageSize={10}
          />
        </div>
      )}

      {/* Tab 4: Time Off Sub-View */}
      {activeTab === 'time-off' && (
        <div className="time-off-subview-wrapper">
          <div className="card">
            <h4>Time Off Allocations (Leave Balances)</h4>
            <DataTable
              columns={[
                { header: 'Leave Type', accessor: 'leave_type_name' },
                { header: 'Allocated', accessor: 'allocated_amount', render: (r) => `${r.allocated_amount} ${r.unit}` },
                { header: 'Taken', accessor: 'taken_amount', render: (r) => `${r.taken_amount} ${r.unit}` },
                { header: 'Remaining Balance', accessor: 'remaining_amount', render: (r) => <strong>{r.remaining_amount} {r.unit}</strong> },
                { header: 'Valid From', accessor: 'valid_from' },
                { header: 'Valid To', accessor: 'valid_to' }
              ]}
              data={subData.allocations || []}
              pageSize={5}
            />
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h4>Leave Requests History</h4>
            <DataTable
              columns={[
                { header: 'Leave Type', accessor: 'leave_type_name' },
                { header: 'From', accessor: 'date_from' },
                { header: 'To', accessor: 'date_to' },
                { header: 'Duration', accessor: 'duration', render: (r) => `${r.duration} ${r.unit}` },
                {
                  header: 'Status',
                  accessor: 'status',
                  render: (r) => (
                    <span className={`badge ${r.status === 'approved' ? 'badge-success' : r.status === 'submitted' ? 'badge-warning' : 'badge-danger'}`}>
                      {r.status}
                    </span>
                  )
                }
              ]}
              data={subData.requests || []}
              pageSize={5}
            />
          </div>
        </div>
      )}
    </div>
  );
}
