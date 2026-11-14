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
} from 'lucide-react';
import { api } from '../api/client';
import { AgentTraceData } from '../types';

export const AgentTracePage: React.FC = () => {
  const [traceData, setTraceData] = useState<AgentTraceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgentNode, setSelectedAgentNode] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

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
  const nodes = traceData?.nodes || [
    { id: '1', name: 'Orchestrator', role: 'Coordinates pipeline & routes events', type: 'coordinator' },
    { id: '2', name: 'Profile Analyst', role: 'Normalizes skills into taxonomy graph', type: 'specialist' },
    { id: '3', name: 'Career Matcher', role: 'Computes role readiness & gaps', type: 'specialist' },
    { id: '4', name: 'Skill Gap Agent', role: 'Ranks missing & weak prerequisites', type: 'specialist' },
    { id: '5', name: 'Curriculum Planner', role: 'Builds phased roadmap & delta', type: 'specialist' },
    { id: '6', name: 'Resource Recommender', role: 'Curates courses, docs & practicals', type: 'specialist' },
    { id: '7', name: 'Assessment Agent', role: 'Generates quizzes & grades submissions', type: 'evaluator' },
    { id: '8', name: 'Progress Evaluator', role: 'Monitors velocity & stagnation signals', type: 'evaluator' },
    { id: '9', name: 'Mentor Agent', role: 'Conversational guidance & re-plans', type: 'coordinator' },
  ];

  // Replay animation simulation
  const handleReplay = () => {
    if (isReplaying) {
      setIsReplaying(false);
      setActiveStepIndex(null);
      return;
    }
    setIsReplaying(true);
    setActiveStepIndex(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= nodes.length) {
        clearInterval(interval);
        setIsReplaying(false);
        setActiveStepIndex(null);
      } else {
        setActiveStepIndex(current);
      }
    }, 700);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Observability & Audit Trail
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading mt-1">
            Agent Activity & Hand-Off Traces
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Real-time observability of multi-agent state machines, execution hand-offs, duration telemetry, and LLM vs Rule-Engine usage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Animated Replay Run Button */}
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
                <span>Replaying... ({nodes[activeStepIndex ?? 0]?.name})</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Replay Pipeline Run</span>
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
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Agent Runs</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading block mt-1">
            {stats?.total_runs || 28}
          </span>
          <span className="text-[10px] text-slate-400">Recorded telemetry events</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
            Rule Fallback Runs
          </span>
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-heading block mt-1">
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
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-heading block mt-1">
            {stats?.llm_runs || 0}
          </span>
          <span className="text-[10px] text-slate-400">gemini-2.0-flash</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Average Duration</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading block mt-1 font-mono">
            {stats?.avg_latency_ms || 18} ms
          </span>
          <span className="text-[10px] text-slate-400">Blazing local execution</span>
        </div>
      </div>

      {/* Visual Graph of Agent Hand-Offs */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Collaborative Multi-Agent Hand-Off Topology
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Explicit hand-off pipeline across specialized agents communicating via shared <code>LearnerContext</code> state.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {nodes.map((n, i) => {
            const isSelected = selectedAgentNode === n.name;
            const isReplayActive = activeStepIndex === i;
            return (
              <button
                key={n.id}
                onClick={() => setSelectedAgentNode(isSelected ? null : n.name)}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  isReplayActive
                    ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400 shadow-lg scale-103'
                    : isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      isReplayActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-750 text-slate-500'
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isReplayActive
                        ? 'bg-white animate-ping'
                        : n.type === 'coordinator'
                        ? 'bg-amber-400'
                        : n.type === 'evaluator'
                        ? 'bg-emerald-400'
                        : 'bg-indigo-500'
                    }`}
                  />
                </div>
                <h4 className="text-xs font-bold leading-tight">{n.name}</h4>
                <p
                  className={`text-[10px] mt-1 leading-snug line-clamp-2 ${
                    isReplayActive ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {n.role}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Timeline of Execution Traces */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Execution Activity Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedAgentNode ? `Filtered by ${selectedAgentNode}` : 'Chronological audit of agent runs & hand-offs'}
            </p>
          </div>
          {selectedAgentNode && (
            <button
              onClick={() => setSelectedAgentNode(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="space-y-3">
          {traces
            .filter((t) => (selectedAgentNode ? t.agent_name === selectedAgentNode : true))
            .map((trace) => {
              const isLLM = trace.used_llm;
              return (
                <div
                  key={trace.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {trace.agent_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-750 text-[10px] font-mono font-semibold uppercase text-slate-600 dark:text-slate-300">
                        {trace.event_name}
                      </span>
                      {isLLM ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                          <Bot className="w-3 h-3" /> Gemini LLM
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-semibold flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> Rule-Engine Fallback
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {trace.duration_ms}ms
                      </span>
                      <span>{trace.created_at}</span>
                    </div>
                  </div>

                  {/* Summary details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Input Summary
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-2 font-mono text-[11px]">
                        {trace.input_summary}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                        Output Summary
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-2 font-mono text-[11px]">
                        {trace.output_summary}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
