import React, { useState } from 'react';
import { CalendarClock, Clock, BarChart3, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShiftType } from '../../types';
import { useItalianLiveClock } from '../../lib/italianTime';

export const ShiftsTimelineCard: React.FC = () => {
  const { shifts, selectedShiftId, setSelectedShiftId, toggleClockIn } = useApp();
  const [viewMode, setViewMode] = useState<'timeline' | 'distribution'>('timeline');
  const [hoveredShiftId, setHoveredShiftId] = useState<string | null>(null);
  const italianTime = useItalianLiveClock();

  // Group shifts by type for distribution
  const typeCounts: Record<ShiftType, number> = {
    mattina: 0,
    pomeriggio: 0,
    notte: 0,
    riposo: 0,
    reperibilita: 0,
  };

  let totalHours = 0;
  shifts.forEach((s) => {
    if (typeCounts[s.type] !== undefined) {
      typeCounts[s.type] += 1;
    }
    totalHours += s.hours || 0;
  });

  const displayedTimelineShifts = React.useMemo(() => {
    if (shifts.length <= 7) return shifts;
    const todayIdx = shifts.findIndex((s) => s.date === italianTime.dateStr);
    if (todayIdx !== -1) {
      const startIndex = Math.max(0, Math.min(shifts.length - 7, todayIdx - 2));
      return shifts.slice(startIndex, startIndex + 7);
    }
    return shifts.slice(0, 7);
  }, [shifts, italianTime.dateStr]);

  const activeShift =
    shifts.find((s) => s.id === (hoveredShiftId || selectedShiftId)) ||
    shifts.find((s) => s.date === italianTime.dateStr) ||
    shifts[0];

  const getShiftBadgeColor = (type: ShiftType) => {
    switch (type) {
      case 'mattina':
        return 'bg-slate-500/15 text-[#E2E8F0] border-slate-500/30';
      case 'pomeriggio':
        return 'bg-[#6366F1]/15 text-[#A5B4FC] border-[#6366F1]/30';
      case 'notte':
        return 'bg-indigo-500/20 text-[#C7D2FE] border-indigo-500/30';
      case 'riposo':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'reperibilita':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
      default:
        return 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30';
    }
  };

  const getShiftBarColor = (type: ShiftType) => {
    switch (type) {
      case 'mattina':
        return 'from-[#334155] to-[#64748B]';
      case 'pomeriggio':
        return 'from-[#4F46E5] to-[#6366F1]';
      case 'notte':
        return 'from-[#312E81] to-[#4338CA]';
      case 'riposo':
        return 'from-emerald-700/60 to-emerald-500/80';
      case 'reperibilita':
        return 'from-violet-800 to-violet-500';
      default:
        return 'from-slate-700 to-slate-500';
    }
  };

  return (
    <div className="card-onyx rounded-[26px] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#818CF8]">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">Turni & Carico</h3>
              <p className="text-xs text-[#94A3B8]">Pianificazione e monte ore</p>
            </div>
          </div>

          {/* View mode toggle pills */}
          <div className="flex items-center gap-1 rounded-full bg-white/[0.03] p-1 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Giorni</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('distribution')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'distribution'
                  ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Tipi</span>
            </button>
          </div>
        </div>

        {/* Header Stats */}
        <div className="flex items-center justify-between pb-2 text-xs">
          <span className="text-[#94A3B8]">Monte ore programmato</span>
          <span className="text-lg font-bold font-mono text-[#F8FAFC] tabular-nums">
            {totalHours}h <span className="text-xs text-[#94A3B8] font-normal">/ 38h</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Chart Area */}
      <div className="my-3 space-y-3">
        {shifts.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#94A3B8] border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            Nessun turno registrato in archivio.
          </div>
        ) : viewMode === 'timeline' ? (
          <div>
            {/* 7 Days Timeline Bars */}
            <div className="grid grid-cols-7 gap-2 h-24 items-end px-1 pt-2">
              {displayedTimelineShifts.map((shift) => {
                const isSelected = (hoveredShiftId || selectedShiftId || activeShift?.id) === shift.id;
                const isToday = shift.date === italianTime.dateStr;
                const heightPercent = shift.type === 'riposo' ? 22 : Math.min(100, (shift.hours / 9) * 100);

                return (
                  <div
                    key={shift.id}
                    onMouseEnter={() => setHoveredShiftId(shift.id)}
                    onMouseLeave={() => setHoveredShiftId(null)}
                    onClick={() => setSelectedShiftId(shift.id)}
                    className="flex flex-col items-center justify-end h-full group/bar cursor-pointer relative"
                  >
                    {isToday && (
                      <span className="absolute -top-3 h-1.5 w-1.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
                    )}
                    <div className="relative w-full flex items-end justify-center">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[22px] min-h-[14px] rounded-t-sm transition-all duration-200 bg-gradient-to-t ${getShiftBarColor(
                          shift.type
                        )} ${
                          isSelected
                            ? 'ring-2 ring-[#E2E8F0] scale-105 shadow-lg shadow-[#6366F1]/20 brightness-110'
                            : 'opacity-75 group-hover/bar:opacity-100'
                        } ${isToday ? 'ring-1 ring-[#6366F1]' : ''}`}
                      />
                    </div>
                    {/* Day label */}
                    <span
                      className={`text-[11px] font-mono mt-1.5 transition-colors ${
                        isToday
                          ? 'text-[#6366F1] font-bold'
                          : isSelected
                          ? 'text-[#F8FAFC] font-bold'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {shift.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* In-place interactive detail pill in frosted glass */}
            {activeShift && (
              <div className="glass-popover mt-3 p-3 rounded-2xl flex items-center justify-between text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${getShiftBadgeColor(activeShift.type)}`}>
                    {activeShift.type}
                  </span>
                  <div className="truncate">
                    <span className="text-[#F1F5F9] font-medium truncate block">{activeShift.title}</span>
                    <span className="text-[11px] text-[#94A3B8]">
                      {activeShift.startTime} - {activeShift.endTime} · {activeShift.hours}h
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleClockIn(activeShift.id);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    activeShift.isClockedIn
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-[#F8FAFC] border border-white/[0.1]'
                  }`}
                >
                  {activeShift.isClockedIn ? 'Timbrato ✓' : 'Timbra'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Distribution View */
          <div className="space-y-2.5 py-1">
            {(['mattina', 'pomeriggio', 'notte', 'riposo', 'reperibilita'] as ShiftType[]).map((type) => {
              const count = typeCounts[type] || 0;
              const pct = shifts.length > 0 ? Math.round((count / shifts.length) * 100) : 0;

              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="capitalize text-[#E2E8F0] font-medium flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full border ${getShiftBadgeColor(type)}`} />
                      {type}
                    </span>
                    <span className="font-mono text-[#94A3B8] tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${getShiftBarColor(type)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-[#94A3B8]">
          Settimana in corso: <strong className="text-[#F1F5F9] font-mono font-semibold tabular-nums">{shifts.length} giorni</strong>
        </span>
        <span className="text-xs font-semibold text-[#818CF8]">
          {shifts.filter(s => s.isClockedIn).length} presenze validate
        </span>
      </div>
    </div>
  );
};
