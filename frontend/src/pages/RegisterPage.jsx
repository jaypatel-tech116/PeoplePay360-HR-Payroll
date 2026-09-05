import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Sparkles, Building2, Mail, Lock, User, Phone, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobPositions, setJobPositions] = useState([]);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    company_id: '',
    department_id: '',
    job_position_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch public companies
    api.getPublicCompanies()
      .then(data => {
        setCompanies(data);
        if (data.length > 0) {
          setForm(f => ({ ...f, company_id: data[0].id }));
        }
      })
      .catch(err => console.error('Failed to load companies:', err));

    // Fetch departments
    api.getDepartments()
      .then(data => setDepartments(data))
      .catch(err => console.error('Failed to load departments:', err));
  }, []);

  useEffect(() => {
    if (form.department_id) {
      api.getJobPositions(form.department_id)
        .then(data => setJobPositions(data))
        .catch(err => console.error('Failed to load jobs:', err));
    } else {
      setJobPositions([]);
    }
  }, [form.department_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitRegistration({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        company_id: form.company_id,
        department_id: form.department_id || null,
        job_position_id: form.job_position_id || null
      });

      // Redirect to OTP verification page
      navigate('/verify-email', {
        state: {
          email: form.email,
          requestId: res.requestId,
          message: res.message
        }
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-glass-card">
        <div className="register-header">
          <div className="register-logo">
            <Sparkles size={24} className="register-sparkle" />
          </div>
          <h1>Join Your Organization</h1>
          <p>Register for PeoplePay360 Employee Portal</p>
        </div>

        {error && (
          <div className="register-error-banner animate-shake">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group-row">
            <div className="form-group">
              <label>Full Name *</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Work Email Address *</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="jordan@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Organization / Company *</label>
              <div className="input-with-icon">
                <Building2 size={18} className="input-icon" />
                <select
                  required
                  value={form.company_id}
                  onChange={e => setForm({ ...form, company_id: e.target.value })}
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Department (Optional)</label>
              <div className="input-with-icon">
                <Briefcase size={18} className="input-icon" />
                <select
                  value={form.department_id}
                  onChange={e => setForm({ ...form, department_id: e.target.value })}
                >
                  <option value="">Select Department...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Job Position (Optional)</label>
              <div className="input-with-icon">
                <Briefcase size={18} className="input-icon" />
                <select
                  value={form.job_position_id}
                  onChange={e => setForm({ ...form, job_position_id: e.target.value })}
                  disabled={!form.department_id}
                >
                  <option value="">Select Job Position...</option>
                  {jobPositions.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Password *</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  required
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={form.confirm_password}
                  onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="security-notice">
            <ShieldCheck size={16} className="security-shield" />
            <span>Registration requires 5-minute email OTP verification followed by HR review.</span>
          </div>

          <button type="submit" className="register-submit-btn" disabled={loading}>
            {loading ? 'Submitting Registration...' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="register-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
