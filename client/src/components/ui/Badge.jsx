import React from "react";
import "./Badge.css";

/**
 * Reusable Status Badge Component
 * @param {'success' | 'warning' | 'danger' | 'info' | 'neutral'} variant
 * @param {string} children
 * @param {'sm' | 'md'} size
 */
const Badge = ({ variant = "neutral", children, size = "md" }) => {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
};

export default Badge;
