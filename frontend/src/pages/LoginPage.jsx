import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const { login, switchDemoAccount, DEMO_ACCOUNTS } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('payrollmgr@peoplepay360.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (accEmail) => {
    try {
      setLoading(true);
      setError(null);
      await switchDemoAccount(accEmail);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card animate-fade-in">
        <div className="login-brand-header">
          <div className="login-logo-icon">
            <Sparkles size={24} />
          </div>
          <h2 className="login-brand-title">PeoplePay<span className="login-brand-highlight">360</span></h2>
          <p className="login-brand-desc">Enterprise HR & Payroll Platform</p>
        </div>

        {error && <div className="login-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. payrollmgr@peoplepay360.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
            <span>{loading ? 'Authenticating...' : 'Sign In to Platform'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="login-quick-roles">
          <div className="quick-roles-divider">
            <span>Or Quick Login with Demo Roles</span>
          </div>

          <div className="quick-roles-grid">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="quick-role-card"
                onClick={() => handleQuickLogin(acc.email)}
                disabled={loading}
              >
                <div className="quick-role-top">
                  <UserCheck size={14} className="quick-role-icon" />
                  <span className="quick-role-name">{acc.role}</span>
                </div>
                <span className="quick-role-email">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Don't have an account yet? <a href="/register" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>Register here</a>
        </div>
      </div>
    </div>
  );
}
