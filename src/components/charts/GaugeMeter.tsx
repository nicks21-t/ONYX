import React from 'react';

interface GaugeMeterProps {
  value: number; // 0 to 100
  label?: string;
  sublabel?: string;
  size?: number;
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  value,
  label = 'Completamento',
  sublabel = 'Target Giornaliero',
  size = 180,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = 70;
  const strokeWidth = 12;
  const cx = 90;
  const cy = 90;

  // Semicircle arc length = PI * r
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength - (arcLength * clampedValue) / 100;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg
        width={size}
        height={size * 0.65}
        viewBox="0 0 180 115"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff5e1e" />
            <stop offset="50%" stopColor="#ff7844" />
            <stop offset="100%" stopColor="#ff9a62" />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#ff5e1e" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Background Track Arc (Semicircle) */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Filled Progress Arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          filter="url(#gaugeGlow)"
          className="transition-all duration-1000 ease-out"
        />

        {/* Tick markers along the edge */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = Math.PI - (Math.PI * tick) / 100;
          const tickR1 = radius + 11;
          const tickR2 = radius + 16;
          const x1 = cx + tickR1 * Math.cos(angle);
          const y1 = cy - tickR1 * Math.sin(angle);
          const x2 = cx + tickR2 * Math.cos(angle);
          const y2 = cy - tickR2 * Math.sin(angle);
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Central Value */}
      <div className="absolute bottom-1 flex flex-col items-center">
        <span className="text-3xl font-extrabold font-mono tracking-tight text-white tabular-nums drop-shadow-md">
          {clampedValue}%
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#ff7844]">
          {label}
        </span>
      </div>

      {sublabel && (
        <span className="mt-1 text-[11px] text-zinc-400 text-center font-medium">
          {sublabel}
        </span>
      )}
    </div>
  );
};
