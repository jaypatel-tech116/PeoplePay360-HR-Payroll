import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import DataTable from '../components/DataTable';
import {
  ArrowLeft,
  Edit,
  UserX,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import './EmployeeDetailPage.css';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [counts, setCounts] = useState({ contracts: 0, attendance: 0, timeOffRequests: 0, allocations: 0 });
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'job' | 'attendance' | 'timeoff'
  const [subData, setSubData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const [empRes, countRes] = await Promise.all([
        api.getEmployeeById(id),
        api.getEmployeeCounts(id)
      ]);
      setEmployee(empRes);
      setCounts(countRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab) => {
    setActiveTab(tab);
    try {
      if (tab === 'job') {
        const res = await api.getEmployeeContracts(id);
        setSubData(res);
      } else if (tab === 'attendance') {
        const res = await api.getEmployeeAttendance(id);
        setSubData(res);
      } else if (tab === 'timeoff') {
        const res = await api.getEmployeeTimeOff(id);
        setSubData(res);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading || !employee) {
    return (
      <div className="page-content flex-center">
        <p className="text-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Top Breadcrumb & Header */}
      <div className="page-header">
        <div className="breadcrumbs">
          <button className="breadcrumb-btn" onClick={() => navigate('/employees')}>
            <ArrowLeft size={14} /> Back to Employees
          </button>
        </div>
        
        <div className="emp-header-flex">
          <div className="emp-header-info">
            {employee.photo_url ? (
              <img src={employee.photo_url} alt={employee.full_name} className="emp-header-avatar" />
            ) : (
              <div className="emp-header-avatar-fallback">
                {employee.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="page-title">{employee.full_name}</h1>
              <p className="page-subtitle">{employee.job_title || 'Position Not Assigned'} • {employee.department_name}</p>
            </div>
          </div>
          <div className="emp-header-actions">
            <button className="btn btn-outline">
              <Edit size={16} /> Edit Profile
            </button>
            <button className="btn btn-outline text-danger" style={{ borderColor: 'var(--danger-bg)' }}>
              <UserX size={16} /> Terminate
            </button>
          </div>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}

      {/* Quick Stats */}
      <div className="kpi-grid emp-stats-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrap bg-primary-light text-primary">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="stat-label">Current Salary</p>
            <p className="stat-value">₹{employee.current_wage ? parseFloat(employee.current_wage).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrap bg-success-light text-success">
            <Calendar size={20} />
          </div>
          <div>
            <p className="stat-label">Available Leave</p>
            <p className="stat-value">12 Days</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrap bg-info-light text-info">
            <Clock size={20} />
          </div>
          <div>
            <p className="stat-label">Next Review</p>
            <p className="stat-value">Oct 15, 2026</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="emp-layout">
        {/* Left Sidebar */}
        <div className="emp-sidebar card">
          <div className="card-body">
            <h4 className="section-title">Contact Information</h4>
            <div className="info-list">
              <div className="info-item">
                <Mail size={16} className="text-muted" />
                <span>{employee.email}</span>
              </div>
              <div className="info-item">
                <Phone size={16} className="text-muted" />
                <span>{employee.phone || '+1 (555) 000-0000'}</span>
              </div>
              <div className="info-item">
                <MapPin size={16} className="text-muted" />
                <span>123 Tech Park, San Francisco, CA</span>
              </div>
            </div>

            <h4 className="section-title mt-6">Work Information</h4>
            <div className="info-list">
              <div className="info-item">
                <Briefcase size={16} className="text-muted" />
                <span>Type: {employee.employee_type.replace('_', ' ')}</span>
              </div>
              <div className="info-item">
                <Building2 size={16} className="text-muted" />
                <span>Joined: {new Date(employee.hire_date).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <CheckCircle2 size={16} className="text-success" />
                <span>Status: {employee.status}</span>
              </div>
            </div>

            <h4 className="section-title mt-6">Emergency Contact</h4>
            <div className="info-list">
              <div className="info-item-block">
                <strong>Sarah {employee.full_name.split(' ')[1] || 'Relative'}</strong>
                <span className="text-muted text-sm">Spouse</span>
                <span className="text-sm">+1 (555) 999-8888</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="emp-content">
          <div className="tabs-container">
            <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => loadTabData('general')}>
              General Information
            </button>
            <button className={`tab-btn ${activeTab === 'job' ? 'active' : ''}`} onClick={() => loadTabData('job')}>
              Job & Salary
            </button>
            <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => loadTabData('attendance')}>
              Attendance
            </button>
            <button className={`tab-btn ${activeTab === 'timeoff' ? 'active' : ''}`} onClick={() => loadTabData('timeoff')}>
              Leave & Time Off
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'general' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Personal Details</h3>
                </div>
                <div className="card-body">
                  <div className="details-grid">
                    <div className="detail-field">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">{employee.full_name}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Date of Birth</span>
                      <span className="detail-value">Mar 12, 1990</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Gender</span>
                      <span className="detail-value">Not Specified</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Nationality</span>
                      <span className="detail-value">American</span>
                    </div>
                  </div>

                  <h3 className="card-title mt-6">Bank Information</h3>
                  <div className="details-grid mt-4">
                    <div className="detail-field">
                      <span className="detail-label">Bank Account Number</span>
                      <span className="detail-value">{employee.bank_account_number || 'Not provided'}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Routing / IFSC</span>
                      <span className="detail-value">{employee.ifsc_code || 'Not provided'}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Verification Status</span>
                      <span className="detail-value">
                        {employee.bank_verified ? 
                          <span className="badge badge-success"><CheckCircle2 size={12}/> Verified</span> : 
                          <span className="badge badge-warning"><AlertTriangle size={12}/> Pending</span>
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'job' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Contract History</h3>
                </div>
                <div className="card-body p-0">
                  <DataTable
                    columns={[
                      { header: 'Wage', accessor: 'wage', render: (r) => `₹${parseFloat(r.wage).toLocaleString()}` },
                      { header: 'Structure', accessor: 'structure_name' },
                      { header: 'Start Date', accessor: 'start_date' },
                      { header: 'End Date', accessor: 'end_date', render: (r) => r.end_date || 'Open-Ended' },
                      {
                        header: 'Status',
                        accessor: 'status',
                        render: (r) => (
                          <span className={`badge ${r.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                            {r.status}
                          </span>
                        )
                      }
                    ]}
                    data={subData}
                    pageSize={5}
                  />
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Attendance</h3>
                </div>
                <div className="card-body p-0">
                  <DataTable
                    columns={[
                      { header: 'Check In', accessor: 'check_in', render: (r) => new Date(r.check_in).toLocaleString() },
                      { header: 'Check Out', accessor: 'check_out', render: (r) => r.check_out ? new Date(r.check_out).toLocaleString() : 'Missing' },
                      { header: 'Hours', accessor: 'worked_hours', render: (r) => `${r.worked_hours || 0}h` },
                      {
                        header: 'Status',
                        accessor: 'status',
                        render: (r) => (
                          <span className={`badge ${r.status === 'normal' ? 'badge-success' : 'badge-warning'}`}>
                            {r.status}
                          </span>
                        )
                      }
                    ]}
                    data={subData}
                    pageSize={5}
                  />
                </div>
              </div>
            )}

            {activeTab === 'timeoff' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Leave History</h3>
                </div>
                <div className="card-body p-0">
                  <DataTable
                    columns={[
                      { header: 'Type', accessor: 'leave_type_name' },
                      { header: 'From', accessor: 'date_from' },
                      { header: 'To', accessor: 'date_to' },
                      { header: 'Duration', accessor: 'duration', render: (r) => `${r.duration} ${r.unit}` },
                      {
                        header: 'Status',
                        accessor: 'status',
                        render: (r) => (
                          <span className={`badge ${r.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                            {r.status}
                          </span>
                        )
                      }
                    ]}
                    data={subData.requests || []}
                    pageSize={5}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
