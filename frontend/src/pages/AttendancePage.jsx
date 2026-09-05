import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { useAuth } from '../context/AuthContext';
import { Clock, LogIn, LogOut, Edit, Search, UserCheck, UserX, AlertCircle, Calendar } from 'lucide-react';
import './AttendancePage.css';

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [todayStatus, setTodayStatus] = useState({ checkedIn: false, record: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Manual correction modal state
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [targetAttendance, setTargetAttendance] = useState(null);
  const [correctionCheckIn, setCorrectionCheckIn] = useState('');
  const [correctionCheckOut, setCorrectionCheckOut] = useState('');
  const [correctionNote, setCorrectionNote] = useState('');

  // Mark Attendance modal
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);

  const canCorrect = ['HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'].includes(user.role);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [attList, today] = await Promise.all([
        api.getAttendances(),
        api.getTodayAttendance()
      ]);
      setAttendances(attList);
      setTodayStatus(today);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setError(null);
      await api.checkIn();
      setSuccess('Check-in logged successfully!');
      setIsMarkModalOpen(false);
      fetchAttendanceData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      setError(null);
      await api.checkOut();
      setSuccess('Check-out logged successfully!');
      setIsMarkModalOpen(false);
      fetchAttendanceData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenCorrection = (record) => {
    setTargetAttendance(record);
    setCorrectionCheckIn(record.check_in ? record.check_in.substring(0, 16) : '');
    setCorrectionCheckOut(record.check_out ? record.check_out.substring(0, 16) : '');
    setCorrectionNote(record.correction_note || '');
    setIsCorrectionModalOpen(true);
  };

  const handleSaveCorrection = async (e) => {
    e.preventDefault();
    if (!correctionNote.trim()) {
      setError('A correction audit note explaining the manual adjustment is required.');
      return;
    }

    try {
      setError(null);
      await api.correctAttendance(targetAttendance.id, {
        check_in: correctionCheckIn,
        check_out: correctionCheckOut || null,
        correction_note: correctionNote
      });
      setSuccess('Attendance record corrected and audit logged.');
      setIsCorrectionModalOpen(false);
      fetchAttendanceData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredAttendances = attendances.filter(att => {
    const matchesSearch = att.employee_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || att.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
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
    {
      header: 'DATE',
      accessor: 'check_in',
      render: (r) => new Date(r.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      header: 'CHECK IN',
      accessor: 'check_in',
      render: (r) => new Date(r.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    },
    {
      header: 'CHECK OUT',
      accessor: 'check_out',
      render: (r) => r.check_out ? new Date(r.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'
    },
    {
      header: 'WORKED HOURS',
      accessor: 'worked_hours',
      render: (r) => <span className="font-medium">{parseFloat(r.worked_hours || 0).toFixed(2)}h</span>
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (r) => {
        const badges = {
          normal: 'badge-success',
          late: 'badge-warning',
          overtime: 'badge-info',
          missing_checkout: 'badge-danger',
          corrected: 'badge-neutral'
        };
        return (
          <span className={`badge ${badges[r.status] || 'badge-neutral'}`}>
            <span className="status-dot"></span>
            {r.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        );
      }
    },
    {
      header: 'ACTIONS',
      accessor: 'id',
      render: (r) => (
        canCorrect ? (
          <button className="btn-text" onClick={() => handleOpenCorrection(r)}>
            Edit
          </button>
        ) : null
      )
    }
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="breadcrumbs">
          <span>HR Management</span>
          <span>/</span>
          <span>Attendance</span>
        </div>
        <div className="page-title-wrapper">
          <div>
            <h1 className="page-title">Attendance</h1>
            <p className="page-subtitle">Monitor daily attendance, view records, and manage schedules.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsMarkModalOpen(true)}>
            <Clock size={16} />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon-wrap bg-success-light text-success">
            <UserCheck size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">Present Today</p>
            <h3 className="kpi-value">
              {attendances.filter(a => new Date(a.check_in).toDateString() === new Date().toDateString()).length}
            </h3>
            <p className="kpi-trend text-muted">Out of {attendances.length > 0 ? new Set(attendances.map(a => a.employee_name)).size : 0} total</p>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon-wrap bg-danger-light text-danger">
            <UserX size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">Absent</p>
            <h3 className="kpi-value">0</h3>
            <p className="kpi-trend text-muted">Today</p>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon-wrap bg-warning-light text-warning">
            <AlertCircle size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">Late</p>
            <h3 className="kpi-value">
              {attendances.filter(a => new Date(a.check_in).toDateString() === new Date().toDateString() && a.status === 'late').length}
            </h3>
            <p className="kpi-trend text-muted">Today</p>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon-wrap bg-info-light text-info">
            <Calendar size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">On Leave</p>
            <h3 className="kpi-value">0</h3>
            <p className="kpi-trend text-muted">Today</p>
          </div>
        </div>
      </div>

      <div className="card">
        {/* Filter Bar */}
        <div className="emp-filter-bar">
          <div className="search-wrapper flex-1">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by employee name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-dropdowns">
            <select
              className="form-select filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="normal">Normal</option>
              <option value="late">Late</option>
              <option value="overtime">Overtime</option>
              <option value="missing_checkout">Missing Checkout</option>
            </select>
          </div>
        </div>

        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={filteredAttendances}
            pageSize={10}
          />
        </div>
      </div>

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        title="Mark Attendance"
        maxWidth="400px"
      >
        <div className="mark-attendance-modal">
          <div className="current-time-display">
            <h2>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</h2>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="punch-actions">
            {!todayStatus.checkedIn ? (
              <button className="btn btn-primary w-100 punch-btn" onClick={handleCheckIn}>
                <LogIn size={20} />
                <span>Clock In</span>
              </button>
            ) : (
              <button className="btn w-100 punch-btn" style={{ backgroundColor: 'var(--danger)', color: 'white' }} onClick={handleCheckOut}>
                <LogOut size={20} />
                <span>Clock Out</span>
              </button>
            )}
          </div>
          <p className="punch-helper text-muted text-center mt-4" style={{ fontSize: '0.875rem' }}>
            Your location and IP address will be recorded.
          </p>
        </div>
      </Modal>

      {/* Manual HR Correction Modal */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="Edit Attendance Record"
        maxWidth="500px"
      >
        <form onSubmit={handleSaveCorrection} className="correction-form">
          <div className="form-group">
            <label className="form-label">Check-In Time *</label>
            <input
              type="datetime-local"
              className="form-input"
              value={correctionCheckIn}
              onChange={(e) => setCorrectionCheckIn(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Check-Out Time</label>
            <input
              type="datetime-local"
              className="form-input"
              value={correctionCheckOut}
              onChange={(e) => setCorrectionCheckOut(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Correction Note *</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              placeholder="Reason for editing this record..."
              required
            />
          </div>
          <div className="modal-footer-actions">
            <button type="button" className="btn btn-outline" onClick={() => setIsCorrectionModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
