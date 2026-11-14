import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Radar,
  Briefcase,
  Map,
  CheckCircle2,
  TrendingUp,
  Bot,
  Activity,
  Users,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VyntrixaLogo } from './VyntrixaLogo';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { profile, loginDemo, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Skill Analysis', path: '/analysis', icon: Radar },
    { name: 'Career Match', path: '/match', icon: Briefcase },
    { name: 'Roadmap', path: '/roadmap', icon: Map },
    { name: 'Assessments', path: '/assessments', icon: CheckCircle2 },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'AI Mentor', path: '/mentor', icon: Bot, badge: 'Live' },
    { name: 'Agent Activity', path: '/trace', icon: Activity },
    { name: 'Cohort View', path: '/cohort', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const learnerName = profile?.full_name || 'Arjun Kumar';
  const roleName = profile?.target_role || 'Full Stack Developer';

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out shrink-0 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
          <VyntrixaLogo showWordmark={!collapsed} size="sm" />
          {!collapsed && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 ml-1">
              v2.5
            </span>
          )}
        </NavLink>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Demo Switcher Quick Pill */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1 text-[11px]">
            <button
              onClick={() => loginDemo('demo')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all text-center truncate ${
                learnerName.includes('Arjun')
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Arjun (Demo)
            </button>
            <button
              onClick={() => loginDemo('alex')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all text-center truncate flex items-center justify-center gap-1 ${
                learnerName.includes('Alex')
                  ? 'bg-amber-500 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Alex Rivera: Adaptive Remedial Assessment Demo"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Alex</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Block at bottom */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
        <NavLink
          to="/profile"
          className="p-1.5 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group flex-1 min-w-0"
          title="View & Edit Profile"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {learnerName.charAt(0)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {learnerName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                {roleName}
              </span>
            </div>
          )}
        </NavLink>

        {!collapsed && (
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
