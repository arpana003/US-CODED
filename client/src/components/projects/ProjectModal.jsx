import { useState } from 'react';
import { X } from 'lucide-react';
import { projectsApi } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Planning', 'Active', 'Completed', 'On Hold'];
const COLOR_OPTIONS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9',
  '#06b6d4', '#14b8a6', '#22c55e', '#f59e0b', '#ef4444', '#f97316',
];

const toDateInput = (d) => {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
};

export default function ProjectModal({ mode, project, teamMembers, onClose, onSuccess }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    startDate: toDateInput(project?.startDate) || '',
    deadline: toDateInput(project?.deadline) || '',
    status: project?.status || 'Planning',
    progress: project?.progress || 0,
    team: project?.team?.map((m) => m._id || m) || [],
    color: project?.color || '#6366f1',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.deadline) e.deadline = 'Deadline is required';
    if (form.startDate && form.deadline && form.deadline < form.startDate)
      e.deadline = 'Deadline must be after start date';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await projectsApi.update(project._id, form);
        toast.success('Project updated!');
      } else {
        await projectsApi.create(form);
        toast.success('Project created!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (id) => {
    set('team', form.team.includes(id)
      ? form.team.filter((m) => m !== id)
      : [...form.team, id]
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Name <span className="required">*</span></label>
            <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Project name" />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief project description…" />
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date <span className="required">*</span></label>
              <input type="date" className="form-input" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              {errors.startDate && <span className="form-error">{errors.startDate}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Deadline <span className="required">*</span></label>
              <input type="date" className="form-input" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
              {errors.deadline && <span className="form-error">{errors.deadline}</span>}
            </div>
          </div>

          {/* Status */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 6 }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c} type="button"
                    onClick={() => set('color', c)}
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: c, border: `3px solid ${form.color === c ? '#fff' : 'transparent'}`,
                      cursor: 'pointer', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Team */}
          {teamMembers.length > 0 && (
            <div className="form-group">
              <label className="form-label">Team Members</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {teamMembers.map((m) => {
                  const selected = form.team.includes(m._id);
                  return (
                    <button
                      key={m._id} type="button"
                      onClick={() => toggleMember(m._id)}
                      className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
