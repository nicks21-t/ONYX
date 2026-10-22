import React from 'react';
import { ActivityTimelineCard } from '../dashboard/ActivityTimelineCard';
import { SleepCurveCard } from '../dashboard/SleepCurveCard';
import { HeartBarCard } from '../dashboard/HeartBarCard';
import { WellnessScoreCard } from '../dashboard/WellnessScoreCard';
import { FocusActivityCard } from '../dashboard/FocusActivityCard';
import { EnergyGaugeCard } from '../dashboard/EnergyGaugeCard';
import { useApp } from '../../context/AppContext';
import { CalendarClock, Plus, Wallet } from 'lucide-react';

export const OverviewSection: React.FC = () => {
  const { shifts, selectedShiftId, setSelectedShiftId, toggleClockIn, openQuickModal, setActiveSection } = useApp();
  const currentSelectedShift = shifts.find(s => s.id === selectedShiftId) || shifts[2] || shifts[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Exact Grid from Reference Image: 3 top cards + 2 bottom cards on left, 1 tall gauge card on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Top Row: Activity, Sleep, Heart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ActivityTimelineCard />
            <SleepCurveCard />
            <HeartBarCard />
          </div>

          {/* Bottom Row: Wellness Score & Focus Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <WellnessScoreCard />
            <FocusActivityCard />
          </div>
        </div>

        {/* Right 4 Columns: Tall Energy & Recovery Gauge Card with 7 micro-buttons */}
        <div className="lg:col-span-4 flex flex-col">
          <EnergyGaugeCard />
        </div>
      </div>

      {/* Roster & Quick Action Bar linked to user's shifts and tasks */}
      <section className="rounded-[26px] border border-white/10 bg-[#141318]/70 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#ff6b35] to-[#ff5e1e] text-white shadow-md">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Roster Settimanale di Turno
              </h3>
              <p className="text-[11px] text-zinc-400">
                Seleziona il giorno per registrare la presenza o pianificare il servizio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openQuickModal('turno')}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#ff5e1e]" />
              <span>+ Turno</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('lavoro')}
              className="rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              Tutti i turni →
            </button>
          </div>
        </div>

        {/* 7 Days Pills or Empty State */}
        {shifts.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-6 bg-white/[0.02]">
            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-2.5">
              <CalendarClock className="h-5 w-5 text-[#ff5e1e]" />
            </div>
            <h4 className="text-sm font-bold text-white">Nessun turno programmato</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              La tua pianificazione è vuota. Inizia aggiungendo il tuo primo turno di servizio.
            </p>
            <button
              type="button"
              onClick={() => openQuickModal('turno')}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#ff5e1e] hover:bg-[#ff7844] px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-[#ff5e1e]/30 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Aggiungi primo turno</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {shifts.slice(0, 7).map((shift) => {
              const isSelected = shift.id === selectedShiftId;
              const isToday = shift.date === '2026-10-21';

              return (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => setSelectedShiftId(shift.id)}
                  className={`relative flex flex-col items-center rounded-2xl p-3 transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'border border-[#ff5e1e] bg-[#ff5e1e]/15 ring-2 ring-[#ff5e1e]/40 shadow-lg'
                      : 'border border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  {isToday && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5e1e] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff5e1e]" />
                    </span>
                  )}

                  <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                    {shift.dayLabel}
                  </span>
                  <span className="mt-0.5 text-xl font-bold font-mono text-white tabular-nums">
                    {shift.dayNumber}
                  </span>
                  <span className="mt-2 w-full rounded-full bg-white/[0.06] border border-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-300 truncate">
                    {shift.type}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quick clock in status */}
        {currentSelectedShift && (
          <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <span className="text-zinc-300">
              <strong className="text-white">{currentSelectedShift.title}</strong> · {currentSelectedShift.startTime} - {currentSelectedShift.endTime} ({currentSelectedShift.location})
            </span>
            <button
              type="button"
              onClick={() => toggleClockIn(currentSelectedShift.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto ${
                currentSelectedShift.isClockedIn
                  ? 'bg-[#a3e635]/20 border border-[#a3e635]/40 text-[#a3e635]'
                  : 'bg-[#ff5e1e] hover:bg-[#ff7844] text-white shadow-md shadow-[#ff5e1e]/30'
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
