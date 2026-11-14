import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Send,
  Bot,
  Sparkles,
  Maximize2,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  BrainCircuit,
  Key,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  streamMentorChat,
  getGeminiApiKey,
  setGeminiApiKey,
  hasGeminiApiKey,
  MentorContext,
} from '../services/geminiMentor';
import { MarkdownContent } from './MarkdownContent';

interface MentorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'mentor' | 'user';
  text: string;
  timestamp: string;
  actionable?: boolean;
  resourceTitle?: string;
  resourceUrl?: string;
}

export const MentorDrawer: React.FC<MentorDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [keyInput, setKeyInput] = useState(getGeminiApiKey());
  const [keySavedMessage, setKeySavedMessage] = useState(false);
  const [hasKey, setHasKey] = useState(hasGeminiApiKey());
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setHasKey(hasGeminiApiKey());
    setKeyInput(getGeminiApiKey());
  }, [isOpen]);

  useEffect(() => {
    const fetchGuidance = async () => {
      try {
        const data = await api.getMentorGuidance();
        setMessages((prev) => {
          if (prev.length === 0) {
            return [
              {
                id: 'init-1',
                sender: 'mentor',
                text: data.message,
                timestamp: 'Just now',
                actionable: true,
                resourceTitle: 'JavaScript ES6+ Promises & Closures Primer',
                resourceUrl: 'https://javascript.info/',
              },
            ];
          }
          return prev;
        });
      } catch (err) {
        console.warn('Could not load mentor guidance', err);
      }
    };
    fetchGuidance();
  }, [profile?.user_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSaveKey = () => {
    setGeminiApiKey(keyInput);
    setHasKey(hasGeminiApiKey());
    setKeySavedMessage(true);
    setTimeout(() => {
      setKeySavedMessage(false);
      setShowKeyConfig(false);
    }, 1500);
  };

  const handleClearKey = () => {
    setGeminiApiKey('');
    setKeyInput('');
    setHasKey(false);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    const mentorMsgId = (Date.now() + 1).toString();
    const initialMentorMsg: ChatMessage = {
      id: mentorMsgId,
      sender: 'mentor',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, initialMentorMsg]);
    setIsStreaming(true);

    try {
      const mentorCtx: MentorContext = {
        fullName: profile?.full_name,
        targetRole: profile?.target_role,
        readinessPct: profile?.readiness_pct,
        streakDays: profile?.streak_days,
        weeklyHours: profile?.weekly_hours,
        activePhaseTitle: 'Phase 1: Remedial JavaScript & Engine Mechanics',
        weakSkills: ['JavaScript', 'React', 'Node.js & APIs'],
        lastScore: { skill: 'JavaScript', score: 48 },
      };

      await streamMentorChat(query, mentorCtx, (accumulatedText) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === mentorMsgId ? { ...msg, text: accumulatedText } : msg
          )
        );
      });
    } catch (err) {
      console.warn('Chat stream error, providing fallback:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === mentorMsgId
            ? {
                ...msg,
                text:
                  msg.text ||
                  "I am actively monitoring your progress! Focus on your active remedial JavaScript phase, and let me know whenever you'd like an explanation on closures, event loop mechanics, or React state.",
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAddToRoadmap = (title: string) => {
    setAddedItems((prev) => new Set(prev).add(title));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">AI Career Mentor</h3>
                {hasKey ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-2.5 h-2.5" />
                    Gemini 2.0 Flash
                  </span>
                ) : (
                  <button
                    onClick={() => setShowKeyConfig(!showKeyConfig)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                    title="Click to configure Gemini API Key"
                  >
                    <Key className="w-2.5 h-2.5" />
                    Set Gemini Key
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Target: {profile?.target_role || 'Full Stack Developer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Configure Google Gemini API Key"
              aria-label="Configure Google Gemini API Key"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/mentor');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Expand to full screen"
              aria-label="Expand mentor to full screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Close mentor drawer"
              aria-label="Close mentor drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gemini API Key Configuration Dropdown */}
        {showKeyConfig && (
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/50 border-b border-indigo-100 dark:border-indigo-900/60 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Google Gemini API Configuration
              </span>
              <button
                onClick={() => setShowKeyConfig(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
              Enter your Gemini API Key to enable live Gemini 2.0 Flash responses. If omitted, the mentor runs on our verified deterministic agent engine.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
              <button
                onClick={handleSaveKey}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1"
              >
                {keySavedMessage ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{keySavedMessage ? 'Saved!' : 'Save'}</span>
              </button>
              {hasKey && (
                <button
                  onClick={handleClearKey}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shrink-0"
                  title="Remove saved key"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mentor Context Accordion (Goal, Weak skills, last score) */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowContext(!showContext)}
            className="w-full flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
              What your Mentor knows about you
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
              {showContext ? 'Hide' : 'Inspect'}
            </span>
          </button>

          {showContext && (
            <div className="mt-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5 animate-in fade-in duration-150">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Role:</span>
                <span className="font-semibold">{profile?.target_role || 'Full Stack'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Readiness:</span>
                <span className="font-semibold text-emerald-500">32% Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Diagnosed Deficits:</span>
                <span className="font-semibold text-amber-500">JavaScript, React, Node.js</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Assessment:</span>
                <span className="font-semibold text-rose-400">JavaScript Quiz: 48% (Poor)</span>
              </div>
            </div>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'mentor' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-xs'
                }`}
              >
                {m.sender === 'mentor' ? (
                  <MarkdownContent content={m.text} />
                ) : (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                )}


                {/* Inline resource suggestion card if available */}
                {m.resourceTitle && (
                  <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Recommended Practice Drill</span>
                    </div>
                    <span className="block font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {m.resourceTitle}
                    </span>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={m.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px] flex items-center gap-1 hover:text-indigo-500"
                      >
                        <span>Open Docs</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <button
                        onClick={() => handleAddToRoadmap(m.resourceTitle!)}
                        disabled={addedItems.has(m.resourceTitle!)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                          addedItems.has(m.resourceTitle!)
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
                            : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                        }`}
                      >
                        {addedItems.has(m.resourceTitle!) ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Added to Roadmap</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3 h-3" />
                            <span>Add to Roadmap</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1.5 ${
                    m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  {profile?.full_name?.charAt(0) || 'A'}
                </div>
              )}
            </div>
          ))}

          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-10">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>{hasKey ? 'Gemini 2.0 Flash is formulating advice...' : 'AI Mentor is analyzing context...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex gap-2 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <button
              onClick={() => handleSend('Explain closures in JavaScript')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 shadow-2xs"
            >
              Explain closures
            </button>
            <button
              onClick={() => handleSend('Why did my roadmap change?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 shadow-2xs"
            >
              Why did roadmap change?
            </button>
            <button
              onClick={() => handleSend('What should I do next?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 shadow-2xs"
            >
              What should I do next?
            </button>
            <button
              onClick={() => handleSend('How do I reach 80% readiness?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 shadow-2xs"
            >
              How to reach 80%?
            </button>
          </div>
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about roadmap, concepts, or code..."
              disabled={isStreaming}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
