import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radar,
  Map,
  CheckCircle2,
  TrendingUp,
  Bot,
} from 'lucide-react';

interface MobileNavProps {
  onOpenMentor: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenMentor }) => {
  const tabs = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analysis', path: '/analysis', icon: Radar },
    { name: 'Roadmap', path: '/roadmap', icon: Map },
    { name: 'Assess', path: '/assessments', icon: CheckCircle2 },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
  ];

  return (
    <>
      {/* Floating Action Button for Mentor on Mobile */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <button
          onClick={onOpenMentor}
          className="w-13 h-13 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative"
        >
          <Bot className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 animate-pulse" />
        </button>
      </div>

      {/* Bottom Sticky Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-30 md:hidden shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
