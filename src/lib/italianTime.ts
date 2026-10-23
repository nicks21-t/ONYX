import { useState, useEffect } from 'react';
import { Shift } from '../types/index';

export interface ItalianTimeInfo {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm:ss
  timeShort: string; // HH:mm
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hours: number;
  minutes: number;
  seconds: number;
  weekdayShort: string; // Lun, Mar, ...
  weekdayName: string; // Lunedì, Martedì, ...
  formattedFullDate: string; // es. "Venerdì 23 Ottobre 2026"
  totalSecondsToday: number;
}

export type ShiftPhase =
  | 'in_service'
  | 'upcoming_today'
  | 'completed_today'
  | 'rest_today'
  | 'no_shift_today';

export interface ShiftLiveStatus {
  phase: ShiftPhase;
  displayTitle: string;
  statusBadge: string;
  statusBadgeVariant: 'emerald' | 'indigo' | 'slate' | 'amber';
  countdownLabel: string;
  countdownFormatted: string;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  totalSecondsLeft: number;
  progressPercent: number; // 0 to 100
  progressLabel: string;
  targetShift: Shift | undefined;
  isCurrentlyActive: boolean;
}

const ITALIAN_WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const ITALIAN_WEEKDAYS_FULL = [
  'Domenica',
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato',
];
const ITALIAN_MONTHS_FULL = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

/**
 * Calcola la data e l'orario precisi nel fuso orario di Roma (Europe/Rome)
 */
export function getItalianTime(baseDate: Date = new Date()): ItalianTimeInfo {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(baseDate);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const year = parseInt(partMap.year || '2026', 10);
  const month = parseInt(partMap.month || '10', 10);
  const day = parseInt(partMap.day || '23', 10);
  const hours = parseInt(partMap.hour || '00', 10);
  const minutes = parseInt(partMap.minute || '00', 10);
  const seconds = parseInt(partMap.second || '00', 10);

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const timeShort = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  // Calcolo giorno della settimana per Roma
  const romeDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
  const dayOfWeek = romeDate.getUTCDay(); // 0 = Dom, 1 = Lun...

  const weekdayShort = ITALIAN_WEEKDAYS[dayOfWeek];
  const weekdayName = ITALIAN_WEEKDAYS_FULL[dayOfWeek];
  const monthName = ITALIAN_MONTHS_FULL[month - 1];
  const formattedFullDate = `${weekdayName} ${day} ${monthName} ${year}`;
  const totalSecondsToday = hours * 3600 + minutes * 60 + seconds;

  return {
    date: baseDate,
    dateStr,
    timeStr,
    timeShort,
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    weekdayShort,
    weekdayName,
    formattedFullDate,
    totalSecondsToday,
  };
}

/**
 * Hook per aggiornare l'orario italiano in tempo reale ogni secondo (1000ms)
 */
