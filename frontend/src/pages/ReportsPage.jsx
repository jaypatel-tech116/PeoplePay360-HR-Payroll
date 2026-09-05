import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Users,
  Download,
  Filter,
  FileText,
  Clock,
  Briefcase
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import './ReportsPage.css';

const trendData = [
  { month: 'Jan', amount: 450000 },
  { month: 'Feb', amount: 460000 },
  { month: 'Mar', amount: 455000 },
  { month: 'Apr', amount: 480000 },
  { month: 'May', amount: 475000 },
  { month: 'Jun', amount: 510000 },
];

const breakdownData = [
  { name: 'Basic Salary', value: 250000 },
  { name: 'Allowances', value: 150000 },
  { name: 'Overtime', value: 50000 },
  { name: 'Bonuses', value: 60000 },
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="breadcrumbs">
          <span>Reports</span>
          <span>/</span>
          <span>{activeTab === 'overview' ? 'Dashboard' : 'Generated Reports'}</span>
        </div>
        <div className="page-title-wrapper">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Visualize trends, track expenses, and export HR data.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button className="btn btn-primary">
              <Download size={16} />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="tabs-container mb-6">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview Dashboard
        </button>
        <button className={`tab-btn ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')}>
          Payroll Reports
        </button>
        <button className={`tab-btn ${activeTab === 'hr' ? 'active' : ''}`} onClick={() => setActiveTab('hr')}>
          HR Reports
        </button>
        <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          Attendance Reports
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-pane animate-fade-in">
          {/* KPI Grid */}
          <div className="kpi-grid mb-6">
            <div className="card kpi-card">
              <div className="kpi-icon-wrap bg-primary-light text-primary">
                <BarChart2 size={24} />
              </div>
              <div className="kpi-details">
                <p className="kpi-label">Payroll Expense</p>
                <h3 className="kpi-value">₹510k</h3>
                <p className="kpi-trend text-success"><TrendingUp size={14} /> +8.2% vs last month</p>
              </div>
            </div>
            <div className="card kpi-card">
              <div className="kpi-icon-wrap bg-success-light text-success">
                <TrendingUp size={24} />
              </div>
              <div className="kpi-details">
                <p className="kpi-label">Total Allowances</p>
                <h3 className="kpi-value">₹150k</h3>
                <p className="kpi-trend text-success"><TrendingUp size={14} /> +2.1% vs last month</p>
              </div>
            </div>
            <div className="card kpi-card">
              <div className="kpi-icon-wrap bg-danger-light text-danger">
                <TrendingDown size={24} />
              </div>
              <div className="kpi-details">
                <p className="kpi-label">Total Deductions</p>
                <h3 className="kpi-value">₹45k</h3>
                <p className="kpi-trend text-danger"><TrendingUp size={14} /> +5.4% vs last month</p>
              </div>
            </div>
            <div className="card kpi-card">
              <div className="kpi-icon-wrap bg-info-light text-info">
                <Users size={24} />
              </div>
              <div className="kpi-details">
                <p className="kpi-label">Headcount</p>
                <h3 className="kpi-value">142</h3>
                <p className="kpi-trend text-success"><TrendingUp size={14} /> +3 new hires</p>
              </div>
            </div>
          </div>

          <div className="reports-chart-grid">
            {/* Line Chart */}
            <div className="card">
              <div className="card-header border-b">
                <h3 className="card-title">Payroll Trends (Last 6 Months)</h3>
              </div>
              <div className="card-body" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="card">
              <div className="card-header border-b">
                <h3 className="card-title">Salary Breakdown</h3>
              </div>
              <div className="card-body" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'overview' && (
        <div className="tab-pane animate-fade-in">
          <div className="card">
            <div className="card-header border-b">
              <h3 className="card-title">Generated {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reports</h3>
            </div>
            <div className="card-body p-0">
              <table className="w-100 reports-list-table">
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Generated On</th>
                    <th>Generated By</th>
                    <th>Format</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="report-name-cell">
                        <FileText size={16} className="text-primary" />
                        <span>Monthly Payroll Summary (June 2026)</span>
                      </div>
                    </td>
                    <td>Jun 30, 2026</td>
                    <td>Admin User</td>
                    <td><span className="badge badge-neutral">PDF</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-text">Download</button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="report-name-cell">
                        <FileText size={16} className="text-success" />
                        <span>Tax Deduction Register (Q2 2026)</span>
                      </div>
                    </td>
                    <td>Jul 05, 2026</td>
                    <td>HR Payroll Manager</td>
                    <td><span className="badge badge-neutral">CSV</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-text">Download</button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="report-name-cell">
                        <FileText size={16} className="text-info" />
                        <span>Employee Headcount Analytics</span>
                      </div>
                    </td>
                    <td>Jul 10, 2026</td>
                    <td>System Scheduled</td>
                    <td><span className="badge badge-neutral">EXCEL</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-text">Download</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
