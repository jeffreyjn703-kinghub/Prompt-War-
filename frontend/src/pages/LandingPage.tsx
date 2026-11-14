import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Bot,
  BrainCircuit,
  Compass,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Zap,
  BookOpen,
  Search,
  Activity,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();

  const handleStartDemo = async (learner: 'demo' | 'alex') => {
    await loginDemo(learner);
    navigate('/dashboard');
  };

  const agents = [
    { name: 'Orchestrator', role: 'Event Routing & State Machine', icon: Cpu, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800' },
    { name: 'Profile Analyst', role: 'Skill Graph Normalization', icon: BrainCircuit, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800' },
    { name: 'Career Matcher', role: 'Readiness & Role Alignment', icon: Compass, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/70 border-violet-200 dark:border-violet-800' },
    { name: 'Skill Gap Agent', role: 'Prerequisite Dependency Ranking', icon: Layers, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-800' },
    { name: 'Curriculum Planner', role: 'Time-Budget Phased Milestones', icon: BookOpen, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/70 border-cyan-200 dark:border-cyan-800' },
    { name: 'Resource Recommender', role: 'Catalog Curation & Tasks', icon: Search, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800' },
    { name: 'Assessment Agent', role: 'Quizzes & Verified Diagnostics', icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500/20' },
    { name: 'Progress Evaluator', role: 'Pace & Stagnation Triggering', icon: Activity, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/70 border-purple-200 dark:border-purple-800' },
  ];

  const steps = [
    { number: '01', title: 'Input Profile & Skills', desc: 'Add existing languages, frameworks, projects and weekly study availability.' },
    { number: '02', title: 'AI Role Benchmarking', desc: 'Match your current capabilities against industry standards across 9 engineering roles.' },
    { number: '03', title: 'Synthesize Adaptive Roadmap', desc: 'Get an ordered sequence of curated courses, documentation, and practical code labs.' },
    { number: '04', title: 'Verify & Auto-Calibrate', desc: 'Pass objective quizzes to verify proficiency. Failures trigger immediate remedial phases.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Simple Nav */}
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white font-heading">
              SkillPath <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleStartDemo('demo')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Try Demo Learner
            </button>
            <button
              onClick={() => navigate('/onboard')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Multi-Agent Career Engine • 100% Deterministic Fallback</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading leading-tight text-slate-900 dark:text-white">
            Your skills. Your goal.<br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Your personalized path.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            SkillPath AI analyzes your skill gaps against target tech roles and synthesizes an adaptive roadmap through multiple collaborating AI agents. No generic checklists—just verified mastery.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => handleStartDemo('demo')}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-102"
            >
              <span>Try Demo Learner (Arjun Kumar)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleStartDemo('alex')}
              className="px-6 py-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-102"
              title="Demo of Alex Rivera with active remedial phase triggered by 38% assessment score"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Try Adaptive Remedial Demo (Alex)</span>
            </button>

            <button
              onClick={() => navigate('/onboard')}
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-xs transition-all"
            >
              Start 4-Step Onboarding
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            ⚡ Runs end-to-end with zero API keys. Optional Google Gemini (gemini-2.0-flash) support included.
          </p>
        </div>

        {/* Animated Dashboard Mockup Preview */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl overflow-hidden relative">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono text-slate-400 ml-2">
                skillpath-ai.app/dashboard • Target: Full Stack Developer
              </span>
            </div>

            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Benchmark Readiness</span>
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-heading my-1">
                  32%
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  +14% Since Onboarding
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Remedial Phase</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Phase 1: JavaScript Fundamentals</h4>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-indigo-600 w-1/2" />
                </div>
                <span className="text-[10px] text-slate-400 block">2 of 4 milestones complete</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">AI Mentor Insight</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  "Python and SQL verified. Next milestone: Close the JavaScript execution model gap."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step "How It Works" Strip */}
      <section className="py-16 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
              Deterministic Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-heading mt-1">
              How SkillPath AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                  {s.number}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 AI Agents Working For You */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
              Architecture & Collaboration
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-heading mt-1">
              8 AI Agents Working Collaboratively For You
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
              Not a monolithic LLM prompt. Specialized agents communicate through explicit hand-offs and a shared <code>LearnerContext</code> state object.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((ag, idx) => {
              const Icon = ag.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${ag.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ag.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {ag.role}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-400">
        <p>SkillPath AI • Senior Full-Stack & Agentic Architecture • 2026 Production Standard</p>
      </footer>
    </div>
  );
};
