import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Flame,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  Award,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const ProgressPage: React.FC = () => {
  const { profile } = useAuth();
  const [progressData, setProgressData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '3M' | 'All'>('30D');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProgress();
        setProgressData(data);
      } catch (err) {
        console.warn('Progress fetch error', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [profile?.user_id]);

  const scoreHistory = progressData?.score_history || [
    { skill_name: 'Python', score_pct: 82, date: 'Oct 28' },
    { skill_name: 'SQL', score_pct: 76, date: 'Nov 02' },
    { skill_name: 'HTML & CSS', score_pct: 70, date: 'Nov 09' },
    { skill_name: 'JavaScript', score_pct: 48, date: 'Nov 14' },
  ];
  const phaseProgress = progressData?.phase_progress || [
    { phase_id: 1, title: 'Phase 1: JavaScript Fundamentals', completed_items: 2, total_items: 4, progress_pct: 50, is_remedial: true },
    { phase_id: 2, title: 'Phase 2: React Component Architecture', completed_items: 0, total_items: 5, progress_pct: 0, is_remedial: false },
    { phase_id: 3, title: 'Phase 3: Node.js & REST APIs', completed_items: 0, total_items: 4, progress_pct: 0, is_remedial: false },
    { phase_id: 4, title: 'Phase 4: Full Stack Capstone', completed_items: 0, total_items: 3, progress_pct: 0, is_remedial: false },
  ];
  const skillBars = progressData?.skill_progress_bars || [
    { skill_id: 'python', skill_name: 'Python', current_level: 4, target_level: 4, progress_pct: 100, is_verified: true },
    { skill_id: 'sql', skill_name: 'SQL', current_level: 3, target_level: 3, progress_pct: 100, is_verified: true },
    { skill_id: 'html-css', skill_name: 'HTML & CSS', current_level: 2, target_level: 4, progress_pct: 50, is_verified: false },
    { skill_id: 'javascript', skill_name: 'JavaScript', current_level: 0, target_level: 4, progress_pct: 0, is_verified: false },
    { skill_id: 'react', skill_name: 'React', current_level: 0, target_level: 4, progress_pct: 0, is_verified: false },
  ];

  // Generate GitHub-style heatmap data (16 weeks x 7 days)
  const heatmapWeeks = Array.from({ length: 16 }).map((_, wIdx) => {
    return Array.from({ length: 7 }).map((_, dIdx) => {
      // Deterministic pseudo-activity distribution
      const val = (wIdx * 7 + dIdx * 3) % 11;
      let level = 0;
      if (val === 1 || val === 4) level = 1;
      else if (val === 2 || val === 5 || val === 8) level = 2;
      else if (val === 7) level = 3;
      else if (val === 9) level = 4;
      return { day: dIdx, level, hours: level * 0.8 };
    });
  });

  const badges = [
    { title: 'Python Verified', desc: 'Achieved Level 4 in Core Algorithms & Backend', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { title: 'SQL Specialist', desc: 'Verified Level 3 in Relational Queries', icon: Award, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { title: '6-Day Pace Streak', desc: 'Consistent active daily practice sessions', icon: Flame, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { title: 'Adaptive Explorer', desc: 'Completed multi-agent remedial calibration', icon: Zap, color: 'text-violet-600 bg-violet-50 border-violet-200' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Progress Evaluator Agent
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading mt-1">
            Learning Velocity & Mastery Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Live evaluation of milestone velocity, diagnostic scores, and calibrated readiness for {profile?.target_role || 'Full Stack Developer'}.
          </p>
        </div>

        {/* Time-Range Selector Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 text-xs">
          {(['7D', '30D', '3M', 'All'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeRange === r
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
              {progressData?.readiness_pct?.toFixed(0) || 32}%
            </span>
            <span className="block text-[11px] text-slate-400 font-semibold">Target Role Readiness</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
              {progressData?.streak_days || 6} Days
            </span>
            <span className="block text-[11px] text-slate-400 font-semibold">Active Study Streak</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
              {progressData?.total_completed_hours || 4.5}h
            </span>
            <span className="block text-[11px] text-slate-400 font-semibold">Logged This Week</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
              {progressData?.roadmap_completion_pct?.toFixed(0) || 12}%
            </span>
            <span className="block text-[11px] text-slate-400 font-semibold">Curriculum Milestone Pace</span>
          </div>
        </div>
      </div>

      {/* Readiness Forecast Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/30 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Projected Readiness Forecast
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              At your current pace of <strong>10h / week</strong>, you are projected to reach <strong>85% benchmark readiness</strong> in approximately <strong>9 weeks</strong>.
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shrink-0 text-center">
          ✓ On Track
        </span>
      </div>

      {/* GitHub-style Learning Activity Heatmap */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Learning Activity Grid
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive session heatmap across the past 16 weeks. Darker green signifies higher study duration.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-900" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-500" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto py-2">
          <div className="flex gap-1.5 min-w-[500px]">
            {heatmapWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day, dIdx) => {
                  const colors = [
                    'bg-slate-100 dark:bg-slate-800',
                    'bg-emerald-200 dark:bg-emerald-900',
                    'bg-emerald-300 dark:bg-emerald-700',
                    'bg-emerald-500 dark:bg-emerald-600',
                    'bg-emerald-600 dark:bg-emerald-500',
                  ];
                  return (
                    <div
                      key={dIdx}
                      className={`w-3.5 h-3.5 rounded-xs ${colors[day.level]} transition-transform hover:scale-125 cursor-pointer`}
                      title={`${day.hours.toFixed(1)} hours logged`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assessment Score History Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Assessment Diagnostic Trajectory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified assessment outcomes over time. The 60% threshold triggers adaptive remedial interventions.
            </p>
          </div>
        </div>

        <div className="w-full h-64 pt-2">
          {scoreHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="skill_name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score_pct"
                  name="Score %"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No assessments recorded yet. Complete quizzes in the Assessment tab to visualize trends.
            </div>
          )}
        </div>
      </div>

      {/* Phase Completion & Badges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Progress */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Curriculum Phase Completion
          </h3>
          <div className="space-y-4">
            {phaseProgress.map((phase: any) => (
              <div key={phase.phase_id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{phase.title}</span>
                    {phase.is_remedial && (
                      <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-500/20">
                        Remedial
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-500 dark:text-slate-400">
                    {phase.completed_items}/{phase.total_items} ({phase.progress_pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                    style={{ width: `${phase.progress_pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Earned Badges & Verified Milestones
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-start gap-3"
                >
                  <div className={`p-2 rounded-xl shrink-0 ${b.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {b.title}
                    </span>
                    <span className="text-[11px] text-slate-400 leading-snug block mt-0.5">
                      {b.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
