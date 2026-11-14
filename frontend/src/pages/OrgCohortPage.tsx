import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  ShieldAlert,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';
import { CohortOverviewData } from '../types';

export const OrgCohortPage: React.FC = () => {
  const [cohortData, setCohortData] = useState<CohortOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCohort = async () => {
      setIsLoading(true);
      try {
        const data = await api.getCohort();
        setCohortData(data);
      } catch (err) {
        console.warn('Failed fetching cohort', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCohort();
  }, []);

  const cohort = cohortData?.cohort || [
    {
      user_id: 1,
      name: 'Arjun Kumar',
      email: 'arjun.kumar@university.edu',
      target_role: 'Full Stack Developer',
      readiness_pct: 32.0,
      streak_days: 6,
      top_gaps: ['JavaScript', 'React', 'Node.js'],
      last_active: 'Today',
      is_at_risk: false,
    },
    {
      user_id: 2,
      name: 'Alex Rivera',
      email: 'alex@vyntrixa.ai',
      target_role: 'Frontend Developer',
      readiness_pct: 28.0,
      streak_days: 1,
      top_gaps: ['JavaScript Fundamentals', 'Async/Await'],
      last_active: '2 days ago',
      is_at_risk: true,
      risk_reason: 'Recent 38% assessment score; remedial roadmap active.',
    },
    {
      user_id: 3,
      name: 'Devin Vance',
      email: 'devin@vyntrixa.ai',
      target_role: 'Backend Engineer',
      readiness_pct: 65.0,
      streak_days: 12,
      top_gaps: ['System Design', 'Docker'],
      last_active: 'Yesterday',
      is_at_risk: false,
    },
    {
      user_id: 4,
      name: 'Maya Patel',
      email: 'maya@vyntrixa.ai',
      target_role: 'Full Stack Developer',
      readiness_pct: 42.0,
      streak_days: 4,
      top_gaps: ['GraphQL', 'React Query'],
      last_active: 'Today',
      is_at_risk: false,
    },
  ];

  const heatmap = cohortData?.skill_heatmap || [
    { skill_id: 'js', skill_name: 'JavaScript (ES6+)', criticality: 'High', avg_level: 1.8, target_level: 4, gap_count: 3 },
    { skill_id: 'react', skill_name: 'React', criticality: 'High', avg_level: 1.5, target_level: 4, gap_count: 3 },
    { skill_id: 'nodejs', skill_name: 'Node.js', criticality: 'Medium', avg_level: 1.2, target_level: 3, gap_count: 2 },
    { skill_id: 'sql', skill_name: 'SQL', criticality: 'Low', avg_level: 3.2, target_level: 3, gap_count: 0 },
    { skill_id: 'python', skill_name: 'Python', criticality: 'Low', avg_level: 3.6, target_level: 4, gap_count: 1 },
    { skill_id: 'git', skill_name: 'Git & GitHub', criticality: 'Low', avg_level: 2.8, target_level: 3, gap_count: 1 },
  ];

  const atRiskLearners = cohort.filter((l: any) => l.is_at_risk || l.readiness_pct < 30 || l.streak_days <= 1);

  // CSV Export action
  const handleExportCSV = () => {
    const headers = ['Learner Name', 'Email', 'Target Role', 'Readiness (%)', 'Streak (Days)', 'Top Gaps', 'Last Active'];
    const rows = cohort.map((l: any) => [
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.target_role}"`,
      l.readiness_pct.toFixed(0),
      l.streak_days,
      `"${l.top_gaps.join(', ')}"`,
      `"${l.last_active}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vyntrixa_cohort_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Enterprise & Cohort Management
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading mt-1">
            Organization Cohort Analytics & Macro Gaps
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Executive view tracking team skill velocity, common bottlenecks, curriculum intervention triggers, and at-risk alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Cohort Members</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white font-heading block mt-1">
            {cohort.length} Engineers
          </span>
          <span className="text-[10px] text-slate-400">Computer Science & Full Stack tracks</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
            Cohort Average Readiness
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading block mt-1">
            {cohortData?.avg_readiness?.toFixed(1) || '41.8'}%
          </span>
          <span className="text-[10px] text-slate-400">+5.2% average gain past 14 days</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
            Top Target Roles
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              { role: 'Full Stack Developer', count: 2 },
              { role: 'Frontend Developer', count: 1 },
              { role: 'Backend Engineer', count: 1 },
            ].map((r, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-semibold"
              >
                {r.role} ({r.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* At-Risk Learners Intervention Panel */}
      {atRiskLearners.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500 text-white">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  At-Risk Learners Requiring Mentor Intervention ({atRiskLearners.length})
                </h3>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Flagged by Progress Evaluator agent due to assessment diagnostic struggle or low study velocity.
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
              Immediate Action Recommended
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {atRiskLearners.map((learner: any) => (
              <div
                key={learner.user_id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {learner.name}
                    </span>
                    <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 px-1.5 py-0.2 rounded border border-rose-500/20">
                      {learner.readiness_pct.toFixed(0)}% Readiness
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {learner.risk_reason || 'Pace lagging behind weekly milestone expectation.'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    Gaps: {learner.top_gaps.slice(0, 2).join(', ')}
                  </span>
                  <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Trigger 1:1 Nudge →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cohort Learner Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Learner Cohort Roster
          </h3>
          <span className="text-xs text-slate-400">{cohort.length} Registered Engineers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Learner</th>
                <th className="py-3 px-3">Target Role</th>
                <th className="py-3 px-3">Readiness</th>
                <th className="py-3 px-3">Streak</th>
                <th className="py-3 px-3">Top Skill Gaps</th>
                <th className="py-3 px-3 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cohort.map((learner) => (
                <tr key={learner.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{learner.name}</span>
                    <span className="text-[10px] text-slate-400">{learner.email}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    {learner.target_role}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${learner.readiness_pct}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {learner.readiness_pct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-amber-500">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      {learner.streak_days}d
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {learner.top_gaps.map((gap: string, gIdx: number) => (
                        <span
                          key={gIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                        >
                          {gap}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                    {learner.last_active}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aggregate Skill-Gap Heatmap */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Aggregate Organizational Skill-Gap Heatmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pinpoints company-wide training deficits to prioritize team workshops, group labs, and curriculum adjustments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {heatmap.map((cell) => {
            const isHigh = cell.criticality === 'High';
            const isMed = cell.criticality === 'Medium';

            return (
              <div
                key={cell.skill_id}
                className={`p-3.5 rounded-xl border transition-all space-y-1.5 ${
                  isHigh
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                    : isMed
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {cell.skill_name}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded shrink-0 ${
                      isHigh
                        ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-700'
                        : isMed
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                        : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                    }`}
                  >
                    {cell.criticality}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Avg Level:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cell.avg_level} / 5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cell.target_level} / 5</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span>Deficit:</span>
                    <span>{cell.gap_count} members</span>
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
