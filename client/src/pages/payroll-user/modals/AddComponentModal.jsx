import React, { useState } from "react";

const AddComponentModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Earning",
    applicableTo: "All",
    defaultValue: "0",
    status: "Active",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAdd) {
      onAdd(formData);
    }
    onClose();
  };

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div className="hr-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="hr-modal-header">
          <div className="hr-modal-title-group">
            <div className="hr-modal-icon">⚙️</div>
            <div>
              <h3 className="hr-modal-title">Add Payroll Component</h3>
              <p className="hr-modal-desc">Create an earning or deduction rule</p>
            </div>
          </div>
          <button type="button" className="hr-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hr-modal-form">
          <div className="hr-form-group">
            <label className="hr-form-label">Component Name *</label>
            <input
              type="text"
              className="hr-form-input"
              placeholder="e.g. Performance Bonus"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="hr-form-row-2">
            <div className="hr-form-group">
              <label className="hr-form-label">Component Type *</label>
              <select
                className="hr-form-select"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="Earning">Earning</option>
                <option value="Deduction">Deduction</option>
              </select>
            </div>

            <div className="hr-form-group">
              <label className="hr-form-label">Default Value</label>
              <input
                type="text"
                className="hr-form-input"
                placeholder="0 or 10%"
                value={formData.defaultValue}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, defaultValue: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="hr-modal-actions">
            <button type="button" className="pay-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="pay-btn-primary">
              + Save Component
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddComponentModal;
