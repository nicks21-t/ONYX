import React from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HeartBarCard: React.FC = () => {
  const { setActiveSection, remainingBudget } = useApp();

  const daysData = [
    { label: 'M', height: 45, filled: false },
    { label: 'T', height: 70, filled: true },
    { label: 'W', height: 85, filled: true },
    { label: 'T', height: 95, filled: true },
    { label: 'F', height: 80, filled: true },
    { label: 'S', height: 60, filled: false },
    { label: 'S', height: 40, filled: false },
  ];

  return (
    <div
      onClick={() => setActiveSection('finanze')}
      className="group cursor-pointer rounded-[26px] border border-white/10 bg-[#141318]/80 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl transition-all hover:border-white/20 hover:bg-[#18171f]/85 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500/30 to-amber-500/20 border border-white/10 text-white shadow-md">
            <Heart className="h-5 w-5 text-rose-400 fill-rose-500/40" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Heart</h3>
          </div>
        </div>
        <span className="text-[11px] font-medium text-zinc-400">Last 7 days</span>
      </div>

      {/* Vertical Rounded Bar Matrix */}
      <div className="my-5">
        <div className="flex items-center justify-between gap-2 h-24 px-2">
          {daysData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-center h-full">
              {/* Outer slot */}
              <div className="relative w-full max-w-[28px] h-20 rounded-md bg-white/[0.04] border border-white/5 flex items-center justify-center p-0.5 overflow-hidden">
                {/* Inner pill bar */}
                <div
                  style={{ height: `${d.height}%` }}
                  className={`w-full rounded-sm transition-all duration-300 ${
                    d.filled
                      ? 'bg-gradient-to-b from-[#f59e0b] to-[#ff5e1e] shadow-md shadow-[#ff5e1e]/30'
                      : 'bg-white/10'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Days of Week Axis */}
        <div className="flex justify-between px-3 text-[10px] text-zinc-500 font-mono pt-2">
          {daysData.map((d, i) => (
            <span key={i} className="w-6 text-center">{d.label}</span>
          ))}
        </div>
      </div>

      {/* Footer Metric */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            63
          </span>
          <span className="text-sm font-bold text-zinc-400 font-mono">BPM</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          <span>Avg Resting Heart Rate · Budget: €{remainingBudget.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};
