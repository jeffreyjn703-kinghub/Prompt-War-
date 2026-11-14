import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Bot,
  ChevronDown,
  Briefcase,
  Check,
  Sparkles,
  Command,
  X,
  AlertTriangle,
  ArrowRight,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/client';
import { RoleTaxonomyItem } from '../types';
import { VyntrixaLogo } from './VyntrixaLogo';

interface TopBarProps {
  onOpenMentor: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMentor }) => {
  const navigate = useNavigate();
  const { profile, refreshProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [roles, setRoles] = useState<RoleTaxonomyItem[]>([]);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await api.getRoles();
        setRoles(data);
      } catch (err) {
        console.warn('Failed to load roles', err);
      }
    };
    fetchRoles();

    // Close dropdowns on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentRole = profile?.target_role || 'Full Stack Developer';
  const readiness = profile?.readiness_pct ?? 32.0;

  const handleSwitchRole = async (roleTitle: string) => {
    setRoleDropdownOpen(false);
    if (roleTitle === currentRole) return;
    try {
      await api.selectRole(roleTitle);
      await refreshProfile();
      navigate('/roadmap');
    } catch (err) {
      console.warn('Failed to switch role', err);
    }
  };

  const notifications = [
    {
      id: '1',
      title: 'Adaptive Re-Plan Active',
      desc: 'Remedial JavaScript phase inserted following your assessment diagnostic.',
      time: '10m ago',
      unread: true,
      type: 'warning',
    },
    {
      id: '2',
      title: 'AI Mentor Insight',
      desc: 'Weekly hours calibrated to 10h/week. Next milestone ready.',
      time: '1h ago',
      unread: true,
      type: 'info',
    },
    {
      id: '3',
      title: 'Strengths Calibrated',
      desc: 'Python 4/5 and SQL 3/5 mapped into core competencies graph.',
      time: '2h ago',
      unread: false,
      type: 'success',
    },
  ];

  return (
    <>
      <header className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors">
        {/* Search Input Button */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Mobile Logo on top bar */}
          <div className="flex items-center gap-2 md:hidden shrink-0">
            <VyntrixaLogo showWordmark={false} size="sm" />
          </div>

          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search skills, roadmaps, roles...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-mono">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Role Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 text-xs font-medium text-slate-800 dark:text-slate-200 transition-all shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline font-semibold">{currentRole}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                {readiness.toFixed(0)}%
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Switch Career Goal
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Triggers GOAL_CHANGED adaptive re-plan
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                  {roles.map((r) => {
                    const isSelected = r.title === currentRole;
                    return (
                      <button
                        key={r.role_id}
                        onClick={() => handleSwitchRole(r.title)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span>{r.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {r.department}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Agent Signals & Alerts
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer">
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        n.unread ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {n.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* AI Mentor Drawer Trigger Button */}
          <button
            onClick={onOpenMentor}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vyntrixa Mentor</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          </button>

          {/* User Profile Avatar & Dropdown Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              title="My Account & Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {(profile?.full_name || 'Arjun Kumar').charAt(0)}
              </div>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header with user info */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                    {profile?.full_name || 'Arjun Kumar'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    {profile?.email || 'arjun.kumar@vyntrixa.ai'}
                  </span>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-semibold">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 truncate">
                      {profile?.target_role || 'Full Stack Developer'}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {Math.round(profile?.readiness_pct ?? 32)}% Ready
                    </span>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile & Skills</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/roadmap');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>Learning Roadmap</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings & Preferences</span>
                  </button>
                </div>

                {/* Logout row */}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Quick Search ⌘K Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to skill, roadmap phase, or role..."
                autoFocus
                className="flex-1 bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-1 text-xs">
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Quick Navigation
              </div>
              {[
                { title: 'Interactive Learning Roadmap', path: '/roadmap' },
                { title: 'JavaScript & React Skill Analysis', path: '/analysis' },
                { title: 'Verify JavaScript (ES6+) Assessment', path: '/assessments?skill=javascript' },
                { title: 'Full Stack Developer Career Match', path: '/match' },
                { title: 'Agent Activity & Hand-off Topology', path: '/trace' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchModalOpen(false);
                    navigate(item.path);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span>{item.title}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
