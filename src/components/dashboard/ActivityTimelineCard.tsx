import React from 'react';
import { Footprints, CalendarClock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ActivityTimelineCard: React.FC = () => {
  const { shifts, setActiveSection } = useApp();
  const todayShift = shifts.find(s => s.date === '2026-10-21') || shifts[0];
  const totalWeeklyHours = shifts.reduce((acc, s) => acc + s.hours, 0);

  return (
    <div
      onClick={() => setActiveSection('lavoro')}
      className="group cursor-pointer rounded-[26px] border border-white/10 bg-[#141318]/80 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl transition-all hover:border-white/20 hover:bg-[#18171f]/85 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] border border-white/10 text-white shadow-md">
            <Footprints className="h-5 w-5 text-white stroke-[2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Activity</h3>
          </div>
        </div>
        <span className="text-[11px] font-medium text-zinc-400">
          {shifts.length > 0 ? `${shifts.length} turni registrati` : 'Nessun turno'}
        </span>
      </div>

      {/* Timeline Matrix Bar */}
      <div className="my-5 space-y-3">
        {/* Row 1: Mattina */}
        <div className="flex items-center text-[11px]">
          <span className="w-20 text-zinc-400 font-medium">Mattina</span>
          <div className="flex-1 flex items-center gap-1.5 pl-2">
            <div className={`h-2.5 w-4 rounded-full ${shifts.some(s => s.type === 'mattina') ? 'bg-[#ff5e1e] shadow-xs shadow-[#ff5e1e]/60' : 'bg-white/10'}`} />
            <div className="h-2.5 w-6 rounded-full bg-transparent" />
            <div className={`h-2.5 w-6 rounded-full ${shifts.some(s => s.type === 'mattina') ? 'bg-[#ff5e1e] shadow-xs shadow-[#ff5e1e]/60' : 'bg-white/10'}`} />
          </div>
        </div>

        {/* Row 2: Pomeriggio */}
        <div className="flex items-center text-[11px]">
          <span className="w-20 text-zinc-400 font-medium">Pomeriggio</span>
          <div className="flex-1 flex items-center gap-1.5 pl-2">
            <div className={`h-2.5 w-6 rounded-full ${shifts.some(s => s.type === 'pomeriggio') ? 'bg-[#ff5e1e] shadow-xs shadow-[#ff5e1e]/60' : 'bg-white/10'}`} />
            <div className="h-2.5 w-4 rounded-full bg-transparent" />
            <div className={`h-2.5 w-5 rounded-full ${shifts.some(s => s.type === 'pomeriggio') ? 'bg-[#ff5e1e] shadow-xs shadow-[#ff5e1e]/60' : 'bg-white/10'}`} />
          </div>
        </div>

        {/* Row 3: Notte */}
        <div className="flex items-center text-[11px]">
          <span className="w-20 text-zinc-400 font-medium">Notte</span>
          <div className="flex-1 flex items-center gap-1.5 pl-2">
            <div className={`h-2.5 w-5 rounded-full ${shifts.some(s => s.type === 'notte') ? 'bg-[#ff5e1e] shadow-xs shadow-[#ff5e1e]/60' : 'bg-white/10'}`} />
            <div className="h-2.5 w-5 rounded-full bg-transparent" />
            <div className={`h-2.5 w-4 rounded-full ${shifts.some(s => s.type === 'notte') ? 'bg-[#ff5e1e] shadow-xs shadow-[#ff5e1e]/60' : 'bg-white/10'}`} />
          </div>
        </div>

        {/* Timeline Axis Labels */}
        <div className="flex items-center text-[10px] text-zinc-500 font-mono pt-1">
          <span className="w-20" />
          <div className="flex-1 flex justify-between px-2">
            <span>08</span>
            <span>12</span>
            <span>18</span>
            <span>22</span>
          </div>
        </div>
      </div>

      {/* Footer Metric */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            {totalWeeklyHours > 0 ? `${totalWeeklyHours}h` : '0h'}
          </span>
          <span className="text-xs text-zinc-400 font-sans">ore totali</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
          <Footprints className="h-3.5 w-3.5 text-zinc-400" />
          <span>
            {todayShift
              ? `Turno ${todayShift.type} (${todayShift.startTime}-${todayShift.endTime})`
              : 'Nessun turno inserito'}
          </span>
        </div>
      </div>
    </div>
  );
};
