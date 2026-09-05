import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  ShieldCheck,
  Filter
} from 'lucide-react';
import Modal from '../components/Modal';
import './RegistrationApprovalPage.css';

export default function RegistrationApprovalPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedReq, setSelectedReq] = useState(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRegistrationRequests({
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setBanner({ type: 'error', text: err.message || 'Failed to load requests.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async (reqItem) => {
    if (!window.confirm(`Are you sure you want to approve registration for ${reqItem.full_name}? This will activate their Employee profile and User login.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.approveRegistrationRequest(reqItem.id);
      setBanner({ type: 'success', text: res.message || 'Registration approved successfully!' });
      fetchRequests();
    } catch (err) {
      setBanner({ type: 'error', text: err.message || 'Approval failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefuseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setActionLoading(true);
    try {
      const res = await api.refuseRegistrationRequest(selectedReq.id, refusalReason);
      setBanner({ type: 'info', text: res.message || 'Registration refused.' });
      setShowRefusalModal(false);
      setRefusalReason('');
      fetchRequests();
    } catch (err) {
      setBanner({ type: 'error', text: err.message || 'Refusal failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="registration-approval-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Registration Approvals</h1>
          <p className="page-subtitle">
            Review and authorize self-registered employee accounts for your organization
          </p>
        </div>

        <div className="filter-controls">
          <Filter size={16} className="filter-icon" />
          <select
            className="status-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="refused">Refused</option>
            <option value="all">All Requests</option>
          </select>
        </div>
      </div>

      {banner && (
        <div className={`approval-banner banner-${banner.type}`}>
          {banner.type === 'success' && <CheckCircle size={18} />}
          {banner.type === 'error' && <AlertCircle size={18} />}
          {banner.type === 'info' && <Clock size={18} />}
          <span>{banner.text}</span>
          <button className="banner-close-btn" onClick={() => setBanner(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Fetching registration requests...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state-card">
          <UserCheck size={44} className="empty-icon" />
          <h3>No {statusFilter !== 'all' ? statusFilter : ''} requests found</h3>
          <p>There are currently no employee registrations matching this criteria.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map((req) => (
            <div key={req.id} className="request-card">
              <div className="request-card-header">
                <div className="applicant-avatar">
                  {req.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="applicant-primary-info">
                  <h3>{req.full_name}</h3>
                  <span className="applicant-company">
                    <Building2 size={13} />
                    {req.company_name}
                  </span>
                </div>
                <span className={`status-badge status-${req.status}`}>
                  {req.status}
                </span>
              </div>

              <div className="request-card-body">
                <div className="info-line">
                  <Mail size={14} />
                  <span>{req.email}</span>
                  {req.email_verified ? (
                    <span className="verified-tag" title="OTP Email Verified">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  ) : (
                    <span className="unverified-tag" title="OTP Unverified">
                      Pending OTP
                    </span>
                  )}
                </div>

                {req.phone && (
                  <div className="info-line">
                    <Phone size={14} />
                    <span>{req.phone}</span>
                  </div>
                )}

                {(req.department_name || req.job_title) && (
                  <div className="info-line">
                    <Briefcase size={14} />
                    <span>
                      {req.department_name || 'General'} &bull; {req.job_title || 'Employee'}
                    </span>
                  </div>
                )}

                <div className="info-meta">
                  <span>Applied on {new Date(req.created_at).toLocaleDateString()}</span>
                  {req.reviewer_name && (
                    <span>Reviewed by {req.reviewer_name}</span>
                  )}
                </div>

                {req.refusal_reason && (
                  <div className="refusal-box">
                    <strong>Refusal Reason:</strong> {req.refusal_reason}
                  </div>
                )}
              </div>

              {req.status === 'pending' && (
                <div className="request-card-actions">
                  <button
                    className="action-btn-approve"
                    onClick={() => handleApprove(req)}
                    disabled={actionLoading || !req.email_verified}
                    title={!req.email_verified ? 'Applicant has not yet verified email via OTP' : 'Approve registration'}
                  >
                    <CheckCircle size={16} />
                    <span>Approve</span>
                  </button>

                  <button
                    className="action-btn-refuse"
                    onClick={() => {
                      setSelectedReq(req);
                      setShowRefusalModal(true);
                    }}
                    disabled={actionLoading}
                  >
                    <XCircle size={16} />
                    <span>Refuse</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Refusal Reason Modal */}
      {showRefusalModal && selectedReq && (
        <Modal
          title={`Refuse Registration: ${selectedReq.full_name}`}
          onClose={() => {
            setShowRefusalModal(false);
            setRefusalReason('');
          }}
        >
          <form onSubmit={handleRefuseSubmit} className="refusal-modal-form">
            <p className="modal-description">
              Please specify the reason for declining this registration request. An automated email will be sent to the applicant with this explanation.
            </p>

            <div className="form-group">
              <label>Reason for Refusal *</label>
              <textarea
                required
                rows={4}
                className="refusal-textarea"
                placeholder="e.g. Email domain does not match verified corporate email directory..."
                value={refusalReason}
                onChange={e => setRefusalReason(e.target.value)}
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowRefusalModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-danger-confirm"
                disabled={actionLoading || !refusalReason.trim()}
              >
                {actionLoading ? 'Declining...' : 'Confirm Refusal'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
