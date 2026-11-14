import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSkillModal } from '../context/SkillModalContext';
import { CareerMatchData, RoleTaxonomyItem } from '../types';

export const CareerMatchPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { openSkillDetail } = useSkillModal();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<RoleTaxonomyItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [matchData, setMatchData] = useState<CareerMatchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [diffModal, setDiffModal] = useState<{
    oldRole: string;
    newRole: string;
    diff: string;
    mentorMsg: string;
  } | null>(null);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const rolesList = await api.getRoles();
        setRoles(rolesList);
        const currentTarget = profile?.target_role || 'Full Stack Developer';
        setSelectedRole(currentTarget);
        const matchRes = await api.getMatch(currentTarget);
        setMatchData(matchRes);
      } catch (err) {
        console.warn('Match fetch error', err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [profile?.target_role]);

  const handleRoleSelect = async (roleTitle: string) => {
    setSelectedRole(roleTitle);
    try {
      const matchRes = await api.getMatch(roleTitle);
      setMatchData(matchRes);
    } catch (err) {
      console.warn('Role switch error', err);
    }
  };

  const handleCommitRoleChange = async () => {
    if (!selectedRole || selectedRole === profile?.target_role) return;
    setIsSwitching(true);
    try {
      const res = await api.selectRole(selectedRole);
      await refreshProfile();
      setDiffModal({
        oldRole: res.old_role,
        newRole: res.new_role,
        diff: res.replan_diff,
        mentorMsg: res.mentor_message,
      });
    } catch (err) {
      console.error('Failed to change target role', err);
    } finally {
      setIsSwitching(false);
    }
  };

  const matchPct = matchData?.match_percentage ?? 0;
  const isCurrentTarget = profile?.target_role === selectedRole;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Role Benchmark Alignment
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading mt-1">
            Career Role Matching & What-If Simulator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Simulate your capability alignment across 9 software engineering roles. Switching goals preserves your already-mastered competencies and commands the multi-agent pipeline to generate delta roadmap phases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Active Goal: <strong className="text-indigo-600 dark:text-indigo-400">{profile?.target_role}</strong>
          </span>
        </div>
      </div>

      {/* Top 3 AI Suggested Roles */}
      {matchData?.top_recommended_roles && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Top 3 AI Recommendations for Your Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {matchData.top_recommended_roles.map((rec) => (
              <button
                key={rec.title}
                onClick={() => handleRoleSelect(rec.title)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedRole === rec.title
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {rec.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    {rec.match_pct.toFixed(0)}% Match
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Click to inspect gap breakdown
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 9 Benchmark Roles Selector Strip */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
          Select Role Benchmark to Evaluate:
        </label>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => {
            const isSelected = selectedRole === r.title;
            const isTarget = profile?.target_role === r.title;
            return (
              <button
                key={r.role_id}
                onClick={() => handleRoleSelect(r.title)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{r.title}</span>
                {isTarget && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-black/25 text-white uppercase font-bold">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Match Breakdown Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Match Percentage Ring Card (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {matchData?.department || 'Engineering'}
              </span>
              {isCurrentTarget && (
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                  Current Target
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-3 font-heading">
              {selectedRole}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {matchData?.description || 'Core technical benchmarks for this engineering pathway.'}
            </p>
          </div>

          <div className="my-6 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#4f46e5"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - matchPct / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {matchPct.toFixed(0)}%
                </span>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Match
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-400 mt-2">
              Based on required vs verified levels
            </span>
          </div>

          {/* Action Button: Set as active goal */}
          {isCurrentTarget ? (
            <div className="py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Current Target Goal Active</span>
            </div>
          ) : (
            <button
              onClick={handleCommitRoleChange}
              disabled={isSwitching}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSwitching ? 'Re-planning Curriculum...' : `Switch Goal to ${selectedRole}`}
              </span>
            </button>
          )}
        </div>

        {/* Detailed Skills Categories Breakdown (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Matched Skills */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Fully Matched Competencies ({matchData?.matched_skills?.filter((s) => s.status === 'matched').length || 0})
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">Current level meets or exceeds role benchmark</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matchData?.matched_skills
                ?.filter((s) => s.status === 'matched')
                .map((s) => (
                  <button
                    key={s.skill_id}
                    onClick={() => openSkillDetail(s.skill_id)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:border-emerald-400 transition-all text-left group"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600">
                      {s.name}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/20">
                      Level {s.current_level} / {s.required_level}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Partial Skills (Level Gaps) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Partial Competencies ({matchData?.matched_skills?.filter((s) => s.status === 'partial').length || 0})
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">Competency baseline exists but needs upgrading</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matchData?.matched_skills
                ?.filter((s) => s.status === 'partial')
                .map((s) => (
                  <button
                    key={s.skill_id}
                    onClick={() => openSkillDetail(s.skill_id)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:border-amber-400 transition-all text-left group"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600">
                        {s.name}
                      </span>
                      <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Gap: +{s.gap} levels needed
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Level {s.current_level} → {s.required_level}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Missing Prerequisites ({matchData?.matched_skills?.filter((s) => s.status === 'missing').length || 0})
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">Unstarted competencies required by curriculum</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matchData?.matched_skills
                ?.filter((s) => s.status === 'missing')
                .map((s) => (
                  <button
                    key={s.skill_id}
                    onClick={() => openSkillDetail(s.skill_id)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:border-rose-400 transition-all text-left group"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600">
                        {s.name}
                      </span>
                      <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                        Target: Level {s.required_level}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
                      Missing
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Before / After Roadmap Diff Modal */}
      {diffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Adaptive Re-Plan Successful
                </h3>
              </div>
              <button
                onClick={() => setDiffModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Before / After role tags */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Previous Target
                </span>
                <span className="text-xs font-bold line-through text-slate-500">
                  {diffModal.oldRole}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                  New Target
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {diffModal.newRole}
                </span>
              </div>
            </div>

            {/* Diff Markdown */}
            <div className="py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
              {diffModal.diff}
            </div>

            <p className="text-xs text-slate-500 italic mt-3">
              "{diffModal.mentorMsg}"
            </p>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setDiffModal(null);
                  navigate('/roadmap');
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                Explore Updated Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
