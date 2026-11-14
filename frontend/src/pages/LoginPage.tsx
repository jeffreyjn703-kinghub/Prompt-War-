import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Bot,
  Radar,
  Map,
  Zap,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VyntrixaLogo } from '../components/VyntrixaLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loginDemo } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('arjun.kumar@vyntrixa.ai');
  const [password, setPassword] = useState('Vyntrixa2026!');
  const [fullName, setFullName] = useState('Arjun Kumar');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Restriction & error states
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionConflict, setSessionConflict] = useState(false);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSessionConflict(false);
    setDuplicateEmailError(false);
    setIsSubmitting(true);

    try {
      if (tab === 'signin') {
        const result = await login(email, password, false);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setErrorMessage(result.error || 'Invalid email or password.');
          if (result.isAlreadyInUse) {
            setSessionConflict(true);
          }
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Please provide your full name.');
          setIsSubmitting(false);
          return;
        }
        const result = await register(email, password, fullName);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setErrorMessage(result.error || 'Registration failed.');
          if (result.isAlreadyInUse) {
            setDuplicateEmailError(true);
          }
        }
      }
    } catch (err: any) {
      const msg = err?.detail || err?.message || 'Authentication error. Please try again.';
      setErrorMessage(msg);
      if (msg.toLowerCase().includes('already in use')) {
        if (tab === 'signin') setSessionConflict(true);
        else setDuplicateEmailError(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSessionConflict(false);
    try {
      const result = await login(email, password, true); // Force override previous active session
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(result.error || 'Failed to override active session.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to override active session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (learner: 'demo' | 'alex') => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSessionConflict(false);
    setDuplicateEmailError(false);
    try {
      await loginDemo(learner);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden bg-cover bg-center bg-no-repeat bg-fixed bg-slate-900"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/login-bg.jpg"
          alt="Educational Background"
          className="w-full h-full object-cover object-center"
        />
        {/* Ambient Dark Gradient & Frosted Overlay for optimal contrast & typography readability */}
        <div className="absolute inset-0 bg-slate-950/55 dark:bg-slate-950/75 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-slate-950/70" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 group p-2.5 px-4 rounded-2xl bg-white/15 dark:bg-slate-900/40 backdrop-blur-md border border-white/25 dark:border-white/10 shadow-lg hover:bg-white/25 transition-all"
        >
          <VyntrixaLogo size="lg" />
        </Link>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md font-heading">
          {tab === 'signin' ? 'Welcome back to VYNTRIXA' : 'Create your personalized account'}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-200/90 drop-shadow-sm">
          Your adaptive learning intelligence
        </p>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl shadow-black/30 border border-white/40 dark:border-slate-700/60 rounded-3xl">
          
          {/* Quick Demo Learner 1-Click Cards */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-violet-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                One-Click Demo Instant Access
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                Zero Setup
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('demo')}
                disabled={isSubmitting}
                className="flex flex-col text-left p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Arjun Kumar
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                    Student
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target: Full Stack Developer
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                  32% readiness • 6d streak →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('alex')}
                disabled={isSubmitting}
                className="flex flex-col text-left p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400">
                    Alex Rivera
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-semibold">
                    Senior
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target: Cloud Architect
                </span>
                <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium mt-1">
                  78% readiness • 18d streak →
                </span>
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setErrorMessage('');
                setSessionConflict(false);
                setDuplicateEmailError(false);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'signin'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setErrorMessage('');
                setSessionConflict(false);
                setDuplicateEmailError(false);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* 1. RESTRICTION ALERT: Concurrent Student Login with Same Email */}
          {sessionConflict && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm block text-amber-900 dark:text-amber-100">
                    Email Already in Use
                  </span>
                  <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Multiple student logins with the same email (<strong className="font-semibold">{email}</strong>) are restricted to prevent session overwrite and ensure roadmap integrity. Another active session is currently logged into this account.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-amber-200 dark:border-amber-800/80">
                <button
                  type="button"
                  onClick={handleForceLogin}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Terminate Other Session & Sign In Here</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSessionConflict(false);
                    setErrorMessage('');
                    setEmail('');
                  }}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold text-xs hover:bg-amber-100/50 transition-colors"
                >
                  Use Another Email ID
                </button>
              </div>
            </div>
          )}

          {/* 2. RESTRICTION ALERT: Duplicate Email Registration */}
          {duplicateEmailError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-700 text-xs text-rose-900 dark:text-rose-200 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm block text-rose-900 dark:text-rose-100">
                    Email Already in Use
                  </span>
                  <p className="mt-0.5 text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                    A student account is already registered with <strong className="font-semibold">{email}</strong>. Multiple student accounts with the same email are restricted.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-rose-200 dark:border-rose-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setDuplicateEmailError(false);
                    setErrorMessage('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Switch to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDuplicateEmailError(false);
                    setErrorMessage('');
                    setEmail('');
                  }}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-700 text-rose-900 dark:text-rose-200 font-semibold text-xs"
                >
                  Use Different Email
                </button>
              </div>
            </div>
          )}

          {/* Generic Error Banner (if not sessionConflict or duplicateEmailError) */}
          {!sessionConflict && !duplicateEmailError && errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {tab === 'signup' && (
              <>
                <div>
                  <label htmlFor="login-fullname" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Arjun Kumar"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-target-role" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Role
                  </label>
                  <select
                    id="login-target-role"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                    <option value="Data Engineer">Data Engineer</option>
                    <option value="Cloud Architect">Cloud Architect</option>
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                    <option value="DevOps & Platform Engineer">DevOps & Platform Engineer</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="login-email" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSessionConflict(false);
                    setDuplicateEmailError(false);
                    setErrorMessage('');
                  }}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setEmail('arjun.kumar@vyntrixa.ai');
                  setPassword('Vyntrixa2026!');
                  setSessionConflict(false);
                  setDuplicateEmailError(false);
                  setErrorMessage('');
                }}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Autofill demo credentials
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{tab === 'signin' ? 'Sign In & View Roadmap' : 'Create Account & Begin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Features Strip */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-1" />
              <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">8 AI Agents</span>
            </div>
            <div className="flex flex-col items-center">
              <Radar className="w-4 h-4 text-violet-600 dark:text-violet-400 mb-1" />
              <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Skill Gap Radar</span>
            </div>
            <div className="flex flex-col items-center">
              <Map className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mb-1" />
              <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Adaptive Path</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 transition-all shadow-md"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
