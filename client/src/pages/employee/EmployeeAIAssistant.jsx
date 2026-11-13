import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Sparkles, Send, User, CheckCircle2,
  Clock, AlertTriangle, ArrowRight
} from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import { aiApi } from '../../services/api';
import toast from 'react-hot-toast';

const clr = {
  bg: '#101116',
  surface: '#15161B',
  elevated: '#1B1D24',
  primary: '#9B8AFB',
  primaryLight: '#B5A5FF',
  cyan: '#78DCE8',
  beige: '#D8C7A3',
  ivory: '#F3EFE7',
  success: '#72C9A5',
  warning: '#E7B86C',
  danger: '#E47C82',
  text: '#F4F2EE',
  muted: '#A5A5B0',
  border: 'rgba(255,255,255,0.09)'
};

const EMPLOYEE_QUESTIONS = [
  "What task should I focus on first?",
  "What are my upcoming deadlines?",
  "Which of my tasks are overdue?",
  "What should I do if I am blocked?",
  "Summarize my assigned responsibilities"
];

export default function EmployeeAIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your personal US-CODED Task Assistant. I have secure visibility into your assigned deliverables, sprint deadlines, and instructions. What would you like help prioritizing today?",
      suggestions: [
        "What task should I focus on first?",
        "What are my upcoming deadlines?",
        "Which of my tasks are overdue?"
      ],
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.employeeAsk(textToSend.trim());
      if (res?.success) {
        const aiMsg = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          text: res.data.answer,
          relevantData: res.data.relevantData || [],
          suggestions: res.data.suggestions || [],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        toast.error(res?.message || 'Unable to process question');
      }
    } catch (err) {
      toast.error(err.message || 'Error communicating with assistant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: clr.bg, minHeight: '100vh', color: clr.text, display: 'flex', flexDirection: 'column' }}>
      <Topbar
        title="Personal AI Assistant"
        subtitle="Individual task prioritization, deadline alerts, and delivery guidance"
      />

      <div style={{
        flex: 1,
        maxWidth: 900,
        width: '100%',
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        height: 'calc(100vh - 120px)'
      }}>
        
        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          paddingRight: 6
        }}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: 12,
                  alignItems: 'flex-start'
                }}
              >
                {!isUser && (
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(120, 220, 232, 0.2)',
                    border: '1px solid rgba(120, 220, 232, 0.4)',
                    color: clr.cyan,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Sparkles size={18} />
                  </div>
                )}

                <div style={{
                  maxWidth: '75%',
                  background: isUser ? 'rgba(120, 220, 232, 0.2)' : clr.surface,
                  border: `1px solid ${isUser ? 'rgba(120, 220, 232, 0.4)' : clr.border}`,
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '16px 20px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  <div style={{ fontSize: '0.92rem', lineHeight: 1.55, color: clr.text, whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>

                  {/* Task details pills if present */}
                  {msg.relevantData && msg.relevantData.length > 0 && (
                    <div style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: `1px solid ${clr.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: clr.cyan, textTransform: 'uppercase' }}>
                        Your Tasks in Scope:
                      </span>
                      {msg.relevantData.map((t, idx) => (
                        <div key={idx} style={{
                          background: clr.elevated,
                          border: `1px solid ${clr.border}`,
                          borderRadius: 8,
                          padding: '6px 10px',
                          fontSize: '0.78rem',
                          color: clr.beige,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span style={{ fontWeight: 600 }}>{t.taskTitle}</span>
                          <span style={{ fontSize: '0.7rem', color: clr.muted }}>{t.urgencyLevel} Urgency</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Follow-up Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${clr.border}`,
                            borderRadius: 12,
                            padding: '4px 10px',
                            color: clr.cyan,
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                          }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <span style={{ fontSize: '0.65rem', color: clr.muted, alignSelf: isUser ? 'flex-end' : 'flex-start', marginTop: 2 }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isUser && (
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: `1px solid ${clr.border}`,
                    color: clr.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <User size={18} />
                  </div>
                )}
              </motion.div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(120, 220, 232, 0.2)',
                border: '1px solid rgba(120, 220, 232, 0.4)',
                color: clr.cyan,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Sparkles size={18} />
              </div>
              <div style={{
                background: clr.surface,
                border: `1px solid ${clr.border}`,
                borderRadius: 16,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span className="dot dot1" />
                <span className="dot dot2" />
                <span className="dot dot3" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {!loading && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {EMPLOYEE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                style={{
                  background: clr.surface,
                  border: `1px solid ${clr.border}`,
                  borderRadius: 20,
                  padding: '6px 14px',
                  color: clr.muted,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = clr.cyan; e.currentTarget.style.borderColor = clr.cyan; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = clr.muted; e.currentTarget.style.borderColor = clr.border; }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div style={{
          background: clr.surface,
          border: `1px solid ${clr.border}`,
          borderRadius: 14,
          padding: '8px 12px 8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <input
            type="text"
            placeholder="Ask about your task priority, next deadline, or blocker guidance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={loading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: clr.text,
              fontSize: '0.9rem'
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: 'none',
              background: input.trim() && !loading ? 'linear-gradient(135deg, #78DCE8 0%, #B5A5FF 100%)' : 'rgba(255,255,255,0.08)',
              color: input.trim() && !loading ? '#101116' : clr.muted,
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #78DCE8;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .dot1 { animation-delay: -0.32s; }
        .dot2 { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

