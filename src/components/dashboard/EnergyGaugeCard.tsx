import React, { useState } from 'react';
import {
  Heart,
  Bed,
  Footprints,
  Zap,
  Activity,
  Brain,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EnergyGaugeCard: React.FC = () => {
  const { setActiveSection } = useApp();
  const [activeMicroTab, setActiveMicroTab] = useState<number>(0);

  const microButtons = [
    { id: 0, icon: Heart, label: 'Cardio' },
    { id: 1, icon: Bed, label: 'Riposo' },
    { id: 2, icon: Footprints, label: 'Passi' },
    { id: 3, icon: Zap, label: 'Energia' },
    { id: 4, icon: Activity, label: 'Attività' },
    { id: 5, icon: Brain, label: 'Focus' },
    { id: 6, icon: ShieldCheck, label: 'Immunità' },
  ];

  // Generate 48 tick marks for the semi-circular tachometer
  const totalTicks = 48;
  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    // Semi-circle angle from -180 deg to 0 deg (or 180 deg to 360 deg)
    const angle = 180 + (i / (totalTicks - 1)) * 180;
    const isLit = i <= totalTicks * 0.5; // 50%
    return { id: i, angle, isLit };
  });

  return (
    <div
      onClick={() => setActiveSection('routine')}
      className="group cursor-pointer rounded-[26px] border border-white/10 bg-[#141318]/70 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl transition-all hover:border-white/20 hover:bg-[#18171f]/80 flex flex-col justify-between h-full relative overflow-hidden"
    >
      {/* 1. Top row of 7 circular micro-buttons (frosted glass pills) */}
      <div className="flex items-center justify-between gap-1.5 pb-4 border-b border-white/5">
        {microButtons.map(btn => {
          const Icon = btn.icon;
          const isActive = activeMicroTab === btn.id;

          return (
            <button
              key={btn.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMicroTab(btn.id);
              }}
              title={btn.label}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white text-black shadow-lg shadow-white/25 scale-105 ring-1 ring-white'
                  : 'bg-white/[0.06] hover:bg-white/15 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5 stroke-[2]" />
            </button>
          );
        })}
      </div>

      {/* 2. Center Speedometer Gauge (0 - 100%) */}
      <div className="my-auto py-6 flex flex-col items-center justify-center relative">
        {/* Speed needle label at top */}
        <div className="flex flex-col items-center mb-1">
          <span className="text-[11px] font-medium text-zinc-400 tracking-wider">Speed</span>
          <div className="w-0.5 h-3 bg-white rounded-full mt-0.5" />
        </div>

        {/* Semi-circular Tachometer Arc */}
        <div className="relative w-64 h-36 flex items-end justify-center overflow-hidden">
          <svg viewBox="0 0 240 130" className="w-full h-full overflow-visible">
            {/* Tick marks around the perimeter */}
            {ticks.map(tick => {
              const rad = (tick.angle * Math.PI) / 180;
              const r1 = 98; // outer radius
              const r2 = tick.id % 4 === 0 ? 84 : 89; // inner radius
              const cx = 120;
              const cy = 120;
              const x1 = cx + r1 * Math.cos(rad);
              const y1 = cy + r1 * Math.sin(rad);
              const x2 = cx + r2 * Math.cos(rad);
              const y2 = cy + r2 * Math.sin(rad);

              return (
                <line
                  key={tick.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={tick.isLit ? '#ffffff' : 'rgba(255, 255, 255, 0.2)'}
                  strokeWidth={tick.id % 4 === 0 ? 2 : 1.25}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Needle pointing upwards to 50% */}
            <line
              x1="120"
              y1="120"
              x2="120"
              y2="45"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="120" cy="120" r="5" fill="#ffffff" />
          </svg>

          {/* Central 50% Text */}
          <div className="absolute top-10 flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              50%
            </span>
          </div>
        </div>

        {/* Sinusoidal Wave Lines below the 50% */}
        <div className="w-full h-12 -mt-2 relative flex items-center justify-center">
          <svg viewBox="0 0 240 50" className="w-full h-full" preserveAspectRatio="none">
            {/* Orange curve */}
            <path
              d="M 10 25 C 50 40, 90 10, 130 25 C 170 40, 200 10, 230 25"
              fill="none"
              stroke="#ff5e1e"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            {/* Green curve */}
            <path
              d="M 10 25 C 40 10, 80 40, 120 25 C 160 10, 190 35, 230 25"
              fill="none"
              stroke="#a3e635"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            {/* White subtle curve */}
            <path
              d="M 10 20 C 60 35, 110 15, 160 30 C 190 20, 210 30, 230 20"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 3. Bottom Titles */}
      <div className="pt-4 border-t border-white/5 text-center sm:text-left">
        <h4 className="text-base font-bold text-white tracking-tight">
          Balanced Energy & Recovery State
        </h4>
        <p className="text-xs text-zinc-400 mt-0.5">
          Overall Health Stability Index
        </p>
      </div>
    </div>
  );
};
