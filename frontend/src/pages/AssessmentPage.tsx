import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Code2,
  ArrowRight,
  RotateCw,
  Clock,
  Layers,
  Timer,
  Zap,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AssessmentGenerateData, AssessmentResultData } from '../types';
import { ReplanBanner } from '../components/ReplanBanner';

export const AssessmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();

  const availableSkills = [
    { id: 'javascript', name: 'JavaScript (ES6+)' },
    { id: 'react', name: 'React' },
    { id: 'nodejs', name: 'Node.js' },
    { id: 'sql', name: 'SQL & Relational Databases' },
    { id: 'python', name: 'Python Programming' },
    { id: 'html', name: 'HTML5 & Web Semantics' },
    { id: 'css', name: 'CSS3 & Modern Layouts' },
    { id: 'git', name: 'Git & Version Control' },
  ];

  const initialSkill = searchParams.get('skill') || 'javascript';
  const [selectedSkill, setSelectedSkill] = useState(initialSkill);
  const [quizData, setQuizData] = useState<AssessmentGenerateData | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [practicalText, setPracticalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<AssessmentResultData | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 minutes timer

  useEffect(() => {
    loadQuiz(selectedSkill);
  }, [selectedSkill]);

  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const loadQuiz = async (skillId: string) => {
    setIsLoading(true);
    setResult(null);
    setAnswers({});
    setPracticalText('');
    setSecondsRemaining(600);
    try {
      const data = await api.generateAssessment(skillId);
      setQuizData(data);
    } catch (err) {
      console.warn('Failed to generate quiz', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!quizData) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitAssessment(quizData.skill_id, answers, practicalText);
      setResult(res);
      await refreshProfile();

      if (res.passed) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Failed submitting assessment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant demo helper to test poor vs strong score
  const handleSimulateVariant = async (variant: 'poor' | 'strong') => {
    if (!quizData) return;
    setIsSubmitting(true);
    try {
      // Create answers to hit <60% or >85%
      const mockAnswers: Record<number, number> = {};
      quizData.questions.forEach((q, idx) => {
        const correctIdx = q.correct_option_index ?? 0;
        if (variant === 'poor') {
          // Intentionally answer 40% correct
          mockAnswers[q.id] = idx % 3 === 0 ? correctIdx : (correctIdx + 1) % 4;
        } else {
          // Answer 100% correct
          mockAnswers[q.id] = correctIdx;
        }
      });
      const mockPractical = variant === 'poor' ? 'TODO' : 'function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }';
      const res = await api.submitAssessment(quizData.skill_id, mockAnswers, mockPractical);
      setResult(res);
      await refreshProfile();
      if (res.passed) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Failed simulating score', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const mcqQuestions = quizData?.questions.filter((q) => q.question_type === 'mcq') || [];
  const practicalQuestion = quizData?.questions.find((q) => q.question_type === 'practical');

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Assessment Agent
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading mt-1">
            Verified Technical Assessments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Objective skill verification (8-10 MCQs + practical coding challenge). Passing updates your verified proficiency level and triggers adaptive re-plans.
          </p>
        </div>

        {/* Demo Variant Quick Triggers */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Adaptive Event Demos:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulateVariant('poor')}
              disabled={isSubmitting}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 text-xs font-semibold flex items-center gap-1 transition-all"
              title="Simulates ASSESSMENT_POOR (<60%) triggering remedial phase insertion"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate 48% (Poor)</span>
            </button>
            <button
              onClick={() => handleSimulateVariant('strong')}
              disabled={isSubmitting}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold flex items-center gap-1 transition-all"
              title="Simulates ASSESSMENT_STRONG (≥85%) triggering roadmap acceleration"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Simulate 92% (Strong)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Skill Selector Chips Strip */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-400 shrink-0 px-1">Target Skill:</span>
        {availableSkills.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSkill(s.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
              selectedSkill === s.id
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Results View */}
      {result && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in zoom-in-95 duration-200">
          {/* Adaptive Live Re-Plan Banner */}
          {result.replan_triggered && (
            <ReplanBanner
              triggerEvent={result.trigger_action}
              title={
                result.trigger_action === 'ASSESSMENT_POOR'
                  ? 'Remedial Re-Plan Triggered (<60% Score)'
                  : 'Curriculum Accelerated (≥85% Mastery)'
              }
              message={
                result.trigger_action === 'ASSESSMENT_POOR'
                  ? `Your score (${result.score_pct.toFixed(0)}%) revealed key growth areas. The Curriculum Planner inserted a dedicated Remedial Phase with foundational drills.`
                  : `Your score (${result.score_pct.toFixed(0)}%) demonstrated strong verified mastery! Redundant introductory content was pruned.`
              }
              diffSummary={result.replan_summary}
              onDismiss={() => {}}
            />
          )}

          {/* Results Summary Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              {/* Score Circular Ring */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
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
                    stroke={result.passed ? '#10b981' : '#f59e0b'}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - result.score_pct / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {result.score_pct.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-400">
                  Assessment Completed
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 font-heading">
                  {result.skill_id.toUpperCase()} Technical Diagnostic
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      result.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {result.passed ? 'Baseline Passed' : 'Remedial Threshold (<60%)'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Level {result.new_verified_level}/5
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadQuiz(selectedSkill)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <Link
                to="/roadmap"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <span>View Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feedback & Weak Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                AI Mentor Feedback
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{result.mentor_feedback}"
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-1">
                Pinpointed Growth Subtopics
              </span>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-1">
                {result.weak_topics?.length > 0 ? (
                  result.weak_topics.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-emerald-500 font-medium">All evaluated subtopics answered correctly!</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Form (Only visible if no result or retaking) */}
      {!result && (
        <div className="space-y-6">
          {/* Timer and Progress bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Timer className="w-4 h-4 text-indigo-500" />
              <span>Time Remaining:</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {formatTimer(secondsRemaining)}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Answered {Object.keys(answers).length} / {mcqQuestions.length} MCQs
            </span>
          </div>

          {/* MCQs List */}
          <div className="space-y-4">
            {mcqQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Question {idx + 1} of {mcqQuestions.length}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {q.difficulty}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {q.question_text}
                </p>

                {/* Optional code snippet representation if present */}
                {q.question_text.includes('code') || idx === 1 ? (
                  <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">
                    <code>{`function testScope() {\n  for (var i = 0; i < 3; i++) {\n    setTimeout(() => console.log(i), 10);\n  }\n}`}</code>
                  </pre>
                ) : null}

                {/* Options */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[q.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, oIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{opt}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Practical Question Challenge */}
          {practicalQuestion && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Practical Implementation Challenge
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {practicalQuestion.question_text}
              </p>
              <textarea
                value={practicalText}
                onChange={(e) => setPracticalText(e.target.value)}
                placeholder="Write your implementation code or architectural breakdown here..."
                rows={5}
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400 italic">
                Evaluated objectively by Assessment Agent keyword matching & structural rubric.
              </p>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length < 2}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-40 transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Evaluating Submission...' : 'Submit & Calibrate Level'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
