import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import PayrunWizardModal from '../components/PayrunWizardModal';
import AlertBanner from '../components/AlertBanner';
import { Plus, DollarSign, Calendar, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import './PayrunsPage.css';

export default function PayrunsPage() {
  const navigate = useNavigate();
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const fetchPayruns = async () => {
    try {
      setLoading(true);
      const res = await api.getPayruns();
      setPayruns(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayruns();
  }, []);

  const handlePayrunCreated = (newPayrun) => {
    navigate(`/payroll/payruns/${newPayrun.id}`);
  };

  const columns = [
    {
      header: 'Payrun Batch',
      accessor: 'name',
      render: (r) => (
        <div>
          <strong style={{ fontSize: '0.9375rem' }}>{r.name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.structure_name}</div>
        </div>
      )
    },
    {
      header: 'Period Dates',
      accessor: 'period_start',
      render: (r) => (
        <span style={{ fontSize: '0.8125rem' }}>
          {r.period_start ? r.period_start.split('T')[0] : ''} → {r.period_end ? r.period_end.split('T')[0] : ''}
        </span>
      )
    },
    {
      header: 'Scope',
      accessor: 'employee_count',
      render: (r) => `${r.employee_count || 0} employees`
    },
    {
      header: 'Gross Total',
      accessor: 'total_gross',
      render: (r) => (
        <span className="font-mono">₹{parseFloat(r.total_gross || 0).toLocaleString('en-IN')}</span>
      )
    },
    {
      header: 'Net Total',
      accessor: 'total_net',
      render: (r) => (
        <strong className="font-mono" style={{ color: 'var(--color-primary)' }}>
          ₹{parseFloat(r.total_net || 0).toLocaleString('en-IN')}
        </strong>
      )
    },
    {
      header: 'Warnings',
      accessor: 'total_warnings_count',
      render: (r) => {
        const count = parseInt(r.total_warnings_count || 0, 10);
        if (count === 0) {
          return <span className="badge badge-success"><CheckCircle2 size={12} /> Clean</span>;
        }
        return (
          <span className="badge badge-warning">
            <AlertTriangle size={12} /> {count} warning{count === 1 ? '' : 's'}
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => {
        const badges = {
          draft: 'badge-neutral',
          computed: 'badge-info',
          validated: 'badge-warning',
          paid: 'badge-success'
        };
        return <span className={`badge ${badges[r.status] || 'badge-neutral'}`}>{r.status}</span>;
      }
    }
  ];

  return (
    <div className="payruns-page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h2>Payrun Batches</h2>
          <span className="page-subtitle">Batch payroll processing, calculation engine runs & salary delivery</span>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setIsWizardOpen(true)}>
            <Plus size={16} />
            <span>New Payrun Wizard</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}

      <DataTable
        columns={columns}
        data={payruns}
        searchKey="name"
        searchPlaceholder="Search payrun batches..."
        onRowClick={(r) => navigate(`/payroll/payruns/${r.id}`)}
      />

      <PayrunWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onPayrunCreated={handlePayrunCreated}
      />
    </div>
  );
}
