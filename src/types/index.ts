export type SectionId = 'panoramica' | 'lavoro' | 'routine' | 'finanze' | 'promemoria';

export type ShiftType = 'mattina' | 'pomeriggio' | 'notte' | 'riposo' | 'reperibilita';

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  dayLabel: string; // 'Lun', 'Mar', etc.
  dayNumber: number; // 21, 22...
  type: ShiftType;
  title: string;
  startTime: string;
  endTime: string;
  hours: number;
  location: string;
  colleagues?: string[];
  notes?: string;
  isClockedIn?: boolean;
}

export type HabitCategory = 'sport' | 'benessere' | 'produttivita' | 'salute';

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  target: string;
  completed: boolean;
  streak: number;
  timeSlot?: string;
  calories?: number;
}

export interface Transaction {
  id: string;
  title: string;
  category: 'casa' | 'alimentari' | 'trasporti' | 'svago' | 'salute' | 'lavoro' | 'stipendio';
  categoryLabel: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

export interface BudgetCategory {
  id: string;
  name: string;
  spent: number;
  budget: number;
  color: string;
}

export type ReminderPriority = 'urgente' | 'media' | 'bassa';
export type ReminderCategory = 'lavoro' | 'personale' | 'finanze' | 'salute';

export interface Reminder {
  id: string;
  title: string;
  category: ReminderCategory;
  priority: ReminderPriority;
  dueDate: string;
  dueTime?: string;
  completed: boolean;
}

export interface DailyActivityMetric {
  day: string;
  workHours: number;
  sportMinutes: number;
  recoveryScore: number;
}
