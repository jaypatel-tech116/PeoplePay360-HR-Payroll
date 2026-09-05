import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Building2, Plus, Users, Globe, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import Modal from '../components/Modal';
import './CompanyAdminPage.css';

export default function CompanyAdminPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', domain: '', logo_url: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setBanner({ type: 'error', text: err.message || 'Failed to load companies.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.createCompany(form);
      setBanner({ type: 'success', text: `Company '${form.name}' created successfully.` });
      setShowAddModal(false);
      setForm({ name: '', domain: '', logo_url: '' });
      fetchCompanies();
    } catch (err) {
      setBanner({ type: 'error', text: err.message || 'Failed to create company.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="company-admin-page">
      <div className="company-header-row">
        <div>
          <h1 className="page-title">Multi-Tenant Organizations</h1>
          <p className="page-subtitle">
            Configure organizations, corporate domains, and access boundaries
          </p>
        </div>

        <button className="btn-primary-add" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>New Organization</span>
        </button>
      </div>

      {banner && (
        <div className={`company-banner banner-${banner.type}`}>
          {banner.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{banner.text}</span>
          <button className="banner-close-btn" onClick={() => setBanner(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading organization profiles...</span>
        </div>
      ) : (
        <div className="companies-grid">
          {companies.map(c => (
            <div key={c.id} className="company-card">
              <div className="company-card-header">
                <div className="company-icon-box">
                  <Building2 size={24} />
                </div>
                <div className="company-title-info">
                  <h3>{c.name}</h3>
                  <div className="company-domain-tag">
                    <Globe size={12} />
                    <span>{c.domain || 'No custom domain'}</span>
                  </div>
                </div>
                <span className={`status-pill ${c.is_active ? 'pill-active' : 'pill-inactive'}`}>
                  {c.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="company-metrics-row">
                <div className="company-metric">
                  <span className="metric-label">Employees</span>
                  <span className="metric-value">{c.employee_count || 0}</span>
                </div>
                <div className="company-metric">
                  <span className="metric-label">Users</span>
                  <span className="metric-value">{c.user_count || 0}</span>
                </div>
              </div>

              <div className="company-card-footer">
                <span className="created-text">
                  Registered {new Date(c.created_at).toLocaleDateString()}
                </span>
                <span className="tenant-id-badge">Tenant #{c.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <Modal
          title="Create New Organization"
          onClose={() => setShowAddModal(false)}
        >
          <form onSubmit={handleCreateCompany} className="company-modal-form">
            <div className="form-group">
              <label>Organization Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corp India"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Corporate Domain (Optional)</label>
              <input
                type="text"
                placeholder="e.g. acme.com"
                value={form.domain}
                onChange={e => setForm({ ...form, domain: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Logo URL (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.logo_url}
                onChange={e => setForm({ ...form, logo_url: e.target.value })}
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary-confirm"
                disabled={actionLoading || !form.name.trim()}
              >
                {actionLoading ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
