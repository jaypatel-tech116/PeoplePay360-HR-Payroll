import React, { useState, useEffect } from "react";
import hrApi from "../../../api/hr.api";

const RequestLeaveModal = ({ isOpen, onClose, onSubmit, leaveTypes = [] }) => {
  const [typesList, setTypesList] = useState([]);
  const [leaveType, setLeaveType] = useState("Annual Leave");
  const [fromDate, setFromDate] = useState("2025-09-15");
  const [toDate, setToDate] = useState("2025-09-16");
  const [reason, setReason] = useState("Family function");

  useEffect(() => {
    if (!isOpen) return;

    // Load dynamic leave types from DB
    hrApi
      .getLeaveTypes()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.leave_types || [];
        if (list.length > 0) {
          setTypesList(list);
          setLeaveType(list[0].name);
        }
      })
      .catch(() => {
        if (leaveTypes && leaveTypes.length > 0) {
          setTypesList(leaveTypes);
          setLeaveType(leaveTypes[0].name);
        } else {
          setTypesList([
            { id: 1, name: "Annual Leave", unit: "DAYS" },
            { id: 2, name: "Sick Leave", unit: "DAYS" },
            { id: 3, name: "Casual Leave", unit: "DAYS" },
          ]);
        }
      });
  }, [isOpen, leaveTypes]);

  if (!isOpen) return null;

  // Calculate duration between dates
  const calculateDays = () => {
    if (!fromDate || !toDate) return 1;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const matchedType = typesList.find((t) => t.name === leaveType);
    if (onSubmit) {
      onSubmit({
        leaveType,
        leave_type_id: matchedType?.id,
        fromDate,
        toDate,
        duration: `${calculateDays()} days`,
        reason,
        appliedOn: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      });
    }
    onClose();
  };

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div className="hr-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="hr-modal-header">
          <div className="hr-modal-title-group">
            <div className="hr-modal-icon">✈</div>
            <div>
              <h3 className="hr-modal-title">Request Leave</h3>
              <p className="hr-modal-desc">Submit a new leave request</p>
            </div>
          </div>
          <button
            type="button"
            className="hr-modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="hr-modal-form">
          <div className="hr-form-group">
            <label className="hr-form-label">
              Leave Type <span className="hr-req-star">*</span>
            </label>
            <select
              className="hr-form-select"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              required
            >
              {typesList.map((t) => (
                <option key={t.id || t.name} value={t.name}>
                  📅 {t.name} ({t.unit ? t.unit.toLowerCase() : "days"})
                </option>
              ))}
            </select>
          </div>

          <div className="hr-form-row-2">
            <div className="hr-form-group">
              <label className="hr-form-label">
                From Date <span className="hr-req-star">*</span>
              </label>
              <input
                type="date"
                className="hr-form-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </div>

            <div className="hr-form-group">
              <label className="hr-form-label">
                To Date <span className="hr-req-star">*</span>
              </label>
              <input
                type="date"
                className="hr-form-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="hr-form-group">
            <label className="hr-form-label">Number of Days</label>
            <input
              type="text"
              className="hr-form-input"
              value={calculateDays()}
              disabled
            />
          </div>

          <div className="hr-form-group">
            <label className="hr-form-label">
              Reason <span className="hr-req-star">*</span>
            </label>
            <textarea
              className="hr-form-textarea"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for leave..."
              required
            />
            <div className="hr-char-counter">{reason.length}/500</div>
          </div>

          {/* Action Buttons */}
          <div className="hr-modal-actions">
            <button
              type="button"
              className="hr-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="hr-btn-primary">
              ✈ Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestLeaveModal;