export function useItalianLiveClock(): ItalianTimeInfo {
  const [italianTime, setItalianTime] = useState<ItalianTimeInfo>(() => getItalianTime());

  useEffect(() => {
    // Sincronizza al secondo
    const interval = setInterval(() => {
      setItalianTime(getItalianTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return italianTime;
}

/**
 * Converte stringa orario "HH:mm" in secondi dal principio del giorno
 */
export function parseTimeToSeconds(timeStr?: string): number | null {
  if (!timeStr || timeStr === '-' || timeStr.trim() === '') return null;
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return parts[0] * 3600 + parts[1] * 60;
}

/**
 * Formatta secondi in stringa leggibile "XXh YYm ZZs" o "XXh YYm"
 */
export function formatSecondsCountdown(totalSec: number, includeSeconds = true): string {
  if (totalSec <= 0) return includeSeconds ? '00h 00m 00s' : '00h 00m';
  const days = Math.floor(totalSec / 86400);
  const remainingSecAfterDays = totalSec % 86400;
  const hours = Math.floor(remainingSecAfterDays / 3600);
  const minutes = Math.floor((remainingSecAfterDays % 3600) / 60);
  const seconds = remainingSecAfterDays % 60;

  if (days > 0) {
    if (includeSeconds) {
      return `${days}g ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `${days}g ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
  }

  if (includeSeconds) {
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

/**
 * Calcola lo stato live del turno e il conto alla rovescia dinamico
 * sincronizzato con il fuso orario italiano
 */
export function calculateShiftLiveStatus(
  shifts: Shift[],
  italianTime: ItalianTimeInfo
): ShiftLiveStatus {
  const { dateStr, totalSecondsToday, year, month, day } = italianTime;

  // Calcolo data del giorno precedente
  const prevDateObj = new Date(Date.UTC(year, month - 1, day - 1));
  const prevYear = prevDateObj.getUTCFullYear();
  const prevMonth = String(prevDateObj.getUTCMonth() + 1).padStart(2, '0');
  const prevDay = String(prevDateObj.getUTCDate()).padStart(2, '0');
  const prevDateStr = `${prevYear}-${prevMonth}-${prevDay}`;

  const yesterdayShift = shifts.find((s) => s.date === prevDateStr);
  const todayShift = shifts.find((s) => s.date === dateStr);

  // 1. Controllo se c'è un turno NOTTURNO di ieri che attraversa la mezzanotte ed è ancora attivo
  if (yesterdayShift && yesterdayShift.type === 'notte') {
    const yStartSec = parseTimeToSeconds(yesterdayShift.startTime) ?? 22 * 3600;
    const yEndSec = parseTimeToSeconds(yesterdayShift.endTime) ?? 6 * 3600;

    // Se il turno notturno termina oggi (es. 06:00) e siamo prima della fine
    if (totalSecondsToday < yEndSec) {
      const totalShiftDuration = 86400 - yStartSec + yEndSec; // es. 2h + 6h = 8h (28800s)
      const elapsed = 86400 - yStartSec + totalSecondsToday;
      const remainingSec = Math.max(0, yEndSec - totalSecondsToday);
      const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalShiftDuration) * 100)));

      return {
        phase: 'in_service',
        displayTitle: `In Servizio: ${yesterdayShift.title} (${yesterdayShift.startTime} - ${yesterdayShift.endTime})`,
        statusBadge: 'LIVE IN SERVIZIO',
        statusBadgeVariant: 'emerald',
        countdownLabel: 'Fine Turno Notturno',
        countdownFormatted: formatSecondsCountdown(remainingSec, true),
        hoursLeft: Math.floor(remainingSec / 3600),
        minutesLeft: Math.floor((remainingSec % 3600) / 60),
        secondsLeft: remainingSec % 60,
        totalSecondsLeft: remainingSec,
        progressPercent,
        progressLabel: `${progressPercent}% completato · Smonto alle ${yesterdayShift.endTime}`,
        targetShift: yesterdayShift,
        isCurrentlyActive: true,
      };
    }
  }

  // 2. Controllo il turno di oggi
  if (todayShift) {
    if (todayShift.type === 'riposo') {
      // Oggi è giorno di riposo/smonto
      // Trova il prossimo turno attivo
      const nextShift = findNextActiveShift(shifts, dateStr);
      const nextCountdown = calculateSecondsUntilNextShift(nextShift, italianTime);

      return {
        phase: 'rest_today',
        displayTitle: `Oggi: ${todayShift.title} (Riposo / Smonto)`,
        statusBadge: 'RIPOSO PROGRAMMATO',
        statusBadgeVariant: 'slate',
        countdownLabel: nextShift ? `Al Prossimo Turno (${nextShift.dayLabel} ${nextShift.dayNumber})` : 'Al Prossimo Turno',
        countdownFormatted: formatSecondsCountdown(nextCountdown, true),
        hoursLeft: Math.floor(nextCountdown / 3600),
        minutesLeft: Math.floor((nextCountdown % 3600) / 60),
        secondsLeft: nextCountdown % 60,
        totalSecondsLeft: nextCountdown,
        progressPercent: 100,
        progressLabel: 'Recupero psicofisico e riposo',
        targetShift: todayShift,
        isCurrentlyActive: false,
      };
    }

    const startSec = parseTimeToSeconds(todayShift.startTime);
    const endSec = parseTimeToSeconds(todayShift.endTime);

    if (startSec !== null && endSec !== null) {
      // Caso turno notturno iniziato oggi (es. 22:00 - 06:00)
      if (startSec > endSec) {
        if (totalSecondsToday < startSec) {
          // Non è ancora iniziato
          const secUntilStart = startSec - totalSecondsToday;
          return {
            phase: 'upcoming_today',
            displayTitle: `Prossimo Turno Oggi: ${todayShift.title} (${todayShift.startTime} - ${todayShift.endTime})`,
            statusBadge: 'IN ATTESA DI INIZIO',
            statusBadgeVariant: 'indigo',
            countdownLabel: `Inizio Turno (${todayShift.startTime})`,
            countdownFormatted: formatSecondsCountdown(secUntilStart, true),
            hoursLeft: Math.floor(secUntilStart / 3600),
            minutesLeft: Math.floor((secUntilStart % 3600) / 60),
            secondsLeft: secUntilStart % 60,
            totalSecondsLeft: secUntilStart,
            progressPercent: 0,
            progressLabel: `Inizio alle ${todayShift.startTime} · ${todayShift.location}`,
            targetShift: todayShift,
            isCurrentlyActive: false,
          };
        } else {
          // Iniziato oggi ed è in corso (dalle 22:00 alla mezzanotte)
          const totalShiftDuration = 86400 - startSec + endSec;
          const elapsed = totalSecondsToday - startSec;
          const remainingSec = 86400 - totalSecondsToday + endSec;
          const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalShiftDuration) * 100)));

          return {
            phase: 'in_service',
            displayTitle: `In Servizio: ${todayShift.title} (${todayShift.startTime} - ${todayShift.endTime})`,
            statusBadge: 'LIVE IN SERVIZIO',
            statusBadgeVariant: 'emerald',
            countdownLabel: 'Fine Turno Notturno',
            countdownFormatted: formatSecondsCountdown(remainingSec, true),
            hoursLeft: Math.floor(remainingSec / 3600),
            minutesLeft: Math.floor((remainingSec % 3600) / 60),
            secondsLeft: remainingSec % 60,
            totalSecondsLeft: remainingSec,
            progressPercent,
            progressLabel: `${progressPercent}% svolto · Smonto alle ${todayShift.endTime}`,
            targetShift: todayShift,
            isCurrentlyActive: true,
          };
        }
      }

      // Caso turno diurno normale (es. 07:00 - 15:00 o 14:00 - 22:00)
      if (totalSecondsToday < startSec) {
        // Non è ancora iniziato
        const secUntilStart = startSec - totalSecondsToday;
        return {
          phase: 'upcoming_today',
          displayTitle: `Prossimo Turno Oggi: ${todayShift.title} (${todayShift.startTime} - ${todayShift.endTime})`,
          statusBadge: 'IN ATTESA DI INIZIO',
          statusBadgeVariant: 'indigo',
          countdownLabel: `Inizio Turno (${todayShift.startTime})`,
          countdownFormatted: formatSecondsCountdown(secUntilStart, true),
          hoursLeft: Math.floor(secUntilStart / 3600),
          minutesLeft: Math.floor((secUntilStart % 3600) / 60),
          secondsLeft: secUntilStart % 60,
          totalSecondsLeft: secUntilStart,
          progressPercent: 0,
          progressLabel: `Inizio alle ${todayShift.startTime} · ${todayShift.location}`,
          targetShift: todayShift,
          isCurrentlyActive: false,
        };
      } else if (totalSecondsToday >= startSec && totalSecondsToday < endSec) {
        // In corso ora
        const totalDuration = endSec - startSec;
        const elapsed = totalSecondsToday - startSec;
        const remainingSec = endSec - totalSecondsToday;
        const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

        return {
          phase: 'in_service',
          displayTitle: `In Servizio: ${todayShift.title} (${todayShift.startTime} - ${todayShift.endTime})`,
          statusBadge: 'LIVE IN SERVIZIO',
          statusBadgeVariant: 'emerald',
          countdownLabel: 'Fine Turno',
          countdownFormatted: formatSecondsCountdown(remainingSec, true),
          hoursLeft: Math.floor(remainingSec / 3600),
          minutesLeft: Math.floor((remainingSec % 3600) / 60),
          secondsLeft: remainingSec % 60,
          totalSecondsLeft: remainingSec,
          progressPercent,
          progressLabel: `${progressPercent}% svolto · Termine alle ${todayShift.endTime}`,
          targetShift: todayShift,
          isCurrentlyActive: true,
        };
      } else {
        // Terminato per oggi
        const nextShift = findNextActiveShift(shifts, dateStr);
        const nextCountdown = calculateSecondsUntilNextShift(nextShift, italianTime);

        return {
          phase: 'completed_today',
          displayTitle: `Turno Concluso: ${todayShift.title} (Terminato alle ${todayShift.endTime})`,
          statusBadge: 'TURNO COMPLETATO',
          statusBadgeVariant: 'slate',
          countdownLabel: nextShift ? `Al Prossimo Turno (${nextShift.dayLabel} ${nextShift.dayNumber})` : 'Al Prossimo Turno',
          countdownFormatted: formatSecondsCountdown(nextCountdown, true),
          hoursLeft: Math.floor(nextCountdown / 3600),
          minutesLeft: Math.floor((nextCountdown % 3600) / 60),
          secondsLeft: nextCountdown % 60,
          totalSecondsLeft: nextCountdown,
          progressPercent: 100,
          progressLabel: `Turno terminato con successo alle ${todayShift.endTime}`,
          targetShift: todayShift,
          isCurrentlyActive: false,
        };
      }
    }
  }

  // 3. Nessun turno programmato per oggi
  const nextShift = findNextActiveShift(shifts, dateStr);
  const nextCountdown = calculateSecondsUntilNextShift(nextShift, italianTime);

  return {
    phase: 'no_shift_today',
    displayTitle: 'Nessun turno in programma per oggi',
    statusBadge: 'NESSUN TURNO',
    statusBadgeVariant: 'slate',
    countdownLabel: nextShift ? `Al Prossimo Turno (${nextShift.dayLabel} ${nextShift.dayNumber})` : 'Pianificazione',
    countdownFormatted: formatSecondsCountdown(nextCountdown, true),
    hoursLeft: Math.floor(nextCountdown / 3600),
    minutesLeft: Math.floor((nextCountdown % 3600) / 60),
    secondsLeft: nextCountdown % 60,
    totalSecondsLeft: nextCountdown,
    progressPercent: 0,
    progressLabel: nextShift ? `Prossimo turno il ${nextShift.date} alle ${nextShift.startTime}` : 'Nessun turno futuro trovato',
    targetShift: nextShift,
    isCurrentlyActive: false,
  };
}

