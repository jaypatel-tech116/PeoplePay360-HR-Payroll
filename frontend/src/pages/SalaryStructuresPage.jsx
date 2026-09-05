import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { Layers, Plus, Edit, Trash2, ArrowUp, ArrowDown, Code2, Calculator } from 'lucide-react';
import './SalaryStructuresPage.css';

export default function SalaryStructuresPage() {
  const [structures, setStructures] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modals
  const [isStructModalOpen, setIsStructModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);

  // Forms
  const [structForm, setStructForm] = useState({ name: '', description: '', active: true });
  const [ruleForm, setRuleForm] = useState({
    name: '',
    code: '',
    category: 'allowance',
    sequence: 35,
    computation_method: 'percentage',
    amount: 10,
    percentage_of_rule_code: 'BASIC',
    formula: ''
  });

  const fetchStructures = async () => {
    try {
      setLoading(true);
      const res = await api.getSalaryStructures();
      setStructures(res);
      if (res.length > 0 && !selectedStructure) {
        selectStructure(res[0]);
      } else if (selectedStructure) {
        const updated = res.find((s) => s.id === selectedStructure.id);
        if (updated) selectStructure(updated);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectStructure = async (struct) => {
    setSelectedStructure(struct);
    try {
      const r = await api.getRulesByStructure(struct.id);
      setRules(r);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await api.createSalaryStructure(structForm);
      setSuccess('New salary structure created.');
      setIsStructModalOpen(false);
      fetchStructures();
      selectStructure(res);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenRuleModal = (rule = null) => {
    if (rule) {
      setEditingRuleId(rule.id);
      setRuleForm({
        name: rule.name,
        code: rule.code,
        category: rule.category,
        sequence: rule.sequence,
        computation_method: rule.computation_method,
        amount: rule.amount || '',
        percentage_of_rule_code: rule.percentage_of_rule_code || 'BASIC',
        formula: rule.formula || ''
      });
    } else {
      setEditingRuleId(null);
      const maxSeq = rules.length > 0 ? Math.max(...rules.map((r) => r.sequence)) + 10 : 10;
      setRuleForm({
        name: '',
        code: '',
        category: 'allowance',
        sequence: maxSeq,
        computation_method: 'percentage',
        amount: 20,
        percentage_of_rule_code: 'BASIC',
        formula: ''
      });
    }
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingRuleId) {
        await api.updateSalaryRule(editingRuleId, ruleForm);
        setSuccess('Salary rule updated.');
      } else {
        await api.createSalaryRule(selectedStructure.id, ruleForm);
        setSuccess('New salary rule added to structure sequence.');
      }
      setIsRuleModalOpen(false);
      selectStructure(selectedStructure);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this salary rule?')) return;
    try {
      setError(null);
      await api.deleteSalaryRule(ruleId);
      setSuccess('Salary rule deleted.');
      selectStructure(selectedStructure);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="salary-structures-container">
      <div className="page-header">
        <div className="page-title-group">
          <h2>Salary Structures & Sequential Rule Engine</h2>
          <span className="page-subtitle">Define ordered computation sequences (Basic, Allowances, Gross, Deductions, Net)</span>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setStructForm({ name: '', description: '', active: true });
              setIsStructModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>New Structure</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      <div className="structure-layout-grid">
        {/* Left Column: Structure Selector */}
        <div className="structure-sidebar">
          <h4 className="sidebar-title">Configured Structures</h4>
          <div className="structure-card-list">
            {structures.map((s) => (
              <div
                key={s.id}
                className={`structure-selector-card ${selectedStructure?.id === s.id ? 'active' : ''}`}
                onClick={() => selectStructure(s)}
              >
                <div className="struct-card-top">
                  <span className="struct-name">{s.name}</span>
                  <span className="badge badge-success">{s.active ? 'Active' : 'Archived'}</span>
                </div>
                <p className="struct-desc">{s.description || 'No description provided'}</p>
                <div className="struct-meta">
                  <span>{s.rule_count} rules</span>
                  <span>•</span>
                  <span>{s.active_employee_count} active contracts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Rule Sequencer */}
        <div className="card rule-sequencer-card">
          <div className="sequencer-header">
            <div>
              <h3>{selectedStructure ? selectedStructure.name : 'Select a Structure'}</h3>
              <p className="sequencer-subtitle">
                Rules execute in strict ascending <strong>Sequence</strong> order. Later rules reference earlier computed codes.
              </p>
            </div>
            {selectedStructure && (
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenRuleModal()}>
                <Plus size={14} />
                <span>Add Rule</span>
              </button>
            )}
          </div>

          <DataTable
            columns={[
              {
                header: 'Seq #',
                accessor: 'sequence',
                render: (r) => (
                  <span className="font-mono font-bold seq-chip">{r.sequence}</span>
                )
              },
              {
                header: 'Rule Code',
                accessor: 'code',
                render: (r) => <strong className="font-mono">{r.code}</strong>
              },
              { header: 'Rule Name', accessor: 'name' },
              {
                header: 'Category',
                accessor: 'category',
                render: (r) => {
                  const colors = {
                    basic: 'badge-info',
                    allowance: 'badge-success',
                    gross: 'badge-primary',
                    deduction: 'badge-danger',
                    net: 'badge-success'
                  };
                  return <span className={`badge ${colors[r.category] || 'badge-neutral'}`}>{r.category}</span>;
                }
              },
              {
                header: 'Computation',
                accessor: 'computation_method',
                render: (r) => {
                  if (r.computation_method === 'fixed') {
                    return <span>Fixed: ₹{parseFloat(r.amount || 0).toLocaleString()}</span>;
                  }
                  if (r.computation_method === 'percentage') {
                    return <span>{r.amount}% of {r.percentage_of_rule_code}</span>;
                  }
                  return <code className="formula-preview">{r.formula}</code>;
                }
              },
              {
                header: 'Actions',
                accessor: 'id',
                align: 'right',
                render: (r) => (
                  <div className="rule-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleOpenRuleModal(r)}>
                      <Edit size={12} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRule(r.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              }
            ]}
            data={rules}
            searchKey="name"
            searchPlaceholder="Filter rules by name or code..."
            pageSize={15}
          />
        </div>
      </div>

      {/* Modal: New Structure */}
      <Modal
        isOpen={isStructModalOpen}
        onClose={() => setIsStructModalOpen(false)}
        title="Create Salary Structure"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateStructure} className="structure-modal-form">
          <div className="form-group">
            <label className="form-label">Structure Name *</label>
            <input
              type="text"
              className="form-input"
              value={structForm.name}
              onChange={(e) => setStructForm({ ...structForm, name: e.target.value })}
              placeholder="e.g. Sales Executive Structure"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={structForm.description}
              onChange={(e) => setStructForm({ ...structForm, description: e.target.value })}
              placeholder="Brief summary of included benefits and deductions"
            />
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsStructModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Structure
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add/Edit Salary Rule */}
      <Modal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        title={editingRuleId ? 'Edit Salary Rule' : 'Add Rule to Sequence'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveRule} className="rule-modal-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Rule Name *</label>
              <input
                type="text"
                className="form-input"
                value={ruleForm.name}
                onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                placeholder="e.g. Special Allowance"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rule Code (Unique Identifier) *</label>
              <input
                type="text"
                className="form-input font-mono"
                value={ruleForm.code}
                onChange={(e) => setRuleForm({ ...ruleForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SPECIAL_ALLOW"
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={ruleForm.category}
                onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                required
              >
                <option value="basic">Basic Wage</option>
                <option value="allowance">Allowance</option>
                <option value="gross">Gross Total</option>
                <option value="deduction">Deduction</option>
                <option value="net">Net Total</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sequence Execution Order *</label>
              <input
                type="number"
                className="form-input"
                value={ruleForm.sequence}
                onChange={(e) => setRuleForm({ ...ruleForm, sequence: parseInt(e.target.value, 10) })}
                required
              />
              <span className="form-helper">Lower numbers evaluate first</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Computation Method *</label>
            <select
              className="form-select"
              value={ruleForm.computation_method}
              onChange={(e) => setRuleForm({ ...ruleForm, computation_method: e.target.value })}
              required
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage of Prior Rule</option>
              <option value="formula">Mathematical Expression Formula</option>
            </select>
          </div>

          {/* Conditional inputs */}
          {ruleForm.computation_method === 'fixed' && (
            <div className="form-group">
              <label className="form-label">Fixed Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                value={ruleForm.amount}
                onChange={(e) => setRuleForm({ ...ruleForm, amount: e.target.value })}
                placeholder="Leave blank for BASIC to use contract wage"
              />
            </div>
          )}

          {ruleForm.computation_method === 'percentage' && (
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Percentage Rate (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={ruleForm.amount}
                  onChange={(e) => setRuleForm({ ...ruleForm, amount: e.target.value })}
                  placeholder="e.g. 40"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Percentage of Rule Code *</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={ruleForm.percentage_of_rule_code}
                  onChange={(e) => setRuleForm({ ...ruleForm, percentage_of_rule_code: e.target.value.toUpperCase() })}
                  placeholder="e.g. BASIC or GROSS"
                  required
                />
              </div>
            </div>
          )}

          {ruleForm.computation_method === 'formula' && (
            <div className="form-group">
              <label className="form-label">Expression Formula *</label>
              <input
                type="text"
                className="form-input font-mono"
                value={ruleForm.formula}
                onChange={(e) => setRuleForm({ ...ruleForm, formula: e.target.value })}
                placeholder="e.g. BASIC + HRA + SPECIAL_ALLOW or GROSS - PF - PT - TDS"
                required
              />
              <span className="form-helper">
                Available variables: Any prior rule code in sequence, plus <code>WAGE</code>, <code>WORKED_DAYS</code>.
              </span>
            </div>
          )}

          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsRuleModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingRuleId ? 'Update Rule' : 'Add Rule to Sequence'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
