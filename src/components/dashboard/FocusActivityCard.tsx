import React from 'react';
import { BarChart2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FocusActivityCard: React.FC = () => {
  const { setActiveSection } = useApp();

  // Generate 54 vertical bars simulating an audio spectrogram with center peak
  const totalBars = 54;
  const bars = Array.from({ length: totalBars }, (_, i) => {
    const distanceFromCenter = Math.abs(i - totalBars / 2);
    // Gaussian-like peak in the center
    const height = Math.max(
      12,
      Math.min(95, Math.round(90 * Math.exp(-Math.pow(distanceFromCenter / 10, 2)) + Math.random() * 8))
    );
    const isCenterHighlight = distanceFromCenter <= 4;
    return { id: i, height, isCenterHighlight };
  });

  return (
    <div
      onClick={() => setActiveSection('lavoro')}
      className="group cursor-pointer rounded-[26px] border border-white/10 bg-[#141318]/80 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl transition-all hover:border-white/20 hover:bg-[#18171f]/85 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Header with Title and Big Orange Score */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-300">Focus Activity</h3>
        </div>

        <div className="text-right">
          <div className="text-3xl font-extrabold text-[#ff5e1e] font-mono tracking-tight leading-none">
            73
          </div>
          <div className="text-xs font-bold text-white mt-1">Focus Score</div>
          <div className="text-[11px] text-zinc-400">Deep Work 14.5h</div>
        </div>
      </div>

      {/* Audio Spectrogram Frequency Waveform */}
      <div className="my-6 flex items-center justify-between gap-[3px] h-24 px-1">
        {bars.map(bar => (
          <div
            key={bar.id}
            className="flex-1 flex items-center justify-center h-full"
          >
            <div
              style={{ height: `${bar.height}%` }}
              className={`w-full max-w-[2.5px] rounded-full transition-all duration-300 ${
                bar.isCenterHighlight
                  ? 'bg-[#ff5e1e] shadow-[0_0_8px_rgba(255,94,30,0.8)]'
                  : 'bg-white/20'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Footer Details with Center Insights Button */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-zinc-400">
        <div>
          <div className="text-[10px] uppercase font-semibold text-zinc-500">Avg Focus Session</div>
          <div className="font-mono font-bold text-white text-xs mt-0.5">42 min</div>
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
          <div className="text-[10px] uppercase font-semibold text-zinc-500">Deep Work</div>
          <div className="font-mono font-bold text-white text-xs mt-0.5">14.5h</div>
        </div>
      </div>
    </div>
  );
};
