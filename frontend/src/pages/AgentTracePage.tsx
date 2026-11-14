import React, { useState, useEffect } from 'react';
import {
  Activity,
  Bot,
  BrainCircuit,
  Cpu,
  Zap,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  Terminal,
  ChevronDown,
  ChevronUp,
  Compass,
  BookOpen,
  Search,
} from 'lucide-react';
import { api } from '../api/client';
import { AgentTraceData } from '../types';

export const AgentTracePage: React.FC = () => {
  const [traceData, setTraceData] = useState<AgentTraceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgentNode, setSelectedAgentNode] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayStep, setReplayStep] = useState<number | null>(null);

  useEffect(() => {
    fetchTraces();
  }, []);

  const fetchTraces = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAgentTraces();
      setTraceData(data);
    } catch (err) {
      console.warn('Failed fetching agent traces', err);
    } finally {
      setIsLoading(false);
    }
  };

  const traces = traceData?.traces || [];
  const stats = traceData?.stats;

  // The 8 Satellite Agents surrounding the central Orchestrator
  const satelliteAgents = [
    { id: 'profile', name: 'Profile Analyst', role: 'Skill graph & normalization', icon: BrainCircuit, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800' },
    { id: 'match', name: 'Career Matcher', role: 'Role gap & match %', icon: Compass, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/70 border-violet-200 dark:border-violet-800' },
    { id: 'gap', name: 'Skill Gap Agent', role: 'Prerequisite DAG sorting', icon: Layers, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-800' },
    { id: 'planner', name: 'Curriculum Planner', role: 'Phased milestone timelines', icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-200 dark:border-cyan-800' },
    { id: 'resource', name: 'Resource Recommender', role: 'Curates courses & tasks', icon: Search, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800' },
    { id: 'assessment', name: 'Assessment Agent', role: 'Quizzes & scoring rubric', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500/20' },
    { id: 'progress', name: 'Progress Evaluator', role: 'Velocity & friction checks', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/70 border-purple-200 dark:border-purple-800' },
    { id: 'mentor', name: 'Mentor Agent', role: 'SSE streaming & replan nudges', icon: Bot, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800' },
  ];

  // Replay animation simulation sequence
  const handleReplay = () => {
    if (isReplaying) {
      setIsReplaying(false);
      setReplayStep(null);
      return;
    }
    setIsReplaying(true);
    setReplayStep(0); // 0 = Orchestrator

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current > satelliteAgents.length) {
        clearInterval(interval);
        setIsReplaying(false);
        setReplayStep(null);
      } else {
        setReplayStep(current);
      }
    }, 750);
  };

  const toggleRow = (id: number) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Multi-Agent State Machine
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading mt-1">
            VYNTRIXA Agent Activity
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Centralized Orchestrator routing events to the specialized VYNTRIXA Agents with explicit hand-offs and deterministic rule-engine fallbacks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReplay}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isReplaying
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
            }`}
          >
            {isReplaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>
                  Replaying Step {replayStep}/{satelliteAgents.length}...
                </span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Replay Run</span>
              </>
            )}
          </button>

          <button
            onClick={fetchTraces}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Pipeline Runs</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white font-heading block mt-1">
            {stats?.total_runs || 28}
          </span>
          <span className="text-[10px] text-slate-400">Deterministic hand-offs</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
            Rule-Engine Fallbacks
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-heading block mt-1">
            {stats?.fallback_runs || 28}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            100% Zero-key reliability
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
            Gemini LLM Runs
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading block mt-1">
            {stats?.llm_runs || 0}
          </span>
          <span className="text-[10px] text-slate-400">gemini-2.0-flash</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Average Duration</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white font-heading block mt-1 font-mono">
            {stats?.avg_latency_ms || 18} ms
          </span>
          <span className="text-[10px] text-slate-400">In-memory execution speed</span>
        </div>
      </div>

      {/* Visual Hub-and-Spoke Agent Graph (Orchestrator at Center) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Visual Agent Architecture Graph
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Orchestrator at the center with directional hand-offs to the 8 specialized agents.
            </p>
          </div>
          {selectedAgentNode && (
            <button
              onClick={() => setSelectedAgentNode(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Central Orchestrator & Surrounding Ring of 8 Satellite Agents */}
        <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Central Orchestrator Node */}
          <div className="mb-6 relative z-10 flex flex-col items-center">
            <button
              onClick={() => setSelectedAgentNode(selectedAgentNode === 'Orchestrator' ? null : 'Orchestrator')}
              className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center shadow-md ${
                replayStep === 0
                  ? 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-400 shadow-indigo-600/40 scale-105'
                  : selectedAgentNode === 'Orchestrator'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white hover:border-indigo-400'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white mb-2 shadow-xs">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-xs font-bold font-heading">Orchestrator Agent</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Central Pipeline Coordinator</span>
            </button>
          </div>

          {/* Satellite Agents Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
            {satelliteAgents.map((ag, idx) => {
              const Icon = ag.icon;
              const isSelected = selectedAgentNode === ag.name;
              const isReplayingThis = replayStep === idx + 1;

              return (
                <button
                  key={ag.id}
                  onClick={() => setSelectedAgentNode(isSelected ? null : ag.name)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isReplayingThis
                      ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400 shadow-md scale-102'
                      : isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg border shrink-0 ${ag.bg} ${ag.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                        isReplayingThis ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      Step 0{idx + 1}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold leading-tight">{ag.name}</h4>
                  <p
                    className={`text-[10px] mt-1 line-clamp-1 ${
                      isReplayingThis ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    {ag.role}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Run Timeline List with Expandable Rows (Monospace Log Style) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Agent Execution Audit Logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedAgentNode
                ? `Filtered by ${selectedAgentNode}`
                : 'Expand any log row to inspect exact structured inputs & outputs.'}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {traces.length} total events
          </span>
        </div>

        <div className="space-y-2.5">
          {traces
            .filter((t) => (selectedAgentNode ? t.agent_name.toLowerCase().includes(selectedAgentNode.toLowerCase()) : true))
            .map((trace) => {
              const isExpanded = expandedRowId === trace.id;
              const isLLM = trace.used_llm;

              return (
                <div
                  key={trace.id}
                  className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all"
                >
                  {/* Row Header */}
                  <div
                    onClick={() => toggleRow(trace.id)}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        [{trace.agent_name}]
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 font-semibold">
                        {trace.event_name}
                      </span>
                      {isLLM ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                          <Bot className="w-3 h-3" /> Gemini LLM
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-semibold flex items-center gap-1 font-mono">
                          <Cpu className="w-3 h-3" /> Rule-Engine Fallback
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0 font-mono">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Clock className="w-3 h-3 text-slate-400" /> {trace.duration_ms}ms
                      </span>
                      <span className="text-[11px]">{trace.created_at}</span>
                      <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Monospace Content */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 space-y-3 font-mono text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Input Payload Summary
                        </span>
                        <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-[11px]">
                          {trace.input_summary}
                        </pre>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                          Output Payload Summary
                        </span>
                        <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-[11px]">
                          {trace.output_summary}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
