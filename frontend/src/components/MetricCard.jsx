import React from 'react';
import './MetricCard.css';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'primary' }) {
  return (
    <div className={`metric-card metric-${color}`}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className="metric-icon-box">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="metric-body">
        <span className="metric-value">{value}</span>
        {subtitle && <span className="metric-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}
