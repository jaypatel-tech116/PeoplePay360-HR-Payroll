import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from './Modal';
import AlertBanner from './AlertBanner';
import { Layers, Calendar, CheckSquare, Square, Users, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import './PayrunWizardModal.css';

export default function PayrunWizardModal({ isOpen, onClose, onPayrunCreated }) {
  const [step, setStep] = useState(1);
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1 Form Data
  const [name, setName] = useState('');
  const [structureId, setStructureId] = useState('');
  const [periodStart, setPeriodStart] = useState('2026-09-01');
  const [periodEnd, setPeriodEnd] = useState('2026-09-30');

  // Step 2 Eligible Employees & Selection
  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      // Fetch structures
      api.getSalaryStructures().then((res) => {
        setStructures(res);
        if (res.length > 0) {
          setStructureId(res[0].id);
          setName(`Payrun - ${new Date(periodStart).toLocaleString('default', { month: 'long', year: 'numeric' })}`);
        }
      });
    }
  }, [isOpen, periodStart]);

  const handlePeriodChange = (start, end) => {
    setPeriodStart(start);
    setPeriodEnd(end);
    if (start) {
      const d = new Date(start);
      setName(`Payrun - ${d.toLocaleString('default', { month: 'long', year: 'numeric' })}`);
    }
  };

  // Step 1 -> Step 2: Fetch eligible preview (NO DB INSERT)
  const handleProceedToStep2 = async (e) => {
    e.preventDefault();
    if (!name || !structureId || !periodStart || !periodEnd) {
      setError('Please fill in all wizard fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.previewEligibleEmployees({
        salary_structure_id: structureId,
        period_start: periodStart,
        period_end: periodEnd
      });

      setEligibleEmployees(res.employees);
      // By default select all eligible
      setSelectedEmpIds(res.employees.map((emp) => emp.id));
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Select / Deselect
  const toggleEmployee = (empId) => {
    if (selectedEmpIds.includes(empId)) {
      setSelectedEmpIds(selectedEmpIds.filter((id) => id !== empId));
    } else {
      setSelectedEmpIds([...selectedEmpIds, empId]);
    }
  };

  const selectAll = () => {
    if (selectedEmpIds.length === eligibleEmployees.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(eligibleEmployees.map((e) => e.id));
    }
  };

  // Step 2: Create Payrun (THE ONLY ACTION THAT INSERTS)
  const handleCreatePayrun = async () => {
    if (selectedEmpIds.length === 0) {
      setError('Please select at least one employee.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.createPayrun({
        name,
        salary_structure_id: structureId,
        period_start: periodStart,
        period_end: periodEnd,
        employee_ids: selectedEmpIds
      });

      onPayrunCreated(res.payrun);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? 'New Payrun Wizard (Step 1 of 2)' : 'Select Employee Scope (Step 2 of 2)'}
      maxWidth="720px"
    >
      <div className="wizard-stepper">
        <div className={`step-indicator ${step === 1 ? 'active' : 'completed'}`}>
          <span className="step-num">1</span>
          <span className="step-label">Batch Scope & Structure</span>
        </div>
        <div className="step-divider" />
        <div className={`step-indicator ${step === 2 ? 'active' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-label">Select Employees ({selectedEmpIds.length})</span>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}

      {step === 1 && (
        <form onSubmit={handleProceedToStep2} className="wizard-form">
          <div className="form-group">
            <label className="form-label">Payrun Batch Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Salary Structure</label>
            <select
              className="form-select"
              value={structureId}
              onChange={(e) => setStructureId(e.target.value)}
              required
            >
              {structures.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rule_count} rules)
                </option>
              ))}
            </select>
            <span className="form-helper">
              The chosen structure provides the exact ordered rules that will execute during salary computation.
            </span>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Period Start Date</label>
              <input
                type="date"
                className="form-input"
                value={periodStart}
                onChange={(e) => handlePeriodChange(e.target.value, periodEnd)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Period End Date</label>
              <input
                type="date"
                className="form-input"
                value={periodEnd}
                onChange={(e) => handlePeriodChange(periodStart, e.target.value)}
                required
              />
            </div>
          </div>

          <div className="wizard-notice">
            <Calendar size={18} className="notice-icon" />
            <p>
              <strong>Two-Step Wizard:</strong> Clicking &quot;Continue&quot; does <em>not</em> create any database record yet. It previews the employees with applicable contracts for this period.
            </p>
          </div>

          <div className="wizard-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <span>{loading ? 'Evaluating Contracts...' : 'Continue to Employee Selection'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="wizard-step-2">
          <div className="step-2-summary">
            <div className="scope-badge">
              <strong>Batch:</strong> {name}
            </div>
            <div className="scope-badge">
              <strong>Period:</strong> {periodStart} to {periodEnd}
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={selectAll}>
              {selectedEmpIds.length === eligibleEmployees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="eligible-employee-list">
            {eligibleEmployees.length > 0 ? (
              eligibleEmployees.map((emp) => {
                const isSelected = selectedEmpIds.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    className={`emp-select-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleEmployee(emp.id)}
                  >
                    <div className="select-checkbox">
                      {isSelected ? (
                        <CheckSquare size={18} className="checkbox-checked" />
                      ) : (
                        <Square size={18} className="checkbox-unchecked" />
                      )}
                    </div>

                    <div className="emp-select-info">
                      <span className="emp-select-name">{emp.full_name}</span>
                      <span className="emp-select-sub">
                        {emp.job_title} • {emp.department_name} ({emp.employee_type})
                      </span>
                    </div>

                    <div className="emp-select-meta">
                      <span className="emp-wage-tag">
                        ₹{parseFloat(emp.wage).toLocaleString()}
                      </span>
                      {!emp.bank_ready && (
                        <span className="emp-warning-chip" title="Missing or unverified bank details">
                          <ShieldAlert size={12} />
                          <span>Bank Pending</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-eligible-box">
                <Users size={32} />
                <p>No employees found with active contracts covering this period.</p>
              </div>
            )}
          </div>

          <div className="wizard-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreatePayrun}
              disabled={loading || selectedEmpIds.length === 0}
            >
              <span>{loading ? 'Creating Batch...' : `Create Payrun (${selectedEmpIds.length} Selected)`}</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
