import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, CheckSquare, Users, ArrowRight, X, Sparkles } from 'lucide-react';
import { projectsApi, tasksApi, teamApi } from '../../services/api';
import sound from '../../utils/sound';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      sound.playPop();
      setTimeout(() => inputRef.current?.focus(), 50);
      loadInitialData();
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [pRes, tRes, teamRes] = await Promise.allSettled([
        projectsApi.getAll(),
        tasksApi.getAll(),
        teamApi.getAll(),
      ]);

      const items = [];
      if (pRes.status === 'fulfilled' && pRes.value?.data) {
        pRes.value.data.forEach((p) => {
          items.push({
            id: p._id,
            title: p.name,
            subtitle: `Project · ${p.status || 'Active'}`,
            type: 'project',
            link: `/projects/${p._id}`,
            icon: FolderKanban,
          });
        });
      }

      if (tRes.status === 'fulfilled' && tRes.value?.data) {
        tRes.value.data.forEach((t) => {
          items.push({
            id: t._id,
            title: t.title,
            subtitle: `Task · ${t.status || 'To Do'} (${t.priority || 'Medium'})`,
            type: 'task',
            link: `/tasks`,
            icon: CheckSquare,
          });
        });
      }

      if (teamRes.status === 'fulfilled' && teamRes.value?.data) {
        teamRes.value.data.forEach((m) => {
          items.push({
            id: m._id,
            title: m.name,
            subtitle: `Team Member · ${m.role || 'Member'}`,
            type: 'team',
            link: `/team`,
            icon: Users,
          });
        });
      }

      setResults(items);
    } catch (_) {}
    setLoading(false);
  };

  const filtered = results.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item) => {
    sound.playClick();
    onClose();
    navigate(item.link);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 12, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          background: '#15161B',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 24px rgba(155, 138, 251, 0.15)',
          overflow: 'hidden',
          animation: 'paletteEntrance 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            gap: 12,
          }}
        >
          <Search size={19} color="#9B8AFB" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, tasks, team members… (Type or press ↑↓)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F4F2EE',
              fontSize: '0.975rem',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#A5A5B0',
              borderRadius: '6px',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {loading ? (
            <div style={{ padding: '28px', textAlign: 'center', color: '#A5A5B0', fontSize: '0.85rem' }}>
              Scanning workspace telemetry…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#6D6F7C', fontSize: '0.875rem' }}>
              No matches found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.slice(0, 10).map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(155, 138, 251, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(155, 138, 251, 0.25)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(155, 138, 251, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#B5A5FF' : '#A5A5B0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F4F2EE' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#A5A5B0' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6D6F7C' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#D8C7A3',
                      }}
                    >
                      {item.type}
                    </span>
                    <ArrowRight size={14} color={isSelected ? '#9B8AFB' : '#6D6F7C'} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            background: '#101116',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#6D6F7C',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4 }}>↑↓</kbd> Navigate</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4 }}>↵</kbd> Select</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4 }}>ESC</kbd> Close</span>
          </div>
          <span style={{ color: '#D8C7A3', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={11} /> US-CODED QuickNav
          </span>
        </div>
      </div>

      <style>{`
        @keyframes paletteEntrance {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

