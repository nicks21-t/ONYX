import React, { useState } from 'react';
import {
  CalendarClock,
  Clock,
  Moon,
  Sun,
  Sunrise,
  Coffee,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShiftsWorkloadGaugeCard: React.FC = () => {
  const { shifts, toggleClockIn } = useApp();
  const [activeMetricIndex, setActiveMetricIndex] = useState<number>(1); // Default: Ore Lavorate

  // Calculate real metrics from user's shifts
  const totalShifts = shifts.length;
  const activeWorkShifts = shifts.filter((s) => s.type !== 'riposo');
  const totalHours = shifts.reduce((acc, s) => acc + (s.hours || 0), 0);
  const nightShifts = shifts.filter((s) => s.type === 'notte').length;
  const afternoonShifts = shifts.filter((s) => s.type === 'pomeriggio').length;
  const morningShifts = shifts.filter((s) => s.type === 'mattina').length;
  const restDays = shifts.filter((s) => s.type === 'riposo').length;
  const clockedInCount = shifts.filter((s) => s.isClockedIn).length;
  const attendanceRate = activeWorkShifts.length > 0 ? Math.round((clockedInCount / activeWorkShifts.length) * 100) : 0;

  // Maximum contractual hours per week (standard 38h or 40h)
  const targetWeeklyHours = 38;
  const workloadPercent = Math.min(100, Math.round((totalHours / targetWeeklyHours) * 100));

  const metricsConfig = [
    {
      id: 0,
      icon: CalendarClock,
      label: 'Turni',
      title: 'Turni Totali',
      value: `${totalShifts}`,
      unit: 'Turni',
      percentage: totalShifts > 0 ? Math.min(100, (totalShifts / 7) * 100) : 0,
      description: `${activeWorkShifts.length} turni di servizio e ${restDays} riposi programmati`,
      status: totalShifts > 0 ? 'Pianificazione attiva' : 'Nessun turno',
    },
    {
      id: 1,
      icon: Clock,
      label: 'Ore',
      title: 'Ore Lavorate',
      value: `${totalHours}`,
      unit: 'Ore',
      percentage: workloadPercent,
      description: `${totalHours}h registrate su ${targetWeeklyHours}h contrattuali`,
      status: totalHours > targetWeeklyHours ? 'Straordinario attivo' : 'Carico ottimale',
    },
    {
      id: 2,
      icon: Moon,
      label: 'Notti',
      title: 'Turni Notturni',
      value: `${nightShifts}`,
      unit: 'Notti',
      percentage: Math.min(100, (nightShifts / 3) * 100),
      description: `${nightShifts} turni notturni svolti o pianificati`,
      status: nightShifts >= 2 ? 'Recupero post-notte' : 'Impatto sonno ridotto',
    },
    {
      id: 3,
      icon: Sun,
      label: 'Pomeriggi',
      title: 'Turni Pomeriggio',
      value: `${afternoonShifts}`,
      unit: 'Pomeriggi',
      percentage: Math.min(100, (afternoonShifts / 4) * 100),
      description: `${afternoonShifts} turni in fascia 14:00 - 22:00`,
      status: 'Fascia regolare',
    },
    {
      id: 4,
      icon: Sunrise,
      label: 'Mattine',
      title: 'Turni Mattutini',
      value: `${morningShifts}`,
      unit: 'Mattine',
      percentage: Math.min(100, (morningShifts / 4) * 100),
      description: `${morningShifts} turni in fascia 07:00 - 15:00`,
      status: 'Fascia mattutina',
    },
    {
      id: 5,
      icon: Coffee,
      label: 'Riposi',
      title: 'Giorni di Riposo',
      value: `${restDays}`,
      unit: 'Giorni',
      percentage: Math.min(100, (restDays / 2) * 100),
      description: `${restDays} giornate dedicate al recupero psicofisico`,
      status: restDays >= 2 ? 'Recupero garantito' : 'Monitorare recupero',
    },
    {
      id: 6,
      icon: CheckCircle2,
      label: 'Presenze',
      title: 'Presenze Timbrate',
      value: `${attendanceRate}%`,
      unit: 'Reg.',
      percentage: attendanceRate,
      description: `${clockedInCount} presenze convalidate su ${activeWorkShifts.length} turni`,
      status: clockedInCount === activeWorkShifts.length && activeWorkShifts.length > 0 ? 'Confermate 100%' : 'Da timbrare',
    },
  ];

  const currentMetric = metricsConfig[activeMetricIndex] || metricsConfig[1];

  // Tachometer geometry calculations (Semi-circle Arc)
  const radius = 80;
  const strokeWidth = 5;
  const arcLength = Math.PI * radius; // ~251.3
  const strokeDashoffset = arcLength * (1 - currentMetric.percentage / 100);

  // Minimalist key ticks (0%, 25%, 50%, 75%, 100%)
  const keyTicks = [0, 25, 50, 75, 100].map((pct) => {
    const angleDeg = 180 + (pct / 100) * 180;
    const rad = (angleDeg * Math.PI) / 180;
    const innerR = 70;
    const outerR = 75;
    const cx = 120;
    const cy = 110;
    return {
      pct,
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
      isPast: currentMetric.percentage >= pct,
    };
  });

  // Calculate needle pointer angle
  const needleAngle = 180 + (currentMetric.percentage / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleTipX = 120 + 72 * Math.cos(needleRad);
  const needleTipY = 110 + 72 * Math.sin(needleRad);

  const nextShift = shifts.find((s) => !s.isClockedIn && s.type !== 'riposo') || shifts[0];

  return (
    <div className="card-onyx rounded-[26px] p-6 shadow-2xl flex flex-col justify-between h-full relative overflow-hidden">
      {/* 1. Header with subtle indigo accent & Title */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#818CF8]">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">Carico & Recupero</h3>
              <p className="text-xs text-[#94A3B8]">Tachimetro operativo turni</p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#94A3B8] bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5">
            ONYX Gauge
          </span>
        </div>

        {/* 7 Circular micro-buttons with refined slate styling */}
        <div className="flex items-center justify-between gap-1 pb-4 border-b border-white/[0.06]">
          {metricsConfig.map((metric) => {
            const Icon = metric.icon;
            const isActive = activeMetricIndex === metric.id;

            return (
              <button
                key={metric.id}
                type="button"
                onClick={() => setActiveMetricIndex(metric.id)}
                title={`${metric.title}: ${metric.value}`}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25 ring-2 ring-white/30 scale-105'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 stroke-[2]" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Elegant, Minimalist Tachometer Arc */}
      <div className="my-auto py-3 flex flex-col items-center justify-center relative">
        {/* Metric title */}
        <span className="text-xs font-semibold text-[#94A3B8] tracking-wider uppercase mb-1">
          {currentMetric.title}
        </span>

        {/* Minimal SVG Tachometer */}
        <div className="relative w-64 h-36 flex items-end justify-center">
          <svg viewBox="0 0 240 120" className="w-full h-full overflow-visible">
            <defs>
              {/* Delicate Indigo to Slate Gradient */}
              <linearGradient id="gaugeArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="60%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>

              {/* Subtle Arc Glow Filter */}
              <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Background hairline guide track */}
            <path
              d="M 40 110 A 80 80 0 0 1 200 110"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Active delicate gradient arc */}
            <path
              d="M 40 110 A 80 80 0 0 1 200 110"
              fill="none"
              stroke="url(#gaugeArcGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter="url(#arcGlow)"
              className="transition-all duration-700 ease-out"
            />

            {/* Sleek Minimal Milestone Tick Marks */}
            {keyTicks.map((tick) => (
              <line
                key={tick.pct}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke={tick.isPast ? '#E2E8F0' : 'rgba(255, 255, 255, 0.15)'}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ))}

            {/* Refined Center Needle / Pivot Hub */}
            <circle cx="120" cy="110" r="4.5" fill="#161920" stroke="#E2E8F0" strokeWidth="2" />
            <line
              x1="120"
              y1="110"
              x2={needleTipX}
              y2={needleTipY}
              stroke="#E2E8F0"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out opacity-85"
            />
            <circle
              cx={needleTipX}
              cy={needleTipY}
              r="2.5"
              fill="#6366F1"
              stroke="#F8FAFC"
              strokeWidth="1"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Central Digital Readout (24-32px font) */}
          <div className="absolute bottom-1 flex flex-col items-center">
            <span className="text-3xl font-extrabold text-[#F8FAFC] font-mono tracking-tight tabular-nums">
              {currentMetric.value}
            </span>
            <span className="text-xs font-medium text-[#94A3B8] tracking-wide mt-0.5">
              {currentMetric.unit}
            </span>
          </div>
        </div>

        {/* Status pill with clean typographic hierarchy */}
        <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-[#E2E8F0]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6366F1]" />
          <span>{currentMetric.status}</span>
        </div>
      </div>

      {/* 3. Bottom Contextual Info Panel */}
      <div className="pt-4 border-t border-white/[0.06] space-y-3">
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          {currentMetric.description}
        </p>

        {nextShift && (
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-[11px] font-medium text-[#94A3B8] block">Prossimo turno</span>
              <span className="text-xs font-semibold text-[#F1F5F9] truncate block">
                {nextShift.title} ({nextShift.startTime} - {nextShift.endTime})
              </span>
            </div>

            <button
              type="button"
              onClick={() => toggleClockIn(nextShift.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                nextShift.isClockedIn
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 text-white shadow-md shadow-[#6366F1]/20'
              }`}
            >
              {nextShift.isClockedIn ? 'Timbrato ✓' : 'Timbra Ora'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
