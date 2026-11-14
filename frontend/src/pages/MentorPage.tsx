import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  BrainCircuit,
  Key,
  Check,
  RefreshCw,
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

interface ChatMessage {
  id: string;
  sender: 'mentor' | 'user';
  text: string;
  timestamp: string;
  resourceTitle?: string;
  resourceUrl?: string;
}

export const MentorPage: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [guidance, setGuidance] = useState<any>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  // Gemini Key Management
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState(getGeminiApiKey());
  const [hasKey, setHasKey] = useState(hasGeminiApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setHasKey(hasGeminiApiKey());
    setKeyInput(getGeminiApiKey());
  }, []);

  useEffect(() => {
    const fetchGuidance = async () => {
      try {
        const data = await api.getMentorGuidance();
        setGuidance(data);
        if (messages.length === 0) {
          setMessages([
            {
              id: 'init-1',
              sender: 'mentor',
              text: data.message,
              timestamp: 'Just now',
              resourceTitle: 'JavaScript Event Loop & Microtask Queue Interactive Simulation',
              resourceUrl: 'https://javascript.info/',
            },
          ]);
        }
      } catch (err) {
        console.warn('Could not load mentor guidance', err);
      }
    };
    fetchGuidance();
  }, [profile?.user_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    const st = location.state as { initialQuery?: string } | null;
    if (st?.initialQuery) {
      handleSend(st.initialQuery);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSaveKey = () => {
    setGeminiApiKey(keyInput);
    setHasKey(hasGeminiApiKey());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowKeyModal(false);
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
      console.warn('Mentor streaming error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === mentorMsgId
            ? {
                ...msg,
                text:
                  msg.text ||
                  "In your journey toward Full Stack Developer, focusing on JavaScript fundamentals before React and Node.js will yield the highest returns. What topic would you like to drill into?",
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8.5rem)]">
        {/* Main Chat Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Career Mentor (Full View)</h2>
                  {hasKey ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Sparkles className="w-2.5 h-2.5" />
                      Gemini 2.0 Flash
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      AI Mentor Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Continuous guidance • Contextually attuned to your roadmap and scores
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKeyModal(!showKeyModal)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  hasKey
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                }`}
                title="Configure Google Gemini API Key"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{hasKey ? 'Gemini Connected' : 'Connect Gemini Key'}</span>
              </button>

              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
          </div>

          {/* Gemini Key Configuration Modal Bar */}
          {showKeyModal && (
            <div className="p-4 px-6 bg-indigo-50/80 dark:bg-indigo-950/60 border-b border-indigo-100 dark:border-indigo-900/60 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Google Gemini 2.0 Flash API Key Configuration
                </span>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                Connect your Gemini API Key for unbounded, live LLM reasoning. Zero setup required: if left blank, the platform runs on our full deterministic multi-agent rule engine!
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste your Gemini API key (AIzaSy...)"
                  className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <button
                  onClick={handleSaveKey}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{savedSuccess ? 'Saved Successfully!' : 'Save Key'}</span>
                </button>
                {hasKey && (
                  <button
                    onClick={handleClearKey}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'mentor' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {m.resourceTitle && (
                    <div className="mt-3.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recommended Practice Drill</span>
                      </div>
                      <span className="block font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                        {m.resourceTitle}
                      </span>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={m.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1 hover:text-indigo-500"
                        >
                          <span>Open Resource</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => handleAddToRoadmap(m.resourceTitle!)}
                          disabled={addedItems.has(m.resourceTitle!)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                            addedItems.has(m.resourceTitle!)
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
                              : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                          }`}
                        >
                          {addedItems.has(m.resourceTitle!) ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Added to Roadmap</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Add to Roadmap</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-2 ${
                      m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {profile?.full_name?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
            ))}

            {isStreaming && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span>{hasKey ? 'Gemini 2.0 Flash is formulating advice...' : 'AI Mentor is analyzing context...'}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-6 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => handleSend('Explain closures in JavaScript')}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 shadow-2xs"
            >
              Explain closures
            </button>
            <button
              onClick={() => handleSend('What should I do next?')}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 shadow-2xs"
            >
              What should I do next?
            </button>
            <button
              onClick={() => handleSend('Why did my roadmap change?')}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 shadow-2xs"
            >
              Why did roadmap change?
            </button>
            <button
              onClick={() => handleSend('How do I reach 80% readiness?')}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 shadow-2xs"
            >
              How to reach 80% readiness?
            </button>
          </div>

          {/* Input Footer */}
          <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your mentor anything about architecture, code, or career goals..."
                disabled={isStreaming}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all shadow-md shadow-indigo-600/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Context Inspector Pane (4 cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <BrainCircuit className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Mentor Context Panel</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Target Career Benchmark
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {profile?.target_role || 'Full Stack Developer'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Live Verified Readiness
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[32%]" />
                  </div>
                  <span className="font-mono font-bold text-emerald-500">32%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-amber-500 block mb-1">
                  Diagnosed Skill Gaps
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold text-[10px]">
                    JavaScript ES6+ (Level 0/4)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold text-[10px]">
                    React (Level 0/4)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold text-[10px]">
                    Node.js (Level 0/3)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Last Assessment Diagnostic
                </span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between font-bold">
                    <span>JavaScript Diagnostic</span>
                    <span className="text-amber-500">48% Score</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Triggered adaptive remedial phase insertion for core closure and event loop mechanics.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tip Card */}
          <div className="p-5 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs">
            <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Gemini 2.0 Flash Ready</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Connect your Gemini API Key in the top right at any time to unlock unconstrained generative intelligence, or continue with our zero-key rule-based agent pipeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
