import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Briefcase, ShieldCheck, CheckCircle2, Clock, Save, Sparkles, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { employeeApi } from '../../services/api';
import Topbar from '../../components/layout/Topbar';
import sound from '../../utils/sound';

export default function EmployeeProfile() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
  });

  const fetchProfile = async () => {
    try {
      const res = await employeeApi.getMyProfile();
      if (res?.success && res.data) {
        setProfileData(res.data);
        setFormData({
          name: res.data.user.name || '',
          designation: res.data.user.designation || res.data.member?.role || '',
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    sound.playClick();
    try {
      const res = await employeeApi.updateMyProfile({
        name: formData.name.trim(),
        designation: formData.designation.trim(),
      });

      if (res?.success) {
        sound.playSuccess();
        toast.success('Profile updated successfully!');
        setProfileData((prev) => ({
          ...prev,
          user: res.data.user,
        }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Topbar title="My Profile" subtitle="Loading profile telemetry…" />
        <div style={{ padding: '60px', textAlign: 'center', color: '#6D6F7C' }}>
          Loading profile telemetry…
        </div>
      </div>
    );
  }

  const u = profileData?.user || authUser || {};
  const stats = profileData?.taskStats || { total: 0, completed: 0, inProgress: 0 };
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div>
      <Topbar title="My Profile" subtitle="Manage workspace identity &amp; credentials" />

      <div className="employee-page">
        {/* Header */}
        <motion.div
          className="employee-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="employee-title-group">
            <div className="employee-title-row">
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#F4F2EE', letterSpacing: '-0.02em', margin: 0 }}>
                Specialist Profile
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 9px',
                  borderRadius: 20,
                  background: 'rgba(114, 201, 165, 0.15)',
                  border: '1px solid rgba(114, 201, 165, 0.3)',
                  color: '#72C9A5',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                <ShieldCheck size={12} />
                Verified Specialist
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#A5A5B0', marginTop: 4 }}>
              Manage your workspace identity, engineering designation, and system preferences.
            </p>
          </div>
        </motion.div>

        {/* Profile Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 24,
          }}
          className="profile-grid"
        >
          {/* Left Avatar Card */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 22,
                background: 'linear-gradient(135deg, #9B8AFB, #78DCE8)',
                color: '#101116',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.25rem',
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(155, 138, 251, 0.25)',
                overflow: 'hidden',
              }}
            >
              {u.avatar ? (
                <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{u.name?.[0]?.toUpperCase() || 'E'}</span>
              )}
            </div>

            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F4F2EE' }}>{u.name}</div>
              <div style={{ fontSize: '0.8125rem', color: '#D8C7A3', fontWeight: 500, marginTop: 2 }}>
                {u.designation || 'Engineering Specialist'}
              </div>
            </div>

            <div
              style={{
                fontSize: '0.785rem',
                color: '#A5A5B0',
                background: '#101116',
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Mail size={13} color="#9B8AFB" />
              <span>{u.email}</span>
            </div>

            {/* Performance Meter */}
            <div
              style={{
                width: '100%',
                background: '#101116',
                borderRadius: 12,
                padding: 16,
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                marginTop: 6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem' }}>
                <span style={{ color: '#A5A5B0' }}>Delivery Rate</span>
                <strong style={{ color: '#72C9A5' }}>{completionRate}%</strong>
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${completionRate}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #9B8AFB, #72C9A5)',
                    borderRadius: 3,
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6D6F7C' }}>
                <span>{stats.completed} Completed</span>
                <span>{stats.total} Total</span>
              </div>
            </div>
          </motion.div>

          {/* Right Form Card */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: 28,
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F4F2EE', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={17} color="#9B8AFB" />
              <span>Identity &amp; Professional Details</span>
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#A5A5B0', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  disabled={saving}
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 14px',
                    background: '#101116',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    color: '#F4F2EE',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#A5A5B0', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Professional Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Lead Frontend Engineer"
                  disabled={saving}
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 14px',
                    background: '#101116',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    color: '#F4F2EE',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#A5A5B0', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Work Email (Managed by Admin)
                </label>
                <input
                  type="email"
                  value={u.email || ''}
                  disabled
                  style={{
                    width: '100%',
                    height: 42,
                    padding: '0 14px',
                    background: 'rgba(16, 17, 22, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 10,
                    color: '#6D6F7C',
                    fontSize: '0.875rem',
                    cursor: 'not-allowed',
                  }}
                />
              </div>

              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ padding: '8px 24px', fontSize: '0.85rem' }}
                >
                  <Save size={15} />
                  <span>{saving ? 'Saving changes…' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
