import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, 
  FileText, 
  CalendarDays, 
  Banknote,
  Download,
  MoreVertical,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './DashboardPage.css';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We fetch the existing dashboard endpoint.
    const fetchDashboard = async () => {
      try {
        const res = await api.getDashboard({ period: 'all', department: 'all', employeeType: 'all' });
        setData(res);
      } catch (err) {
        console.error('Error fetching dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-content flex-center">
        <Activity className="animate-spin text-muted" size={32} />
      </div>
    );
  }

  // Map backend data to UI
  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  
  // Fake chart data for Area chart (Attendance Trends) to match UI if backend doesn't provide exact structure
  const attendanceData = [
    { name: 'Mon', present: 120, absent: 10 },
    { name: 'Tue', present: 132, absent: 8 },
    { name: 'Wed', present: 141, absent: 5 },
    { name: 'Thu', present: 138, absent: 9 },
    { name: 'Fri', present: 125, absent: 12 },
    { name: 'Sat', present: 45, absent: 2 },
    { name: 'Sun', present: 30, absent: 0 },
  ];

  // Donut chart data mapping
  const COLORS = ['#7e22ce', '#3b82f6', '#10b981', '#f59e0b', '#64748b'];
  const departmentData = (charts.deptCosts || []).map((dept) => ({
    name: dept.department,
    value: parseInt(dept.headcount, 10) || 0
  }));

  // If no dept data, fallback to dummy
  const pieData = departmentData.length > 0 ? departmentData : [
    { name: 'Engineering', value: 45 },
    { name: 'Marketing', value: 25 },
    { name: 'HR', value: 10 },
    { name: 'Sales', value: 30 }
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-wrapper">
          <div>
            <h1 className="page-title">Overview</h1>
            <p className="page-subtitle">Welcome back, here's what's happening today.</p>
          </div>
          <button className="btn btn-primary">
            <Download size={16} />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon-wrapper success-bg">
            <Users className="kpi-icon success-text" size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">Total Employees</p>
            <h3 className="kpi-value">
              {data ? (charts.deptCosts || []).reduce((acc, curr) => acc + parseInt(curr.headcount || 0), 0) : '...'}
            </h3>
            <p className="kpi-trend success-text">
              <TrendingUp size={14} /> +5% this month
            </p>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-wrapper info-bg">
            <FileText className="kpi-icon info-text" size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">Active Contracts</p>
            <h3 className="kpi-value">
              {data ? (charts.deptCosts || []).reduce((acc, curr) => acc + parseInt(curr.headcount || 0), 0) : '...'}
            </h3>
            <p className="kpi-trend text-muted">Up to date</p>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-wrapper warning-bg">
            <CalendarDays className="kpi-icon warning-text" size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">Pending Leave Requests</p>
            <h3 className="kpi-value">{kpis.pendingLeaveRequests || 0}</h3>
            <p className="kpi-trend warning-text">Requires attention</p>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-wrapper primary-bg">
            <Banknote className="kpi-icon primary-text" size={24} />
          </div>
          <div className="kpi-details">
            <p className="kpi-label">Processed Payroll</p>
            <h3 className="kpi-value">
              ₹{kpis.totalNetPaid ? (kpis.totalNetPaid / 1000000).toFixed(2) + 'M' : '0.00'}
            </h3>
            <p className="kpi-trend text-muted">This month</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid">
        <div className="card chart-container span-2">
          <div className="card-header">
            <h3 className="card-title">Attendance Trends</h3>
            <button className="btn-icon"><MoreVertical size={16} /></button>
          </div>
          <div className="card-body" style={{ height: '300px', padding: '16px 24px 24px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7e22ce" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7e22ce" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="present" stroke="#7e22ce" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-container">
          <div className="card-header">
            <h3 className="card-title">Department Distribution</h3>
            <button className="btn-icon"><MoreVertical size={16} /></button>
          </div>
          <div className="card-body flex-center" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="donut-legend">
              {pieData.map((entry, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="legend-label">{entry.name}</span>
                  <span className="legend-value">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity Row */}
      <div className="dashboard-grid">
        <div className="card span-2">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div className="card-body p-0">
            <table className="table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>ACTION</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="td-employee">
                      <div className="td-avatar">SJ</div>
                      <div className="td-emp-details">
                        <span className="td-emp-name">Sarah Jenkins</span>
                        <span className="td-emp-sub">Software Engineer</span>
                      </div>
                    </div>
                  </td>
                  <td>Leave Request - Sick Leave</td>
                  <td>Today, 09:42 AM</td>
                  <td><span className="badge badge-warning"><span className="status-dot"></span>Pending</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-employee">
                      <div className="td-avatar">MR</div>
                      <div className="td-emp-details">
                        <span className="td-emp-name">Michael Ross</span>
                        <span className="td-emp-sub">Sales Director</span>
                      </div>
                    </div>
                  </td>
                  <td>Contract Renewal</td>
                  <td>Yesterday, 14:30 PM</td>
                  <td><span className="badge badge-success"><span className="status-dot"></span>Completed</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-employee">
                      <div className="td-avatar">AK</div>
                      <div className="td-emp-details">
                        <span className="td-emp-name">Alex Kumar</span>
                        <span className="td-emp-sub">Product Designer</span>
                      </div>
                    </div>
                  </td>
                  <td>Expense Claim - Travel</td>
                  <td>Oct 12, 11:20 AM</td>
                  <td><span className="badge badge-primary"><span className="status-dot"></span>Approved</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-body quick-actions-body">
            <button className="quick-action-btn">
              <div className="qa-icon-wrap bg-primary-light text-primary"><Users size={20} /></div>
              <span>Add New Employee</span>
            </button>
            <button className="quick-action-btn">
              <div className="qa-icon-wrap bg-success-light text-success"><Banknote size={20} /></div>
              <span>Run Payroll</span>
            </button>
            <button className="quick-action-btn">
              <div className="qa-icon-wrap bg-warning-light text-warning"><CalendarDays size={20} /></div>
              <span>Review Time Off</span>
            </button>
            <button className="quick-action-btn">
              <div className="qa-icon-wrap bg-info-light text-info"><FileText size={20} /></div>
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
