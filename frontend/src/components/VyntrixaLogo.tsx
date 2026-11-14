import React from 'react';

interface VyntrixaLogoProps {
  showWordmark?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  mono?: boolean;
  animated?: boolean;
}

export const VyntrixaLogo: React.FC<VyntrixaLogoProps> = ({
  showWordmark = true,
  size = 'md',
  className = '',
  mono = false,
  animated = false,
}) => {
  const sizeMap = {
    xs: { mark: 20, text: 'text-sm' },
    sm: { mark: 26, text: 'text-base' },
    md: { mark: 34, text: 'text-xl' },
    lg: { mark: 44, text: 'text-2xl' },
    xl: { mark: 64, text: 'text-4xl' },
  };

  const { mark: markSize, text: textSize } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Logo Mark */}
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="vyntrixa-brand-grad" x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <filter id="vyntrixa-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4F46E5" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Left Ascending Path Arm */}
        <path
          d="M 22 24 L 50 82"
          stroke={mono ? 'currentColor' : 'url(#vyntrixa-brand-grad)'}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'animate-[dash_1.4s_ease-in-out_forwards]' : ''}
        />

        {/* Right Ascending Path Arm */}
        <path
          d="M 50 82 L 78 24"
          stroke={mono ? 'currentColor' : 'url(#vyntrixa-brand-grad)'}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'animate-[dash_1.4s_ease-in-out_forwards]' : ''}
        />

        {/* Apex Intelligence Node */}
        <circle
          cx="50"
          cy="82"
          r="7"
          fill={mono ? 'currentColor' : '#FFFFFF'}
          filter={mono ? undefined : 'url(#vyntrixa-glow)'}
        />
        <circle
          cx="50"
          cy="82"
          r="3.5"
          fill={mono ? '#0F172A' : '#4F46E5'}
        />

        {/* Path Target Terminal Nodes */}
        <circle
          cx="78"
          cy="24"
          r="5"
          fill={mono ? 'currentColor' : '#7C3AED'}
        />
        <circle
          cx="22"
          cy="24"
          r="5"
          fill={mono ? 'currentColor' : '#4F46E5'}
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={`font-extrabold tracking-[0.08em] font-sans ${textSize} ${
            mono ? 'text-current' : 'text-slate-900 dark:text-white'
          }`}
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
        >
          VYNTRIXA
        </span>
      )}
    </div>
  );
};
