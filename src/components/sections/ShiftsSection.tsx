import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarClock,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  Sliders,
  ChevronLeft,
  ChevronRight,
  FileText,
  Check,
  Timer,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Shift, ShiftType, ShiftInitial, ShiftPatternPreset, ShiftSwapRequest } from '../../types';
import { useItalianLiveClock, calculateShiftLiveStatus, getItalianTime } from '../../lib/italianTime';

// Preset standard di turnazione ricorsiva
const SHIFT_PATTERN_PRESETS: ShiftPatternPreset[] = [
  {
    id: 'mpnr',
    name: 'Ciclo Classico (M - P - N - R)',
    sequence: ['M', 'P', 'N', 'R'],
    description: 'Mattina, Pomeriggio, Notte, Smonto/Riposo a rotazione continua 4 giorni',
  },
  {
    id: 'hosp7',
    name: 'Rotazione Ospedaliera 7gg (M-M-P-P-N-R-R)',
    sequence: ['M', 'M', 'P', 'P', 'N', 'R', 'R'],
    description: '2 Mattine, 2 Pomeriggi, 1 Notte, 2 Giorni Riposo settimanali',
  },
  {
    id: 'mpr',
    name: 'Ciclo Diurno (M - P - R)',
    sequence: ['M', 'P', 'R'],
    description: 'Mattina, Pomeriggio, Riposo senza turni notturni',
  },
  {
    id: 'mnr',
    name: 'Ciclo Emergenza (M - N - R - R)',
    sequence: ['M', 'N', 'R', 'R'],
    description: 'Mattina, Notte, Smonto e Riposo di recupero esteso',
  },
];

