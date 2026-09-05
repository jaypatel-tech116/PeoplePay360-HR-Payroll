import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Database,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Globe
} from 'lucide-react';
import './AuditLogsPage.css';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    tableName: '',
    limit: '50'
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs({
        action: filters.action || undefined,
        tableName: filters.tableName || undefined,
        limit: filters.limit
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('created') || action.includes('approved')) return 'badge-green';
    if (action.includes('deleted') || action.includes('refused') || action.includes('deactivated')) return 'badge-red';
    if (action.includes('updated') || action.includes('role')) return 'badge-amber';
    if (action.includes('login') || action.includes('logout')) return 'badge-blue';
    return 'badge-gray';
  };

  return (
    <div className="audit-logs-page">
      <div className="audit-header-row">
        <div>
          <h1 className="page-title">Security Audit Trail</h1>
          <p className="page-subtitle">
            Immutable system audit logs tracking authentication, approvals, payruns, and administrative events
          </p>
        </div>

        <button className="refresh-btn" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spinning' : ''} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="audit-filter-bar">
        <div className="filter-item">
          <label>Action Filter</label>
          <input
            type="text"
            placeholder="e.g. login, payrun, approved..."
            value={filters.action}
            onChange={e => setFilters({ ...filters, action: e.target.value })}
          />
        </div>

        <div className="filter-item">
          <label>Target Table</label>
          <select
            value={filters.tableName}
            onChange={e => setFilters({ ...filters, tableName: e.target.value })}
          >
            <option value="">All Tables</option>
            <option value="users">users</option>
            <option value="user_sessions">user_sessions</option>
            <option value="registration_requests">registration_requests</option>
            <option value="employees">employees</option>
            <option value="payruns">payruns</option>
            <option value="companies">companies</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Limit</label>
          <select
            value={filters.limit}
            onChange={e => setFilters({ ...filters, limit: e.target.value })}
          >
            <option value="25">25 entries</option>
            <option value="50">50 entries</option>
            <option value="100">100 entries</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading immutable audit logs...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-audit-card">
          <ShieldAlert size={48} className="empty-shield" />
          <h3>No audit records match your filters</h3>
          <p>Security operations and events are automatically captured in this immutable log.</p>
        </div>
      ) : (
        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }} />
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Table</th>
                <th>Record ID</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const isExpanded = expandedRow === log.id;
                const hasDetails = log.old_values || log.new_values;

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`audit-row ${isExpanded ? 'row-expanded' : ''} ${hasDetails ? 'row-clickable' : ''}`}
                      onClick={() => hasDetails && toggleExpand(log.id)}
                    >
                      <td className="expand-cell">
                        {hasDetails && (
                          isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                        )}
                      </td>
                      <td className="time-cell">
                        <Clock size={13} className="cell-icon" />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </td>
                      <td className="user-cell">
                        <div className="user-tag">
                          <User size={13} className="cell-icon" />
                          <span>{log.user_name || 'System / Guest'}</span>
                        </div>
                        {log.user_email && (
                          <span className="user-email-sub">{log.user_email}</span>
                        )}
                      </td>
                      <td>
                        <span className={`action-badge ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <div className="table-tag">
                          <Database size={13} className="cell-icon" />
                          <span>{log.table_name || '—'}</span>
                        </div>
                      </td>
                      <td className="id-cell">{log.record_id ? `#${log.record_id}` : '—'}</td>
                      <td className="ip-cell">
                        <Globe size={13} className="cell-icon" />
                        <span>{log.ip_address || '127.0.0.1'}</span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="detail-row">
                        <td colSpan={7}>
                          <div className="audit-details-container animate-fade-in">
                            <div className="details-header">Change Payload Details</div>
                            <div className="json-diff-grid">
                              {log.old_values && (
                                <div className="json-box">
                                  <div className="json-title title-old">Previous State (Old Values)</div>
                                  <pre className="json-code">
                                    {typeof log.old_values === 'string'
                                      ? JSON.stringify(JSON.parse(log.old_values), null, 2)
                                      : JSON.stringify(log.old_values, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {log.new_values && (
                                <div className="json-box">
                                  <div className="json-title title-new">Updated State (New Values)</div>
                                  <pre className="json-code">
                                    {typeof log.new_values === 'string'
                                      ? JSON.stringify(JSON.parse(log.new_values), null, 2)
                                      : JSON.stringify(log.new_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
