import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  label = 'Loading municipal data...',
  className = '',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 ${className}`}>
      <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
        {/* Outer Glowing Gradient Spinning Ring */}
        <svg
          className="animate-spin w-full h-full text-emerald-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-20 stroke-current text-slate-700"
            cx="12"
            cy="12"
            r="10"
            strokeWidth="3"
          />
          <path
            className="opacity-90 fill-current text-emerald-400"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>

        {/* Inner Counter-Rotating Sub-Ring */}
        <svg
          className="animate-[spin_1.5s_linear_infinite_reverse] absolute inset-1 w-3/4 h-3/4 text-indigo-400 opacity-75"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
            strokeDasharray="16 8"
            d="M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>

        {/* Pulsing Core Dot */}
        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping absolute" />
      </div>

      {label && (
        <span className="text-xs font-semibold text-slate-300 tracking-wide animate-pulse">
          {label}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}
