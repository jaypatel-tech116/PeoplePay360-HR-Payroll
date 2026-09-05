import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';
import { Plus, Clock, Edit, CheckCircle2, Calculator } from 'lucide-react';
import './WorkingSchedulesPage.css';

const DAYS_OF_WEEK = [
  { val: 1, label: 'Monday' },
  { val: 2, label: 'Tuesday' },
  { val: 3, label: 'Wednesday' },
  { val: 4, label: 'Thursday' },
  { val: 5, label: 'Friday' },
  { val: 6, label: 'Saturday' },
  { val: 0, label: 'Sunday' }
];

export default function WorkingSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [scheduleType, setScheduleType] = useState('full_time');
  const [lines, setLines] = useState([]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await api.getSchedules();
      setSchedules(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Compute derived hours live on client for instant preview
  const derivedWeeklyHours = lines.reduce((acc, line) => {
    if (!line.enabled || !line.start_time || !line.end_time) return acc;
    const [sH, sM] = line.start_time.split(':').map(Number);
    const [eH, eM] = line.end_time.split(':').map(Number);
    const diff = (eH * 60 + eM) - (sH * 60 + sM) - parseInt(line.break_duration_minutes || 0, 10);
    return acc + (diff > 0 ? diff / 60 : 0);
  }, 0);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setScheduleType('full_time');
    // Default 5-day week
    const defaultLines = DAYS_OF_WEEK.map((d) => ({
      day_of_week: d.val,
      day_label: d.label,
      enabled: d.val >= 1 && d.val <= 5,
      start_time: '09:00',
      end_time: '18:00',
      break_duration_minutes: 60
    }));
    setLines(defaultLines);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sched) => {
    setEditingId(sched.id);
    setName(sched.name);
    setScheduleType(sched.schedule_type);

    const existingDays = {};
    (sched.lines || []).forEach((l) => {
      existingDays[l.day_of_week] = l;
    });

    const populated = DAYS_OF_WEEK.map((d) => {
      const match = existingDays[d.val];
      return {
        day_of_week: d.val,
        day_label: d.label,
        enabled: !!match,
        start_time: match ? match.start_time.substring(0, 5) : '09:00',
        end_time: match ? match.end_time.substring(0, 5) : '18:00',
        break_duration_minutes: match ? match.break_duration_minutes : 60
      };
    });

    setLines(populated);
    setIsModalOpen(true);
  };

  const updateLineField = (dayVal, field, val) => {
    setLines(
      lines.map((l) => (l.day_of_week === dayVal ? { ...l, [field]: val } : l))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      // Filter only enabled lines
      const activeLines = lines
        .filter((l) => l.enabled)
        .map((l) => ({
          day_of_week: l.day_of_week,
          start_time: l.start_time,
          end_time: l.end_time,
          break_duration_minutes: parseInt(l.break_duration_minutes || 0, 10)
        }));

      if (editingId) {
        await api.updateSchedule(editingId, {
          name,
          schedule_type: scheduleType,
          lines: activeLines
        });
        setSuccess('Schedule and derived hours updated successfully.');
      } else {
        await api.createSchedule({
          name,
          schedule_type: scheduleType,
          lines: activeLines
        });
        setSuccess('New working schedule created.');
      }
      setIsModalOpen(false);
      fetchSchedules();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    { header: 'Schedule Name', accessor: 'name' },
    {
      header: 'Type',
      accessor: 'schedule_type',
      render: (r) => <span className="badge badge-info">{r.schedule_type.replace('_', ' ')}</span>
    },
    {
      header: 'Total Weekly Hours',
      accessor: 'total_weekly_hours',
      render: (r) => (
        <span className="font-mono font-bold" style={{ color: 'var(--color-primary)' }}>
          {parseFloat(r.total_weekly_hours).toFixed(1)} hrs/week (Auto-Derived)
        </span>
      )
    },
    {
      header: 'Assigned Headcount',
      accessor: 'assigned_employees_count',
      render: (r) => `${r.assigned_employees_count} employees`
    },
    {
      header: 'Actions',
      accessor: 'id',
      align: 'right',
      render: (r) => (
        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(r)}>
          <Edit size={13} />
          <span>Edit Grid</span>
        </button>
      )
    }
  ];

  return (
    <div className="schedules-page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h2>Working Schedules</h2>
          <span className="page-subtitle">Configurable day/time grids with strictly auto-derived weekly hours</span>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>New Schedule</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      <DataTable
        columns={columns}
        data={schedules}
        searchKey="name"
        searchPlaceholder="Search schedules..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Working Schedule Grid' : 'Create Working Schedule'}
        maxWidth="760px"
      >
        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Schedule Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard Full-Time (40h)"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Schedule Type</label>
              <select
                className="form-select"
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="shift">Shift</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          {/* Derived Hours Live Indicator */}
          <div className="derived-hours-card">
            <Calculator size={20} className="calculator-icon" />
            <div className="derived-hours-text">
              <span className="derived-hours-val">{derivedWeeklyHours.toFixed(1)} hrs</span>
              <span className="derived-hours-desc">
                Derived Weekly Hours (Calculated strictly from lines sum: end - start - break)
              </span>
            </div>
          </div>

          {/* Daily Lines Grid */}
          <div className="lines-grid-wrapper">
            <div className="lines-grid-header">
              <span>Day</span>
              <span>Working?</span>
              <span>Start Time</span>
              <span>End Time</span>
              <span>Break (mins)</span>
            </div>

            {lines.map((l) => (
              <div key={l.day_of_week} className={`line-row ${l.enabled ? 'enabled' : 'disabled'}`}>
                <span className="day-name">{l.day_label}</span>
                <input
                  type="checkbox"
                  checked={l.enabled}
                  onChange={(e) => updateLineField(l.day_of_week, 'enabled', e.target.checked)}
                />
                <input
                  type="time"
                  className="form-input line-time-input"
                  value={l.start_time}
                  disabled={!l.enabled}
                  onChange={(e) => updateLineField(l.day_of_week, 'start_time', e.target.value)}
                />
                <input
                  type="time"
                  className="form-input line-time-input"
                  value={l.end_time}
                  disabled={!l.enabled}
                  onChange={(e) => updateLineField(l.day_of_week, 'end_time', e.target.value)}
                />
                <input
                  type="number"
                  className="form-input line-break-input"
                  value={l.break_duration_minutes}
                  disabled={!l.enabled}
                  onChange={(e) => updateLineField(l.day_of_week, 'break_duration_minutes', e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Schedule' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
