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
  ShieldCheck,
  Lock,
  Trash2,
  Users,
  TrendingDown,
  TrendingUp,
  CreditCard
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
    return <div className="page-content flex-center"><p className="text-muted">Loading payrun details...</p></div>;
  }

  const isLocked = payrun.status === 'paid';
  const isComputed = payrun.status === 'computed';
  const isValidated = payrun.status === 'validated';
  const isDraft = payrun.status === 'draft';

  const payslipsColumns = [
    {
      header: 'EMPLOYEE',
      accessor: 'employee_name',
      render: (r) => (
        <div className="td-employee">
          <div className="td-avatar">{r.employee_name.charAt(0).toUpperCase()}</div>
          <div className="td-emp-details">
            <span className="td-emp-name">{r.employee_name}</span>
            <span className="td-emp-sub">{r.department_name}</span>
          </div>
        </div>
      )
    },
    {
      header: 'BASIC PAY',
      accessor: 'basic', // Using gross as placeholder for visual
      render: (r) => <span className="font-medium text-main">₹{parseFloat(r.gross_amount * 0.4).toLocaleString('en-IN')}</span>
    },
    {
      header: 'ALLOWANCES',
      accessor: 'allowances',
      render: (r) => <span className="font-medium text-success">₹{parseFloat(r.gross_amount * 0.6).toLocaleString('en-IN')}</span>
    },
    {
      header: 'GROSS',
      accessor: 'gross_amount',
      render: (r) => <span className="font-bold text-main">₹{parseFloat(r.gross_amount).toLocaleString('en-IN')}</span>
    },
    {
      header: 'DEDUCTIONS',
      accessor: 'deductions',
      render: (r) => <span className="font-medium text-danger">₹{parseFloat(r.gross_amount - r.net_amount).toLocaleString('en-IN')}</span>
    },
    {
      header: 'NET PAY',
      accessor: 'net_amount',
      render: (r) => (
        <span className="font-bold text-primary">
          ₹{parseFloat(r.net_amount).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (r) => (
        r.has_warnings ? (
          <span className="badge badge-warning">
            <span className="status-dot"></span> Needs Review
          </span>
        ) : (
          <span className="badge badge-success">
            <span className="status-dot"></span> Clean
          </span>
        )
      )
    },
    {
      header: 'ACTIONS',
      accessor: 'id',
      align: 'right',
      render: (r) => (
        <div className="table-actions">
          <button
            className="btn-text"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/payroll/payslips/${r.id}`);
            }}
          >
            View Payslip
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="breadcrumbs">
          <button className="breadcrumb-btn" onClick={() => navigate('/payroll/payruns')}>
            <ArrowLeft size={14} /> Back to Payruns
          </button>
        </div>
        
        <div className="header-flex-between mt-4">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-title">{payrun.name}</h1>
              <span className={`badge ${payrun.status === 'paid' ? 'badge-success' : payrun.status === 'validated' ? 'badge-warning' : 'badge-info'}`} style={{ padding: '6px 12px', fontSize: '0.875rem' }}>
                <span className="status-dot"></span>
                {payrun.status.replace(/^\w/, c => c.toUpperCase())}
              </span>
            </div>
            <p className="page-subtitle mt-2">
              Pay Period: {payrun.period_start?.split('T')[0]} to {payrun.period_end?.split('T')[0]} • Structure: {payrun.structure_name}
            </p>
          </div>

          <div className="header-actions">
            {!isLocked && !isValidated && (
              <>
                <button className="btn btn-outline text-danger border-danger">
                  <Trash2 size={16} />
                  <span>Discard</span>
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCompute}
                  disabled={actionLoading}
                >
                  <Calculator size={16} />
                  <span>{isComputed ? 'Re-Compute' : 'Compute'}</span>
                </button>
                {isComputed && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleValidate(false)}
                    disabled={actionLoading}
                  >
                    <ShieldCheck size={16} />
                    <span>Validate Payrun</span>
                  </button>
                )}
              </>
            )}

            {isValidated && (
              <button
                className="btn btn-success"
                onClick={handleMarkPaid}
                disabled={actionLoading}
              >
                <CheckCircle2 size={16} />
                <span>Mark as Paid</span>
              </button>
            )}

            {(isValidated || isLocked) && (
              <button
                className="btn btn-primary"
                onClick={handleSendPayslips}
                disabled={actionLoading}
              >
                <Send size={16} />
                <span>Send Payslips</span>
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
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      {blockingWarnings.length > 0 && (
        <AlertBanner
          type="warning"
          title="Validation Blocked: Critical Warnings"
          message={`Unresolved warnings exist for: ${blockingWarnings.map((w) => `${w.employee_name} (${w.type})`).join(', ')}.`}
          actions={
            <button className="btn btn-warning btn-sm" onClick={() => handleValidate(true)} disabled={actionLoading}>
              Force Validate
            </button>
          }
        />
      )}

      {/* KPI Metrics */}
      <div className="kpi-grid mb-6">
        <div className="card stat-card">
          <div className="stat-icon-wrap bg-info-light text-info">
            <Users size={20} />
          </div>
          <div>
            <p className="stat-label">Employees Processed</p>
            <p className="stat-value">{payrun.payslips?.length || 0}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrap bg-success-light text-success">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="stat-label">Total Gross</p>
            <p className="stat-value">₹{parseFloat(payrun.total_gross || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrap bg-danger-light text-danger">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="stat-label">Total Deductions</p>
            <p className="stat-value">₹{parseFloat((payrun.total_gross || 0) - (payrun.total_net || 0)).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrap bg-primary-light text-primary">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="stat-label">Net Payable</p>
            <p className="stat-value">₹{parseFloat(payrun.total_net || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Warnings Panel */}
      {(payrun.warnings || []).length > 0 && (
        <div className="card mb-6 border-warning">
          <div className="card-header border-b bg-warning-light">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} className="text-warning" />
              <h4 className="m-0 text-warning">Batch Warnings ({payrun.warnings.length})</h4>
            </div>
          </div>
          <div className="card-body">
            <div className="warnings-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {payrun.warnings.map((w, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem' }}>
                  <span className="badge badge-warning">{w.type}</span>
                  <strong>{w.employee_name}:</strong>
                  <span className="text-muted">{w.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payslips Table */}
      <div className="card">
        <div className="card-header border-b">
          <h3 className="card-title">Salary Computation</h3>
        </div>
        <div className="card-body p-0">
          <DataTable
            columns={payslipsColumns}
            data={payrun.payslips || []}
            searchKey="employee_name"
            searchPlaceholder="Search employees..."
            onRowClick={(r) => navigate(`/payroll/payslips/${r.id}`)}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
