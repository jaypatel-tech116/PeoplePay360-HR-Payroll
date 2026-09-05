import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import PayrunWizardModal from '../components/PayrunWizardModal';
import AlertBanner from '../components/AlertBanner';
import { Plus, DollarSign, Calendar, AlertTriangle, CheckCircle2, Search, FileText, Settings, PlayCircle } from 'lucide-react';
import './PayrunsPage.css';

export default function PayrunsPage() {
  const navigate = useNavigate();
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredPayruns = payruns.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns = [
    {
      header: 'PAYRUN NAME',
      accessor: 'name',
      render: (r) => (
        <div className="td-payrun-name">
          <span className="font-medium text-main">{r.name}</span>
          <span className="text-muted text-xs">{r.structure_name}</span>
        </div>
      )
    },
    {
      header: 'PERIOD',
      accessor: 'period_start',
      render: (r) => (
        <span>
          {r.period_start ? new Date(r.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} - {r.period_end ? new Date(r.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
        </span>
      )
    },
    {
      header: 'EMPLOYEES',
      accessor: 'employee_count',
      render: (r) => <span className="font-medium">{r.employee_count || 0}</span>
    },
    {
      header: 'TOTAL AMOUNT',
      accessor: 'total_net',
      render: (r) => (
        <span className="font-bold text-main">
          ₹{parseFloat(r.total_net || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (r) => {
        const statusMap = {
          draft: { label: 'Draft', class: 'badge-neutral' },
          computed: { label: 'Computed', class: 'badge-info' },
          validated: { label: 'Validated', class: 'badge-warning' },
          paid: { label: 'Completed', class: 'badge-success' }
        };
        const s = statusMap[r.status] || statusMap.draft;
        return (
          <span className={`badge ${s.class}`}>
            <span className="status-dot"></span>
            {s.label}
          </span>
        );
      }
    },
    {
      header: 'ACTIONS',
      accessor: 'id',
      align: 'right',
      render: (r) => (
        <button
          className="btn btn-outline btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/payroll/payruns/${r.id}`);
          }}
        >
          View Details
        </button>
      )
    }
  ];

  const activeCount = payruns.filter(p => p.status !== 'paid').length;
  const processedCount = payruns.filter(p => p.status === 'paid').length;
  const totalAmount = payruns.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.total_net || 0), 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="breadcrumbs">
          <span>Payroll</span>
          <span>/</span>
          <span>Overview</span>
        </div>
        <div className="page-title-wrapper">
          <div>
            <h1 className="page-title">Payroll</h1>
            <p className="page-subtitle">Manage payruns, process salaries and view payslips.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsWizardOpen(true)}>
            <PlayCircle size={16} />
            <span>Run Payroll</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}

      <div className="tabs-container mb-6">
        <button className="tab-btn active">Payruns</button>
        <button className="tab-btn" onClick={() => navigate('/payroll/payslips')}>Payslips</button>
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon-wrap bg-info-light text-info">
            <PlayCircle size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">Active Payruns</p>
            <h3 className="kpi-value">{activeCount}</h3>
            <p className="kpi-trend text-muted">In progress</p>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon-wrap bg-success-light text-success">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">Processed This Month</p>
            <h3 className="kpi-value">{processedCount}</h3>
            <p className="kpi-trend text-muted">Completed runs</p>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon-wrap bg-primary-light text-primary">
            <DollarSign size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">Total Payroll</p>
            <h3 className="kpi-value">₹{totalAmount > 0 ? (totalAmount / 1000).toFixed(0) + 'k' : '0'}</h3>
            <p className="kpi-trend text-muted">This month</p>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-icon-wrap bg-danger-light text-danger">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">Failed Runs</p>
            <h3 className="kpi-value">0</h3>
            <p className="kpi-trend text-muted">Requires attention</p>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header border-b flex-between">
          <h3 className="card-title">Recent Payruns</h3>
          <div className="search-wrapper" style={{ width: '250px' }}>
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search payruns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={filteredPayruns}
            onRowClick={(r) => navigate(`/payroll/payruns/${r.id}`)}
            pageSize={10}
          />
        </div>
      </div>

      <PayrunWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onPayrunCreated={handlePayrunCreated}
      />
    </div>
  );
}
