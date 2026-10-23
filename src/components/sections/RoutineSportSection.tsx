import React, { useState } from 'react';
import {
  Activity,
  Flame,
  Check,
  Plus,
  Trophy,
  Dumbbell,
  Heart,
  BookOpen,
  Droplet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HabitCategory } from '../../types';
import { GaugeMeter } from '../charts/GaugeMeter';

export const RoutineSportSection: React.FC = () => {
  const { habits, toggleHabit, addHabit } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingHabit, setIsAddingHabit] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HabitCategory>('sport');
  const [newTarget, setNewTarget] = useState('30 minuti');

  const filteredHabits = selectedCategory === 'all'
    ? habits
    : habits.filter(h => h.category === selectedCategory);

  const completedCount = habits.filter(h => h.completed).length;
  const completionPercentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addHabit(newTitle.trim(), newCategory, newTarget);
    setNewTitle('');
    setIsAddingHabit(false);
  };

  const getCategoryIcon = (cat: HabitCategory) => {
    switch (cat) {
      case 'sport':
        return <Dumbbell className="h-4 w-4 text-[#818CF8]" />;
      case 'benessere':
        return <Heart className="h-4 w-4 text-rose-400" />;
      case 'produttivita':
        return <BookOpen className="h-4 w-4 text-[#A5B4FC]" />;
      case 'salute':
        return <Droplet className="h-4 w-4 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F1F5F9]">
            Routine & Sport
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Monitoraggio abitudini, streak e tracciamento prestazioni fisiche
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingHabit(true)}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-5 py-2 text-xs font-semibold text-white shadow-xl shadow-[#6366F1]/20 transition-all self-start sm:self-auto cursor-pointer ring-1 ring-white/10"
        >
          <Plus className="h-4 w-4" />
          <span>Nuova Abitudine</span>
        </button>
      </div>

      {/* Progress & Stats Cards with Gauge */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card-onyx rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#E2E8F0]">
              Tachimetro Obiettivi
            </span>
            <Activity className="h-4 w-4 text-[#818CF8]" />
          </div>

          <div className="my-2">
            <GaugeMeter
              value={completionPercentage}
              label="Completato"
              sublabel={`${completedCount} di ${habits.length} routine chiuse`}
              size={180}
            />
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.04] border border-white/[0.06]">
            <div
              style={{ width: `${completionPercentage}%` }}
              className="h-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] transition-all duration-500 rounded-full"
            />
          </div>
        </div>

        <div className="card-onyx rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#E2E8F0]">
              Serie Record (Streak)
            </span>
            <Trophy className="h-4 w-4 text-[#818CF8]" />
          </div>
          <div className="my-auto py-4">
            <div className="text-4xl font-extrabold font-mono text-[#F8FAFC] tabular-nums">
              24 giorni
            </div>
            <div className="mt-2 text-xs text-[#94A3B8]">
              Lettura serale continua senza interruzioni
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-3 text-xs text-[#818CF8] font-semibold">
            Costanza 94% mensile
          </div>
        </div>

        <div className="card-onyx rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#E2E8F0]">
              Dispendio Energetico
            </span>
            <Flame className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="my-auto py-4">
            <div className="text-4xl font-extrabold font-mono text-emerald-400 tabular-nums">
              650 kcal
            </div>
            <div className="mt-2 text-xs text-[#94A3B8]">
              Target giornaliero di 500 kcal ampiamente superato
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-3 text-xs text-emerald-400 font-semibold">
            Zona Aerobica Ottimale
          </div>
        </div>
      </div>

      {/* Add Habit Form */}
      {isAddingHabit && (
        <form
          onSubmit={handleCreate}
          className="card-onyx rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <h3 className="text-sm font-bold text-[#F1F5F9]">
              Crea Nuova Routine o Allenamento
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingHabit(false)}
              className="text-xs text-[#94A3B8] hover:text-white cursor-pointer"
            >
              Annulla
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Nome Routine
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Es. Meditazione 15m"
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Categoria
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as HabitCategory)}
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
              >
                <option value="sport">Sport & Allenamento</option>
                <option value="salute">Salute & Nutrizione</option>
                <option value="benessere">Benessere Mentale</option>
                <option value="produttivita">Produttività & Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Obiettivo Giornaliero
              </label>
              <input
                type="text"
                value={newTarget}
                onChange={e => setNewTarget(e.target.value)}
                placeholder="Es. 30 minuti"
                className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0F12] px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#6366F1]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingHabit(false)}
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

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#0D0F12]/80 p-1.5 max-w-fit shadow-xl">
        {[
          { id: 'all', label: 'Tutte' },
          { id: 'sport', label: 'Sport' },
          { id: 'salute', label: 'Salute' },
          { id: 'benessere', label: 'Benessere' },
          { id: 'produttivita', label: 'Produttività' },
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center rounded-3xl border border-white/[0.08] card-onyx p-8">
          <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#94A3B8] mb-3">
            <Activity className="h-6 w-6 text-[#818CF8]" />
          </div>
          <p className="text-sm font-semibold text-[#F1F5F9]">Nessuna routine impostata</p>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-sm">
            Crea le tue abitudini giornaliere per sport, recupero, salute e benessere.
          </p>
          <button
            type="button"
            onClick={() => setIsAddingHabit(true)}
            className="mt-4 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-[#6366F1]/20 cursor-pointer"
          >
            + Crea la prima routine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredHabits.map(habit => (
          <div
            key={habit.id}
            onClick={() => toggleHabit(habit.id)}
            className={`flex cursor-pointer items-center justify-between rounded-3xl border p-5 transition-all shadow-xl ${
              habit.completed
                ? 'border-white/[0.04] bg-[#0D0F12]/40 opacity-50'
                : 'card-onyx'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <button
                type="button"
                aria-label={`Completa ${habit.title}`}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer ${
                  habit.completed
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'border-zinc-500 bg-transparent hover:border-[#E2E8F0]'
                }`}
              >
                {habit.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </button>

              <div className="min-w-0">
                <div
                  className={`text-sm font-bold truncate ${
                    habit.completed ? 'line-through text-[#64748B]' : 'text-[#F1F5F9]'
                  }`}
                >
                  {habit.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-1">
                  {getCategoryIcon(habit.category)}
                  <span className="capitalize">{habit.category}</span>
                  <span>·</span>
                  <span>{habit.target}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 px-3 py-1 text-xs font-mono font-bold text-[#A5B4FC] tabular-nums shrink-0">
              <Flame className="h-3.5 w-3.5 text-[#818CF8]" />
              <span>{habit.streak} gg</span>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
