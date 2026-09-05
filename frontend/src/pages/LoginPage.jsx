import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, UserCheck } from 'lucide-react';
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
    <div className="login-split-container">
      {/* Left Side: Form */}
      <div className="login-form-side">
        <div className="login-form-wrapper animate-fade-in">
          <div className="login-brand">
            <div className="login-logo-icon">
              <Sparkles size={24} />
            </div>
            <h1 className="login-brand-title">PeoplePay<span className="login-brand-highlight">360</span></h1>
          </div>

          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Please enter your details to sign in.</p>
          </div>

          {error && <div className="login-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
                placeholder="••••••••"
                required
              />
            </div>

            <div className="login-form-options">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox-custom" />
                <span>Remember for 30 days</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts for Hackathon */}
          <div className="login-quick-roles">
            <div className="quick-roles-divider">
              <span>Quick Login Demo Accounts</span>
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
                  <UserCheck size={14} className="quick-role-icon" />
                  <span className="quick-role-name">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="login-footer-text">
            Don't have an account? <a href="#">Contact HR</a>
          </p>
        </div>
      </div>

      {/* Right Side: Visuals */}
      <div className="login-visual-side">
        <div className="visual-content">
          <h2>Streamline your HR & Payroll operations</h2>
          <p>Automate salary processing, manage attendance, and empower your workforce with our comprehensive suite.</p>
          
          <div className="visual-mockup">
            {/* Abstract representation of the dashboard */}
            <div className="mockup-header"></div>
            <div className="mockup-body">
              <div className="mockup-sidebar"></div>
              <div className="mockup-main">
                <div className="mockup-cards">
                  <div className="m-card"></div>
                  <div className="m-card"></div>
                  <div className="m-card"></div>
                </div>
                <div className="mockup-chart"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
