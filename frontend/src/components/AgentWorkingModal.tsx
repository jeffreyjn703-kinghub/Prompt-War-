import React, { useState, useEffect } from 'react';
import {
  Bot,
  CheckCircle2,
  Loader2,
  Sparkles,
  BrainCircuit,
  Compass,
  Layers,
  BookOpen,
  Search,
  Activity,
  Cpu,
} from 'lucide-react';

interface AgentWorkingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  targetRole: string;
}

const AGENT_STEPS = [
  {
    name: 'Orchestrator',
    action: 'Dispatched learner context & planned 7-stage execution pipeline',
    icon: Cpu,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800',
  },
  {
    name: 'Profile Analyst',
    action: 'Normalized 3 skills (Python 4/5, SQL 3/5, HTML 2/5) into competency graph',
    icon: BrainCircuit,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800',
  },
  {
    name: 'Career Matcher',
    action: 'Calculated 32% baseline readiness against Full Stack Developer benchmark',
    icon: Compass,
    color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/70 border-violet-200 dark:border-violet-800',
  },
  {
    name: 'Skill Gap Agent',
    action: 'Found 3 missing skills (JavaScript, React, Node.js) & ranked prerequisites',
    icon: Layers,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-800',
  },
  {
    name: 'Curriculum Planner',
    action: 'Synthesized 4 phased milestones respecting 10h/week study pace',
    icon: BookOpen,
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/70 border-cyan-200 dark:border-cyan-800',
  },
  {
    name: 'Resource Recommender',
    action: 'Curated 14 hands-on resources, documentation & practical exercises',
    icon: Search,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800',
  },
  {
    name: 'AI Mentor',
    action: 'Calibrated diagnostic milestones & initialized real-time guidance stream',
    icon: Bot,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500/20',
  },
];

export const AgentWorkingModal: React.FC<AgentWorkingModalProps> = ({
  isOpen,
  onComplete,
  targetRole,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < AGENT_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 800);
          return prev;
        }
      });
    }, 650);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const progressPct = ((currentStep + 1) / AGENT_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Agents Generating Your Learning Path
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synthesizing adaptive path for <strong className="text-indigo-600 dark:text-indigo-400">{targetRole}</strong>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-5">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Agent Avatars Lighting Up Step-by-Step */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {AGENT_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            const Icon = step.icon;

            return (
              <div
                key={step.name}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs scale-101'
                    : isCompleted
                    ? 'bg-slate-50/80 dark:bg-slate-850 border-slate-200/80 dark:border-slate-800'
                    : 'bg-transparent border-transparent opacity-30'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${step.color} ${
                    isCurrent ? 'ring-2 ring-indigo-500 shadow-xs' : ''
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {step.name}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                    {step.action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
