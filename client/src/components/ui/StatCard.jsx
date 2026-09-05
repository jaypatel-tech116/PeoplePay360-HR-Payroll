import React from "react";
import "./StatCard.css";

/**
 * Reusable Metric Statistic Card
 * @param {string} title
 * @param {string|number} value
 * @param {string} [subtitle]
 * @param {string} [icon]
 * @param {'primary' | 'success' | 'warning' | 'info' | 'danger'} [variant]
 * @param {string} [trend]
 */
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = "primary",
  trend,
}) => {
  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {(subtitle || trend) && (
          <div className="stat-card-meta">
            {trend && <span className="stat-card-trend">{trend}</span>}
            {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
