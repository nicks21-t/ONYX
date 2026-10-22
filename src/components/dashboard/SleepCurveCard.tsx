import React from 'react';
import { Bed, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SleepCurveCard: React.FC = () => {
  const { setActiveSection, habits } = useApp();
  const completedHabits = habits.filter(h => h.completed).length;

  return (
    <div
      onClick={() => setActiveSection('routine')}
      className="group cursor-pointer rounded-[26px] border border-white/10 bg-[#141318]/80 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl transition-all hover:border-white/20 hover:bg-[#18171f]/85 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] border border-white/10 text-white shadow-md">
            <Bed className="h-5 w-5 text-white stroke-[2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Sleep</h3>
          </div>
        </div>
        <span className="text-[11px] font-medium text-zinc-400">Last 7 days</span>
      </div>

      {/* Stepped Sigmoid Curve Chart */}
      <div className="my-4">
        <div className="relative h-28 w-full flex items-center">
          {/* Y Axis */}
          <div className="flex flex-col justify-between h-full text-[10px] text-zinc-500 font-mono pr-2">
            <span>4</span>
            <span>2</span>
            <span>0</span>
          </div>

          {/* SVG Sigmoid Curves */}
          <div className="relative flex-1 h-full">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-dashed border-white/20 w-full" />
              <div className="border-b border-dashed border-white/20 w-full" />
              <div className="border-b border-dashed border-white/20 w-full" />
            </div>

            <svg viewBox="0 0 280 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {/* Curve 1: Lime green line (#a3e635) */}
              <path
                d="M 10 90 C 40 90, 50 85, 70 85 C 90 85, 100 50, 130 50 C 160 50, 170 30, 200 30 L 270 30"
                fill="none"
                stroke="#a3e635"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Curve 2: Yellow/Amber line (#facc15) */}
              <path
                d="M 10 75 C 40 75, 50 70, 70 70 C 90 70, 100 35, 130 35 C 160 35, 170 15, 200 15 L 270 15"
                fill="none"
                stroke="#facc15"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-between pl-6 pr-2 text-[10px] text-zinc-500 font-mono pt-1">
          <span>08</span>
          <span>12</span>
          <span>18</span>
          <span>22</span>
        </div>
      </div>

      {/* Footer Metric */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            7<span className="text-xl font-normal text-zinc-400">h</span> 45<span className="text-xl font-normal text-zinc-400">m</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
          <span className="text-[#a3e635] font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {completedHabits > 0 ? `${completedHabits} completate` : '0 completate'}
          </span>
          <span>· {habits.length > 0 ? `${habits.length} routine registrate` : 'nessuna routine'}</span>
        </div>
      </div>
    </div>
  );
};
