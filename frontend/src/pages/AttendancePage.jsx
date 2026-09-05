import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { useAuth } from '../context/AuthContext';
import { Clock, LogIn, LogOut, Edit, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';
import './AttendancePage.css';

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [todayStatus, setTodayStatus] = useState({ checkedIn: false, record: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Manual correction modal state
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [targetAttendance, setTargetAttendance] = useState(null);
  const [correctionCheckIn, setCorrectionCheckIn] = useState('');
  const [correctionCheckOut, setCorrectionCheckOut] = useState('');
  const [correctionNote, setCorrectionNote] = useState('');

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
      fetchAttendanceData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      setError(null);
      await api.checkOut();
      setSuccess('Check-out logged successfully. Worked hours recorded!');
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
      header: 'Check In',
      accessor: 'check_in',
      render: (r) => new Date(r.check_in).toLocaleString()
    },
    {
      header: 'Check Out',
      accessor: 'check_out',
      render: (r) => (
        r.check_out ? (
          new Date(r.check_out).toLocaleString()
        ) : (
          <span className="badge badge-warning">Missing / Open</span>
        )
      )
    },
    {
      header: 'Worked Hours',
      accessor: 'worked_hours',
      render: (r) => <span className="font-mono font-bold">{parseFloat(r.worked_hours || 0).toFixed(2)} hrs</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => {
        const badges = {
          normal: 'badge-success',
          late: 'badge-warning',
          overtime: 'badge-info',
          missing_checkout: 'badge-danger',
          corrected: 'badge-neutral'
        };
        return <span className={`badge ${badges[r.status] || 'badge-neutral'}`}>{r.status.replace('_', ' ')}</span>;
      }
    },
    {
      header: 'Correction Audit',
      accessor: 'correction_note',
      render: (r) => (
        r.corrected_by_name ? (
          <div style={{ fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>By {r.corrected_by_name}:</span>
            <p style={{ fontStyle: 'italic', margin: 0 }}>&quot;{r.correction_note}&quot;</p>
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
        )
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      align: 'right',
      render: (r) => (
        canCorrect ? (
          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenCorrection(r)}>
            <Edit size={13} />
            <span>Correct</span>
          </button>
        ) : null
      )
    }
  ];

  return (
    <div className="attendance-page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h2>Daily Attendance Log & Check-In Terminal</h2>
          <span className="page-subtitle">Punch records, overtime tracking, and HR audit correction workflows</span>
        </div>

        {/* Live Terminal Punch Widget */}
        <div className="attendance-punch-box">
          {todayStatus.checkedIn ? (
            <button className="btn btn-danger" onClick={handleCheckOut}>
              <LogOut size={16} />
              <span>Check Out Now</span>
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleCheckIn}>
              <LogIn size={16} />
              <span>Check In Now</span>
            </button>
          )}
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      <DataTable
        columns={columns}
        data={attendances}
        searchKey="employee_name"
        searchPlaceholder="Search attendance by employee..."
        pageSize={12}
      />

      {/* Manual HR Correction Modal */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title={`Audit Correction for ${targetAttendance?.employee_name}`}
        maxWidth="540px"
      >
        <form onSubmit={handleSaveCorrection} className="correction-form">
          <div className="form-group">
            <label className="form-label">Check-In Timestamp *</label>
            <input
              type="datetime-local"
              className="form-input"
              value={correctionCheckIn}
              onChange={(e) => setCorrectionCheckIn(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Check-Out Timestamp</label>
            <input
              type="datetime-local"
              className="form-input"
              value={correctionCheckOut}
              onChange={(e) => setCorrectionCheckOut(e.target.value)}
            />
            <span className="form-helper">
              Leave blank if employee was absent or still clocked in.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Correction Reason / Audit Note *</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              placeholder="e.g. Employee forgot to punch out due to client visit. Verified with manager."
              required
            />
            <span className="form-helper">
              This note is permanently recorded with your user ID for compliance auditing.
            </span>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsCorrectionModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Audited Correction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
