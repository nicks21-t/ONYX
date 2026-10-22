import React, { useState } from 'react';
import {
  CalendarClock,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  ArrowRightLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShiftType } from '../../types';

export const ShiftsSection: React.FC = () => {
  const { shifts, toggleClockIn, addShift, showToast } = useApp();
  const [isAddingShift, setIsAddingShift] = useState(false);

  // New Shift form state
  const [newTitle, setNewTitle] = useState('Turno Pomeriggio');
  const [newType, setNewType] = useState<ShiftType>('pomeriggio');
  const [newDate, setNewDate] = useState('2026-10-26');
  const [newStart, setNewStart] = useState('14:00');
  const [newEnd, setNewEnd] = useState('22:00');
  const [newLocation, setNewLocation] = useState('Presidio Ospedaliero Nord - Rep. B');
  const [newHours, setNewHours] = useState('8');
  const [newNotes, setNewNotes] = useState('');

  const totalHours = shifts.reduce((acc, s) => acc + s.hours, 0);
  const morningShifts = shifts.filter(s => s.type === 'mattina').length;
  const afternoonShifts = shifts.filter(s => s.type === 'pomeriggio').length;
  const nightShifts = shifts.filter(s => s.type === 'notte').length;
  const restDays = shifts.filter(s => s.type === 'riposo').length;

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    addShift({
      date: newDate,
      dayLabel: 'Lun',
      dayNumber: parseInt(newDate.split('-')[2] || '26', 10),
      type: newType,
      title: newTitle,
      startTime: newStart,
      endTime: newEnd,
      hours: parseFloat(newHours) || 8,
      location: newLocation,
      notes: newNotes,
      colleagues: ['Marco V.', 'Sara Conti'],
      isClockedIn: false,
    });
    setIsAddingShift(false);
  };

  const getShiftBadgeStyle = (type: ShiftType) => {
    switch (type) {
      case 'mattina':
        return 'text-amber-300 bg-amber-500/15 border-amber-500/30';
      case 'pomeriggio':
        return 'text-[#ff5e1e] bg-[#ff5e1e]/15 border-[#ff5e1e]/35';
      case 'notte':
        return 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30';
      case 'riposo':
        return 'text-[#a3e635] bg-[#a3e635]/15 border-[#a3e635]/35';
      case 'reperibilita':
        return 'text-fuchsia-300 bg-fuchsia-500/15 border-fuchsia-500/30';
      default:
        return 'text-zinc-300 bg-zinc-800 border-white/10';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Lavoro & Roster Turni
          </h1>
          <p className="text-xs text-zinc-400">
            Pianificazione di reparto, presenze timbrate e straordinari
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => showToast('Richiesta cambio turno inoltrata alla caposala')}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/15 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-[#ff5e1e]" />
            <span>Richiedi Cambio</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingShift(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#ff5e1e] hover:bg-[#ff7844] px-5 py-2 text-xs font-bold text-white shadow-xl shadow-[#ff5e1e]/30 transition-all cursor-pointer ring-1 ring-white/20"
          >
            <Plus className="h-4 w-4" />
            <span>Aggiungi Turno</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-5 shadow-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Ore Settimana
          </span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-white tabular-nums">
            {totalHours}h
          </div>
          <span className="mt-1 block text-xs text-zinc-500">Contratto base: 36h</span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-5 shadow-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Mattina (07-15)
          </span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-amber-300 tabular-nums">
            {morningShifts}
          </div>
          <span className="mt-1 block text-xs text-zinc-500">Turni assegnati</span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-5 shadow-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Pomeriggio (14-22)
          </span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-[#ff5e1e] tabular-nums">
            {afternoonShifts}
          </div>
          <span className="mt-1 block text-xs text-zinc-500">Pronto Soccorso</span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-5 shadow-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Notturno (22-06)
          </span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-indigo-300 tabular-nums">
            {nightShifts}
          </div>
          <span className="mt-1 block text-xs text-zinc-500">Indennità +35%</span>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-5 shadow-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Giorni Riposo
          </span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-[#a3e635] tabular-nums">
            {restDays}
          </div>
          <span className="mt-1 block text-xs text-zinc-500">Recuperi fisici</span>
        </div>
      </div>

      {/* Add Shift Form */}
      {isAddingShift && (
        <form
          onSubmit={handleCreateShift}
          className="rounded-3xl border border-white/15 bg-black/60 backdrop-blur-2xl p-6 sm:p-8 space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white">
              Pianifica Nuovo Turno di Servizio
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingShift(false)}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Annulla
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Nome Turno
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Tipologia
              </label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as ShiftType)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
              >
                <option value="mattina">Mattina (07-15)</option>
                <option value="pomeriggio">Pomeriggio (14-22)</option>
                <option value="notte">Notte (22-06)</option>
                <option value="riposo">Riposo</option>
                <option value="reperibilita">Reperibilità</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Data
              </label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingShift(false)}
              className="rounded-full px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#ff5e1e] px-5 py-2 text-xs font-bold text-white hover:bg-[#ff7844] cursor-pointer"
            >
              Salva Turno
            </button>
          </div>
        </form>
      )}

      {/* Shifts Full Table / Schedule List */}
      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-lg font-bold tracking-tight text-white mb-6">
          Registro di Servizio Mensile (Ottobre 2026)
        </h2>

        <div className="divide-y divide-white/5">
          {shifts.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-3">
                <CalendarClock className="h-6 w-6 text-[#ff5e1e]" />
              </div>
              <p className="text-sm font-semibold text-white">Nessun turno inserito</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Non hai ancora inserito turni per questo account. Clicca su "+ Aggiungi Turno" per iniziare a compilare il tuo orario.
              </p>
              <button
                type="button"
                onClick={() => setIsAddingShift(true)}
                className="mt-4 rounded-full bg-[#ff5e1e] hover:bg-[#ff7844] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#ff5e1e]/30 cursor-pointer"
              >
                + Aggiungi il tuo primo turno
              </button>
            </div>
          ) : (
            shifts.map((shift) => {
              const isToday = shift.date === '2026-10-21';
              return (
                <div
                  key={shift.id}
                  className={`flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between transition-colors ${
                    isToday ? 'bg-[#ff5e1e]/10 -mx-4 px-4 rounded-2xl border border-[#ff5e1e]/30' : ''
                  }`}
                >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center w-12 rounded-2xl bg-white/[0.06] border border-white/15 p-2 shrink-0">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      {shift.dayLabel}
                    </span>
                    <span className="text-lg font-bold font-mono text-white tabular-nums">
                      {shift.dayNumber}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {shift.title}
                      </span>
                      {isToday && (
                        <span className="rounded-full bg-[#ff5e1e] text-white px-2 py-0.2 text-[10px] font-extrabold">
                          OGGI
                        </span>
                      )}
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getShiftBadgeStyle(
                          shift.type
                        )}`}
                      >
                        {shift.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-zinc-500" />
                        <span>
                          {shift.startTime} - {shift.endTime} ({shift.hours} ore)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{shift.location}</span>
                      </div>
                      {shift.colleagues && (
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-zinc-500" />
                          <span>Team: {shift.colleagues.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleClockIn(shift.id)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      shift.isClockedIn
                        ? 'border border-[#a3e635]/50 bg-[#a3e635]/20 text-[#a3e635]'
                        : 'border border-white/15 bg-white/[0.06] text-zinc-200 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{shift.isClockedIn ? 'Timbrato' : 'Timbra'}</span>
                  </button>
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
};
