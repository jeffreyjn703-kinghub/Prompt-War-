import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Briefcase,
  Clock,
  GraduationCap,
  Sliders,
  Search,
  Award,
  FolderGit2,
  User,
  Zap,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RoleTaxonomyItem, SkillTaxonomyItem, UserSkillItem, CertificationItem, ProjectItem } from '../types';
import { AgentWorkingModal } from '../components/AgentWorkingModal';

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('Arjun Kumar');
  const [education, setEducation] = useState('B.E. CSE student');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [weeklyHours, setWeeklyHours] = useState(10);

  const [taxonomySkills, setTaxonomySkills] = useState<SkillTaxonomyItem[]>([]);
  const [roles, setRoles] = useState<RoleTaxonomyItem[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<UserSkillItem[]>([
    { skill_name: 'Python', proficiency: 4, confidence: 'self-rated' },
    { skill_name: 'SQL', proficiency: 3, confidence: 'self-rated' },
    { skill_name: 'HTML', proficiency: 2, confidence: 'self-rated' },
  ]);

  const [certs, setCerts] = useState<CertificationItem[]>([
    { name: 'Python for Everybody (Coursera)', issuer: 'University of Michigan', issue_date: '2024' },
  ]);
  const [projects, setProjects] = useState<ProjectItem[]>([
    { title: 'Library Management API with Python & SQLite', description: 'FastAPI CRUD endpoints with relational schema', skills_used: 'Python, SQL, SQLite' },
  ]);

  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [freeTextSkill, setFreeTextSkill] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsData, rolesData] = await Promise.all([
          api.getSkills(),
          api.getRoles(),
        ]);
        setTaxonomySkills(skillsData);
        setRoles(rolesData);
      } catch (err) {
        console.warn('Failed loading taxonomy', err);
      }
    };
    fetchData();
  }, []);

  const handleAddTaxonomySkill = (s: SkillTaxonomyItem) => {
    if (!selectedSkills.some((item) => item.skill_name.toLowerCase() === s.name.toLowerCase())) {
      setSelectedSkills([...selectedSkills, { skill_name: s.name, proficiency: 3, confidence: 'self-rated' }]);
    }
  };

  const handleAddFreeTextSkill = () => {
    if (freeTextSkill.trim() && !selectedSkills.some((item) => item.skill_name.toLowerCase() === freeTextSkill.trim().toLowerCase())) {
      setSelectedSkills([...selectedSkills, { skill_name: freeTextSkill.trim(), proficiency: 3, confidence: 'self-rated' }]);
      setFreeTextSkill('');
    }
  };

  const handleRemoveSkill = (name: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s.skill_name !== name));
  };

  const handleProficiencyChange = (name: string, level: number) => {
    setSelectedSkills(
      selectedSkills.map((s) => (s.skill_name === name ? { ...s, proficiency: level } : s))
    );
  };

  const handleAddCert = () => {
    if (newCertName.trim()) {
      setCerts([...certs, { name: newCertName.trim(), issuer: newCertIssuer.trim() || 'Online', issue_date: '2025' }]);
      setNewCertName('');
      setNewCertIssuer('');
    }
  };

  const handleRemoveCert = (idx: number) => {
    setCerts(certs.filter((_, i) => i !== idx));
  };

  const handleAddProj = () => {
    if (newProjTitle.trim()) {
      setProjects([...projects, { title: newProjTitle.trim(), description: newProjDesc.trim() || 'Software implementation', skills_used: 'Full Stack' }]);
      setNewProjTitle('');
      setNewProjDesc('');
    }
  };

  const handleRemoveProj = (idx: number) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handleFinalSubmit = async () => {
    setIsGenerating(true);
  };

  const handleModalComplete = async () => {
    try {
      await api.updateProfile({
        full_name: fullName,
        education,
        target_role: targetRole,
        weekly_hours: weeklyHours,
        skills: selectedSkills,
        certifications: certs,
        projects: projects,
      });
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding', err);
      navigate('/dashboard');
    }
  };

  const filteredSkills = taxonomySkills.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 14);

  const stepLabels = [
    { num: 1, label: 'Profile' },
    { num: 2, label: 'Skills & Experience' },
    { num: 3, label: 'Career Goal' },
    { num: 4, label: 'Weekly Hours' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center transition-colors">
      <div className="max-w-2xl mx-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-9 shadow-xl relative overflow-hidden">
        {/* Brand Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight font-heading">
              SkillPath <span className="text-indigo-600 dark:text-indigo-400">AI</span> Onboarding
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Step {step} of 4
          </span>
        </div>

        {/* 4-Step Stepper Header */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2 mb-2">
            {stepLabels.map((s) => (
              <div key={s.num} className="flex flex-col">
                <span
                  className={`text-[11px] font-semibold truncate ${
                    step >= s.num ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                  }`}
                >
                  {s.num}. {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Personal Profile & Education */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Personal Profile & Background
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The Profile Analyst agent uses your education and name to seed your learner profile and personalize coaching nudges.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Arjun Kumar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Degree / Current Education
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. B.E. CSE student"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <span>Continue to Skills</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Skills with 1-5 Proficiency Sliders, Certifications, Projects */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Skills, Certifications & Projects
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Rate your proficiency on a 1–5 scale. Search the taxonomy or add custom skills.
              </p>
            </div>

            {/* Selected Skills List with Sliders */}
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {selectedSkills.map((s) => (
                <div
                  key={s.skill_name}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{s.skill_name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        Level {s.proficiency}/5
                      </span>
                      <button
                        onClick={() => handleRemoveSkill(s.skill_name)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={s.proficiency}
                    onChange={(e) => handleProficiencyChange(s.skill_name, parseInt(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1: Beginner</span>
                    <span>3: Intermediate</span>
                    <span>5: Expert</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Taxonomy Search & Add */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Add Skills from Taxonomy
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search 80+ skills (Python, Docker, TypeScript, AWS...)"
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-1">
                {filteredSkills.map((sk) => {
                  const isAdded = selectedSkills.some((s) => s.skill_name.toLowerCase() === sk.name.toLowerCase());
                  return (
                    <button
                      key={sk.skill_id}
                      onClick={() => !isAdded && handleAddTaxonomySkill(sk)}
                      disabled={isAdded}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all flex items-center gap-1 ${
                        isAdded
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 text-indigo-600 opacity-60'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      <span>{sk.name}</span>
                      {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>

              {/* Free Text Add */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={freeTextSkill}
                  onChange={(e) => setFreeTextSkill(e.target.value)}
                  placeholder="Or enter custom skill..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  onClick={handleAddFreeTextSkill}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <span>Continue to Career Goal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Career Goal Role Cards with Match Preview */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Select Your Target Role
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The Career Matcher agent will benchmark your skills against industry requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {roles.map((r) => {
                const isSelected = targetRole === r.title;
                return (
                  <button
                    key={r.role_id}
                    onClick={() => setTargetRole(r.title)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{r.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block mb-2">{r.department}</span>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      {r.total_skills_count} Benchmark Skills
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <span>Continue to Weekly Hours</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Weekly Hours Budget & Final Generate Path */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Study Cadence & Weekly Hours
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The Curriculum Planner agent calibrates your roadmap milestones strictly to your available time budget.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Weekly Study Availability
                </span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {weeklyHours} Hours / Week
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                <div className={`p-2.5 rounded-xl border ${weeklyHours <= 10 ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40' : 'border-slate-200 dark:border-slate-750'}`}>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">Casual</span>
                  <span className="text-[10px] text-slate-400">5-10h/wk</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${weeklyHours > 10 && weeklyHours <= 20 ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40' : 'border-slate-200 dark:border-slate-750'}`}>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">Focused</span>
                  <span className="text-[10px] text-slate-400">15-20h/wk</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${weeklyHours > 20 ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40' : 'border-slate-200 dark:border-slate-750'}`}>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">Bootcamp</span>
                  <span className="text-[10px] text-slate-400">25-40h/wk</span>
                </div>
              </div>
            </div>

            {/* Summary review box */}
            <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 text-xs space-y-1">
              <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
                Profile Configuration Summary:
              </span>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                • Learner: <strong>{fullName}</strong> ({education})
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                • Target Goal: <strong>{targetRole}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                • Seeded Skills: <strong>{selectedSkills.map(s => `${s.skill_name} (${s.proficiency}/5)`).join(', ')}</strong>
              </p>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-102"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate My Path</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Agent Animated Working Screen Modal */}
      <AgentWorkingModal
        isOpen={isGenerating}
        onComplete={handleModalComplete}
        targetRole={targetRole}
      />
    </div>
  );
};
