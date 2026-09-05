import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import AlertBanner from '../components/AlertBanner';
import {
  Calculator,
  CheckCircle2,
  DollarSign,
  Send,
  AlertTriangle,
  FileText,
  ArrowLeft,
  Mail,
  Lock
} from 'lucide-react';
import './PayrunDetailPage.css';

export default function PayrunDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payrun, setPayrun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [blockingWarnings, setBlockingWarnings] = useState([]);

  const fetchPayrun = async () => {
    try {
      setLoading(true);
      const res = await api.getPayrunById(id);
      setPayrun(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrun();
  }, [id]);

  const handleCompute = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      setBlockingWarnings([]);
      const res = await api.computePayrun(id);
      setSuccess(res.message);
      fetchPayrun();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async (force = false) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      setBlockingWarnings([]);
      const res = await api.validatePayrun(id, force);
      setSuccess(res.message);
      fetchPayrun();
    } catch (err) {
      if (err.blockingWarnings) {
        setBlockingWarnings(err.blockingWarnings);
      }
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!window.confirm('Mark this payrun batch as Paid? This will finalize and lock historical records.')) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      const res = await api.markPaidPayrun(id);
      setSuccess(res.message);
      fetchPayrun();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendPayslips = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      const res = await api.sendPayrunPayslips(id);
      setSuccess(res.message);
      fetchPayrun();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !payrun) {
    return <div className="detail-loading">Loading payrun batch processing screen...</div>;
  }

  const isLocked = payrun.status === 'paid';
  const isComputed = payrun.status === 'computed';
  const isValidated = payrun.status === 'validated';

  const payslipsColumns = [
    {
      header: 'Employee',
      accessor: 'employee_name',
      render: (r) => (
        <div>
          <strong>{r.employee_name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {r.job_title} • {r.department_name} ({r.employee_type})
          </div>
        </div>
      )
    },
    {
      header: 'Worked Days',
      accessor: 'worked_days',
      render: (r) => `${r.worked_days} days`
    },
    {
      header: 'Gross Salary',
      accessor: 'gross_amount',
      render: (r) => <span className="font-mono">₹{parseFloat(r.gross_amount).toLocaleString('en-IN')}</span>
    },
    {
      header: 'Net Salary',
      accessor: 'net_amount',
      render: (r) => (
        <strong className="font-mono" style={{ color: 'var(--color-primary)' }}>
          ₹{parseFloat(r.net_amount).toLocaleString('en-IN')}
        </strong>
      )
    },
    {
      header: 'Warnings',
      accessor: 'has_warnings',
      render: (r) => (
        r.has_warnings ? (
          <span className="badge badge-warning">
            <AlertTriangle size={12} /> {r.warnings_count || 1} Issue
          </span>
        ) : (
          <span className="badge badge-success"><CheckCircle2 size={12} /> Clean</span>
        )
      )
    },
    {
      header: 'Delivery',
      accessor: 'email_sent',
      render: (r) => (
        r.email_sent ? (
          <span className="badge badge-success"><Mail size={12} /> Emailed</span>
        ) : (
          <span className="badge badge-neutral">Not Sent</span>
        )
      )
    },
    {
      header: 'Action',
      accessor: 'id',
      align: 'right',
      render: (r) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/payroll/payslips/${r.id}`);
          }}
        >
          <FileText size={13} />
          <span>View Slip</span>
        </button>
      )
    }
  ];

  return (
    <div className="payrun-detail-container">
      {/* Top Header */}
      <div className="page-header">
        <div className="page-title-group">
          <button className="back-nav-btn" onClick={() => navigate('/payroll/payruns')}>
            <ArrowLeft size={16} />
            <span>Payrun Batches</span>
          </button>
          <div className="batch-title-row">
            <h2>{payrun.name}</h2>
            <span className={`badge badge-lg badge-${payrun.status === 'paid' ? 'success' : payrun.status === 'validated' ? 'warning' : 'info'}`}>
              {payrun.status}
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar (B6) */}
        <div className="payrun-action-bar">
          {!isLocked && !isValidated && (
            <button
              className="btn btn-primary"
              onClick={handleCompute}
              disabled={actionLoading}
            >
              <Calculator size={16} />
              <span>{isComputed ? 'Re-Compute Salary Rules' : 'Compute Salary Rules'}</span>
            </button>
          )}

          {isComputed && (
            <button
              className="btn btn-success"
              onClick={() => handleValidate(false)}
              disabled={actionLoading}
            >
              <CheckCircle2 size={16} />
              <span>Validate Payrun</span>
            </button>
          )}

          {isValidated && (
            <button
              className="btn btn-success"
              onClick={handleMarkPaid}
              disabled={actionLoading}
            >
              <DollarSign size={16} />
              <span>Mark as Paid & Disburse</span>
            </button>
          )}

          {(isValidated || isLocked) && (
            <button
              className="btn btn-outline-primary"
              onClick={handleSendPayslips}
              disabled={actionLoading}
            >
              <Send size={16} />
              <span>Send Payslips (Bulk Email)</span>
            </button>
          )}

          {isLocked && (
            <div className="locked-badge-indicator">
              <Lock size={15} />
              <span>Historically Locked</span>
            </div>
          )}
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      {/* Critical Warnings Gate Alert (B6 / Critical Rule #5) */}
      {blockingWarnings.length > 0 && (
        <AlertBanner
          type="warning"
          title="Validation Blocked: Critical Warnings Detected"
          message={`Unresolved warnings exist for: ${blockingWarnings.map((w) => `${w.employee_name} (${w.type})`).join(', ')}. Resolve these issues or force validation.`}
          actions={
            <button
              className="btn btn-warning btn-sm"
              onClick={() => handleValidate(true)}
              disabled={actionLoading}
            >
              Force Validate Anyway
            </button>
          }
        />
      )}

      {/* Batch Summary Metrics */}
      <div className="payrun-metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Structure</span>
          <strong className="metric-val-text">{payrun.structure_name}</strong>
        </div>
        <div className="metric-box">
          <span className="metric-label">Period</span>
          <strong className="metric-val-text">
            {payrun.period_start?.split('T')[0]} to {payrun.period_end?.split('T')[0]}
          </strong>
        </div>
        <div className="metric-box">
          <span className="metric-label">Total Gross</span>
          <strong className="metric-val-mono">₹{parseFloat(payrun.total_gross || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div className="metric-box">
          <span className="metric-label">Total Net Payable</span>
          <strong className="metric-val-mono" style={{ color: 'var(--color-primary)' }}>
            ₹{parseFloat(payrun.total_net || 0).toLocaleString('en-IN')}
          </strong>
        </div>
        <div className="metric-box">
          <span className="metric-label">Warnings</span>
          <strong className="metric-val-text" style={{ color: (payrun.warnings || []).length > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
            {(payrun.warnings || []).length} Issues
          </strong>
        </div>
      </div>

      {/* Warnings Panel */}
      {(payrun.warnings || []).length > 0 && (
        <div className="card warnings-panel-card">
          <div className="warnings-header">
            <AlertTriangle size={18} className="text-warning" />
            <h4>Batch Operational Warnings (Gate Checklist)</h4>
          </div>
          <div className="warnings-list">
            {payrun.warnings.map((w, idx) => (
              <div key={idx} className="warning-item-row">
                <span className="warning-type-chip">{w.type}</span>
                <span className="warning-emp-tag">{w.employee_name}:</span>
                <span className="warning-message-text">{w.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payslips Table */}
      <div className="card">
        <div className="sub-header">
          <h4>Batch Generated Payslips ({payrun.payslips?.length || 0})</h4>
          <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
            Click any row to open the line-item salary computation breakdown
          </span>
        </div>

        <DataTable
          columns={payslipsColumns}
          data={payrun.payslips || []}
          searchKey="employee_name"
          searchPlaceholder="Filter payslips..."
          onRowClick={(r) => navigate(`/payroll/payslips/${r.id}`)}
          pageSize={12}
        />
      </div>
    </div>
  );
}
