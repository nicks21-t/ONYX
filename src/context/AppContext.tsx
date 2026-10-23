import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SectionId,
  Shift,
  ShiftType,
  Habit,
  Transaction,
  BudgetCategory,
  Reminder,
  DailyActivityMetric
} from '../types';
import {
  initialShifts,
  initialHabits,
  initialBudgetCategories,
  initialTransactions,
  initialReminders,
  weeklyActivityData
} from '../data/initialData';
import { useAuth } from './AuthContext';
import {
  fetchUserSpese,
  fetchUserTurni,
  insertDbSpesa,
  insertDbTurno,
  DbSpesa,
  DbTurno
} from '../lib/supabase';

const categoryLabels: Record<string, string> = {
  casa: 'Casa & Utenze',
  alimentari: 'Spesa Alimentare',
  trasporti: 'Trasporti & Auto',
  svago: 'Svago & Ristoranti',
  salute: 'Salute & Sport',
  lavoro: 'Lavoro & Rimborsi',
  stipendio: 'Stipendio & Bonus',
};

const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

const getDayInfo = (dateStr: string) => {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return {
        dayLabel: dayNames[d.getDay()] || 'Lun',
        dayNumber: day,
      };
    }
  } catch {
    // fallback
  }
  return { dayLabel: 'Oggi', dayNumber: 21 };
};

const calculateHours = (start?: string, end?: string, type?: string) => {
  if (type === 'riposo') return 0;
  if (!start || !end) return 8;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = (eh + (em || 0) / 60) - (sh + (sm || 0) / 60);
  if (diff <= 0) diff += 24;
  return Math.round(diff * 10) / 10;
};

const mapDbSpesaToTransaction = (s: DbSpesa): Transaction => ({
  id: s.id || `spesa-${Date.now()}-${Math.random()}`,
  title: s.descrizione || 'Spesa',
  amount: Number(s.importo) || 0,
  category: (s.categoria as Transaction['category']) || 'alimentari',
  categoryLabel: categoryLabels[s.categoria] || s.categoria || 'Spesa',
  date: s.data || 'Oggi',
  type: s.categoria === 'stipendio' || s.categoria === 'lavoro' ? 'income' : 'expense',
});

const mapDbTurnoToShift = (t: DbTurno): Shift => {
  const { dayLabel, dayNumber } = getDayInfo(t.data);
  const type = (t.tipo_turno as ShiftType) || 'pomeriggio';
  const hours = calculateHours(t.orario_inizio, t.orario_fine, type);
  const typeFormatted = type.charAt(0).toUpperCase() + type.slice(1);

  return {
    id: t.id || `turno-${Date.now()}-${Math.random()}`,
    date: t.data,
    dayLabel,
    dayNumber,
    type,
    title: `Turno ${typeFormatted}`,
    startTime: t.orario_inizio || '14:00',
    endTime: t.orario_fine || '22:00',
    hours,
    location: t.note || 'Presidio Ospedaliero Nord',
    notes: t.note || '',
    colleagues: ['Marco V.', 'Sara Conti'],
    isClockedIn: false,
  };
};

interface AppContextType {
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Shifts
  shifts: Shift[];
  selectedShiftId: string;
  setSelectedShiftId: (id: string) => void;
  toggleClockIn: (shiftId: string) => void;
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (shift: Shift) => Promise<void>;
  bulkSetShifts: (shifts: Shift[]) => Promise<void>;
  deleteShift: (id: string) => void;

  // Habits
  habits: Habit[];
  toggleHabit: (id: string) => void;
  addHabit: (title: string, category: Habit['category'], target: string) => void;

  // Finances
  transactions: Transaction[];
  budgetCategories: BudgetCategory[];
  updateBudgetCategory: (id: string, newBudget: number) => void;
  updateAllBudgetCategories: (newCategories: BudgetCategory[]) => void;
  savingsGoal: number;
  updateSavingsGoal: (newGoal: number) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;

  // Reminders
  reminders: Reminder[];
  toggleReminder: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
  deleteReminder: (id: string) => void;

  // Chart data
  activityData: DailyActivityMetric[];

  // Modal
  isQuickModalOpen: boolean;
  openQuickModal: (defaultTab?: 'spesa' | 'promemoria' | 'abitudine' | 'turno') => void;
  closeQuickModal: () => void;
  quickModalTab: 'spesa' | 'promemoria' | 'abitudine' | 'turno';
  setQuickModalTab: (tab: 'spesa' | 'promemoria' | 'abitudine' | 'turno') => void;

