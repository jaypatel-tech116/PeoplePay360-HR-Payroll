import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

/**
 * Registration Page Component
 * Accepts ONLY Email and Password as requested.
 * Automatically logs in and routes user upon successful registration.
 */
const Register = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === "EMPLOYEE") {
        navigate("/employee", { replace: true });
      } else if (user.role === "HR_MANAGER" || user.role === "ADMIN") {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const registeredUser = await register({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (registeredUser?.role === "HR_MANAGER" || registeredUser?.role === "ADMIN") {
        navigate("/hr", { replace: true });
      } else {
        navigate("/employee", { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Registration failed. Please enter a valid email and password.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-badge">PeoplePay360</div>
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Sign up with your email and password</p>
        </div>

        {error && (
          <div className="register-alert-error" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-input"
              placeholder="name@example.com"
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
              required
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="register-btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="register-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
