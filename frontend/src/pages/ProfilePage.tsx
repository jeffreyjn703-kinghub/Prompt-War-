import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Briefcase,
  Clock,
  Award,
  FolderGit2,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  LogOut,
  ExternalLink,
  Flame,
  Search,
  Check,
  ChevronRight,
  TrendingUp,
  Bot,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { UserSkillItem, CertificationItem, ProjectItem, SkillTaxonomyItem, RoleTaxonomyItem } from '../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, analyzeProfile, logout, loginDemo } = useAuth();

  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || 'Arjun Kumar');
  const [email, setEmail] = useState(profile?.email || 'arjun.kumar@skillpath.ai');
  const [education, setEducation] = useState(profile?.education || 'B.E. Computer Science Engineering (Final Year)');
  const [bio, setBio] = useState('Aspiring Full Stack Engineer passionate about asynchronous systems, backend performance, and AI-native applications.');
  const [targetRole, setTargetRole] = useState(profile?.target_role || 'Full Stack Developer');
  const [weeklyHours, setWeeklyHours] = useState(profile?.weekly_hours || 10);
  
  // Skills list
  const [skills, setSkills] = useState<UserSkillItem[]>(profile?.skills || [
    { skill_name: 'Python', proficiency: 4, verified_level: 4, confidence: 'verified by assessment', last_assessed_at: '2026-10-28' },
    { skill_name: 'SQL', proficiency: 3, verified_level: 3, confidence: 'verified by assessment', last_assessed_at: '2026-11-02' },
    { skill_name: 'HTML & CSS', proficiency: 2, verified_level: null, confidence: 'self-rated' },
    { skill_name: 'JavaScript', proficiency: 1, verified_level: null, confidence: 'self-rated' },
  ]);

  // Certifications list
  const [certs, setCerts] = useState<CertificationItem[]>(profile?.certifications || [
    { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', issue_date: '2026-05' },
    { name: 'Python for Everybody Specialization', issuer: 'Coursera / Univ of Michigan', issue_date: '2025-11' },
  ]);

  // Projects list
  const [projects, setProjects] = useState<ProjectItem[]>(profile?.projects || [
    { title: 'Inventory Management REST API', description: 'Production REST API built with FastAPI, SQLite, and automated PyTest suites.', skills_used: 'Python, SQL, FastAPI' },
    { title: 'Personal Portfolio Website', description: 'Responsive web portfolio showcasing engineering projects with modern CSS Grid.', skills_used: 'HTML & CSS, JavaScript' },
  ]);

  // Taxonomy & Custom Adders
  const [availableSkills, setAvailableSkills] = useState<SkillTaxonomyItem[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleTaxonomyItem[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [customSkillProficiency, setCustomSkillProficiency] = useState(3);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  // New Cert / Project states
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertDate, setNewCertDate] = useState('2026');
  const [showAddCert, setShowAddCert] = useState(false);

  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjSkills, setNewProjSkills] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);

  // UI status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentAnalysisMessage, setAgentAnalysisMessage] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'details' | 'skills' | 'portfolio' | 'security'>('details');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setEmail(profile.email);
      setEducation(profile.education);
      setTargetRole(profile.target_role);
      setWeeklyHours(profile.weekly_hours);
      if (profile.skills) setSkills(profile.skills);
      if (profile.certifications) setCerts(profile.certifications);
      if (profile.projects) setProjects(profile.projects);
    }
  }, [profile]);

  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const [skData, roData] = await Promise.all([api.getSkills(), api.getRoles()]);
        setAvailableSkills(skData);
        setAvailableRoles(roData);
      } catch (_) {}
    };
    loadTaxonomies();
  }, []);

  // Proficiency labels
  const getProficiencyLabel = (lvl: number) => {
    switch (lvl) {
      case 1: return '1 - Novice (Learning basics)';
      case 2: return '2 - Beginner (Can apply with guidance)';
      case 3: return '3 - Competent (Autonomous in routine tasks)';
      case 4: return '4 - Proficient (Handles complex production problems)';
      case 5: return '5 - Expert (Staff / Architecture level mastery)';
      default: return `${lvl} / 5`;
    }
  };

  // Add skill from taxonomy or free text
  const handleAddSkill = (name: string, proficiency: number = 3) => {
    const clean = name.trim();
    if (!clean) return;
    if (skills.some((s) => s.skill_name.toLowerCase() === clean.toLowerCase())) {
      return; // Already exists
    }
    const newSkill: UserSkillItem = {
      skill_name: clean,
      proficiency,
      verified_level: null,
      confidence: 'self-rated',
    };
    setSkills([...skills, newSkill]);
    setCustomSkillName('');
    setSkillSearchQuery('');
    setShowSkillDropdown(false);
  };

  const handleUpdateProficiency = (index: number, newProf: number) => {
    const updated = [...skills];
    updated[index].proficiency = newProf;
    setSkills(updated);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Add certification
  const handleAddCertification = () => {
    if (!newCertName.trim()) return;
    setCerts([
      ...certs,
      {
        name: newCertName.trim(),
        issuer: newCertIssuer.trim() || 'Accredited Issuer',
        issue_date: newCertDate.trim() || '2026',
      },
    ]);
    setNewCertName('');
    setNewCertIssuer('');
    setShowAddCert(false);
  };

  const handleRemoveCertification = (index: number) => {
    setCerts(certs.filter((_, i) => i !== index));
  };

  // Add project
  const handleAddProject = () => {
    if (!newProjTitle.trim()) return;
    setProjects([
      ...projects,
      {
        title: newProjTitle.trim(),
        description: newProjDesc.trim() || 'Engineering implementation with modular architecture.',
        skills_used: newProjSkills.trim() || targetRole,
      },
    ]);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjSkills('');
    setShowAddProject(false);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({
        full_name: fullName,
        education,
        target_role: targetRole,
        weekly_hours: weeklyHours,
        skills,
        certifications: certs,
        projects,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Run AI Agent Analysis
  const handleRunAgentAnalysis = async () => {
    setIsAnalyzing(true);
    setAgentAnalysisMessage(null);
    try {
      // First save profile
      await updateProfile({
        full_name: fullName,
        education,
        target_role: targetRole,
        weekly_hours: weeklyHours,
        skills,
        certifications: certs,
        projects,
      });
      // Then trigger agent pipeline
      const res = await analyzeProfile();
      setAgentAnalysisMessage(res.message);
    } catch (err: any) {
      setAgentAnalysisMessage('Profile Analyst & Career Matcher re-calculated your skill readiness.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const readiness = profile?.readiness_pct ?? 32.0;
  const streak = profile?.streak_days ?? 6;
  const verifiedCount = skills.filter((s) => s.confidence.includes('verified')).length;
  const selfRatedCount = skills.length - verifiedCount;

  // Filter skills taxonomy
  const filteredTaxonomy = availableSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) &&
      !skills.some((existing) => existing.skill_name.toLowerCase() === s.name.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">
              Profile updated successfully! AI multi-agent orchestrator synced your skill graph.
            </span>
          </div>
          <button
            onClick={() => setSaveSuccess(false)}
            className="text-emerald-700 dark:text-emerald-300 hover:underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Agent Analysis Result Banner */}
      {agentAnalysisMessage && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <span className="font-bold block">AI Agent Orchestrator Analysis Complete</span>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-300">
                {agentAnalysisMessage}
              </span>
            </div>
          </div>
          <button
            onClick={() => setAgentAnalysisMessage(null)}
            className="text-indigo-700 dark:text-indigo-300 hover:underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Learner Info */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                {fullName.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
                  {fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Target: {targetRole}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Learner
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {education}
                </span>
                <span>•</span>
                <span>{email}</span>
              </p>

              {/* Badges strip */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{streak} Day Streak</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{weeklyHours} hrs/week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:border-l lg:border-slate-100 lg:dark:border-slate-800 lg:pl-6">
            {/* Live Readiness Widget */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 shrink-0">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-700 ease-out"
                    strokeWidth="4"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * readiness) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute font-bold text-xs text-slate-900 dark:text-white">
                  {Math.round(readiness)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Role Readiness
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {readiness >= 75 ? 'Ready to Interview' : 'Gap Closing Phase'}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRunAgentAnalysis}
                disabled={isAnalyzing}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Re-Analysis</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="py-2 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-6 pt-4 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'details', label: 'Personal & Academic', icon: User },
            { id: 'skills', label: `Skills & Competencies (${skills.length})`, icon: Sparkles },
            { id: 'portfolio', label: `Projects & Certifications (${certs.length + projects.length})`, icon: FolderGit2 },
            { id: 'security', label: 'Account & Security', icon: ShieldCheck },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PERSONAL & ACADEMIC DETAILS */}
      {/* ============================================================== */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Academic & Profile Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Education & Institution
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.E. Computer Science Engineering, Anna University"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Professional Summary / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Target Role & Availability Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Target Role & Weekly Commitment
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Role
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  >
                    <option value="Full Stack Developer">Full Stack Developer (Web & API Architecture)</option>
                    <option value="Backend Engineer">Backend Engineer (Distributed Services & SQL)</option>
                    <option value="Data Engineer">Data Engineer (Pipelines, ETL, Warehouses)</option>
                    <option value="Cloud Architect">Cloud Architect (AWS, Kubernetes, Infrastructure)</option>
                    <option value="AI / ML Engineer">AI / ML Engineer (PyTorch, LLMs, Vector DBs)</option>
                    <option value="Mobile Developer">Mobile Developer (React Native & Native Bridges)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Weekly Study Allocation: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{weeklyHours} hours/week</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {weeklyHours >= 20 ? 'Accelerated Pace' : weeklyHours >= 10 ? 'Balanced Pace' : 'Light Study'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={40}
                    step={1}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>4 hrs (Part-time)</span>
                    <span>15 hrs (Recommended)</span>
                    <span>40 hrs (Full-time Bootcamp)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Adaptive Timeline Forecast:</span> At {weeklyHours} hours/week, your 4-phase learning roadmap will take approximately{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {Math.max(3, Math.round(66 / Math.max(1, weeklyHours)))} weeks
                    </strong>{' '}
                    to reach 85%+ role readiness.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Learner Verification Summary
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Verified Skills</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {verifiedCount} Skills
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Self-rated Skills</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {selfRatedCount} Skills
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Certifications</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {certs.length} Credentials
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Projects Showcase</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {projects.length} Projects
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-5 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Next Steps for You
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Take the JavaScript assessment quiz to boost your verified level and update your adaptive phase roadmap.
              </p>
              <button
                type="button"
                onClick={() => navigate('/assessments?skill=javascript')}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all flex items-center justify-between"
              >
                <span>Verify JavaScript Diagnostic</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SKILLS INVENTORY & TAXONOMY */}
      {/* ============================================================== */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Skill Inventory & Proficiency Levels
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rate your competencies from 1 to 5. Verified skills carry full weight in multi-agent gap evaluations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunAgentAnalysis}
                  disabled={isAnalyzing}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Re-Analyze</span>
                </button>
              </div>
            </div>

            {/* Add Skill Form (Searchable taxonomy + custom free text) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Add Skill from Taxonomy or Enter Custom Skill
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                {/* Search Taxonomy Input */}
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => {
                      setSkillSearchQuery(e.target.value);
                      setShowSkillDropdown(true);
                    }}
                    onFocus={() => setShowSkillDropdown(true)}
                    placeholder="Search taxonomy (e.g. React, Docker, Git)..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />

                  {/* Dropdown search results */}
                  {showSkillDropdown && skillSearchQuery && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-40 p-1 divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredTaxonomy.length > 0 ? (
                        filteredTaxonomy.map((s) => (
                          <button
                            key={s.skill_id}
                            type="button"
                            onClick={() => handleAddSkill(s.name, 3)}
                            className="w-full text-left p-2 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {s.name}
                            </span>
                            <span className="text-[10px] text-slate-400">{s.category}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-2 text-center text-[11px] text-slate-400">
                          No exact match. Use the custom skill adder below.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Free Text Custom Skill Adder */}
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={customSkillName}
                    onChange={(e) => setCustomSkillName(e.target.value)}
                    placeholder="Or type custom (e.g. TailwindCSS, GraphQL)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3 flex items-center gap-2">
                  <select
                    value={customSkillProficiency}
                    onChange={(e) => setCustomSkillProficiency(parseInt(e.target.value, 10))}
                    className="flex-1 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none"
                  >
                    <option value={1}>1 - Novice</option>
                    <option value={2}>2 - Beginner</option>
                    <option value={3}>3 - Competent</option>
                    <option value={4}>4 - Proficient</option>
                    <option value={5}>5 - Expert</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleAddSkill(customSkillName || skillSearchQuery, customSkillProficiency)}
                    disabled={!customSkillName.trim() && !skillSearchQuery.trim()}
                    className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Skills Table / Cards */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
              {skills.map((skill, idx) => {
                const isVerified = skill.confidence.includes('verified');
                return (
                  <div
                    key={skill.skill_name}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="space-y-1 sm:w-1/3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {skill.skill_name}
                        </span>
                        {isVerified ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Verified ({skill.verified_level || skill.proficiency}/5)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            Self-rated
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {isVerified
                          ? `Assessed level ${skill.verified_level || skill.proficiency}/5`
                          : 'Not yet verified by quiz'}
                      </span>
                    </div>

                    {/* Interactive Slider */}
                    <div className="sm:w-1/3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          Proficiency:
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {skill.proficiency} / 5
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={skill.proficiency}
                        onChange={(e) => handleUpdateProficiency(idx, parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 block truncate">
                        {getProficiencyLabel(skill.proficiency)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:justify-end">
                      {!isVerified && (
                        <button
                          type="button"
                          onClick={() => navigate(`/assessments?skill=${encodeURIComponent(skill.skill_name.toLowerCase())}`)}
                          className="py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify Quiz</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PROJECTS & CERTIFICATIONS */}
      {/* ============================================================== */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Certifications Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Certifications ({certs.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verified credentials boost your domain readiness benchmark.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCert(!showAddCert)}
                className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Cert</span>
              </button>
            </div>

            {/* Expandable Add Cert Form */}
            {showAddCert && (
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Add New Certification
                </span>
                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    value={newCertName}
                    onChange={(e) => setNewCertName(e.target.value)}
                    placeholder="Certification Name (e.g. AWS Solutions Architect)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newCertIssuer}
                      onChange={(e) => setNewCertIssuer(e.target.value)}
                      placeholder="Issuer (e.g. Amazon Web Services)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newCertDate}
                      onChange={(e) => setNewCertDate(e.target.value)}
                      placeholder="Year / Date (e.g. 2026)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddCert(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCertification}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-xs"
                    >
                      Save Certification
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Certs List */}
            <div className="space-y-2.5">
              {certs.map((c, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {c.issuer} • Issued {c.issue_date}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(i)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Portfolio Projects ({projects.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Demonstrated evidence analyzed by Profile Analyst agent.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddProject(!showAddProject)}
                className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {/* Expandable Add Project Form */}
            {showAddProject && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Add New Portfolio Project
                </span>
                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    placeholder="Project Title (e.g. Realtime Collaborative Canvas)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    placeholder="Architecture description, problems solved..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none resize-none"
                  />
                  <input
                    type="text"
                    value={newProjSkills}
                    onChange={(e) => setNewProjSkills(e.target.value)}
                    placeholder="Technologies Used (e.g. React, WebSocket, Node.js)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddProject(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs"
                    >
                      Save Project
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Projects List */}
            <div className="space-y-3">
              {projects.map((p, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {p.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(i)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.skills_used.split(',').map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ACCOUNT SECURITY & SESSION MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Account Credentials & Security
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Connected Email
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Update Password
                </label>
                <input
                  type="password"
                  placeholder="New password (min 8 characters)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-2"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="py-2 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs shadow-xs transition-all"
              >
                Save New Password
              </button>
            </div>
          </div>

          {/* Session Info & Learner Switcher */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Quick Switch Demo Learner
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly toggle between different learner personas to experience the adaptive multi-agent roadmap engine with different skill sets.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => loginDemo('demo')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    fullName.includes('Arjun')
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Arjun Kumar
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Full Stack Dev • 32%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => loginDemo('alex')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    fullName.includes('Alex')
                      ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/40 ring-2 ring-violet-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Alex Rivera
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Cloud Architect • 78%
                  </span>
                </button>
              </div>
            </div>

            {/* Logout Card */}
            <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Sign Out of SkillPath AI
              </span>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
                Signing out will clear your local JWT session token. You can sign back in at any time or use one-click demo login.
              </p>
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Confirm Sign Out?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to log out from this session? Your roadmap and assessment scores will remain safely saved.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-xs"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
