import React from 'react';
import { ShiftsTimelineCard } from '../dashboard/ShiftsTimelineCard';
import { RemindersPriorityCard } from '../dashboard/RemindersPriorityCard';
import { FinanceFlowCard } from '../dashboard/FinanceFlowCard';
import { FinanceCategoriesCard } from '../dashboard/FinanceCategoriesCard';
import { RemindersDeadlinesCard } from '../dashboard/RemindersDeadlinesCard';
import { ShiftsWorkloadGaugeCard } from '../dashboard/ShiftsWorkloadGaugeCard';
import { useApp } from '../../context/AppContext';
import { CalendarClock, Plus } from 'lucide-react';
import { useItalianLiveClock } from '../../lib/italianTime';

export const OverviewSection: React.FC = () => {
  const { shifts, selectedShiftId, setSelectedShiftId, toggleClockIn, openQuickModal } = useApp();
  const italianTime = useItalianLiveClock();

  // Find shift for current Italian date or selected shift
  const currentSelectedShift =
    shifts.find(s => s.id === selectedShiftId) ||
    shifts.find(s => s.date === italianTime.dateStr) ||
    shifts[0];

  // Dynamically show the 7 days of the active week around Italian today
  const displayedWeeklyShifts = React.useMemo(() => {
    if (shifts.length <= 7) return shifts;
    const todayIdx = shifts.findIndex(s => s.date === italianTime.dateStr);
    if (todayIdx !== -1) {
      const startIndex = Math.max(0, Math.min(shifts.length - 7, todayIdx - 2));
      return shifts.slice(startIndex, startIndex + 7);
    }
    return shifts.slice(0, 7);
  }, [shifts, italianTime.dateStr]);

  return (
    <div className="space-y-6 pb-16">
      {/* ONYX Dashboard Grid: Finanze, Promemoria e Gestione Turni */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Top Row: Turni Timeline, Promemoria Priority, Finanze Cash Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ShiftsTimelineCard />
            <RemindersPriorityCard />
            <FinanceFlowCard />
          </div>

          {/* Bottom Row: Finanze Categories & Budget, Promemoria Scadenze Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FinanceCategoriesCard />
            <RemindersDeadlinesCard />
          </div>
        </div>

        {/* Right 4 Columns: Gestione Turni & Carico Operativo Tachometer */}
        <div className="lg:col-span-4 flex flex-col">
          <ShiftsWorkloadGaugeCard />
        </div>
      </div>

      {/* Roster & Quick Action Bar linked to user's shifts and tasks */}
      <section className="card-onyx rounded-[26px] p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#818CF8]">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">
                Roster Settimanale di Turno
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Seleziona il giorno per registrare la presenza o consultare i dettagli di servizio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openQuickModal('turno')}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#E2E8F0] hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 text-[#818CF8]" />
              <span>+ Nuovo Turno</span>
            </button>
          </div>
        </div>

        {/* 7 Days Grid or Empty State */}
        {shifts.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-6 bg-white/[0.02]">
            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] mb-2.5">
              <CalendarClock className="h-5 w-5 text-[#818CF8]" />
            </div>
            <h4 className="text-sm font-bold text-[#F1F5F9]">Nessun turno programmato</h4>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-sm">
              La tua pianificazione è vuota. Inizia aggiungendo il tuo primo turno di servizio.
            </p>
            <button
              type="button"
              onClick={() => openQuickModal('turno')}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-[#6366F1]/20 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Aggiungi primo turno</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {displayedWeeklyShifts.map((shift) => {
              const isSelected = shift.id === (selectedShiftId || currentSelectedShift?.id);
              const isToday = shift.date === italianTime.dateStr;

              return (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => setSelectedShiftId(shift.id)}
                  className={`relative flex flex-col items-center rounded-2xl p-3.5 transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'border border-[#6366F1]/60 bg-[#6366F1]/15 ring-2 ring-[#6366F1]/30 shadow-lg scale-102'
                      : 'border border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  {isToday && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366F1] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6366F1]" />
                    </span>
                  )}

                  <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                    {shift.dayLabel}
                  </span>
                  <span className="mt-0.5 text-2xl font-bold font-mono text-[#F8FAFC] tabular-nums">
                    {shift.dayNumber}
                  </span>
                  <span className="mt-2 w-full rounded-full bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#E2E8F0] truncate">
                    {shift.type}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quick clock in status */}
        {currentSelectedShift && (
          <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <span className="text-[#94A3B8]">
              <strong className="text-[#F1F5F9] font-semibold">{currentSelectedShift.title}</strong> · {currentSelectedShift.startTime} - {currentSelectedShift.endTime} ({currentSelectedShift.location})
            </span>
            <button
              type="button"
              onClick={() => toggleClockIn(currentSelectedShift.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto ${
                currentSelectedShift.isClockedIn
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 text-white shadow-md shadow-[#6366F1]/20'
              }`}
            >
              {currentSelectedShift.isClockedIn ? 'Presenza Registrata ✓' : 'Timbra Presenza'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
