import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';
import AlertBanner from '../components/AlertBanner';
import {
  DollarSign,
  Calendar,
  Activity,
  Building2,
  TrendingUp,
  Clock,
  Filter,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import './DashboardPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters (User Correction #1: Employee Type filter included!)
  const [period] = useState('all');
  const [department, setDepartment] = useState('all');
  const [employeeType, setEmployeeType] = useState('all');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard({
        period,
        department,
        employeeType
      });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [period, department, employeeType]);

  if (loading && !data) {
    return (
      <div className="dashboard-loading">
        <Activity className="animate-spin" size={32} />
        <p>Loading live payroll aggregations...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const alerts = data?.alerts || {};
  const filterOptions = data?.filterOptions || {};

  // Bar Chart: Salary Cost by Department
  const deptBarData = {
    labels: (charts.deptCosts || []).map((d) => d.department),
    datasets: [
      {
        label: 'Net Salary Paid (₹)',
        data: (charts.deptCosts || []).map((d) => parseFloat(d.total_net_expenditure || 0)),
        backgroundColor: '#6366f1',
        borderRadius: 6
      },
      {
        label: 'Active Base Wage (₹)',
        data: (charts.deptCosts || []).map((d) => parseFloat(d.total_wage || 0)),
        backgroundColor: '#cbd5e1',
        borderRadius: 6
      }
    ]
  };

  // Line Chart: Monthly Trend
  const trendLineData = {
    labels: (charts.monthlyTrend || []).map((t) => t.month_label),
    datasets: [
      {
        label: 'Monthly Net Disbursement (₹)',
        data: (charts.monthlyTrend || []).map((t) => parseFloat(t.monthly_net_total || 0)),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointRadius: 5
      }
    ]
  };

  return (
    <div className="dashboard-container">
      {/* Header & Live Filter Bar */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>Payroll & HR Operations Dashboard</h2>
          <span className="page-subtitle">Real-time live database analytics & compliance monitoring</span>
        </div>

        {/* Filters */}
        <div className="filter-toolbar">
          <div className="filter-group">
            <Filter size={14} className="filter-icon" />
            <span className="filter-label">Filters:</span>
          </div>

          <div className="filter-group">
            <select
              className="form-select filter-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {(filterOptions.departments || []).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* User Correction #1: Employee Type filter wired to employee_type column */}
          <div className="filter-group">
            <select
              className="form-select filter-select"
              value={employeeType}
              onChange={(e) => setEmployeeType(e.target.value)}
            >
              <option value="all">All Employee Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </div>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <MetricCard
          title="Total Net Salary Paid"
          value={`₹${(kpis.totalNetPaid || 0).toLocaleString('en-IN')}`}
          subtitle={`${kpis.totalPayslips || 0} finalized payslips`}
          icon={DollarSign}
          color="primary"
        />

        <MetricCard
          title="Average Net Salary"
          value={`₹${Math.round(kpis.avgSalary || 0).toLocaleString('en-IN')}`}
          subtitle="Per paid employee"
          icon={TrendingUp}
          color="info"
        />

        <MetricCard
          title="Approved Time Off"
          value={`${kpis.approvedLeaveDays || 0} Days`}
          subtitle={`${kpis.pendingLeaveRequests || 0} pending approvals`}
          icon={Calendar}
          color="warning"
        />

        <MetricCard
          title="Attendance Health"
          value={`${kpis.attendanceHealthPct || 100}%`}
          subtitle={`${kpis.attendanceStats?.normal_count || 0} normal / ${kpis.attendanceStats?.total_attendances || 0} shifts`}
          icon={Activity}
          color="success"
        />
      </div>

      {/* Operational Alerts & Attention Needed */}
      {alerts.missingBankCount > 0 && (
        <AlertBanner
          type="warning"
          title={`Action Needed: ${alerts.missingBankCount} Employee(s) Missing Verified Bank Details`}
          message={`Payslips cannot disburse to: ${alerts.missingBankEmployees.map((e) => e.full_name).join(', ')}. Please update bank account and IFSC code.`}
        />
      )}

      {/* Charts Section */}
      <div className="dashboard-charts-grid">
        <div className="card chart-card">
          <div className="chart-header">
            <div className="chart-title-group">
              <h4>Salary Cost by Department</h4>
              <p className="chart-subtitle">Live breakdown of net salary payout vs active contractual wage</p>
            </div>
            <Building2 size={20} className="chart-header-icon" />
          </div>
          <div className="chart-body">
            <Bar
              data={deptBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => ` ₹${Number(ctx.raw).toLocaleString('en-IN')}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (v) => `₹${(v / 1000).toFixed(0)}k`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <div className="chart-title-group">
              <h4>Monthly Net Salary Trend</h4>
              <p className="chart-subtitle">Disbursements over time from finalized payruns</p>
            </div>
            <TrendingUp size={20} className="chart-header-icon" />
          </div>
          <div className="chart-body">
            <Line
              data={trendLineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => ` ₹${Number(ctx.raw).toLocaleString('en-IN')}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (v) => `₹${(v / 1000).toFixed(0)}k`
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Operational Overviews Row */}
      <div className="dashboard-bottom-grid">
        {/* Department Breakdown Table */}
        <div className="card">
          <h4 className="section-title">Department Payroll & Headcount Overview</h4>
          <div className="table-responsive">
            <table className="overview-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Headcount</th>
                  <th>Total Active Wage</th>
                  <th>Net Paid to Date</th>
                </tr>
              </thead>
              <tbody>
                {(charts.deptCosts || []).map((dept, idx) => (
                  <tr key={idx}>
                    <td><strong>{dept.department}</strong></td>
                    <td>
                      <span className="badge badge-info">{dept.headcount} employees</span>
                    </td>
                    <td className="font-mono">₹{parseFloat(dept.total_wage).toLocaleString('en-IN')}</td>
                    <td className="font-mono font-bold text-primary">
                      ₹{parseFloat(dept.total_net_expenditure).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance & Shift Breakdown */}
        <div className="card">
          <h4 className="section-title">Attendance & Shift Health Statistics</h4>
          <div className="attendance-stat-list">
            <div className="att-stat-item">
              <div className="att-stat-left">
                <CheckCircle2 size={16} className="text-success" />
                <span>Normal Shifts Completed</span>
              </div>
              <strong>{kpis.attendanceStats?.normal_count || 0}</strong>
            </div>

            <div className="att-stat-item">
              <div className="att-stat-left">
                <Clock size={16} className="text-warning" />
                <span>Late Check-in Exceptions</span>
              </div>
              <strong>{kpis.attendanceStats?.late_count || 0}</strong>
            </div>

            <div className="att-stat-item">
              <div className="att-stat-left">
                <TrendingUp size={16} className="text-info" />
                <span>Overtime Shifts</span>
              </div>
              <strong>{kpis.attendanceStats?.overtime_count || 0}</strong>
            </div>

            <div className="att-stat-item">
              <div className="att-stat-left">
                <ShieldAlert size={16} className="text-danger" />
                <span>Missing Check-outs (Need Correction)</span>
              </div>
              <strong className="text-danger">{kpis.attendanceStats?.missing_checkout_count || 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
