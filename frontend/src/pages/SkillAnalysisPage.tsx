import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  BarChart3,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSkillModal } from '../context/SkillModalContext';

export const SkillAnalysisPage: React.FC = () => {
  const { profile } = useAuth();
  const { openSkillDetail } = useSkillModal();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<any>(null);
  const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'self-rated'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await api.getAnalysis();
        setAnalysis(data);
      } catch (err) {
        console.warn('Analysis fetch error', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [profile?.user_id]);

  const allSkills = analysis?.all_skills || [
    { skill_id: 'python', name: 'Python', category: 'Backend', proficiency: 4, target_level: 4, is_verified: true },
    { skill_id: 'sql', name: 'SQL', category: 'Database', proficiency: 3, target_level: 3, is_verified: true },
    { skill_id: 'html-css', name: 'HTML & CSS', category: 'Frontend', proficiency: 2, target_level: 4, is_verified: false },
    { skill_id: 'javascript', name: 'JavaScript', category: 'Frontend', proficiency: 0, target_level: 4, is_verified: false },
    { skill_id: 'react', name: 'React', category: 'Frontend', proficiency: 0, target_level: 4, is_verified: false },
    { skill_id: 'nodejs', name: 'Node.js', category: 'Backend', proficiency: 0, target_level: 3, is_verified: false },
    { skill_id: 'git', name: 'Git & GitHub', category: 'DevOps', proficiency: 2, target_level: 3, is_verified: false },
  ];

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'DevOps'];

  const filteredSkills = allSkills.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus =
      filterType === 'all'
        ? true
        : filterType === 'verified'
        ? s.is_verified
        : !s.is_verified;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const strengths = analysis?.strengths || [
    { skill_id: 'python', name: 'Python', proficiency: 4, is_verified: true, rationale: 'Advanced procedural & object-oriented programming.' },
    { skill_id: 'sql', name: 'SQL', proficiency: 3, is_verified: true, rationale: 'Relational queries, joins, filtering & indexing.' },
  ];

  const weaknesses = analysis?.weaknesses || [
    { skill_id: 'javascript', name: 'JavaScript (ES6+)', target_level: 4, rationale: 'Core requirement for client-side full-stack applications.' },
    { skill_id: 'react', name: 'React Framework', target_level: 4, rationale: 'Modern component architecture & state lifecycle.' },
    { skill_id: 'nodejs', name: 'Node.js & Express', target_level: 3, rationale: 'Server-side runtime and RESTful APIs.' },
  ];

  // Bar chart formatted data
  const barChartData = (analysis?.radar_data || [
    { subject: 'Python', learner_level: 4, target_level: 4 },
    { subject: 'SQL', learner_level: 3, target_level: 3 },
    { subject: 'HTML & CSS', learner_level: 2, target_level: 4 },
    { subject: 'JavaScript', learner_level: 0, target_level: 4 },
    { subject: 'React', learner_level: 0, target_level: 4 },
    { subject: 'Node.js', learner_level: 0, target_level: 3 },
  ]).map((item: any) => ({
    name: item.subject,
    current: item.learner_level,
    target: item.target_level,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Competency Diagnostic
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading mt-1">
            Skill Analysis & Calibration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Objective comparison of verified assessment scores and self-rated baseline proficiencies against industry benchmark requirements for {profile?.target_role || 'Full Stack Developer'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/assessments"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all hover:scale-102"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Take Verified Quiz</span>
          </Link>
        </div>
      </div>

      {/* Top Grid: Radar / Bar Chart Visual + Strengths & Growth Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Chart Card (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Multi-Dimensional Capability Model
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Scale: 0 (No foundation) to 5 (Mastery). Click any item to inspect.
              </p>
            </div>

            {/* Radar vs Bar Chart Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setChartType('radar')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  chartType === 'radar'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Radar</span>
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  chartType === 'bar'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Bar Chart</span>
              </button>
            </div>
          </div>

          <div className="w-full h-72 my-2">
            {chartType === 'radar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analysis?.radar_data || barChartData.map((b: any) => ({ subject: b.name, learner_level: b.current, target_level: b.target }))}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#64748b', fontSize: 11, cursor: 'pointer' }}
                    onClick={(e) => {
                      if (e && e.value) openSkillDetail(e.value.toString().toLowerCase());
                    }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} stroke="transparent" />
                  <Radar
                    name="Benchmark Required"
                    dataKey="target_level"
                    stroke="#94a3b8"
                    fill="#cbd5e1"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="Your Verified Level"
                    dataKey="learner_level"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.5}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-lg">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {d.subject || d.name}
                          </span>
                          <span className="text-indigo-600 dark:text-indigo-400 block font-semibold">
                            Current: {d.learner_level ?? d.current}/5
                          </span>
                          <span className="text-slate-400 block">
                            Benchmark: {d.target_level ?? d.target}/5
                          </span>
                        </div>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-lg">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {d.name}
                          </span>
                          <span className="text-indigo-600 dark:text-indigo-400 block font-semibold">
                            Your Level: {d.current}/5
                          </span>
                          <span className="text-slate-400 block">
                            Role Target: {d.target}/5
                          </span>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="current" fill="#4f46e5" name="Your Level" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#cbd5e1" name="Benchmark Target" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-md bg-indigo-600"></span> Your Level
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-md bg-slate-300 dark:bg-slate-700"></span> Role Benchmark
            </span>
          </div>
        </div>

        {/* Strengths & Weaknesses (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Strengths List */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Verified Strengths (Level 3+)
                </h3>
                <span className="text-[10px] text-slate-400">Competencies validated by quiz diagnostics</span>
              </div>
            </div>
            <div className="space-y-2">
              {strengths.map((s: any) => (
                <div
                  key={s.skill_id}
                  onClick={() => openSkillDetail(s.skill_id)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:border-emerald-400 cursor-pointer transition-all group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                        {s.name}
                      </span>
                      {s.is_verified && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {s.rationale || 'Core competency validated'}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-1 rounded-lg">
                    Level {s.proficiency}/5
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses List */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Target Gaps & Growth Areas
                </h3>
                <span className="text-[10px] text-slate-400">Skills requiring curriculum roadmap acceleration</span>
              </div>
            </div>
            <div className="space-y-2">
              {weaknesses.map((s: any) => (
                <div
                  key={s.skill_id}
                  onClick={() => openSkillDetail(s.skill_id)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:border-amber-400 cursor-pointer transition-all group"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600">
                      {s.name}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Target: Level {s.target_level || 4} • {s.rationale || 'High priority gap'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/assessments?skill=${s.skill_id}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold transition-colors flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                  >
                    <span>Assess</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Inventory Table with Filtering & Click-to-Detail */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Complete Skill Inventory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any skill row to preview curated resources, documentation, and launch verified assessments.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-52">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Verified vs Self-Rated Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              {(['all', 'verified', 'self-rated'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterType(m)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    filterType === m
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skill Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Skill</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Current Level</th>
                <th className="py-3 px-3">Role Target</th>
                <th className="py-3 px-3">Verification Source</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSkills.map((s: any) => {
                const isVerified = s.is_verified;
                return (
                  <tr
                    key={s.skill_id}
                    onClick={() => openSkillDetail(s.skill_id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {s.name}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                        {s.category || 'Engineering'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`w-2.5 h-2.5 rounded-sm ${
                                lvl <= s.proficiency
                                  ? 'bg-indigo-600'
                                  : 'bg-slate-200 dark:bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {s.proficiency}/5
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      Level {s.target_level || 4}/5
                    </td>
                    <td className="py-3 px-3">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" /> Verified by Quiz
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          <UserCheck className="w-3 h-3" /> Self-Rated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/assessments?skill=${s.skill_id}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <span>Test</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
