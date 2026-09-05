import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

/**
 * PeoplePay360 Modern Clean Login Screen
 * Featuring high-resolution office backdrop, left hero branding, and right floating login card
 */
const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to designated portal
  useEffect(() => {
    if (user) {
      if (user.role === "EMPLOYEE") {
        navigate("/employee", { replace: true });
      } else if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (
        user.role === "PAYROLL_MANAGER" ||
        user.role === "HR_PAYROLL_MANAGER"
      ) {
        navigate("/payroll-manager", { replace: true });
      } else if (
        user.role === "PAYROLL_USER" ||
        user.role === "HR_PAYROLL_USER"
      ) {
        navigate("/payroll-user", { replace: true });
      } else if (user.role === "HR_MANAGER") {
        navigate("/hr-manager", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const loggedInUser = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Role-specific redirect
      if (loggedInUser?.role === "EMPLOYEE") {
        navigate("/employee", { replace: true });
      } else if (loggedInUser?.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (
        loggedInUser?.role === "PAYROLL_MANAGER" ||
        loggedInUser?.role === "HR_PAYROLL_MANAGER"
      ) {
        navigate("/payroll-manager", { replace: true });
      } else if (
        loggedInUser?.role === "PAYROLL_USER" ||
        loggedInUser?.role === "HR_PAYROLL_USER"
      ) {
        navigate("/payroll-user", { replace: true });
      } else if (loggedInUser?.role === "HR_MANAGER") {
        navigate("/hr-manager", { replace: true });
      } else {
        const origin = location.state?.from?.pathname || "/dashboard";
        navigate(origin, { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Invalid email or password. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pp-login-viewport">
      {/* Soft gradient overlay for optimal legibility */}
      <div className="pp-login-bg-overlay" />

      {/* Main Container Layout */}
      <div className="pp-login-wrapper">
        {/* Left Hero Branding & Information Panel */}
        <div className="pp-hero-pane">
          {/* Header Logo & Tagline */}
          <div className="pp-hero-header">
            <div className="pp-brand-badge-row">
              <span className="pp-brand-logo-text">
                PeoplePay<span className="pp-brand-360">360</span>
              </span>
              <div className="pp-brand-underline" />
            </div>
            <div className="pp-platform-badge">
              ALL-IN-ONE HR &amp; PAYROLL PLATFORM
            </div>
          </div>

          {/* Main Headline */}
          <div className="pp-hero-headlines">
            <h1 className="pp-hero-title">
              Empower People.<br />
              <span className="pp-hero-title-accent">Simplify Payroll.</span>
            </h1>
            <p className="pp-hero-subtext">
              Manage your workforce, payroll, attendance and compliance — all in one place.
            </p>
          </div>

          {/* 4 Feature Items */}
          <div className="pp-features-list">
            <div className="pp-feature-item">
              <div className="pp-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="pp-feature-text">
                <h4>Manage Employees</h4>
                <p>Keep your workforce organized</p>
              </div>
            </div>

            <div className="pp-feature-item">
              <div className="pp-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="pp-feature-text">
                <h4>Track Attendance</h4>
                <p>Real-time insights and compliance</p>
              </div>
            </div>

            <div className="pp-feature-item">
              <div className="pp-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="pp-feature-text">
                <h4>Automate Payroll</h4>
                <p>Accurate, fast and hassle-free</p>
              </div>
            </div>

            <div className="pp-feature-item">
              <div className="pp-feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="pp-feature-text">
                <h4>Insights &amp; Reports</h4>
                <p>Make better decisions with data</p>
              </div>
            </div>
          </div>

          {/* Bottom Floating Stats Bar */}
          <div className="pp-stats-pill-bar">
            <div className="pp-stat-cell">
              <div className="pp-stat-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#714B67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="pp-stat-info">
                <span className="pp-stat-num">500+</span>
                <span className="pp-stat-lbl">Happy Employees</span>
              </div>
            </div>
            <div className="pp-stat-sep" />
            <div className="pp-stat-cell">
              <div className="pp-stat-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#714B67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                  <line x1="9" y1="22" x2="9" y2="22" />
                  <line x1="8" y1="6" x2="8.01" y2="6" />
                  <line x1="16" y1="6" x2="16.01" y2="6" />
                  <line x1="12" y1="6" x2="12.01" y2="6" />
                  <line x1="8" y1="10" x2="8.01" y2="10" />
                  <line x1="16" y1="10" x2="16.01" y2="10" />
                  <line x1="12" y1="10" x2="12.01" y2="10" />
                  <line x1="8" y1="14" x2="8.01" y2="14" />
                  <line x1="16" y1="14" x2="16.01" y2="14" />
                  <line x1="12" y1="14" x2="12.01" y2="14" />
                  <line x1="8" y1="18" x2="8.01" y2="18" />
                  <line x1="16" y1="18" x2="16.01" y2="18" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <div className="pp-stat-info">
                <span className="pp-stat-num">50+</span>
                <span className="pp-stat-lbl">Companies Trust Us</span>
              </div>
            </div>
            <div className="pp-stat-sep" />
            <div className="pp-stat-cell">
              <div className="pp-stat-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#714B67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="pp-stat-info">
                <span className="pp-stat-num">99.9%</span>
                <span className="pp-stat-lbl">Uptime &amp; Reliability</span>
              </div>
            </div>
            <div className="pp-stat-sep" />
            <div className="pp-stat-cell">
              <div className="pp-stat-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#714B67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div className="pp-stat-info">
                <span className="pp-stat-num">Global</span>
                <span className="pp-stat-lbl">Built for Tomorrow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Floating Login Card */}
        <div className="pp-form-pane">
          <div className="pp-card-container">
            {/* Card Brand Header */}
            <div className="pp-card-header">
              <div className="pp-card-logo">
                PeoplePay<span className="pp-card-logo-360">360</span>
              </div>
              <h2 className="pp-card-title">Welcome back</h2>
              <p className="pp-card-subtitle">Sign in to continue to your account</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="pp-auth-alert" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="pp-login-form" noValidate>
              {/* Email Input Field */}
              <div className="pp-form-field">
                <label htmlFor="pp-email" className="pp-field-label">
                  Email address
                </label>
                <div className="pp-input-wrapper">
                  <span className="pp-input-icon-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="pp-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email address"
                    className="pp-text-input"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Input Field with Eye Toggle */}
              <div className="pp-form-field">
                <label htmlFor="pp-password" className="pp-field-label">
                  Password
                </label>
                <div className="pp-input-wrapper">
                  <span className="pp-input-icon-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="pp-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    className="pp-text-input"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="pp-input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Options Row (Remember me & Forgot Password) */}
              <div className="pp-form-options-row">
                <label className="pp-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="pp-custom-checkbox"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact your HR administrator to reset your password.");
                  }}
                  className="pp-forgot-link"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="pp-btn-login"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="pp-btn-spinner-text">
                    <span className="pp-spinner" /> Signing in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Footer Trust Badge */}
            <div className="pp-card-footer">
              <span className="pp-security-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secure access to PeoplePay360
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
