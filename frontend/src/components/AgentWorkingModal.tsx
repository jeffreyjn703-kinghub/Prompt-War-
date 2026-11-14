import React, { useState, useEffect } from 'react';
import { Bot, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface AgentWorkingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  targetRole: string;
}

const AGENT_STEPS = [
  { name: 'Profile Analyst', action: 'Normalizing existing competencies & project experience...' },
  { name: 'Career Matcher', action: 'Benchmarking against target job role requirements...' },
  { name: 'Skill Gap Agent', action: 'Topologically ordering prerequisite skill dependencies...' },
  { name: 'Curriculum Planner', action: 'Synthesizing week-by-week learning roadmap...' },
  { name: 'Resource Recommender', action: 'Selecting curated courses, tutorials, and capstones...' },
  { name: 'AI Mentor', action: 'Formulating personalized growth strategy and nudges...' },
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
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const progressPct = ((currentStep + 1) / AGENT_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold">Multi-Agent Collaboration</h3>
            <p className="text-xs text-muted-foreground">
              Synthesizing adaptive path for <span className="text-violet-400 font-semibold">{targetRole}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {AGENT_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={step.name}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-violet-500/10 border-violet-500/30'
                    : isCompleted
                    ? 'bg-muted/30 border-border/40 opacity-80'
                    : 'bg-muted/10 border-transparent opacity-40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{step.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">
                        Running
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
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
