import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

/**
 * Login Page Component
 * Accepts ONLY Email and Password as requested.
 * Automatically routes to /employee for EMPLOYEE role or /hr for HR_MANAGER role.
 */
const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already authenticated, redirect to their role-specific page
  useEffect(() => {
    if (user) {
      if (user.role === "EMPLOYEE") {
        navigate("/employee", { replace: true });
      } else if (user.role === "HR_MANAGER" || user.role === "ADMIN" || user.role === "HR_PAYROLL_MANAGER") {
        navigate("/hr", { replace: true });
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

  const handleFillCredentials = (email, password) => {
    setFormData({ email, password });
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
      } else if (
        loggedInUser?.role === "HR_MANAGER" ||
        loggedInUser?.role === "ADMIN" ||
        loggedInUser?.role === "HR_PAYROLL_MANAGER"
      ) {
        navigate("/hr", { replace: true });
      } else {
        const origin = location.state?.from?.pathname || "/dashboard";
        navigate(origin, { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">PeoplePay360</div>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">Enter your email and password to access your portal</p>
        </div>

        {error && (
          <div className="auth-alert-error" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="e.g. employee1@gmail.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="auth-btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div className="demo-credentials-box">
          <span className="demo-title">⚡ Quick Demo Login:</span>
          <div className="demo-btn-group">
            <button
              type="button"
              className="demo-btn demo-btn-emp"
              onClick={() => handleFillCredentials("employee1@gmail.com", "123456")}
            >
              Employee: employee1@gmail.com (123456)
            </button>
            <button
              type="button"
              className="demo-btn demo-btn-hr"
              onClick={() => handleFillCredentials("hr@gmail.com", "909090")}
            >
              HR: hr@gmail.com (909090)
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
