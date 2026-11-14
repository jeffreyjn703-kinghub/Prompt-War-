import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Flame,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSkillModal } from '../context/SkillModalContext';
import { RoadmapVersion } from '../types';
import { ReplanBanner } from '../components/ReplanBanner';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const { openSkillDetail } = useSkillModal();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState<RoadmapVersion | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [guidance, setGuidance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissBanner, setDismissBanner] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [roadmapData, analysisData, progressData, guidanceData] = await Promise.all([
          api.getRoadmap(),
          api.getAnalysis(),
          api.getProgress(),
          api.getMentorGuidance(),
        ]);
        setRoadmap(roadmapData);
        setAnalysis(analysisData);
        setProgress(progressData);
        setGuidance(guidanceData);
      } catch (err) {
        console.warn('Dashboard fetch error', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [profile?.user_id]);

  const readiness = profile?.readiness_pct ?? 32.0;
  const streakDays = profile?.streak_days ?? 6;
  const hoursCompleted = progress?.total_completed_hours ?? 4.5;
  const weeklyHours = profile?.weekly_hours ?? 10;

  // Active phase is the first incomplete phase
  const activePhase = roadmap?.phases?.find((p) => !p.is_completed) || roadmap?.phases?.[0];

  // Next 3 actions (incomplete items)
  const nextActions =
    roadmap?.phases
      ?.flatMap((p) => p.items)
      .filter((it) => !it.is_completed)
      .slice(0, 3) || [];

  const handleToggleItem = async (itemId: number) => {
    try {
      await api.toggleRoadmapItem(itemId);
      const updatedRoadmap = await api.getRoadmap();
      const updatedProgress = await api.getProgress();
      setRoadmap(updatedRoadmap);
      setProgress(updatedProgress);
    } catch (err) {
      console.warn('Failed to toggle item', err);
    }
  };

  const showReplanBanner =
    !dismissBanner &&
    roadmap?.trigger_event &&
    ['ASSESSMENT_POOR', 'GOAL_CHANGED', 'ASSESSMENT_STRONG', 'PROGRESS_STALLED'].includes(
      roadmap.trigger_event
    );

  // Fallback score history if empty
  const scoreHistoryData =
    progress?.score_history && progress.score_history.length > 0
      ? progress.score_history
      : [
          { date: 'Oct 28', score: 82, skill: 'Python' },
          { date: 'Nov 02', score: 76, skill: 'SQL' },
          { date: 'Nov 09', score: 70, skill: 'HTML & Web' },
          { date: 'Nov 14', score: 48, skill: 'JavaScript' },
        ];

  // Quick reply prompt chips for AI Mentor
  const quickPrompts = [
    'Explain JS Closures',
    'What should I do next?',
    'Why did my roadmap change?',
    'Review SQL Indexing',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Re-plan Adaptive Banner if triggered */}
      {showReplanBanner && roadmap && (
        <ReplanBanner
          triggerEvent={roadmap.trigger_event || 'GOAL_CHANGED'}
          title={
            roadmap.trigger_event === 'ASSESSMENT_POOR'
              ? 'Remedial Adaptation Triggered (<60%)'
              : roadmap.trigger_event === 'GOAL_CHANGED'
              ? `Career Goal Adapted to ${roadmap.target_role}`
              : 'Curriculum Path Updated'
          }
          message={
            roadmap.trigger_event === 'ASSESSMENT_POOR'
              ? 'A remedial reinforcement phase was inserted following diagnostic test results.'
              : `Your learning path has been re-planned for ${roadmap.target_role}. Prior completed skills are preserved.`
          }
          diffSummary={roadmap.reason_diff}
          onDismiss={() => setDismissBanner(true)}
        />
      )}

      {/* Top Header Card: Greeting & Target Role */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Role: {profile?.target_role || 'Full Stack Developer'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Arjun'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {profile?.education || 'B.E. CSE student'} • Studying {weeklyHours}h / week • Next target: Bridge Core JavaScript fundamentals.
          </p>
        </div>

        {/* 4 Top Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 min-w-[105px]">
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">2 Skills</span>
            <span className="text-[10px] text-slate-400 block">Python, SQL</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 min-w-[105px]">
            <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 text-xs font-medium mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Week Load</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{hoursCompleted}h</span>
            <span className="text-[10px] text-slate-400 block">of {weeklyHours}h budget</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 min-w-[105px]">
            <div className="flex items-center gap-1.5 text-amber-500 text-xs font-medium mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Streak</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{streakDays} Days</span>
            <span className="text-[10px] text-slate-400 block">Active pace</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 min-w-[105px]">
            <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 text-xs font-medium mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Next Quiz</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">JS Core</span>
            <span className="text-[10px] text-slate-400 block">Phase 1 Gate</span>
          </div>
        </div>
      </div>

      {/* Row 1: Readiness Ring + Skill Radar + AI Mentor Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Ring Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Role Benchmark Readiness
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live Calibration
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated against 9 industry competencies for {profile?.target_role}.
            </p>
          </div>

          {/* Animated Readiness Ring SVG */}
          <div className="py-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#readinessGrad)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - readiness / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {readiness.toFixed(0)}%
                </span>
                <span className="text-[11px] font-semibold text-slate-400">Ready</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2">
              Reach 80%+ to unlock career placement simulations
            </p>
          </div>

          <Link
            to="/match"
            className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 text-center flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-800"
          >
            <span>Compare with other Roles</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Skill Radar Card (Clickable to open SkillDetailPanel) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Skill Radar Comparison
              </h3>
              <Link
                to="/analysis"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
              >
                Deep View <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any axis or skill to inspect catalog resources & quiz details.
            </p>
          </div>

          <div className="w-full h-56 my-2">
            {analysis?.radar_data ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analysis.radar_data}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#64748b', fontSize: 10, cursor: 'pointer' }}
                    onClick={(e) => {
                      if (e && e.value) openSkillDetail(e.value.toString().toLowerCase());
                    }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} stroke="transparent" />
                  <Radar
                    name="Required"
                    dataKey="target_level"
                    stroke="#94a3b8"
                    fill="#cbd5e1"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Current"
                    dataKey="learner_level"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.45}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-lg">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {d.subject}
                          </span>
                          <span className="text-indigo-600 dark:text-indigo-400 block font-medium">
                            Current: {d.learner_level}/5 ({d.confidence_label || 'Self-rated'})
                          </span>
                          <span className="text-slate-400 block">
                            Role Target: {d.target_level}/5
                          </span>
                        </div>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Synthesizing skill coordinates...
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Your Capability
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span> Role Benchmark
            </span>
          </div>
        </div>

        {/* AI Mentor Live Insight Card with Quick Prompt Chips */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  AI Mentor Insight
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-2">
              {guidance?.message ||
                "Hi Arjun! Your Python and SQL foundation is solid. To accelerate your Full Stack path, let's close the JavaScript gap before moving to React."}
            </div>

            {guidance?.action_suggestion && (
              <div className="mt-2.5 p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                  Recommendation
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {guidance.action_suggestion}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Quick Inquiries
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate('/mentor', { state: { initialQuery: prompt } })}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] text-slate-600 dark:text-slate-300 font-medium transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Row 2: Skill Gap Heat-Strip (Horizontal visual breakdown: Strong, Partial, Missing) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Skill Gap Heat-Strip
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive competency distribution. Click any skill chip to view catalog resources.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Strong (≥ Target)
            </span>
            <span className="flex items-center gap-1 text-amber-500 font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Partial Gap
            </span>
            <span className="flex items-center gap-1 text-rose-500 font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Missing
            </span>
          </div>
        </div>

        {/* Heat Strip List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: 'Python', current: 4, target: 4, status: 'strong', confidence: 'Verified' },
            { name: 'SQL', current: 3, target: 3, status: 'strong', confidence: 'Verified' },
            { name: 'HTML & CSS', current: 2, target: 4, status: 'partial', confidence: 'Self-rated' },
            { name: 'JavaScript', current: 0, target: 4, status: 'missing', confidence: 'Unverified' },
            { name: 'React', current: 0, target: 4, status: 'missing', confidence: 'Unverified' },
            { name: 'Node.js & APIs', current: 0, target: 3, status: 'missing', confidence: 'Unverified' },
          ].map((skill, idx) => {
            const pct = Math.min(100, Math.round((skill.current / skill.target) * 100));
            return (
              <button
                key={idx}
                onClick={() => openSkillDetail(skill.name.toLowerCase())}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {skill.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      skill.status === 'strong'
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : skill.status === 'partial'
                        ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {skill.current}/{skill.target} • {skill.status}
                  </span>
                </div>

                {/* Bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      skill.status === 'strong'
                        ? 'bg-emerald-500'
                        : skill.status === 'partial'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(5, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>{skill.confidence}</span>
                  <span className="group-hover:underline">View details →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Current Phase & Actions + Assessment Score History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Phase & Next 3 Prioritized Actions */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Active Phase: {activePhase?.title || 'Phase 1: JavaScript Foundations'}
              </span>
              {activePhase?.is_remedial && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Remedial Adaptation
                </span>
              )}
            </div>
            <Link
              to="/roadmap"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
            >
              Full Roadmap <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            {activePhase?.description || 'Build solid core JavaScript fundamentals.'}
          </p>

          <div className="space-y-2.5">
            {nextActions.length > 0 ? (
              nextActions.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                      title="Mark complete"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-300 uppercase">
                          {item.item_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {item.rationale}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs text-slate-400">{item.estimated_hours}h</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                      title="Open external resource"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                All milestones in current phase completed! Launch next assessment.
              </div>
            )}
          </div>
        </div>

        {/* Assessment Score History Trend Line Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Score Trend History
              </h3>
              <Link
                to="/assessments"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Assessments →
              </Link>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified assessment diagnostics over time. Threshold: 60%.
            </p>
          </div>

          <div className="w-full h-44 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-md">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {d.skill} Quiz
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          Score: {d.score}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">{d.date}</span>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Latest JavaScript score (48%) initiated an adaptive remedial roadmap adjustment.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
