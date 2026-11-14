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
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RoleTaxonomyItem, SkillTaxonomyItem, UserSkillItem } from '../types';
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
  ).slice(0, 16);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full bg-card border border-border/70 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Stepper Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span>Step {step} of 3</span>
            <span>
              {step === 1 && 'Personal Profile'}
              {step === 2 && 'Existing Competencies'}
              {step === 3 && 'Career Goal & Hours'}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Profile & Education */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl font-bold">Tell us about yourself</h2>
              <p className="text-xs text-muted-foreground mt-1">
                The Profile Analyst agent uses your background to calibrate starting prerequisites.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="e.g. Sarah Chen"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">Educational Background</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="e.g. B.S. in Computer Science or Self-Taught Developer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <span>Continue to Skills</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Existing Skills */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl font-bold">What are your existing skills?</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Select from our 80+ skill taxonomy or add custom skills. Adjust your self-rated level (1-5).
              </p>
            </div>

            {/* Selected Skills List with Level Sliders */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {selectedSkills.map((s) => (
                <div
                  key={s.skill_name}
                  className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-4"
                >
                  <div className="min-w-[120px]">
                    <span className="text-xs font-bold text-foreground">{s.skill_name}</span>
                    <span className="block text-[10px] text-muted-foreground">Level {s.proficiency} / 5</span>
                  </div>

                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={s.proficiency}
                      onChange={(e) => handleProficiencyChange(s.skill_name, parseInt(e.target.value))}
                      className="w-full accent-violet-500 h-1.5 rounded-lg bg-muted cursor-pointer"
                    />
                    <span className="text-xs font-mono font-semibold w-5 text-center">
                      {s.proficiency}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveSkill(s.skill_name)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Search Taxonomy & Add Free Text */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search 80+ skills (e.g. React, Docker, SQL, Python)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/30 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Quick skill pills */}
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {filteredSkills.map((s) => {
                  const isAdded = selectedSkills.some(
                    (it) => it.skill_name.toLowerCase() === s.name.toLowerCase()
                  );
                  return (
                    <button
                      key={s.skill_id}
                      onClick={() => handleAddTaxonomySkill(s)}
                      disabled={isAdded}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                        isAdded
                          ? 'bg-violet-500/20 text-violet-400 border-violet-500/30 opacity-60'
                          : 'bg-muted/50 border-border/60 hover:border-violet-500/40 hover:text-violet-400'
                      }`}
                    >
                      {isAdded && <Check className="w-3 h-3" />}
                      {s.name}
                    </button>
                  );
                })}
              </div>

              {/* Free text custom addition */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={freeTextSkill}
                  onChange={(e) => setFreeTextSkill(e.target.value)}
                  placeholder="Or type any custom skill (e.g. Bun, WebAssembly)..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-muted/30 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFreeTextSkill()}
                />
                <button
                  onClick={handleAddFreeTextSkill}
                  className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-muted/60 text-xs font-semibold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2"
              >
                <span>Continue to Goal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goal & Hours */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl font-bold">Choose your target career role</h2>
              <p className="text-xs text-muted-foreground mt-1">
                The Career Matcher and Curriculum Planner will generate an adaptive week-by-week roadmap.
              </p>
            </div>

            {/* Roles selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {roles.map((r) => {
                const isSelected = targetRole === r.title;
                return (
                  <button
                    key={r.role_id}
                    onClick={() => setTargetRole(r.title)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-violet-500/15 border-violet-500 text-violet-400 shadow-xs'
                        : 'bg-muted/30 border-border/60 hover:border-violet-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{r.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {r.department}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Weekly Hours Slider */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold">Weekly Study Budget</span>
                </div>
                <span className="text-sm font-bold text-violet-400">{weeklyHours} hours/week</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                className="w-full accent-violet-500 h-2 rounded-lg bg-muted cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>5h (Part-time pace)</span>
                <span>15h (Recommended)</span>
                <span>40h (Bootcamp intensive)</span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-muted/60 text-xs font-semibold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate My Path</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Multi-agent generation modal */}
      <AgentWorkingModal
        isOpen={isGenerating}
        onComplete={handleModalComplete}
        targetRole={targetRole}
      />
    </div>
  );
};
