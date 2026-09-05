import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Briefcase, ShieldAlert, CheckCircle2, DollarSign } from 'lucide-react';
import './KanbanBoard.css';

export default function KanbanBoard({ employees = [], groupBy = 'department_name' }) {
  const navigate = useNavigate();

  // Group employees
  const groups = employees.reduce((acc, emp) => {
    const key = emp[groupBy] || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(emp);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups).sort();

  return (
    <div className="kanban-board-container">
      {groupKeys.map((groupName) => (
        <div key={groupName} className="kanban-column">
          <div className="kanban-column-header">
            <h4 className="kanban-column-title">{groupName}</h4>
            <span className="kanban-count-pill">{groups[groupName].length}</span>
          </div>

          <div className="kanban-cards-wrapper">
            {groups[groupName].map((emp) => (
              <div
                key={emp.id}
                className="kanban-employee-card"
                onClick={() => navigate(`/employees/${emp.id}`)}
              >
                <div className="kanban-card-top">
                  {emp.photo_url ? (
                    <img src={emp.photo_url} alt={emp.full_name} className="kanban-avatar" />
                  ) : (
                    <div className="kanban-avatar-fallback">
                      {emp.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="kanban-top-details">
                    <span className="kanban-emp-name">{emp.full_name}</span>
                    <span className="kanban-emp-title">{emp.job_title || 'Employee'}</span>
                  </div>
                </div>

                <div className="kanban-card-body">
                  <div className="kanban-info-row">
                    <Mail size={13} className="kanban-icon" />
                    <span>{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="kanban-info-row">
                      <Phone size={13} className="kanban-icon" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>

                <div className="kanban-card-footer">
                  <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                    {emp.status}
                  </span>

                  <span className="badge badge-info">
                    {emp.employee_type.replace('_', ' ')}
                  </span>

                  {emp.current_wage && (
                    <span className="kanban-wage-tag">
                      ₹{parseFloat(emp.current_wage).toLocaleString()}
                    </span>
                  )}

                  {!emp.bank_account_number || !emp.bank_verified ? (
                    <span className="kanban-warning-tag" title="Missing or unverified bank details">
                      <ShieldAlert size={12} />
                      <span>Bank Info</span>
                    </span>
                  ) : (
                    <span className="kanban-verified-tag" title="Bank account verified">
                      <CheckCircle2 size={12} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
