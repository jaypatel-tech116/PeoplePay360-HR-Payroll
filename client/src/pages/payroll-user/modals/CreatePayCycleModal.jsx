import React, { useState } from "react";

const CreatePayCycleModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    month: "September",
    year: "2025",
    payDate: "30 Sep 2025",
    status: "Draft",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCreate) {
      onCreate(formData);
    }
    onClose();
  };

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div className="hr-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="hr-modal-header">
          <div className="hr-modal-title-group">
            <div className="hr-modal-icon">📅</div>
            <div>
              <h3 className="hr-modal-title">Create Pay Cycle</h3>
              <p className="hr-modal-desc">Initiate a new monthly salary cycle</p>
            </div>
          </div>
          <button type="button" className="hr-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hr-modal-form">
          <div className="hr-form-row-2">
            <div className="hr-form-group">
              <label className="hr-form-label">Month *</label>
              <select
                className="hr-form-select"
                value={formData.month}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, month: e.target.value }))
                }
              >
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>

            <div className="hr-form-group">
              <label className="hr-form-label">Year *</label>
              <input
                type="text"
                className="hr-form-input"
                value={formData.year}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, year: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="hr-form-group">
            <label className="hr-form-label">Scheduled Pay Date *</label>
            <input
              type="text"
              className="hr-form-input"
              value={formData.payDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, payDate: e.target.value }))
              }
              required
            />
          </div>

          <div className="hr-modal-actions">
            <button type="button" className="pay-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="pay-btn-primary">
              + Create Cycle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePayCycleModal;
