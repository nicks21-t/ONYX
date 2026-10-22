import React from 'react';
import { BarChart2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WellnessScoreCard: React.FC = () => {
  const { setActiveSection } = useApp();

  return (
    <div
      onClick={() => setActiveSection('routine')}
      className="group cursor-pointer rounded-[26px] border border-white/10 bg-[#141318]/80 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl transition-all hover:border-white/20 hover:bg-[#18171f]/85 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Header with Title and Big Orange Score */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-300">Wellness Score</h3>
        </div>

        <div className="text-right">
          <div className="text-3xl font-extrabold text-[#ff5e1e] font-mono tracking-tight leading-none">
            87
          </div>
          <div className="text-xs font-bold text-white mt-1">Good Condition</div>
          <div className="text-[11px] text-zinc-400">+5 vs weekly average York</div>
        </div>
      </div>

      {/* Multi-wave Sinusoidal Overlapping Curves */}
      <div className="my-6 relative h-24 w-full flex items-center justify-center">
        <svg
          viewBox="0 0 400 100"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Subtle gray baseline wave */}
          <path
            d="M 0 50 C 50 20, 100 80, 150 50 C 200 20, 250 80, 300 50 C 350 20, 400 80, 450 50"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Lime Green Wave */}
          <path
            d="M 0 55 C 60 75, 120 30, 180 60 C 240 85, 300 35, 360 65 C 390 75, 420 40, 450 55"
            fill="none"
            stroke="#a3e635"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Amber Gold Wave */}
          <path
            d="M 0 45 C 50 30, 110 70, 170 45 C 230 20, 290 75, 350 45 C 380 30, 410 65, 450 45"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.75"
            strokeLinecap="round"
          />

          {/* Glowing Orange Coral Sine Wave */}
          <path
            d="M 0 60 C 45 85, 95 25, 145 60 C 195 95, 255 15, 310 60 C 360 95, 410 20, 450 60"
            fill="none"
            stroke="#ff5e1e"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_6px_rgba(255,94,30,0.5)]"
          />
        </svg>
      </div>

      {/* Footer Details with Center Insights Button */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-zinc-400">
        <div>
          <div className="text-[10px] uppercase font-semibold text-zinc-500">Sleep Avg</div>
          <div className="font-mono font-bold text-white text-xs mt-0.5">7.2h</div>
        </div>

        {/* Center Insights Capsule Button */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/10 px-3 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          <BarChart2 className="h-3 w-3 text-[#ff5e1e]" />
          <span>Insights</span>
        </button>

        <div className="text-right">
          <div className="text-[10px] uppercase font-semibold text-zinc-500">Recovery</div>
          <div className="font-mono font-bold text-white text-xs mt-0.5">82%</div>
        </div>
      </div>
    </div>
  );
};
