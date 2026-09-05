import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import './AlertBanner.css';

export default function AlertBanner({ type = 'warning', title = '', message = '', actions = null }) {
  const icons = {
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
    danger: XCircle
  };

  const Icon = icons[type] || AlertTriangle;

  return (
    <div className={`alert-banner alert-${type}`}>
      <div className="alert-icon-box">
        <Icon size={18} />
      </div>
      <div className="alert-content">
        {title && <h5 className="alert-title">{title}</h5>}
        <p className="alert-message">{message}</p>
      </div>
      {actions && <div className="alert-actions">{actions}</div>}
    </div>
  );
}