const COLLEAGUES_LIST = [
  'Marco V.',
  'Sara Conti',
  'Elena Rossi',
  'Matteo Ferrari',
  'Chiara Bianchi',
  'Giulia Colombo',
  'Andrea Galli',
  'Luca De Angelis',
];

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const ShiftsSection: React.FC = () => {
  const {
    shifts,
    toggleClockIn,
    addShift,
    updateShift,
    bulkSetShifts,
    deleteShift,
    showToast,
  } = useApp();

  // Active Tab: 'calendar' (Griglia Mensile) vs 'configurator' (Configuratore Turni)
  const [activeTab, setActiveTab] = useState<'calendar' | 'configurator'>('calendar');

  // Real-time Italian Clock ticking every second (1000ms)
  const italianTime = useItalianLiveClock();

  // Month navigation: default to current Italian year and month
  const [selectedYear, setSelectedYear] = useState<number>(() => getItalianTime().year);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => getItalianTime().month); // 1-12

  // Quick Action Modals
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingDayDate, setEditingDayDate] = useState<string | null>(null);

  // Swap Request Form State (defaults to 2 days ahead of Italian today)
  const [swapTargetColleague, setSwapTargetColleague] = useState(COLLEAGUES_LIST[0]);
  const [swapReason, setSwapReason] = useState('Impegno familiare inderogabile');
  const [swapProposedDate, setSwapProposedDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().slice(0, 10);
  });

  // Today Note Form State
  const [todayNoteText, setTodayNoteText] = useState('Briefing triage sala 3 ore 14:15 - Consegna cartelle');

  // Day Edit / Assign Modal State
  const [editInitial, setEditInitial] = useState<ShiftInitial>('P');
  const [editStartTime, setEditStartTime] = useState('14:00');
  const [editEndTime, setEditEndTime] = useState('22:00');
  const [editLocation, setEditLocation] = useState('Presidio Ospedaliero Nord - Pronto Soccorso');
  const [editHours, setEditHours] = useState('8');
  const [editColleagues, setEditColleagues] = useState<string[]>(['Marco V.', 'Sara Conti']);
  const [editNotes, setEditNotes] = useState('');

  // Shift Configurator Settings State
  const [configMorningStart, setConfigMorningStart] = useState('07:00');
  const [configMorningEnd, setConfigMorningEnd] = useState('15:00');
  const [configAfternoonStart, setConfigAfternoonStart] = useState('14:00');
  const [configAfternoonEnd, setConfigAfternoonEnd] = useState('22:00');
  const [configNightStart, setConfigNightStart] = useState('22:00');
  const [configNightEnd, setConfigNightEnd] = useState('06:00');
  const [configDepartment, setConfigDepartment] = useState('Presidio Ospedaliero Nord');
  const [selectedPatternId, setSelectedPatternId] = useState<string>('mpnr');
  const [customPattern, setCustomPattern] = useState<ShiftInitial[]>(['M', 'P', 'N', 'R']);
  const [patternOffset, setPatternOffset] = useState<number>(0);

  // Live real-time shift status & dynamic countdown calculated from Italian time
  const liveShiftStatus = useMemo(() => {
    return calculateShiftLiveStatus(shifts, italianTime);
  }, [shifts, italianTime]);

  // Current active shift or today's scheduled shift in Italian time
  const currentActiveOrTodayShift = useMemo(() => {
    return (
      liveShiftStatus.targetShift ||
      shifts.find((s) => s.date === italianTime.dateStr) ||
      shifts[0]
    );
  }, [liveShiftStatus, shifts, italianTime.dateStr]);

  // Format month label
  const monthName = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth - 1, 1);
    return d.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  }, [selectedYear, selectedMonth]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Convert ShiftType to ShiftInitial
  const getShiftInitial = (type: ShiftType): ShiftInitial => {
    switch (type) {
      case 'mattina':
        return 'M';
      case 'pomeriggio':
        return 'P';
      case 'notte':
        return 'N';
      case 'riposo':
      case 'reperibilita':
      default:
        return 'R';
    }
  };

  // Days in selected month computation
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Leading empty days in month grid (Monday start = 1)
  const firstDayWeekday = useMemo(() => {
    const day = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    // JS getDay(): 0 = Sun, 1 = Mon...
    return day === 0 ? 6 : day - 1;
  }, [selectedYear, selectedMonth]);

  // Map of shifts in currently selected month
  const monthShiftsMap = useMemo(() => {
    const map = new Map<string, Shift>();
    const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    shifts.forEach(shift => {
      if (shift.date.startsWith(monthPrefix)) {
        map.set(shift.date, shift);
      }
    });
    return map;
  }, [shifts, selectedYear, selectedMonth]);

  // Monthly KPI Metrics
  const monthlyMetrics = useMemo(() => {
    const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const curMonthShifts = shifts.filter(s => s.date.startsWith(monthPrefix));

    const totalHours = curMonthShifts.reduce((acc, s) => acc + (s.hours || 0), 0);
    const morningCount = curMonthShifts.filter(s => s.type === 'mattina').length;
    const afternoonCount = curMonthShifts.filter(s => s.type === 'pomeriggio').length;
    const nightCount = curMonthShifts.filter(s => s.type === 'notte').length;
    const restCount = curMonthShifts.filter(s => s.type === 'riposo').length;
    const standardContractHours = 152; // Standard monthly healthcare contract
    const balanceDelta = totalHours - standardContractHours;

    return {
      totalHours,
      standardContractHours,
      balanceDelta,
      morningCount,
      afternoonCount,
      nightCount,
      restCount,
      activeShiftsTotal: morningCount + afternoonCount + nightCount,
    };
  }, [shifts, selectedYear, selectedMonth]);

  // Styling helper for Initial Badges
  const getInitialBadgeStyle = (initial: ShiftInitial) => {
    switch (initial) {
      case 'M':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.12)]';
      case 'P':
        return 'bg-indigo-500/20 text-[#A5B4FC] border-indigo-500/35 shadow-[0_0_12px_rgba(99,102,241,0.18)]';
      case 'N':
        return 'bg-blue-600/25 text-blue-200 border-blue-500/35 shadow-[0_0_12px_rgba(59,130,246,0.15)]';
      case 'R':
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  // Open day edit modal
  const handleOpenDayEdit = (dateStr: string) => {
    const existing = monthShiftsMap.get(dateStr);
    setEditingDayDate(dateStr);
    if (existing) {
      setEditInitial(getShiftInitial(existing.type));
      setEditStartTime(existing.startTime || '07:00');
      setEditEndTime(existing.endTime || '15:00');
      setEditLocation(existing.location || 'Presidio Ospedaliero Nord - Rep. B');
      setEditHours(String(existing.hours || 8));
      setEditColleagues(existing.colleagues || ['Marco V.', 'Sara Conti']);
      setEditNotes(existing.notes || '');
    } else {
      setEditInitial('M');
      setEditStartTime('07:00');
      setEditEndTime('15:00');
      setEditLocation('Presidio Ospedaliero Nord - Rep. B');
      setEditHours('8');
      setEditColleagues(['Sara Conti', 'Elena Rossi']);
      setEditNotes('');
    }
  };

  // Save day shift from modal
  const handleSaveDayShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDayDate) return;

    let finalType: ShiftType = 'mattina';
    let finalTitle = 'Turno Mattina';
    if (editInitial === 'M') {
      finalType = 'mattina';
      finalTitle = 'Turno Mattina';
    } else if (editInitial === 'P') {
      finalType = 'pomeriggio';
      finalTitle = 'Turno Pomeriggio';
    } else if (editInitial === 'N') {
      finalType = 'notte';
      finalTitle = 'Turno Notturno';
    } else {
      finalType = 'riposo';
      finalTitle = 'Giorno Riposo / Smonto';
    }

    const dayNum = parseInt(editingDayDate.split('-')[2], 10);
    const d = new Date(editingDayDate);
    const dayLabel = WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1] || 'Lun';

    const existing = monthShiftsMap.get(editingDayDate);
    if (existing) {
      updateShift({
        ...existing,
        type: finalType,
        title: finalTitle,
        startTime: editStartTime,
        endTime: editEndTime,
        hours: parseFloat(editHours) || (editInitial === 'R' ? 0 : 8),
        location: editLocation,
        colleagues: editColleagues,
        notes: editNotes,
      });
    } else {
      addShift({
        date: editingDayDate,
        dayLabel,
        dayNumber: dayNum,
        type: finalType,
        title: finalTitle,
        startTime: editStartTime,
        endTime: editEndTime,
        hours: parseFloat(editHours) || (editInitial === 'R' ? 0 : 8),
        location: editLocation,
        colleagues: editColleagues,
        notes: editNotes,
        isClockedIn: false,
      });
    }

    setEditingDayDate(null);
  };

  // Delete shift
  const handleDeleteDayShift = () => {
    if (!editingDayDate) return;
    const existing = monthShiftsMap.get(editingDayDate);
    if (existing) {
      deleteShift(existing.id);
    }
    setEditingDayDate(null);
  };

  // Submit Swap Request
  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSwapModalOpen(false);
    showToast(`Richiesta di cambio turno inviata a ${swapTargetColleague} per il ${swapProposedDate}`);
  };

  // Submit Handover Note
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentActiveOrTodayShift) {
      updateShift({
        ...currentActiveOrTodayShift,
        notes: todayNoteText,
      });
    }
    setIsNoteModalOpen(false);
    showToast('Nota di consegna reparto salvata per il turno odierno');
  };

  // Apply recurring shift pattern to the entire selected month
  const handleApplyMonthlyPattern = () => {
    const selectedPreset = SHIFT_PATTERN_PRESETS.find(p => p.id === selectedPatternId);
    const pattern = selectedPreset ? selectedPreset.sequence : customPattern;

    if (!pattern || pattern.length === 0) {
      showToast('Seleziona o definisci un pattern valido');
      return;
    }

    const newMonthShifts: Shift[] = [];
    const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
      const d = new Date(selectedYear, selectedMonth - 1, day);
      const dayLabel = WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1] || 'Lun';

      // Pick pattern token based on day index + offset
      const patternIndex = (day - 1 + patternOffset) % pattern.length;
      const initial = pattern[patternIndex];

      let type: ShiftType = 'mattina';
      let title = 'Turno Mattina';
      let startTime = configMorningStart;
      let endTime = configMorningEnd;
      let hours = 8;
      let location = `${configDepartment} - Rep. B`;
      let colleagues = ['Marco V.', 'Sara Conti'];

      if (initial === 'M') {
        type = 'mattina';
        title = 'Turno Mattina';
        startTime = configMorningStart;
        endTime = configMorningEnd;
        hours = 8;
        location = `${configDepartment} - Rep. B`;
        colleagues = ['Marco V.', 'Elena Rossi'];
      } else if (initial === 'P') {
        type = 'pomeriggio';
        title = 'Turno Pomeriggio';
        startTime = configAfternoonStart;
        endTime = configAfternoonEnd;
        hours = 8;
        location = `${configDepartment} - Pronto Soccorso`;
        colleagues = ['Luca De Angelis', 'Andrea Galli'];
      } else if (initial === 'N') {
        type = 'notte';
        title = 'Turno Notturno';
        startTime = configNightStart;
        endTime = configNightEnd;
        hours = 8;
        location = `${configDepartment} - Rep. B`;
        colleagues = ['Giulia Colombo'];
      } else {
        type = 'riposo';
        title = 'Smonto Notte / Riposo';
        startTime = '-';
        endTime = '-';
        hours = 0;
        location = 'A Casa';
        colleagues = [];
      }

      newMonthShifts.push({
        id: `gen-${selectedYear}-${selectedMonth}-${day}-${Date.now()}`,
        date: dayDateStr,
        dayLabel,
        dayNumber: day,
        type,
        title,
        startTime,
        endTime,
        hours,
        location,
        colleagues,
        notes: initial === 'R' ? 'Riposo compensativo programmato' : 'Assegnazione automatica da pattern',
        isClockedIn: false,
      });
    }

    // Keep other months' shifts and replace the selected month
    const otherMonthsShifts = shifts.filter(s => !s.date.startsWith(monthPrefix));
    bulkSetShifts([...otherMonthsShifts, ...newMonthShifts]);
    setActiveTab('calendar');
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* 1. Header with Modern Naming & Subtitle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5F9]">
              Shift & Work Operations
            </h1>
            <span className="rounded-full border border-indigo-500/30 bg-[#6366F1]/15 px-3 py-0.5 text-[10px] font-bold tracking-wider text-[#A5B4FC] uppercase">
              Roster ONYX
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#94A3B8]">
            Organize your daily work, schedules, and monthly shift balance
          </p>
        </div>

        {/* View Switcher Tabs (Calendario vs Configuratore) */}
        <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#161920] p-1 shadow-lg ring-1 ring-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Calendario Roster</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('configurator')}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'configurator'
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Shift Configurator</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Widget "Organize your daily work" */}
      <section
        aria-label="Organize your daily work"
        className="card-onyx relative overflow-hidden rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/[0.08]"
      >
        {/* Subtle Ambient Decorative Glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#6366F1]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-[#38BDF8]/5 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Details: Today's Shift Live Status */}
          <div className="space-y-3.5 max-w-xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold text-[#E2E8F0] tracking-wide">
                <Sparkles className="h-3 w-3 text-[#818CF8]" />
                Organize your daily work
              </span>

              {/* Real-time Italian Clock Badge */}
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0D0F12]/80 px-3 py-1 text-[11px] font-mono text-[#CBD5E1] shadow-inner">
                <span className="text-xs">🇮🇹</span>
                <span className="text-[#94A3B8]">Fuso Roma:</span>
                <strong className="text-[#F8FAFC] font-bold">
                  {italianTime.weekdayShort} {italianTime.day} {italianTime.month.toString().padStart(2, '0')} · {italianTime.timeStr}
                </strong>
              </div>

              {/* Dynamic live status pill */}
              <div
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                  liveShiftStatus.statusBadgeVariant === 'emerald'
                    ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                    : liveShiftStatus.statusBadgeVariant === 'indigo'
                    ? 'border-indigo-500/30 bg-indigo-500/15 text-[#A5B4FC]'
                    : 'border-slate-500/30 bg-slate-500/15 text-slate-300'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {liveShiftStatus.isCurrentlyActive ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
                  )}
                </span>
                <span>{liveShiftStatus.statusBadge}</span>
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-[#F8FAFC]">
                {liveShiftStatus.displayTitle}
              </div>
              <p className="mt-1 text-xs sm:text-sm text-[#94A3B8] flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-[#CBD5E1]">
                  <MapPin className="h-3.5 w-3.5 text-[#818CF8]" />
                  {currentActiveOrTodayShift?.location || 'Presidio Ospedaliero Nord'}
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1 text-[#94A3B8]">
                  <Users className="h-3.5 w-3.5 text-[#94A3B8]" />
                  {currentActiveOrTodayShift?.colleagues && currentActiveOrTodayShift.colleagues.length > 0
                    ? `Team: ${currentActiveOrTodayShift.colleagues.join(', ')}`
                    : 'Team di reparto assegnato'}
                </span>
              </p>
            </div>

            {/* Shift Note preview if present */}
            {currentActiveOrTodayShift?.notes && (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0D0F12]/60 px-3.5 py-1.5 text-xs text-[#94A3B8]">
                <FileText className="h-3.5 w-3.5 text-[#818CF8] shrink-0" />
                <span className="truncate max-w-md">"{currentActiveOrTodayShift.notes}"</span>
              </div>
            )}
          </div>

          {/* Right Section: Dynamic Countdown & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 lg:pl-6 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-5 lg:pt-0">
            {/* Live Countdown Box */}
            <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#0D0F12]/80 px-4 py-3 min-w-[200px] shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#94A3B8] gap-2">
                <span className="flex items-center gap-1 truncate">
                  <Timer className="h-3.5 w-3.5 text-[#818CF8]" />
                  {liveShiftStatus.countdownLabel}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                  {liveShiftStatus.progressPercent}%
                </span>
              </div>
              <div className="mt-1 font-mono text-xl sm:text-2xl font-extrabold text-[#F8FAFC] tracking-tight tabular-nums">
                {liveShiftStatus.countdownFormatted}
              </div>
              {/* Micro Progress Bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#38BDF8] transition-all duration-300"
                  style={{ width: `${liveShiftStatus.progressPercent}%` }}
                />
              </div>
              <span className="mt-1.5 text-[10px] text-[#94A3B8] truncate">
                {liveShiftStatus.progressLabel}
              </span>
            </div>

            {/* Action Buttons Column */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Timbra Presenza with Micro-Animation and Active State */}
              <button
                type="button"
                onClick={() => {
                  if (currentActiveOrTodayShift) {
                    toggleClockIn(currentActiveOrTodayShift.id);
                  } else {
                    showToast('Nessun turno registrato per oggi');
                  }
                }}
                className={`group flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
                  currentActiveOrTodayShift?.isClockedIn
                    ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-emerald-500/20 ring-1 ring-emerald-500/30'
                    : 'bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white hover:brightness-110 shadow-[#6366F1]/30 ring-1 ring-white/10'
                }`}
              >
                <CheckCircle2
                  className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                    currentActiveOrTodayShift?.isClockedIn ? 'text-emerald-400 animate-pulse' : 'text-white'
                  }`}
                />
                <span>
                  {currentActiveOrTodayShift?.isClockedIn
                    ? `Presenza: ${currentActiveOrTodayShift.clockInTime || italianTime.timeShort}`
                    : 'Timbra Presenza'}
                </span>
              </button>

              {/* Richiedi Cambio */}
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] px-4 py-3 text-xs font-semibold text-[#E2E8F0] hover:text-white transition-all cursor-pointer shadow-md active:scale-95 hover:border-white/20"
              >
                <ArrowRightLeft className="h-4 w-4 text-[#818CF8]" />
                <span>Richiedi Cambio</span>
              </button>

              {/* Aggiungi Nota */}
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] px-4 py-3 text-xs font-semibold text-[#E2E8F0] hover:text-white transition-all cursor-pointer shadow-md active:scale-95 hover:border-white/20"
              >
                <FileText className="h-4 w-4 text-[#818CF8]" />
                <span>Aggiungi Nota</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Hours KPI Strip with 3D Hover & Dark Slate Theme */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Total Hours & Balance */}
        <div className="card-onyx rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Monte Ore Mese
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                  monthlyMetrics.balanceDelta >= 0
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                {monthlyMetrics.balanceDelta >= 0 ? `+${monthlyMetrics.balanceDelta}h` : `${monthlyMetrics.balanceDelta}h`}
              </span>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-mono text-[#F8FAFC] tabular-nums tracking-tight">
              {monthlyMetrics.totalHours}h
            </div>
          </div>
          <span className="mt-2 text-[11px] text-[#94A3B8]">
            Base contratto: {monthlyMetrics.standardContractHours}h
          </span>
        </div>

        {/* Morning Shifts */}
        <div className="card-onyx rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Mattina [M]
              </span>
              <span className="h-6 w-6 rounded-full border border-sky-500/30 bg-sky-500/15 text-sky-300 flex items-center justify-center font-bold text-xs">
                M
              </span>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-mono text-[#E2E8F0] tabular-nums">
              {monthlyMetrics.morningCount}
            </div>
          </div>
          <span className="mt-2 text-[11px] text-[#94A3B8]">07:00 - 15:00 · 8h</span>
        </div>

        {/* Afternoon Shifts */}
        <div className="card-onyx rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Pomeriggio [P]
              </span>
              <span className="h-6 w-6 rounded-full border border-indigo-500/35 bg-indigo-500/20 text-[#A5B4FC] flex items-center justify-center font-bold text-xs">
                P
              </span>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-mono text-[#818CF8] tabular-nums">
              {monthlyMetrics.afternoonCount}
            </div>
          </div>
          <span className="mt-2 text-[11px] text-[#94A3B8]">14:00 - 22:00 · 8h</span>
        </div>

        {/* Night Shifts */}
        <div className="card-onyx rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Notturno [N]
              </span>
              <span className="h-6 w-6 rounded-full border border-blue-500/35 bg-blue-600/25 text-blue-200 flex items-center justify-center font-bold text-xs">
                N
              </span>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-mono text-[#A5B4FC] tabular-nums">
              {monthlyMetrics.nightCount}
            </div>
          </div>
          <span className="mt-2 text-[11px] text-[#94A3B8]">22:00 - 06:00 · Indennità +35%</span>
        </div>

        {/* Rest / Recovery Days */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 card-onyx rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Riposo [R]
              </span>
              <span className="h-6 w-6 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 flex items-center justify-center font-bold text-xs">
                R
              </span>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
              {monthlyMetrics.restCount}
            </div>
          </div>
          <span className="mt-2 text-[11px] text-[#94A3B8]">Recupero fisiologico</span>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA: TAB CALENDARIO vs TAB SHIFT CONFIGURATOR */}
      {activeTab === 'calendar' ? (
        /* ================= VISTA CALENDARIO MENSILE A INIZIALI ================= */
        <div className="card-onyx rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          {/* Calendar Month Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-[#818CF8]">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[#F1F5F9] capitalize">
                  {monthName}
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  {monthlyMetrics.activeShiftsTotal} turni attivi · Clicca su un giorno per modificare
                </p>
              </div>
            </div>

            {/* Month Switcher Arrows & Quick Add */}
            <div className="flex items-center gap-2">
              {/* Quick jump to current Italian month */}
              {(selectedYear !== italianTime.year || selectedMonth !== italianTime.month) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedYear(italianTime.year);
                    setSelectedMonth(italianTime.month);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-indigo-500/30 bg-[#6366F1]/15 text-[#A5B4FC] hover:bg-[#6366F1]/25 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Torna al mese corrente in Italia"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Oggi ({italianTime.day} {italianTime.weekdayShort})</span>
                </button>
              )}

              <div className="flex items-center rounded-full border border-white/[0.08] bg-[#0D0F12] p-1 shadow-inner">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#94A3B8] hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                  title="Mese precedente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-xs font-mono font-semibold text-[#E2E8F0]">
                  {selectedMonth.toString().padStart(2, '0')}/{selectedYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#94A3B8] hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                  title="Mese successivo"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Legend Badges */}
              <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/[0.08]">
                <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                  <span className="h-5 w-5 rounded-full border border-sky-500/30 bg-sky-500/15 text-sky-300 flex items-center justify-center font-bold text-[10px]">
                    M
                  </span>
                  Mattina
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                  <span className="h-5 w-5 rounded-full border border-indigo-500/35 bg-indigo-500/20 text-[#A5B4FC] flex items-center justify-center font-bold text-[10px]">
                    P
                  </span>
                  Pomeriggio
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                  <span className="h-5 w-5 rounded-full border border-blue-500/35 bg-blue-600/25 text-blue-200 flex items-center justify-center font-bold text-[10px]">
                    N
                  </span>
                  Notte
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                  <span className="h-5 w-5 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                    R
                  </span>
                  Riposo
                </span>
              </div>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {WEEKDAYS.map((wd, i) => (
              <div
                key={wd}
                className={`py-2 text-[11px] font-bold uppercase tracking-wider ${
                  i >= 5 ? 'text-[#818CF8]' : 'text-[#94A3B8]'
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Monthly Shift Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {/* Empty slots for days before the 1st of the month */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-20 sm:h-24 rounded-2xl border border-white/[0.02] bg-white/[0.01] opacity-30"
              />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const shift = monthShiftsMap.get(dateStr);
              const isToday = dateStr === italianTime.dateStr;
              const initial: ShiftInitial = shift ? getShiftInitial(shift.type) : 'R';

              return (
                <div
                  key={dateStr}
                  onClick={() => handleOpenDayEdit(dateStr)}
                  className={`calendar-cell-3d group relative flex flex-col justify-between p-2.5 sm:p-3 h-20 sm:h-24 rounded-2xl cursor-pointer ${
                    isToday ? 'ring-2 ring-[#6366F1] shadow-[0_0_24px_rgba(99,102,241,0.35)] border-[#6366F1]/60 bg-[#6366F1]/10' : ''
                  }`}
                >
                  {/* Top Day row */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold tabular-nums ${
                        isToday ? 'text-[#6366F1] font-black' : 'text-[#94A3B8] group-hover:text-white'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {isToday && (
                      <span className="rounded-full bg-[#6366F1] px-1.5 py-0.2 text-[9px] font-extrabold text-white uppercase tracking-wider">
                        OGGI
                      </span>
                    )}

                    {shift && shift.isClockedIn && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Timbrato" />
                    )}
                  </div>

                  {/* Minimalist Circular/Pill Badge with Shift Initial */}
                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full border flex items-center justify-center font-bold text-xs sm:text-sm transition-transform group-hover:scale-110 ${getInitialBadgeStyle(
                        initial
                      )}`}
                    >
                      {initial}
                    </span>

                    {shift && shift.hours > 0 && (
                      <span className="text-[10px] font-mono text-[#94A3B8] group-hover:text-[#CBD5E1]">
                        {shift.hours}h
                      </span>
                    )}
                  </div>

                  {/* TRANSLUCENT DARK GLASS HOVER POPOVER */}
                  <div
                    role="tooltip"
                    className="glass-popover pointer-events-none absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 w-64 p-3.5 rounded-2xl text-left scale-95 group-hover:scale-100"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-6 w-6 rounded-full border flex items-center justify-center font-extrabold text-xs ${getInitialBadgeStyle(
                            initial
                          )}`}
                        >
                          {initial}
                        </span>
                        <span className="text-xs font-bold text-[#F8FAFC]">
                          {shift ? shift.title : 'Nessun Turno'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#94A3B8]">
                        {dateStr}
                      </span>
                    </div>

                    {isToday && (
                      <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6366F1]/20 text-[#A5B4FC] border border-[#6366F1]/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Oggi in Italia (Ora: {italianTime.timeStr})</span>
                      </div>
                    )}

                    <div className="space-y-1.5 text-[11px] text-[#CBD5E1]">
                      {shift && shift.startTime && shift.startTime !== '-' && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-[#818CF8]" />
                          <span>
                            {shift.startTime} - {shift.endTime} ({shift.hours}h di servizio)
                          </span>
                        </div>
                      )}

                      {shift && shift.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-[#818CF8]" />
                          <span className="truncate">{shift.location}</span>
                        </div>
                      )}

                      {shift?.colleagues && shift.colleagues.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-[#818CF8]" />
                          <span className="truncate">{shift.colleagues.join(', ')}</span>
                        </div>
                      )}

                      {shift?.notes && (
                        <div className="mt-1 pt-1.5 border-t border-white/[0.08] text-[10px] text-[#94A3B8] italic truncate">
                          "{shift.notes}"
                        </div>
                      )}

                      <div className="pt-1.5 text-[9px] text-[#6366F1] font-semibold flex items-center gap-1">
                        <Edit2 className="h-2.5 w-2.5" />
                        <span>Clicca per modificare o riassegnare</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= VISTA SHIFT CONFIGURATOR ================= */
        <div className="card-onyx rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30">
                  <Sliders className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-[#F1F5F9]">
                  Configuratore Turni Mensili & Rotazioni
                </h2>
              </div>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Imposta i parametri orari standard e applica pattern ricorsivi (es. M-P-N-R) su tutto il mese
              </p>
            </div>

            {/* Target Month Indicator */}
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-4 py-2">
              <Calendar className="h-4 w-4 text-[#818CF8]" />
              <span className="text-xs font-semibold text-[#F8FAFC] capitalize">{monthName}</span>
            </div>
          </div>

          {/* Step 1: Preset Timetables for Standard Shifts (M, P, N, R) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
              1. Orari Standard dei Turni Base
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Mattina (M) */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F12]/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-[#F8FAFC]">
                    <span className="h-6 w-6 rounded-full border border-sky-500/30 bg-sky-500/15 text-sky-300 flex items-center justify-center font-bold text-xs">
                      M
                    </span>
                    Mattina
                  </span>
                  <span className="text-[11px] font-mono text-[#94A3B8]">8.0h</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-1">Inizio</label>
                    <input
                      type="time"
                      value={configMorningStart}
                      onChange={e => setConfigMorningStart(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-1">Fine</label>
                    <input
                      type="time"
                      value={configMorningEnd}
                      onChange={e => setConfigMorningEnd(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                    />
                  </div>
                </div>
              </div>

              {/* Pomeriggio (P) */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F12]/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-[#F8FAFC]">
                    <span className="h-6 w-6 rounded-full border border-indigo-500/35 bg-indigo-500/20 text-[#A5B4FC] flex items-center justify-center font-bold text-xs">
                      P
                    </span>
                    Pomeriggio
                  </span>
                  <span className="text-[11px] font-mono text-[#94A3B8]">8.0h</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-1">Inizio</label>
                    <input
                      type="time"
                      value={configAfternoonStart}
                      onChange={e => setConfigAfternoonStart(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-1">Fine</label>
                    <input
                      type="time"
                      value={configAfternoonEnd}
                      onChange={e => setConfigAfternoonEnd(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                    />
                  </div>
                </div>
              </div>

              {/* Notturno (N) */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F12]/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-[#F8FAFC]">
                    <span className="h-6 w-6 rounded-full border border-blue-500/35 bg-blue-600/25 text-blue-200 flex items-center justify-center font-bold text-xs">
                      N
                    </span>
                    Notte
                  </span>
                  <span className="text-[11px] font-mono text-[#94A3B8]">8.0h</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-1">Inizio</label>
                    <input
                      type="time"
                      value={configNightStart}
                      onChange={e => setConfigNightStart(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-1">Fine</label>
                    <input
                      type="time"
                      value={configNightEnd}
                      onChange={e => setConfigNightEnd(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Select Rotation Pattern */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
              2. Scegli il Modello di Turnazione Ricorsivo
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SHIFT_PATTERN_PRESETS.map(preset => {
                const isSelected = selectedPatternId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPatternId(preset.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#6366F1] bg-[#6366F1]/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                        : 'border-white/[0.08] bg-[#0D0F12]/80 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#F8FAFC]">{preset.name}</span>
                      <div className="flex items-center gap-1.5">
                        {preset.sequence.map((init, idx) => (
                          <span
                            key={idx}
                            className={`h-5 w-5 rounded-full border flex items-center justify-center font-bold text-[10px] ${getInitialBadgeStyle(
                              init
                            )}`}
                          >
                            {init}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#94A3B8]">{preset.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Reparto & Offset Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                Presidio / Reparto di Assegnazione
              </label>
              <input
                type="text"
                value={configDepartment}
                onChange={e => setConfigDepartment(e.target.value)}
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                Sfasamento Inizio Turno (Giorno 1 del mese)
              </label>
              <select
                value={patternOffset}
                onChange={e => setPatternOffset(parseInt(e.target.value, 10))}
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
              >
                <option value={0}>Inizia da token 1 (es. Mattina)</option>
                <option value={1}>Inizia da token 2 (es. Pomeriggio)</option>
                <option value={2}>Inizia da token 3 (es. Notte)</option>
                <option value={3}>Inizia da token 4 (es. Riposo)</option>
              </select>
            </div>
          </div>

          {/* Action Button: Apply Pattern to Whole Month */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <AlertCircle className="h-4 w-4 text-[#818CF8]" />
              <span>
                Questa azione genererà {daysInMonth} turni per tutto il mese di {monthName}.
              </span>
            </div>

            <button
              type="button"
              onClick={handleApplyMonthlyPattern}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-[#6366F1]/25 transition-all cursor-pointer ring-1 ring-white/10 active:scale-98"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Applica Pattern a Tutto il Mese ({monthName})</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: RICHIEDI CAMBIO TURNO ================= */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="card-onyx w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border border-white/15">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1]/15 text-[#818CF8]">
                  <ArrowRightLeft className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC]">
                  Richiesta di Cambio Turno
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(false)}
                className="text-[#94A3B8] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSwapSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Turno da Cedere
                </label>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F12] p-3 text-xs text-[#E2E8F0]">
                  {currentActiveOrTodayShift ? `${currentActiveOrTodayShift.title} · ${currentActiveOrTodayShift.date} (${currentActiveOrTodayShift.startTime} - ${currentActiveOrTodayShift.endTime})` : 'Turno Odierno'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Collega di Reparto con cui effettuare lo scambio
                </label>
                <select
                  value={swapTargetColleague}
                  onChange={e => setSwapTargetColleague(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                >
                  {COLLEAGUES_LIST.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Data Proposta di Compensazione
                </label>
                <input
                  type="date"
                  value={swapProposedDate}
                  onChange={e => setSwapProposedDate(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Motivazione della Richiesta
                </label>
                <textarea
                  rows={3}
                  value={swapReason}
                  onChange={e => setSwapReason(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                  placeholder="Specificare motivo per la caposala..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsSwapModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-white cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#6366F1]/20 cursor-pointer"
                >
                  Invia Richiesta alla Caposala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: AGGIUNGI NOTA TURNO ================= */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="card-onyx w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border border-white/15">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1]/15 text-[#818CF8]">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC]">
                  Aggiungi Nota / Consegna Reparto
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="text-[#94A3B8] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Turno
                </label>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0D0F12] p-3 text-xs text-[#E2E8F0]">
                  {currentActiveOrTodayShift ? `${currentActiveOrTodayShift.title} · ${currentActiveOrTodayShift.date}` : 'Turno Odierno'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Nota Operativa o Passaggio di Consegna
                </label>
                <textarea
                  rows={4}
                  value={todayNoteText}
                  onChange={e => setTodayNoteText(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                  placeholder="Es. Segnalare pazienti con monitoraggio stretto, farmaci in scadenza..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-white cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#6366F1]/20 cursor-pointer"
                >
                  Salva Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MODIFICA / ASSEGNA TURNO GIORNALIERO ================= */}
      {editingDayDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="card-onyx w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border border-white/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1]/15 text-[#818CF8]">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC]">
                    Assegna / Modifica Turno
                  </h3>
                  <span className="text-xs font-mono text-[#818CF8]">{editingDayDate}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDayDate(null)}
                className="text-[#94A3B8] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDayShift} className="space-y-4">
              {/* Initial Selection Pills */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-2">
                  Seleziona Tipologia (Iniziale)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['M', 'P', 'N', 'R'] as ShiftInitial[]).map(init => {
                    const isSelected = editInitial === init;
                    return (
                      <button
                        key={init}
                        type="button"
                        onClick={() => {
                          setEditInitial(init);
                          if (init === 'M') {
                            setEditStartTime('07:00');
                            setEditEndTime('15:00');
                            setEditHours('8');
                          } else if (init === 'P') {
                            setEditStartTime('14:00');
                            setEditEndTime('22:00');
                            setEditHours('8');
                          } else if (init === 'N') {
                            setEditStartTime('22:00');
                            setEditEndTime('06:00');
                            setEditHours('8');
                          } else {
                            setEditStartTime('-');
                            setEditEndTime('-');
                            setEditHours('0');
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#6366F1] bg-[#6366F1]/20 shadow-[0_0_15px_rgba(99,102,241,0.25)] ring-1 ring-[#6366F1]'
                            : 'border-white/[0.08] bg-[#0D0F12] hover:border-white/20'
                        }`}
                      >
                        <span
                          className={`h-7 w-7 rounded-full border flex items-center justify-center font-bold text-xs mb-1 ${getInitialBadgeStyle(
                            init
                          )}`}
                        >
                          {init}
                        </span>
                        <span className="text-[11px] font-semibold text-white">
                          {init === 'M' ? 'Mattina' : init === 'P' ? 'Pomeriggio' : init === 'N' ? 'Notte' : 'Riposo'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Times row */}
              {editInitial !== 'R' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                      Inizio
                    </label>
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={e => setEditStartTime(e.target.value)}
                      className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                      Fine
                    </label>
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={e => setEditEndTime(e.target.value)}
                      className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                      Ore
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={editHours}
                      onChange={e => setEditHours(e.target.value)}
                      className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Reparto / Sede
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-white"
                  placeholder="Es. Presidio Ospedaliero Nord - Rep. B"
                />
              </div>

              {/* Colleagues */}
              {editInitial !== 'R' && (
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                    Colleghi di Turno
                  </label>
                  <input
                    type="text"
                    value={editColleagues.join(', ')}
                    onChange={e => setEditColleagues(e.target.value.split(',').map(s => s.trim()))}
                    className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-white"
                    placeholder="Separa con virgola (es. Marco V., Sara Conti)"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Note del Giorno
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-white"
                  placeholder="Note, consegne o promemoria..."
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                {monthShiftsMap.has(editingDayDate) ? (
                  <button
                    type="button"
                    onClick={handleDeleteDayShift}
                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Elimina Turno</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDayDate(null)}
                    className="rounded-full px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-white cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#6366F1]/20 cursor-pointer"
                  >
                    Salva Turno
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
