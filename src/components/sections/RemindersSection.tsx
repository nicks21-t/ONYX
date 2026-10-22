import React, { useState } from 'react';
import {
  CheckSquare,
  Check,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReminderPriority, ReminderCategory } from '../../types';

export const RemindersSection: React.FC = () => {
  const { reminders, toggleReminder, addReminder, deleteReminder } = useApp();
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'urgent' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<ReminderPriority>('media');
  const [newCategory, setNewCategory] = useState<ReminderCategory>('personale');
  const [newDueDate, setNewDueDate] = useState('Oggi');
  const [newDueTime, setNewDueTime] = useState('');

  const filteredReminders = reminders.filter(r => {
    if (filterTab === 'pending') return !r.completed;
    if (filterTab === 'urgent') return !r.completed && r.priority === 'urgente';
    if (filterTab === 'completed') return r.completed;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addReminder({
      title: newTitle.trim(),
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate,
      dueTime: newDueTime || undefined,
    });

    setNewTitle('');
    setNewDueTime('');
    setIsAdding(false);
  };

  const pendingCount = reminders.filter(r => !r.completed).length;
  const urgentCount = reminders.filter(r => !r.completed && r.priority === 'urgente').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Promemoria & Scadenze
          </h1>
          <p className="text-xs text-zinc-400">
            {pendingCount} task attive ({urgentCount} priorità urgente)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 rounded-full bg-[#ff5e1e] hover:bg-[#ff7844] px-5 py-2 text-xs font-bold text-white shadow-xl shadow-[#ff5e1e]/30 transition-all self-start sm:self-auto cursor-pointer ring-1 ring-white/20"
        >
          <Plus className="h-4 w-4" />
          <span>Nuovo Promemoria</span>
        </button>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="rounded-3xl border border-white/15 bg-black/60 backdrop-blur-2xl p-6 sm:p-8 space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white">
              Crea Promemoria o Scadenza
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Annulla
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Cosa devi ricordare?
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Es. Invio cartella clinica"
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Priorità
              </label>
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as ReminderPriority)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
              >
                <option value="urgente">Urgente</option>
                <option value="media">Media</option>
                <option value="bassa">Bassa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Categoria
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as ReminderCategory)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
              >
                <option value="lavoro">Lavoro</option>
                <option value="personale">Personale</option>
                <option value="finanze">Finanze</option>
                <option value="salute">Salute</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Data Scadenza
              </label>
              <input
                type="text"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                placeholder="Oggi / 25 Ottobre"
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Orario Opzionale
              </label>
              <input
                type="time"
                value={newDueTime}
                onChange={e => setNewDueTime(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-full px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#ff5e1e] px-5 py-2 text-xs font-bold text-white hover:bg-[#ff7844] cursor-pointer"
            >
              Crea Promemoria
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs (Glassmorphic pill style) */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-xl p-1.5 max-w-fit shadow-xl">
        {[
          { id: 'all', label: 'Tutti', count: reminders.length },
          { id: 'pending', label: 'Da Fare', count: pendingCount },
          { id: 'urgent', label: 'Urgenti', count: urgentCount },
          { id: 'completed', label: 'Completati', count: reminders.length - pendingCount },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id as typeof filterTab)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterTab === tab.id
                ? 'bg-white text-black shadow-lg ring-1 ring-white'
                : 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono tabular-nums ${
                filterTab === tab.id ? 'bg-black/15 text-black font-bold' : 'bg-white/10 text-zinc-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
        <div className="divide-y divide-white/5">
          {filteredReminders.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-3">
                <CheckSquare className="h-6 w-6 text-[#ff5e1e]" />
              </div>
              <p className="text-sm font-semibold text-white">Nessun promemoria presente</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                La tua lista delle attività è vuota. Clicca su "+ Nuovo Promemoria" per inserire la prima scadenza.
              </p>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="mt-4 rounded-full bg-[#ff5e1e] hover:bg-[#ff7844] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#ff5e1e]/30 cursor-pointer"
              >
                + Crea primo promemoria
              </button>
            </div>
          ) : (
            filteredReminders.map(reminder => (
              <div
                key={reminder.id}
                className={`flex items-start justify-between py-4 transition-colors ${
                  reminder.completed ? 'opacity-40' : ''
                }`}
              >
              <div className="flex items-start gap-3.5 flex-1 min-w-0 pr-4">
                <button
                  type="button"
                  onClick={() => toggleReminder(reminder.id)}
                  aria-label={`Completa ${reminder.title}`}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer ${
                    reminder.completed
                      ? 'border-[#ff5e1e] bg-[#ff5e1e] text-white shadow-lg shadow-[#ff5e1e]/40'
                      : 'border-zinc-500 bg-transparent hover:border-white'
                  }`}
                >
                  {reminder.completed && <Check className="h-3 w-3 stroke-[3]" />}
                </button>

                <div className="space-y-1.5 min-w-0">
                  <p
                    onClick={() => toggleReminder(reminder.id)}
                    className={`cursor-pointer text-sm font-bold leading-relaxed ${
                      reminder.completed ? 'line-through text-zinc-500' : 'text-white'
                    }`}
                  >
                    {reminder.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-0.5 text-zinc-300 capitalize font-medium">
                      {reminder.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider text-[10px] ${
                        reminder.priority === 'urgente'
                          ? 'bg-[#ff5e1e]/20 text-[#ff7844] border border-[#ff5e1e]/40'
                          : reminder.priority === 'media'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-white/[0.06] text-zinc-300 border border-white/10'
                      }`}
                    >
                      {reminder.priority}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Clock className="h-3 w-3 text-zinc-400" />
                      <span>{reminder.dueDate} {reminder.dueTime ? `alle ${reminder.dueTime}` : ''}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteReminder(reminder.id)}
                className="p-2 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                aria-label="Elimina promemoria"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