/**
 * Trova il prossimo turno lavorativo attivo successivo alla data indicata
 */
function findNextActiveShift(shifts: Shift[], afterDateStr: string): Shift | undefined {
  const futureShifts = shifts
    .filter((s) => s.date > afterDateStr && s.type !== 'riposo')
    .sort((a, b) => a.date.localeCompare(b.date));

  return futureShifts[0];
}

/**
 * Calcola i secondi rimanenti all'inizio del prossimo turno futuro
 */
function calculateSecondsUntilNextShift(
  nextShift: Shift | undefined,
  italianTime: ItalianTimeInfo
): number {
  if (!nextShift) return 3600 * 24; // Default fallback 24h

  const targetDateParts = nextShift.date.split('-').map(Number);
  const startSec = parseTimeToSeconds(nextShift.startTime) ?? 7 * 3600;
  const startHours = Math.floor(startSec / 3600);
  const startMinutes = Math.floor((startSec % 3600) / 60);

  // Timestamp approssimato
  const nowUtcMs = Date.UTC(
    italianTime.year,
    italianTime.month - 1,
    italianTime.day,
    italianTime.hours,
    italianTime.minutes,
    italianTime.seconds
  );

  const targetUtcMs = Date.UTC(
    targetDateParts[0],
    targetDateParts[1] - 1,
    targetDateParts[2],
    startHours,
    startMinutes,
    0
  );

  const diffSec = Math.max(0, Math.floor((targetUtcMs - nowUtcMs) / 1000));
  return diffSec;
}
