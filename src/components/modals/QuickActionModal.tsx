import React, { useState } from 'react';
import { X, Wallet, CheckSquare, Activity, CalendarClock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HabitCategory, ReminderPriority, ReminderCategory, ShiftType, Transaction } from '../../types';

export const QuickActionModal: React.FC = () => {
  const {
    isQuickModalOpen,
    closeQuickModal,
    quickModalTab,
    setQuickModalTab,
    addTransaction,
    addReminder,
    addHabit,
    addShift
  } = useApp();

  // Spesa form
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<Transaction['category']>('alimentari');
  const [expenseType, setExpenseType] = useState<'expense' | 'income'>('expense');

  // Promemoria form
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderPriority, setReminderPriority] = useState<ReminderPriority>('media');
  const [reminderCategory, setReminderCategory] = useState<ReminderCategory>('personale');
  const [reminderDue, setReminderDue] = useState('Oggi');

  // Habit form
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCat, setHabitCat] = useState<HabitCategory>('sport');
  const [habitTarget, setHabitTarget] = useState('30 min');

  // Shift form
  const [shiftTitle, setShiftTitle] = useState('Turno Pomeriggio');
  const [shiftType, setShiftType] = useState<ShiftType>('pomeriggio');
  const [shiftDate, setShiftDate] = useState('2026-10-26');

  if (!isQuickModalOpen) return null;

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(expenseAmount);
    if (!expenseTitle.trim() || isNaN(val) || val <= 0) return;

    const categoryLabels: Record<Transaction['category'], string> = {
      casa: 'Casa & Utenze',
      alimentari: 'Spesa Alimentare',
      trasporti: 'Trasporti & Auto',
      svago: 'Svago & Ristoranti',
      salute: 'Salute & Sport',
      lavoro: 'Lavoro & Rimborsi',
      stipendio: 'Stipendio & Bonus',
    };

    addTransaction({
      title: expenseTitle.trim(),
      amount: val,
      category: expenseCategory,
      categoryLabel: categoryLabels[expenseCategory],
      date: 'Oggi',
      type: expenseType,
    });
    setExpenseTitle('');
    setExpenseAmount('');
    closeQuickModal();
  };

  const handleSubmitReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;
    addReminder({
      title: reminderTitle.trim(),
      priority: reminderPriority,
      category: reminderCategory,
      dueDate: reminderDue,
    });
    setReminderTitle('');
    closeQuickModal();
  };

  const handleSubmitHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    addHabit(habitTitle.trim(), habitCat, habitTarget);
    setHabitTitle('');
    closeQuickModal();
  };

  const handleSubmitShift = (e: React.FormEvent) => {
    e.preventDefault();
    addShift({
      date: shiftDate,
      dayLabel: 'Lun',
      dayNumber: parseInt(shiftDate.split('-')[2] || '26', 10),
      type: shiftType,
      title: shiftTitle,
      startTime: shiftType === 'mattina' ? '07:00' : shiftType === 'pomeriggio' ? '14:00' : '22:00',
      endTime: shiftType === 'mattina' ? '15:00' : shiftType === 'pomeriggio' ? '22:00' : '06:00',
      hours: 8,
      location: 'Presidio Ospedaliero Nord',
      isClockedIn: false,
    });
    closeQuickModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeQuickModal}
      />

      {/* Modal Container in Slate Premium Style */}
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#161920]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <h2 className="text-base font-bold text-[#F1F5F9]">
            Nuova Voce Rapida
          </h2>
          <button
            type="button"
            onClick={closeQuickModal}
            className="rounded-full p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.08] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="mt-5 grid grid-cols-4 gap-1 rounded-full border border-white/[0.08] bg-[#0D0F12]/80 p-1">
          <button
            type="button"
            onClick={() => setQuickModalTab('spesa')}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all cursor-pointer ${
              quickModalTab === 'spesa'
                ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Spesa</span>
          </button>

          <button
            type="button"
            onClick={() => setQuickModalTab('promemoria')}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all cursor-pointer ${
              quickModalTab === 'promemoria'
                ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Task</span>
          </button>

          <button
            type="button"
            onClick={() => setQuickModalTab('abitudine')}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all cursor-pointer ${
              quickModalTab === 'abitudine'
                ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Routine</span>
          </button>

          <button
            type="button"
            onClick={() => setQuickModalTab('turno')}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all cursor-pointer ${
              quickModalTab === 'turno'
                ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Turno</span>
          </button>
        </div>

        {/* Form Spesa */}
        {quickModalTab === 'spesa' && (
          <form onSubmit={handleSubmitExpense} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Descrizione Movimento
              </label>
              <input
                type="text"
                value={expenseTitle}
                onChange={e => setExpenseTitle(e.target.value)}
                placeholder="Es. Pranzo di lavoro"
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Importo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Tipologia
                </label>
                <select
                  value={expenseType}
                  onChange={e => setExpenseType(e.target.value as 'expense' | 'income')}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                >
                  <option value="expense">Uscita / Spesa (-)</option>
                  <option value="income">Entrata / Guadagno (+)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Categoria
              </label>
              <select
                value={expenseCategory}
                onChange={e => setExpenseCategory(e.target.value as Transaction['category'])}
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
              >
                <option value="alimentari">Spesa Alimentari</option>
                <option value="casa">Casa & Utenze</option>
                <option value="trasporti">Trasporti & Auto</option>
                <option value="svago">Svago & Ristoranti</option>
                <option value="salute">Salute & Sport</option>
                <option value="stipendio">Stipendio</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={closeQuickModal}
                className="rounded-full px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-white cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#6366F1]/20 cursor-pointer"
              >
                Salva Spesa
              </button>
            </div>
          </form>
        )}

        {/* Form Promemoria */}
        {quickModalTab === 'promemoria' && (
          <form onSubmit={handleSubmitReminder} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Cosa devi ricordare?
              </label>
              <input
                type="text"
                value={reminderTitle}
                onChange={e => setReminderTitle(e.target.value)}
                placeholder="Es. Invio turni ferie"
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Priorità
                </label>
                <select
                  value={reminderPriority}
                  onChange={e => setReminderPriority(e.target.value as ReminderPriority)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                >
                  <option value="urgente">Urgente</option>
                  <option value="media">Media</option>
                  <option value="bassa">Bassa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Scadenza
                </label>
                <input
                  type="text"
                  value={reminderDue}
                  onChange={e => setReminderDue(e.target.value)}
                  placeholder="Oggi / Domani"
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={closeQuickModal}
                className="rounded-full px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-white cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#6366F1]/20 cursor-pointer"
              >
                Crea Task
              </button>
            </div>
          </form>
        )}

        {/* Form Routine */}
        {quickModalTab === 'abitudine' && (
          <form onSubmit={handleSubmitHabit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Nome Routine
              </label>
              <input
                type="text"
                value={habitTitle}
                onChange={e => setHabitTitle(e.target.value)}
                placeholder="Es. Corsa 10km"
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Categoria
                </label>
                <select
                  value={habitCat}
                  onChange={e => setHabitCat(e.target.value as HabitCategory)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                >
                  <option value="sport">Sport</option>
                  <option value="salute">Salute</option>
                  <option value="benessere">Benessere</option>
                  <option value="produttivita">Produttività</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Obiettivo
                </label>
                <input
                  type="text"
                  value={habitTarget}
                  onChange={e => setHabitTarget(e.target.value)}
                  placeholder="Es. 30 min"
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={closeQuickModal}
                className="rounded-full px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-white cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#6366F1]/20 cursor-pointer"
              >
                Salva Routine
              </button>
            </div>
          </form>
        )}

        {/* Form Turno */}
        {quickModalTab === 'turno' && (
          <form onSubmit={handleSubmitShift} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Nome Turno
              </label>
              <input
                type="text"
                value={shiftTitle}
                onChange={e => setShiftTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Tipologia
                </label>
                <select
                  value={shiftType}
                  onChange={e => setShiftType(e.target.value as ShiftType)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                >
                  <option value="mattina">Mattina (07-15)</option>
                  <option value="pomeriggio">Pomeriggio (14-22)</option>
                  <option value="notte">Notte (22-06)</option>
                  <option value="riposo">Riposo</option>
                  <option value="reperibilita">Reperibilità</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={e => setShiftDate(e.target.value)}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={closeQuickModal}
                className="rounded-full px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-white cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#6366F1]/20 cursor-pointer"
              >
                Aggiungi Turno
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
