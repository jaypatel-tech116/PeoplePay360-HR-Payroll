import React from 'react';
import './SmartButton.css';

export default function SmartButton({ icon: Icon, count = 0, label = '', onClick = null, active = false }) {
  return (
    <button
      type="button"
      className={`smart-button ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="smart-btn-icon-box">
        {Icon && <Icon size={18} />}
      </div>
      <div className="smart-btn-content">
        <span className="smart-btn-count">{count}</span>
        <span className="smart-btn-label">{label}</span>
      </div>
    </button>
  );
}
