import { useState } from 'react';
import { X } from 'lucide-react';
import { tasksApi } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

const toDateInput = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

export default function TaskModal({ mode, task, projectId, teamMembers, onClose, onSuccess }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    project: task?.project?._id || task?.project || projectId,
    assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
    deadline: toDateInput(task?.deadline),
    status: task?.status || 'To Do',
    priority: task?.priority || 'Medium',
    issueNotes: task?.issueNotes || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = { ...form };
    if (!payload.assignedTo) delete payload.assignedTo;
    if (!payload.deadline) delete payload.deadline;

    setLoading(true);
    try {
      if (isEdit) {
        await tasksApi.update(task._id, payload);
        toast.success('Task updated!');
      } else {
        await tasksApi.create(payload);
        toast.success('Task created!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title <span className="required">*</span></label>
            <input className="form-input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Task title" />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Task details…" style={{ minHeight: 80 }} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <select className="form-select" value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}>
                <option value="">— Unassigned —</option>
                {teamMembers.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input type="date" className="form-input" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Issue / Problem Notes</label>
            <textarea
              className="form-textarea"
              value={form.issueNotes}
              onChange={(e) => set('issueNotes', e.target.value)}
              placeholder="Any blockers, issues, or problems to flag…"
              style={{ minHeight: 70 }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
