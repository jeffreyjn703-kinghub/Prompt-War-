import React from 'react';

export const VyntrixaSplash: React.FC<{ message?: string }> = ({
  message = 'Initializing adaptive learning intelligence...',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <style>{`
        @keyframes drawVPath {
          0% {
            stroke-dashoffset: 120;
            opacity: 0.2;
          }
          50% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes fadeInWordmark {
          0%, 35% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
        .animate-draw-v {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: drawVPath 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards infinite;
        }
        .animate-fade-wordmark {
          animation: fadeInWordmark 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-pulse-node {
          animation: pulseGlow 1.8s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col items-center select-none">
        {/* Animated Logo Mark */}
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-xl animate-pulse" />
          <svg
            width="88"
            height="88"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative"
          >
            <defs>
              <linearGradient id="splash-grad" x1="15%" y1="15%" x2="85%" y2="85%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>

            {/* Left Arm Path */}
            <path
              d="M 22 24 L 50 82"
              stroke="url(#splash-grad)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw-v"
            />

            {/* Right Arm Path */}
            <path
              d="M 50 82 L 78 24"
              stroke="url(#splash-grad)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw-v"
              style={{ animationDelay: '0.15s' }}
            />

            {/* Center Apex Node */}
            <circle
              cx="50"
              cy="82"
              r="6"
              fill="#FFFFFF"
              className="animate-pulse-node"
            />
            <circle cx="50" cy="82" r="3" fill="#4F46E5" />

            {/* Apex Endpoints */}
            <circle cx="78" cy="24" r="4.5" fill="#7C3AED" />
            <circle cx="22" cy="24" r="4.5" fill="#4F46E5" />
          </svg>
        </div>

        {/* Wordmark & Tagline with delay fade-in */}
        <div className="animate-fade-wordmark text-center">
          <span
            className="text-2xl font-extrabold tracking-[0.1em] text-slate-900 dark:text-white block font-sans"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
          >
            VYNTRIXA
          </span>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-400 block mt-1">
            Adaptive Learning Intelligence
          </span>
        </div>

        {/* Loading status message */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};