  // Sync state & Toast feedback
  isLoadingData: boolean;
  syncUserData: () => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState<SectionId>('panoramica');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Dark mode initialization
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chronos-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('chronos-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('chronos-theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  // Core State Collections
  const isDemo = user?.id === 'demo-user-123';

  // Core State Collections: empty by default for real users, sample data only for explicit Demo user
  const [shifts, setShifts] = useState<Shift[]>(() => (isDemo ? initialShifts : []));
  const [selectedShiftId, setSelectedShiftId] = useState<string>(() => (isDemo ? 's-3' : ''));
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (isDemo) return initialHabits;
    if (user?.id) {
      try {
        const stored = localStorage.getItem(`onyx_habits_${user.id}`);
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => (isDemo ? initialTransactions : []));
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(() => {
    if (user?.id) {
      try {
        const stored = localStorage.getItem(`onyx_budget_caps_${user.id}`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return initialBudgetCategories;
  });
  const [savingsGoal, setSavingsGoal] = useState<number>(() => {
    if (user?.id) {
      try {
        const stored = localStorage.getItem(`onyx_savings_goal_${user.id}`);
        if (stored) return parseFloat(stored);
      } catch {}
    }
    return 10000;
  });
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    if (isDemo) return initialReminders;
    if (user?.id) {
      try {
        const stored = localStorage.getItem(`onyx_reminders_${user.id}`);
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return [];
  });
  const [activityData] = useState<DailyActivityMetric[]>(weeklyActivityData);

  // Modal state
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [quickModalTab, setQuickModalTab] = useState<'spesa' | 'promemoria' | 'abitudine' | 'turno'>('spesa');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const openQuickModal = (defaultTab: 'spesa' | 'promemoria' | 'abitudine' | 'turno' = 'spesa') => {
    setQuickModalTab(defaultTab);
    setIsQuickModalOpen(true);
  };

  const closeQuickModal = () => setIsQuickModalOpen(false);

  // Sync / Load user-specific records from Supabase
  const syncUserData = useCallback(async () => {
    if (!user?.id) {
      setShifts([]);
      setTransactions([]);
      setHabits([]);
      setReminders([]);
      return;
    }

    // Demo Mode user gets pre-filled demo data
    if (user.id === 'demo-user-123') {
      setShifts(initialShifts);
      setTransactions(initialTransactions);
      setHabits(initialHabits);
      setReminders(initialReminders);
      setSelectedShiftId('s-3');
      return;
    }

    // Real authenticated user: load habits and reminders from their private storage
    try {
      const storedH = localStorage.getItem(`onyx_habits_${user.id}`);
      setHabits(storedH ? JSON.parse(storedH) : []);
      const storedR = localStorage.getItem(`onyx_reminders_${user.id}`);
      setReminders(storedR ? JSON.parse(storedR) : []);
    } catch {
      // ignore
    }

    setIsLoadingData(true);
    try {
      // Fetch only the authenticated user's records from Supabase
      const [userTurni, userSpese] = await Promise.all([
        fetchUserTurni(user.id),
        fetchUserSpese(user.id),
      ]);

      if (userTurni && userTurni.length > 0) {
        const mapped = userTurni.map(mapDbTurnoToShift);
        setShifts(mapped);
        setSelectedShiftId(mapped[0]?.id || '');
      } else {
        // New user has an empty roster to fill
        setShifts([]);
        setSelectedShiftId('');
      }

      if (userSpese && userSpese.length > 0) {
        setTransactions(userSpese.map(mapDbSpesaToTransaction));
      } else {
        // New user starts with empty transactions
        setTransactions([]);
      }
    } catch (err) {
      console.error('Errore durante syncUserData:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [user?.id]);

  useEffect(() => {
    syncUserData();
  }, [syncUserData]);

  // Shift methods
  const toggleClockIn = (shiftId: string) => {
    setShifts(prev =>
      prev.map(s => {
        if (s.id === shiftId) {
          const next = !s.isClockedIn;
          showToast(next ? `Presenza registrata per ${s.title}` : `Timbratura uscita registrata`);
          return { ...s, isClockedIn: next };
        }
        return s;
      })
    );
  };

  const addShift = async (shift: Omit<Shift, 'id'>) => {
    const tempId = `s-${Date.now()}`;
    const newShift: Shift = {
      ...shift,
      id: tempId,
    };
    setShifts(prev => [...prev, newShift]);

    if (user?.id) {
      const dbRecord: DbTurno = {
        user_id: user.id,
        data: shift.date,
        tipo_turno: shift.type,
        orario_inizio: shift.startTime,
        orario_fine: shift.endTime,
        note: shift.notes ? `${shift.location} - ${shift.notes}` : shift.location,
      };

      const saved = await insertDbTurno(dbRecord);
      if (saved?.id) {
        setShifts(prev => prev.map(s => (s.id === tempId ? { ...s, id: saved.id! } : s)));
        showToast(`Turno salvato su Supabase (${shift.date})`);
        return;
      }
    }

    showToast('Nuovo turno aggiunto al calendario');
  };

  const updateShift = async (updated: Shift) => {
    setShifts(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    if (user?.id && user.id !== 'demo-user-123') {
      try {
        localStorage.setItem(`onyx_shifts_${user.id}`, JSON.stringify(
          shifts.map(s => (s.id === updated.id ? updated : s))
        ));
      } catch {}
    }
    showToast(`Turno del ${updated.date} aggiornato`);
  };

  const bulkSetShifts = async (newShifts: Shift[]) => {
    setShifts(newShifts);
    if (user?.id && user.id !== 'demo-user-123') {
      try {
        localStorage.setItem(`onyx_shifts_${user.id}`, JSON.stringify(newShifts));
      } catch {}
    }
    showToast(`Roster mensile configurato (${newShifts.length} turni generati)`);
  };

  const deleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    showToast('Turno rimosso dal roster');
  };

  // Habit methods
  const toggleHabit = (id: string) => {
    setHabits(prev => {
      const updated = prev.map(h => {
        if (h.id === id) {
          const next = !h.completed;
          showToast(next ? `Completato: "${h.title}"` : `Riaperto: "${h.title}"`);
          return {
            ...h,
            completed: next,
            streak: next ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      });
      if (user?.id && user.id !== 'demo-user-123') {
        try { localStorage.setItem(`onyx_habits_${user.id}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  const addHabit = (title: string, category: Habit['category'], target: string) => {
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      title,
      category,
      target,
      completed: false,
      streak: 1,
    };
    setHabits(prev => {
      const updated = [newHabit, ...prev];
      if (user?.id && user.id !== 'demo-user-123') {
        try { localStorage.setItem(`onyx_habits_${user.id}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
    showToast(`Nuova routine creata: ${title}`);
  };

  // Transaction calculations & methods
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBudget = budgetCategories.reduce((sum, b) => sum + b.budget, 0);
  const remainingBudget = Math.max(0, totalBudget - totalExpenses);

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const tempId = `t-${Date.now()}`;
    const newTx: Transaction = {
      ...tx,
      id: tempId,
    };
    setTransactions(prev => [newTx, ...prev]);

    if (user?.id) {
      const dbSpesa: DbSpesa = {
        user_id: user.id,
        importo: tx.amount,
        categoria: tx.category,
        data: tx.date.includes('202') ? tx.date : new Date().toISOString().split('T')[0],
        descrizione: tx.title,
      };

      const saved = await insertDbSpesa(dbSpesa);
      if (saved?.id) {
        setTransactions(prev =>
          prev.map(item => (item.id === tempId ? { ...item, id: saved.id! } : item))
        );
        showToast(`Spesa registrata su Supabase (€${tx.amount.toFixed(2)})`);
        return;
      }
    }

    showToast(`Registrato: ${tx.title} (€${tx.amount.toFixed(2)})`);
  };

  const updateBudgetCategory = (id: string, newBudget: number) => {
    setBudgetCategories(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, budget: newBudget } : c));
      if (user?.id) {
        try { localStorage.setItem(`onyx_budget_caps_${user.id}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
    showToast('Tetto di spesa aggiornato');
  };

  const updateAllBudgetCategories = (newCategories: BudgetCategory[]) => {
    setBudgetCategories(newCategories);
    if (user?.id) {
      try { localStorage.setItem(`onyx_budget_caps_${user.id}`, JSON.stringify(newCategories)); } catch {}
    }
    showToast('Tutti i tetti di spesa sono stati salvati');
  };

  const updateSavingsGoal = (newGoal: number) => {
    setSavingsGoal(newGoal);
    if (user?.id) {
      try { localStorage.setItem(`onyx_savings_goal_${user.id}`, String(newGoal)); } catch {}
    }
    showToast('Obiettivo di risparmio aggiornato');
  };

  // Reminder methods
  const toggleReminder = (id: string) => {
    setReminders(prev => {
      const updated = prev.map(r => {
        if (r.id === id) {
          const next = !r.completed;
          showToast(next ? `Promemoria completato` : `Promemoria riaperto`);
          return { ...r, completed: next };
        }
        return r;
      });
      if (user?.id && user.id !== 'demo-user-123') {
        try { localStorage.setItem(`onyx_reminders_${user.id}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  const addReminder = (reminder: Omit<Reminder, 'id' | 'completed'>) => {
    const newR: Reminder = {
      ...reminder,
      id: `r-${Date.now()}`,
      completed: false,
    };
    setReminders(prev => {
      const updated = [newR, ...prev];
      if (user?.id && user.id !== 'demo-user-123') {
        try { localStorage.setItem(`onyx_reminders_${user.id}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
    showToast(`Promemoria aggiunto: ${reminder.title}`);
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => {
      const updated = prev.filter(r => r.id !== id);
      if (user?.id && user.id !== 'demo-user-123') {
        try { localStorage.setItem(`onyx_reminders_${user.id}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
    showToast('Promemoria rimosso');
  };

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection,
        isDark,
        toggleDarkMode,
        sidebarOpen,
        setSidebarOpen,
        shifts,
        selectedShiftId,
        setSelectedShiftId,
        toggleClockIn,
        addShift,
        updateShift,
        bulkSetShifts,
        deleteShift,
        habits,
        toggleHabit,
        addHabit,
        transactions,
        budgetCategories,
        updateBudgetCategory,
        updateAllBudgetCategories,
        savingsGoal,
        updateSavingsGoal,
        addTransaction,
        totalIncome,
        totalExpenses,
        remainingBudget,
        reminders,
        toggleReminder,
        addReminder,
        deleteReminder,
        activityData,
        isQuickModalOpen,
        openQuickModal,
        closeQuickModal,
        quickModalTab,
        setQuickModalTab,
        isLoadingData,
        syncUserData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
