import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, AlertCircle, CheckCircle2, Clock, Send, MessageSquare,
  FileText, Activity, FolderKanban, User, ShieldCheck, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeApi } from '../../services/api';
import Topbar from '../../components/layout/Topbar';
import sound from '../../utils/sound';

const ALLOWED_STATUSES = ['To Do', 'In Progress', 'Under Review', 'Completed', 'Blocked'];

export default function EmployeeTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Form states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [completionNote, setCompletionNote] = useState('');
  const [newComment, setNewComment] = useState('');

  const fetchTask = async () => {
    try {
      const res = await employeeApi.getMyTaskById(id);
      if (res?.success && res.data) {
        setTask(res.data);
        setSelectedStatus(res.data.status || 'To Do');
        setCompletionNote(res.data.completionNote || '');
      } else {
        toast.error('Task not found or unauthorized');
        navigate('/employee/tasks');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load task details');
      navigate('/employee/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (selectedStatus === task?.status && completionNote === (task?.completionNote || '')) {
      toast('No status changes detected', { icon: 'ℹ️' });
      return;
    }

    setUpdating(true);
    sound.playClick();
    try {
      const res = await employeeApi.updateMyTaskStatus(id, {
        status: selectedStatus,
        completionNote: selectedStatus === 'Completed' ? completionNote : undefined,
      });

      if (res?.success && res.data) {
        setTask(res.data);
        sound.playSuccess();
        toast.success(`Task status updated to ${selectedStatus}!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    sound.playClick();
    try {
      const res = await employeeApi.addComment(id, { text: newComment.trim() });
      if (res?.success && res.data) {
        setTask(res.data);
        setNewComment('');
        sound.playSuccess();
        toast.success('Comment posted');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Topbar title="Task Detail" subtitle="Loading task telemetry…" />
        <div style={{ padding: '60px', textAlign: 'center', color: '#6D6F7C' }}>
          Loading task telemetry…
        </div>
      </div>
    );
  }

  if (!task) return null;

  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    !['Completed', 'Done'].includes(task.status);

  return (
    <div>
      <Topbar title="Task Detail" subtitle={`Work Item: ${task.title}`} />

      <div className="employee-page">
        {/* Back Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              navigate('/employee/tasks');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#A5A5B0',
              padding: '8px 14px',
              borderRadius: '9px',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to My Tasks</span>
          </button>
        </div>

        {/* Main Split Grid */}
        <div className="task-detail-grid">
          {/* Left Column: Details, Guidance, Comments, History */}
          <div className="task-detail-main">
            {/* Main Info Card */}
            <div
              style={{
                background: '#15161B',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#78DCE8',
                    background: 'rgba(120, 220, 232, 0.12)',
                    padding: '3px 9px',
                    borderRadius: 6,
                    textTransform: 'uppercase',
                  }}
                >
                  {task.project?.name || task.projectId?.name || 'Project'}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: task.priority === 'High' ? '#E7B86C' : '#9B8AFB',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontWeight: 600,
                  }}
                >
                  {task.priority || 'Medium'} Priority
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: task.status === 'Completed' || task.status === 'Done' ? '#72C9A5' : '#B5A5FF',
                    background: task.status === 'Completed' || task.status === 'Done' ? 'rgba(114, 201, 165, 0.15)' : 'rgba(155, 138, 251, 0.15)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontWeight: 600,
                  }}
                >
                  {task.status}
                </span>
              </div>

              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#F4F2EE', margin: '4px 0', lineHeight: 1.3 }}>
                {task.title}
              </h1>

              <div style={{ color: '#A5A5B0', fontSize: '0.925rem', lineHeight: 1.6 }}>
                {task.description || 'No detailed description provided for this work item.'}
              </div>

              {/* Admin Instructions Callout */}
              {task.instructions && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(155, 138, 251, 0.12), rgba(216, 199, 163, 0.06))',
                    border: '1px solid rgba(155, 138, 251, 0.3)',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D8C7A3', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <ShieldCheck size={16} color="#9B8AFB" />
                    <span>Admin Instructions &amp; Guidance</span>
                  </div>
                  <div style={{ color: '#F4F2EE', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {task.instructions}
                  </div>
                </div>
              )}

              {/* Metadata Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 16,
                  background: '#101116',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6D6F7C', textTransform: 'uppercase' }}>Target Deadline</div>
                  <div style={{ fontSize: '0.875rem', color: isOverdue ? '#E47C82' : '#F4F2EE', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Calendar size={14} color={isOverdue ? '#E47C82' : '#9B8AFB'} />
                    <span>{task.deadline ? new Date(task.deadline).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6D6F7C', textTransform: 'uppercase' }}>Completion Evidence</div>
                  <div style={{ fontSize: '0.875rem', color: task.status === 'Completed' || task.status === 'Done' ? '#72C9A5' : '#A5A5B0', fontWeight: 600, marginTop: 4 }}>
                    {task.status === 'Completed' || task.status === 'Done' ? 'Verified Delivered' : 'Pending Verification'}
                  </div>
                </div>
              </div>

              {/* Completion Note if present */}
              {task.completionNote && (
                <div
                  style={{
                    background: 'rgba(114, 201, 165, 0.08)',
                    border: '1px solid rgba(114, 201, 165, 0.25)',
                    borderRadius: 10,
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ color: '#72C9A5', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                    Delivered Completion Note
                  </div>
                  <div style={{ color: '#F4F2EE', fontSize: '0.875rem' }}>
                    {task.completionNote}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Thread */}
            <div
              style={{
                background: '#15161B',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F4F2EE', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={17} color="#78DCE8" />
                <span>Discussion &amp; Updates ({task.comments?.length || 0})</span>
              </h2>

              <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <textarea
                  placeholder="Post an update, comment, or query to your project manager…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  disabled={submittingComment}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#101116',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 10,
                    color: '#F4F2EE',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="btn btn-primary"
                    style={{ padding: '7px 18px', fontSize: '0.8125rem' }}
                  >
                    <Send size={14} />
                    <span>{submittingComment ? 'Posting…' : 'Add Comment'}</span>
                  </button>
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(!task.comments || task.comments.length === 0) ? (
                  <div style={{ color: '#6D6F7C', fontSize: '0.8125rem', fontStyle: 'italic', padding: '8px 0' }}>
                    No comments posted yet.
                  </div>
                ) : (
                  task.comments.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#101116',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 10,
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#78DCE8' }}>{c.author}</span>
                        <span style={{ fontSize: '0.7rem', color: '#6D6F7C' }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#F4F2EE', lineHeight: 1.45 }}>{c.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit History */}
            {task.activityLog?.length > 0 && (
              <div
                style={{
                  background: '#15161B',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                }}
              >
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F4F2EE', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={16} color="#9B8AFB" />
                  <span>Activity Audit Log</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {task.activityLog.slice().reverse().map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.8rem', color: '#A5A5B0' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9B8AFB', marginTop: 6, flexShrink: 0 }} />
                      <div>
                        <span style={{ color: '#F4F2EE', fontWeight: 600 }}>{a.action}</span>
                        <span style={{ color: '#6D6F7C', marginLeft: 8 }}>by {a.by}</span>
                        <div style={{ fontSize: '0.7rem', color: '#6D6F7C', marginTop: 2 }}>
                          {a.at ? new Date(a.at).toLocaleString() : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Update Progress Box */}
          <div>
            <div
              style={{
                background: '#15161B',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                position: 'sticky',
                top: 88,
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F4F2EE', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color="#9B8AFB" />
                <span>Update Task Status</span>
              </h3>

              <form onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.785rem', color: '#A5A5B0', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Current Workflow State
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={updating}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      background: '#101116',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 10,
                      color: '#F4F2EE',
                      fontSize: '0.875rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {ALLOWED_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStatus === 'Completed' && (
                  <div>
                    <label style={{ fontSize: '0.785rem', color: '#72C9A5', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Completion Sign-off Note
                    </label>
                    <textarea
                      placeholder="Commit hashes, PR reference, or test evidence…"
                      value={completionNote}
                      onChange={(e) => setCompletionNote(e.target.value)}
                      rows={3}
                      disabled={updating}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#101116',
                        border: '1px solid rgba(114, 201, 165, 0.3)',
                        borderRadius: 10,
                        color: '#F4F2EE',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updating}
                  className="btn btn-primary"
                  style={{ width: '100%', height: 42, justifyContent: 'center' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{updating ? 'Recording Status…' : 'Save Task Progress'}</span>
                </button>
              </form>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 12, fontSize: '0.72rem', color: '#6D6F7C', lineHeight: 1.45 }}>
                Advances the digital twin schedule model and alerts your lead architect in real time.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
