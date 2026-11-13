import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Sparkles, Send, Bot, User, ArrowRight,
  ShieldAlert, Clock, FolderKanban, CheckCircle, ChevronDown
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

const SUGGESTED_QUESTIONS = [
  "Which project is most likely to be delayed?",
  "What should I focus on today?",
  "Who is currently overloaded on the team?",
  "What tasks are overdue?",
  "How are all my projects performing?",
  "Suggest a plan to reduce schedule risks"
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your US-CODED Intelligence Assistant. I continuously inspect live Digital Twin telemetry, tasks, and project velocity to advise you on schedule risks and optimal decisions. How can I assist you today?",
      suggestions: [
        "Which project is most likely to be delayed?",
        "What should I focus on today?",
        "Who is currently overloaded on the team?"
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
      const res = await aiApi.ask(textToSend.trim());
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
        toast.error('AI assistant was unable to process query');
      }
    } catch (err) {
      toast.error(err.message || 'Error communicating with AI engine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: clr.bg, minHeight: '100vh', color: clr.text, display: 'flex', flexDirection: 'column' }}>
      <Topbar
        title="US-CODED Intelligence Assistant"
        subtitle="Natural language query engine grounded in real-time Digital Twin project telemetry"
      />

      <div style={{
        flex: 1,
        maxWidth: 1000,
        width: '100%',
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        height: 'calc(100vh - 120px)'
      }}>
        
        {/* Chat Messages Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
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
                    background: 'rgba(155, 138, 251, 0.2)',
                    border: '1px solid rgba(155, 138, 251, 0.4)',
                    color: clr.primaryLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Sparkles size={18} />
                  </div>
                )}

                <div style={{
                  maxWidth: '75%',
                  background: isUser ? 'rgba(155, 138, 251, 0.2)' : clr.surface,
                  border: `1px solid ${isUser ? 'rgba(155, 138, 251, 0.4)' : clr.border}`,
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

                  {/* Relevant Data Cards */}
                  {msg.relevantData && msg.relevantData.length > 0 && (
                    <div style={{
                      marginTop: 8,
                      paddingTop: 10,
                      borderTop: `1px solid ${clr.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: clr.muted, textTransform: 'uppercase' }}>
                        Retrieved Project Telemetry:
                      </span>
                      {msg.relevantData.slice(0, 3).map((item, dIdx) => (
                        <div key={dIdx} style={{
                          background: clr.elevated,
                          border: `1px solid ${clr.border}`,
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontSize: '0.8rem',
                          color: clr.beige
                        }}>
                          <span style={{ fontWeight: 700 }}>{item.taskTitle || item.name || item.projectName}: </span>
                          <span>{item.reason || item.description || item.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Follow-ups */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div style={{
                      marginTop: 6,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6
                    }}>
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
                            cursor: 'pointer',
                            textAlign: 'left'
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

          {/* Typing Indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(155, 138, 251, 0.2)',
                border: '1px solid rgba(155, 138, 251, 0.4)',
                color: clr.primaryLight,
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

        {/* Quick Suggestion Chips (when idle) */}
        {!loading && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q, qIdx) => (
              <button
                key={qIdx}
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
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = clr.primaryLight; e.currentTarget.style.borderColor = clr.primary; }}
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
            placeholder="Ask about project delays, critical tasks, workload, or strategy..."
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
              background: input.trim() && !loading ? 'linear-gradient(135deg, #9B8AFB 0%, #B5A5FF 100%)' : 'rgba(255,255,255,0.08)',
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
          background: #9B8AFB;
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

