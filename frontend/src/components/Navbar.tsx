import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Radar,
  Briefcase,
  Map,
  CheckCircle2,
  TrendingUp,
  Activity,
  Users,
  Sun,
  Moon,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { VyntrixaLogo } from './VyntrixaLogo';

interface NavbarProps {
  onOpenMentor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMentor }) => {
  const location = useLocation();
  const { profile, loginDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Compass },
    { name: 'Analysis', path: '/analysis', icon: Radar },
    { name: 'Career Match', path: '/match', icon: Briefcase },
    { name: 'Roadmap', path: '/roadmap', icon: Map },
    { name: 'Assessments', path: '/assessments', icon: CheckCircle2 },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Agent Trace', path: '/trace', icon: Activity },
    { name: 'Cohort', path: '/cohort', icon: Users },
  ];

  const readiness = profile?.readiness_pct ?? 38.0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <VyntrixaLogo size="md" />
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Agentic
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Target Role & Readiness pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/60 border border-border/60 text-xs">
            <span className="text-muted-foreground truncate max-w-[120px] font-medium">
              {profile?.target_role || 'Full Stack'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-emerald-400">{readiness.toFixed(0)}% ready</span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/50 text-xs">
            <button
              onClick={() => loginDemo('demo')}
              title="Demo Learner: Sarah Chen"
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                profile?.full_name?.includes('Sarah')
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sarah (Demo)
            </button>
            <button
              onClick={() => loginDemo('alex')}
              title="Adaptive Scenario Demo: Alex Rivera (Poor Assessment -> Remedial)"
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                profile?.full_name?.includes('Alex')
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Alex (Adaptive)
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* AI Mentor Drawer Trigger */}
          <button
            onClick={onOpenMentor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all hover:scale-102"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Mentor</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
