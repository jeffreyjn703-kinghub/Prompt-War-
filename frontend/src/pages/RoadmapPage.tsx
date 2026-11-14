import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  History,
  RotateCw,
  Clock,
  Calendar,
  X,
  BookOpen,
  Code2,
  Video,
  FileText,
  Briefcase,
  ChevronDown,
  ChevronUp,
  LayoutList,
  CalendarDays,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RoadmapVersion } from '../types';

export const RoadmapPage: React.FC = () => {
  const { profile } = useAuth();
  const [roadmap, setRoadmap] = useState<RoadmapVersion | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [collapsedPhases, setCollapsedPhases] = useState<Record<number, boolean>>({});

  const loadRoadmap = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rm, vers] = await Promise.all([
        api.getRoadmap(),
        api.getRoadmapVersions(),
      ]);
      setRoadmap(rm);
      setVersions(vers);
    } catch (err) {
      console.warn('Roadmap fetch error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap, profile?.user_id]);

  const handleToggleItem = async (itemId: number) => {
    try {
      await api.toggleRoadmapItem(itemId);
      const updated = await api.getRoadmap();
      setRoadmap(updated);
    } catch (err) {
      console.warn('Failed to toggle item', err);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const rm = await api.regenerateRoadmap();
      setRoadmap(rm);
      const vers = await api.getRoadmapVersions();
      setVersions(vers);
    } catch (err) {
      console.error('Failed to regenerate roadmap', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const togglePhaseCollapse = (phaseId: number) => {
    setCollapsedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const weeklyHours = profile?.weekly_hours || 10;
  const totalHours = roadmap?.total_hours || 40;
  const estimatedWeeks = Math.max(1, Math.ceil(totalHours / weeklyHours));

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-500" />;
      case 'doc':
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case 'exercise':
        return <Code2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'project':
        return <Briefcase className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  // Practical challenges mapping for capstone and phases
  const getPhaseChallenge = (phaseNumber: number, isRemedial?: boolean) => {
    if (isRemedial) {
      return {
        title: 'Diagnostic Lab: JavaScript Scope, Closure & Async Loop Drill',
        desc: 'Implement a custom debounce function and an async retry helper without third-party libraries.',
        estimated: '3 hours',
      };
    }
    switch (phaseNumber) {
      case 1:
        return {
          title: 'Milestone Challenge: Interactive DOM Task Manager with LocalStorage',
          desc: 'Build an ES6+ modular task board with filtering, persistent state, and asynchronous data sync.',
          estimated: '4 hours',
        };
      case 2:
        return {
          title: 'Milestone Challenge: React Component Library & Data Dashboard',
          desc: 'Develop a responsive analytics dashboard utilizing custom hooks, Context API, and optimistic UI updates.',
          estimated: '6 hours',
        };
      case 3:
        return {
          title: 'Milestone Challenge: RESTful Microservice with Authentication & SQLite',
          desc: 'Create secure Express endpoints with JWT authentication, relational queries, and input validation schemas.',
          estimated: '8 hours',
        };
      default:
        return {
          title: 'Capstone Challenge: Full Stack End-to-End Production Platform',
          desc: 'Integrate the React frontend with the backend REST API, CI/CD pipeline, and comprehensive test suite.',
          estimated: '12 hours',
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Curriculum Planner Agent
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading mt-1">
            Adaptive Learning Roadmap
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Generated specifically for <strong>{profile?.target_role}</strong> based on identified skill gaps. Calibrated to your {weeklyHours}h/week study pace across an estimated {estimatedWeeks} weeks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeline vs Calendar Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Phases</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setShowVersionModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            <span>Version History ({versions.length})</span>
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Re-plan</span>
          </button>
        </div>
      </div>

      {/* Week-by-Week Phased Timeline View */}
      {viewMode === 'timeline' ? (
        <div className="space-y-6">
          {roadmap?.phases?.map((phase, pIndex) => {
            const isRemedial = phase.is_remedial;
            const isCollapsed = collapsedPhases[phase.id];
            const phaseWeeks = Math.max(1, Math.ceil(phase.estimated_hours / weeklyHours));
            const startWeek = pIndex * phaseWeeks + 1;
            const endWeek = startWeek + phaseWeeks - 1;
            const completedCount = phase.items.filter((it) => it.is_completed).length;
            const challenge = getPhaseChallenge(phase.phase_number, isRemedial);

            return (
              <div
                key={phase.id}
                className={`p-6 rounded-2xl border transition-all shadow-xs relative overflow-hidden ${
                  isRemedial
                    ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-300 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          isRemedial
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                            : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {isRemedial ? 'Remedial Adaptation' : `Phase ${phase.phase_number}`}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Weeks {startWeek}-{endWeek}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                      {phase.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {phase.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right sm:shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white">{phase.estimated_hours} Hours</span>
                      <span className="block text-[10px] text-slate-400">
                        {completedCount}/{phase.items.length} Completed
                      </span>
                    </div>
                    <button
                      onClick={() => togglePhaseCollapse(phase.id)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                      title={isCollapsed ? 'Expand phase' : 'Collapse phase'}
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <>
                    {/* Resource Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-5">
                      {phase.items.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                            item.is_completed
                              ? 'bg-slate-50/60 dark:bg-slate-950/40 border-emerald-500/30 opacity-75'
                              : 'bg-slate-50 dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                          }`}
                        >
                          <div>
                            {/* Top Bar: Checkbox + Title + Type */}
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleToggleItem(item.id)}
                                className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                                title="Toggle milestone completion"
                              >
                                {item.is_completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <span
                                  className={`text-xs font-bold leading-tight block ${
                                    item.is_completed
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-900 dark:text-white'
                                  }`}
                                >
                                  {item.title}
                                </span>

                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-300">
                                    {getItemTypeIcon(item.item_type)}
                                    {item.item_type}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {item.provider}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Pedagogical "Why This" Rationale */}
                            <div className="mt-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-1">
                                Why this:
                              </span>
                              {item.rationale}
                            </div>
                          </div>

                          {/* Bottom: Hours & External URL link */}
                          <div className="mt-4 pt-2.5 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {item.estimated_hours}h estimated
                            </span>

                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors text-xs"
                              >
                                <span>Start Resource</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Practical Challenge / Mini-Project Box */}
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 to-violet-50/70 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-xs">
                          <Code2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {challenge.title}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                              Practical Task
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                            {challenge.desc}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                        {challenge.estimated}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Week-by-Week Calendar Breakdown */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: estimatedWeeks }).map((_, wIndex) => {
            const weekNum = wIndex + 1;
            return (
              <div
                key={weekNum}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Week {weekNum} Schedule
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Budget: {weeklyHours}h
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      Target Milestone
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Focus on core topics, complete 2 exercise modules and weekly review quiz.
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Expected Output:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Phase Checkpoint
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Version History Modal with Green / Red Diffs */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Roadmap Version History & Semantic Diffs
                </h3>
              </div>
              <button
                onClick={() => setShowVersionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Version {ver.version_number}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold uppercase">
                        {ver.trigger_event}
                      </span>
                      {ver.is_active && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ver.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target: <strong className="text-slate-800 dark:text-slate-200">{ver.target_role}</strong> • {ver.total_phases} Phases • {ver.total_hours} Hours
                  </p>

                  {/* Render Diff with + and - styling */}
                  <div className="mt-2 text-xs font-mono bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {ver.reason_diff?.split('\n').map((line: string, lIdx: number) => {
                      const isAdded = line.trim().startsWith('+');
                      const isRemoved = line.trim().startsWith('-');
                      return (
                        <div
                          key={lIdx}
                          className={`${
                            isAdded
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : isRemoved
                              ? 'text-rose-600 dark:text-rose-400 line-through'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
