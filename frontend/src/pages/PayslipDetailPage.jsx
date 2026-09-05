import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import {
  Printer,
  Download,
  ArrowLeft,
  Calendar,
  Building2,
  DollarSign,
  AlertTriangle,
  FileText,
  CreditCard,
  Briefcase
} from 'lucide-react';
import './PayslipDetailPage.css';

export default function PayslipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPayslip = async () => {
    try {
      setLoading(true);
      const res = await api.getPayslipById(id);
      setPayslip(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslip();
  }, [id]);

  const handlePrintPDF = async () => {
    try {
      setDownloading(true);
      const filename = `Payslip_${payslip.employee_name.replace(/\s+/g, '_')}_${payslip.period_start?.split('T')[0]}.pdf`;
      await api.downloadPayslipPDF(id, filename);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !payslip) {
    return <div className="detail-loading">Loading salary computation breakdown...</div>;
  }

  const lines = payslip.lines || [];
  const earnings = lines.filter((l) => l.category === 'basic' || l.category === 'allowance');
  const deductions = lines.filter((l) => l.category === 'deduction');

  return (
    <div className="payslip-detail-container">
      {/* Top Header */}
      <div className="page-header">
        <div className="page-title-group">
          <button className="back-nav-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back to Payrun / Payslips</span>
          </button>
          <div className="payslip-title-row">
            <h2>Payslip: {payslip.employee_name}</h2>
            <span className={`badge badge-${payslip.status === 'paid' ? 'success' : payslip.status === 'validated' ? 'warning' : 'info'}`}>
              {payslip.status}
            </span>
          </div>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={handlePrintPDF} disabled={downloading}>
            <Printer size={16} />
            <span>{downloading ? 'Rendering PDF...' : 'Print Payslip (PDF)'}</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}

      {/* Warnings Panel */}
      {(payslip.warnings || []).length > 0 && (
        <AlertBanner
          type="warning"
          title="Payslip Verification Notice"
          message={(payslip.warnings || []).map((w) => w.message).join(' | ')}
        />
      )}

      {/* Official Payslip Layout Paper */}
      <div className="card payslip-paper animate-fade-in">
        <div className="payslip-paper-header">
          <div className="paper-company-brand">
            <h3 className="company-logo-text">PeoplePay<span>360</span></h3>
            <p className="company-sub-text">Enterprise HR & Payroll Platform</p>
          </div>
          <div className="paper-status-block">
            <span className="paper-status-title">OFFICIAL SALARY COMPUTATION</span>
            <span className="paper-batch-tag">{payslip.payrun_name}</span>
          </div>
        </div>

        <div className="payslip-meta-grid">
          <div className="meta-col">
            <span className="meta-field-label">Employee Name</span>
            <strong className="meta-field-val">{payslip.employee_name}</strong>

            <span className="meta-field-label">Department</span>
            <span className="meta-field-val">{payslip.department_name}</span>

            <span className="meta-field-label">Job Position</span>
            <span className="meta-field-val">{payslip.job_title} ({payslip.employee_type})</span>
          </div>

          <div className="meta-col">
            <span className="meta-field-label">Pay Period</span>
            <span className="meta-field-val">
              {payslip.period_start?.split('T')[0]} to {payslip.period_end?.split('T')[0]}
            </span>

            <span className="meta-field-label">Salary Structure</span>
            <span className="meta-field-val">{payslip.structure_name}</span>

            <span className="meta-field-label">Worked Days</span>
            <strong className="meta-field-val" style={{ color: 'var(--color-primary)' }}>
              {payslip.worked_days} Days (Derived from Attendance & Leave)
            </strong>
          </div>

          <div className="meta-col">
            <span className="meta-field-label">Contract Base Wage</span>
            <span className="meta-field-val font-mono">
              ₹{parseFloat(payslip.contract_wage).toLocaleString('en-IN')}
            </span>

            <span className="meta-field-label">Bank Account</span>
            <span className="meta-field-val">
              {payslip.bank_account_number ? (
                <>
                  {payslip.bank_account_number} ({payslip.ifsc_code}){' '}
                  {payslip.bank_verified ? '✓' : '(Unverified)'}
                </>
              ) : (
                <span className="text-danger">NOT ENTERED</span>
              )}
            </span>
          </div>
        </div>

        {/* Rule-by-rule Sequential Breakdown Table */}
        <div className="breakdown-section">
          <h4 className="breakdown-section-title">Sequential Salary Rule Breakdown</h4>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Seq #</th>
                <th style={{ width: '150px' }}>Rule Code</th>
                <th>Description / Rule Name</th>
                <th style={{ width: '120px' }}>Category</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => {
                const isSpecial = line.category === 'gross' || line.category === 'net';
                return (
                  <tr key={idx} className={isSpecial ? 'special-rule-row' : ''}>
                    <td className="font-mono">{line.sequence}</td>
                    <td><strong className="font-mono">{line.rule_code}</strong></td>
                    <td>{line.label}</td>
                    <td>
                      <span className={`badge badge-${line.category === 'deduction' ? 'danger' : 'neutral'}`}>
                        {line.category}
                      </span>
                    </td>
                    <td className="font-mono text-right">
                      ₹{parseFloat(line.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Grand Total Summary */}
        <div className="payslip-totals-summary">
          <div className="summary-left">
            <p className="confidential-text">
              Confidential document generated automatically by the PeoplePay360 Rule Engine.
            </p>
          </div>
          <div className="summary-right">
            <div className="summary-line">
              <span>Gross Salary:</span>
              <strong className="font-mono">₹{parseFloat(payslip.gross_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div className="summary-line highlight-net">
              <span>Net Payable Salary:</span>
              <strong className="font-mono net-val">
                ₹{parseFloat(payslip.net_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
