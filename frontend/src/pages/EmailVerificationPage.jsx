import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ShieldCheck, Mail, RefreshCw, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import './EmailVerificationPage.css';

export default function EmailVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';
  const initialMessage = location.state?.message || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendsLeft, setResendsLeft] = useState(3);

  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Handle single digit input
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError(null);

    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (secondsLeft <= 0) {
      setError('This verification code has expired (5-minute limit). Please request a new code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyRegistrationOTP(email, fullCode);
      setSuccess(res.message || 'Email verified successfully! Your request has been sent for HR approval.');
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendsLeft <= 0) return;
    setError(null);
    setResending(true);
    try {
      const res = await api.resendRegistrationOTP(email, 'email_verification');
      setSecondsLeft(300);
      setOtp(['', '', '', '', '', '']);
      if (res.resendsRemaining !== undefined) {
        setResendsLeft(res.resendsRemaining);
      } else {
        setResendsLeft(r => r - 1);
      }
      inputRefs.current[0]?.focus();
      alert('A new 6-digit verification code has been dispatched to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="otp-container">
      <div className="otp-glass-card">
        <div className="otp-header">
          <div className="otp-icon-wrap">
            <ShieldCheck size={28} className="otp-icon" />
          </div>
          <h1>Verify Your Email</h1>
          <p>
            We've dispatched a secure 6-digit code to <br />
            <strong>{email || 'your email'}</strong>
          </p>
        </div>

        {initialMessage && !error && !success && (
          <div className="otp-info-banner">
            <Mail size={16} />
            <span>{initialMessage}</span>
          </div>
        )}

        {error && (
          <div className="otp-error-banner animate-shake">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="otp-success-card animate-scale-up">
            <CheckCircle size={48} className="success-check-icon" />
            <h2>Email Successfully Verified!</h2>
            <p>{success}</p>
            <div className="approval-status-pill">
              <span className="status-dot-pulse" />
              <span>Status: Pending HR & Administrator Approval</span>
            </div>
            <p className="approval-subtext">
              Once an HR Manager or Admin approves your application, your active employee account will be generated and you will receive an approval email notification.
            </p>
            <Link to="/login" className="otp-return-btn">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="otp-form">
            <div className="otp-digit-inputs" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputRefs.current[idx] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  autoFocus={idx === 0}
                  className={`otp-digit-box ${digit ? 'filled' : ''}`}
                />
              ))}
            </div>

            <div className="otp-timer-row">
              <div className={`otp-timer ${secondsLeft < 60 ? 'timer-warning' : ''}`}>
                <Clock size={16} />
                <span>Code expires in: <strong>{formatTime(secondsLeft)}</strong></span>
              </div>

              <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={resending || resendsLeft <= 0}
              >
                <RefreshCw size={14} className={resending ? 'spinning' : ''} />
                <span>Resend Code ({resendsLeft} left)</span>
              </button>
            </div>

            <button
              type="submit"
              className="otp-verify-btn"
              disabled={loading || otp.join('').length !== 6 || secondsLeft <= 0}
            >
              {loading ? 'Verifying Code...' : 'Verify & Submit'}
            </button>
          </form>
        )}

        <div className="otp-footer">
          Entered the wrong email? <Link to="/register">Register again</Link>
        </div>
      </div>
    </div>
  );
}
