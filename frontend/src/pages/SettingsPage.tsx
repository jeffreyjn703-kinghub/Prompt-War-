import React, { useState, useEffect } from 'react';
import {
  User,
  Award,
  FolderGit2,
  Sun,
  Moon,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/client';
import { CertificationItem, ProjectItem } from '../types';

export const SettingsPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(profile?.full_name || 'Arjun Kumar');
  const [education, setEducation] = useState(profile?.education || 'B.E. CSE student');
  const [targetRole, setTargetRole] = useState(profile?.target_role || 'Full Stack Developer');
  const [weeklyHours, setWeeklyHours] = useState(profile?.weekly_hours || 10);

  const [certs, setCerts] = useState<CertificationItem[]>(profile?.certifications || [
    { name: 'Python for Everybody (Coursera)', issuer: 'University of Michigan', issue_date: '2024' },
  ]);

  const [projects, setProjects] = useState<ProjectItem[]>(profile?.projects || [
    { title: 'Library Management API with Python & SQLite', description: 'FastAPI CRUD endpoints with relational schema', skills_used: 'Python, SQL, SQLite' },
  ]);

  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  const [notifReplan, setNotifReplan] = useState(true);
  const [notifMentor, setNotifMentor] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setEducation(profile.education);
      setTargetRole(profile.target_role);
      setWeeklyHours(profile.weekly_hours);
      if (profile.certifications) setCerts(profile.certifications);
      if (profile.projects) setProjects(profile.projects);
    }
  }, [profile]);

  const handleAddCert = () => {
    if (!newCertName.trim()) return;
    setCerts([...certs, { name: newCertName.trim(), issuer: newCertIssuer.trim() || 'Verified Issuer', issue_date: '2025' }]);
    setNewCertName('');
    setNewCertIssuer('');
  };

  const handleRemoveCert = (index: number) => {
    setCerts(certs.filter((_, i) => i !== index));
  };

  const handleAddProject = () => {
    if (!newProjTitle.trim()) return;
    setProjects([...projects, { title: newProjTitle.trim(), description: newProjDesc.trim(), skills_used: 'Full Stack' }]);
    setNewProjTitle('');
    setNewProjDesc('');
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile({
        full_name: fullName,
        education,
        target_role: targetRole,
        weekly_hours: weeklyHours,
        certifications: certs,
        projects: projects,
      });
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Profile & Preferences</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile, credentials, study schedule, and system settings.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </>
          )}
        </button>
      </div>

      {/* Profile & Education Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <User className="w-4 h-4 text-indigo-500" />
          <span>Learner Identity & Target Goal</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5">
              Education / Degree
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5">
              Target Role Benchmark
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-500 dark:text-slate-400 font-semibold">
                Weekly Study Commitment
              </label>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                {weeklyHours} hrs/week
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
              className="w-full accent-indigo-600 h-2 rounded-lg bg-slate-200 dark:bg-slate-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Certifications Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Award className="w-4 h-4 text-violet-500" />
          <span>Certifications & Credential Badges</span>
        </h3>

        <div className="space-y-2">
          {certs.map((c, i) => (
            <div
              key={i}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                <span className="text-slate-400 text-[11px]">{c.issuer} • {c.issue_date}</span>
              </div>
              <button
                onClick={() => handleRemoveCert(i)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <input
            type="text"
            value={newCertName}
            onChange={(e) => setNewCertName(e.target.value)}
            placeholder="Certification name (e.g. AWS Certified Developer)..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={newCertIssuer}
            onChange={(e) => setNewCertIssuer(e.target.value)}
            placeholder="Issuer (e.g. Amazon Web Services)..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
          <button
            onClick={handleAddCert}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 hover:bg-slate-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Projects Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <FolderGit2 className="w-4 h-4 text-emerald-500" />
          <span>Portfolio Projects & Practical Work</span>
        </h3>

        <div className="space-y-2">
          {projects.map((p, i) => (
            <div
              key={i}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{p.title}</span>
                <span className="text-slate-400 text-[11px]">{p.description}</span>
              </div>
              <button
                onClick={() => handleRemoveProject(i)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <input
            type="text"
            value={newProjTitle}
            onChange={(e) => setNewProjTitle(e.target.value)}
            placeholder="Project title (e.g. Chat application with WebSockets)..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={newProjDesc}
            onChange={(e) => setNewProjDesc(e.target.value)}
            placeholder="Description..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
          <button
            onClick={handleAddProject}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 hover:bg-slate-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Appearance & Notification Preferences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Appearance & Notifications</span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">Theme Mode</span>
              <span className="text-slate-400 text-[11px]">Toggle between Light and Dark interface</span>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold flex items-center gap-1.5"
            >
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span className="capitalize">{theme} Mode</span>
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">Adaptive Re-plan Banners</span>
              <span className="text-slate-400 text-[11px]">Notify when agents adapt your roadmap</span>
            </div>
            <input
              type="checkbox"
              checked={notifReplan}
              onChange={(e) => setNotifReplan(e.target.checked)}
              className="accent-indigo-600 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">AI Mentor Micro-Nudges</span>
              <span className="text-slate-400 text-[11px]">Receive 15-minute daily milestone suggestions</span>
            </div>
            <input
              type="checkbox"
              checked={notifMentor}
              onChange={(e) => setNotifMentor(e.target.checked)}
              className="accent-indigo-600 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
