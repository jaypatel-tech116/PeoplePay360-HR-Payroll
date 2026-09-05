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
    return <div className="page-content flex-center"><p className="text-muted">Loading payslip details...</p></div>;
  }

  const lines = payslip.lines || [];
  const earnings = lines.filter((l) => l.category === 'basic' || l.category === 'allowance');
  const deductions = lines.filter((l) => l.category === 'deduction');

  return (
    <div className="page-content payslip-print-bg">
      {/* Top Header */}
      <div className="page-header print-hide">
        <div className="breadcrumbs">
          <button className="breadcrumb-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back to Payrun
          </button>
        </div>
        
        <div className="header-flex-between mt-4">
          <div>
            <h1 className="page-title">Payslip Details</h1>
            <p className="page-subtitle mt-2">
              Viewing official salary statement for {payslip.employee_name}
            </p>
          </div>

          <div className="header-actions">
            <button className="btn btn-outline" onClick={() => window.print()} disabled={downloading}>
              <Printer size={16} />
              <span>Print</span>
            </button>
            <button className="btn btn-primary" onClick={handlePrintPDF} disabled={downloading}>
              <Download size={16} />
              <span>{downloading ? 'Rendering PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} className="print-hide" />}

      {/* Official Payslip Layout Paper */}
      <div className="payslip-paper-wrapper mt-4">
        <div className="payslip-paper animate-fade-in">
          {/* Header Section */}
          <div className="slip-header">
            <div className="slip-brand">
              <div className="brand-logo">PP</div>
              <div>
                <h3 className="company-logo-text">PeoplePay<span>360</span></h3>
                <p className="company-sub-text">123 Tech Park, Silicon Valley, CA 94025</p>
              </div>
            </div>
            <div className="slip-title">
              <h2>PAYSLIP</h2>
              <p>{new Date(payslip.period_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="slip-divider"></div>

          {/* Employee & Period Details */}
          <div className="slip-info-grid">
            <div className="info-block">
              <div className="info-row">
                <span className="info-label">Employee Name:</span>
                <span className="info-value font-medium">{payslip.employee_name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Employee ID:</span>
                <span className="info-value">EMP-{(payslip.employee_id || 0).toString().padStart(4, '0')}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Department:</span>
                <span className="info-value">{payslip.department_name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Designation:</span>
                <span className="info-value">{payslip.job_title}</span>
              </div>
            </div>
            <div className="info-block">
              <div className="info-row">
                <span className="info-label">Pay Period:</span>
                <span className="info-value">{payslip.period_start?.split('T')[0]} to {payslip.period_end?.split('T')[0]}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Paid Days:</span>
                <span className="info-value font-medium">{payslip.worked_days}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Bank Name:</span>
                <span className="info-value">{payslip.bank_name || 'Standard Chartered'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Account No:</span>
                <span className="info-value font-mono">{payslip.bank_account_number || 'XXXXXXXX1234'}</span>
              </div>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="slip-breakdown-container mt-6">
            <div className="slip-earnings">
              <div className="breakdown-header">
                <h4>Earnings</h4>
                <h4>Amount</h4>
              </div>
              <div className="breakdown-body">
                {earnings.map((line, idx) => (
                  <div className="breakdown-row" key={idx}>
                    <span>{line.label || line.rule_code}</span>
                    <span>₹{parseFloat(line.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
              <div className="breakdown-footer">
                <span>Gross Earnings</span>
                <span className="font-bold">₹{parseFloat(payslip.gross_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="slip-deductions">
              <div className="breakdown-header">
                <h4>Deductions</h4>
                <h4>Amount</h4>
              </div>
              <div className="breakdown-body">
                {deductions.map((line, idx) => (
                  <div className="breakdown-row" key={idx}>
                    <span>{line.label || line.rule_code}</span>
                    <span>₹{parseFloat(line.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                {deductions.length === 0 && (
                  <div className="breakdown-row text-muted" style={{ fontStyle: 'italic' }}>
                    <span>No deductions</span>
                    <span>₹0.00</span>
                  </div>
                )}
              </div>
              <div className="breakdown-footer">
                <span>Total Deductions</span>
                <span className="font-bold">
                  ₹{parseFloat(
                    (payslip.gross_amount || 0) - (payslip.net_amount || 0)
                  ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="slip-net-pay-box mt-6">
            <div className="net-pay-content">
              <div>
                <p className="net-pay-label">Net Payable Amount</p>
                <p className="net-pay-words text-muted mt-1">Amount transferred to bank account</p>
              </div>
              <h2 className="net-pay-amount">
                ₹{parseFloat(payslip.net_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          {/* Footer */}
          <div className="slip-footer mt-8">
            <p>This is a system generated document. No signature is required.</p>
            <p>Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} by PeoplePay360</p>
          </div>
        </div>
      </div>
    </div>
  );
}
