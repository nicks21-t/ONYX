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
        return <Dumbbell className="h-4 w-4 text-[#ff5e1e]" />;
      case 'benessere':
        return <Heart className="h-4 w-4 text-rose-400" />;
      case 'produttivita':
        return <BookOpen className="h-4 w-4 text-amber-400" />;
      case 'salute':
        return <Droplet className="h-4 w-4 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Routine & Sport
          </h1>
          <p className="text-xs text-zinc-400">
            Monitoraggio abitudini, streak e tracciamento prestazioni fisiche
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingHabit(true)}
          className="flex items-center gap-1.5 rounded-full bg-[#ff5e1e] hover:bg-[#ff7844] px-5 py-2 text-xs font-bold text-white shadow-xl shadow-[#ff5e1e]/30 transition-all self-start sm:self-auto cursor-pointer ring-1 ring-white/20"
        >
          <Plus className="h-4 w-4" />
          <span>Nuova Abitudine</span>
        </button>
      </div>

      {/* Progress & Stats Cards with Gauge */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-300">
              Tachimetro Obiettivi
            </span>
            <Activity className="h-4 w-4 text-[#ff5e1e]" />
          </div>

          <div className="my-2">
            <GaugeMeter
              value={completionPercentage}
              label="Completato"
              sublabel={`${completedCount} di ${habits.length} routine chiuse`}
              size={180}
            />
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-black/60 border border-white/10">
            <div
              style={{ width: `${completionPercentage}%` }}
              className="h-full bg-gradient-to-r from-[#ff5e1e] to-[#a3e635] transition-all duration-500 rounded-full"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-300">
              Serie Record (Streak)
            </span>
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div className="my-auto py-4">
            <div className="text-4xl font-extrabold font-mono text-white tabular-nums">
              24 giorni
            </div>
            <div className="mt-2 text-xs text-zinc-400">
              Lettura serale continua senza interruzioni
            </div>
          </div>
          <div className="border-t border-white/10 pt-3 text-xs text-[#ff5e1e] font-semibold">
            Costanza 94% mensile
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-300">
              Dispendio Energetico
            </span>
            <Flame className="h-4 w-4 text-[#a3e635]" />
          </div>
          <div className="my-auto py-4">
            <div className="text-4xl font-extrabold font-mono text-[#a3e635] tabular-nums">
              650 kcal
            </div>
            <div className="mt-2 text-xs text-zinc-400">
              Target giornaliero di 500 kcal ampiamente superato
            </div>
          </div>
          <div className="border-t border-white/10 pt-3 text-xs text-[#a3e635] font-semibold">
            Zona Aerobica Ottimale
          </div>
        </div>
      </div>

      {/* Add Habit Form */}
      {isAddingHabit && (
        <form
          onSubmit={handleCreate}
          className="rounded-3xl border border-white/15 bg-black/60 backdrop-blur-2xl p-6 sm:p-8 space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white">
              Crea Nuova Routine o Allenamento
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingHabit(false)}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Annulla
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Nome Routine
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Es. Meditazione 15m"
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Categoria
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as HabitCategory)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
              >
                <option value="sport">Sport & Allenamento</option>
                <option value="salute">Salute & Nutrizione</option>
                <option value="benessere">Benessere Mentale</option>
                <option value="produttivita">Produttività & Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Obiettivo Giornaliero
              </label>
              <input
                type="text"
                value={newTarget}
                onChange={e => setNewTarget(e.target.value)}
                placeholder="Es. 30 minuti"
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingHabit(false)}
              className="rounded-full px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#ff5e1e] px-5 py-2 text-xs font-bold text-white hover:bg-[#ff7844] cursor-pointer"
            >
              Salva Routine
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Pills (Glassmorphic style) */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-xl p-1.5 max-w-fit shadow-xl">
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
                ? 'bg-white text-black shadow-lg ring-1 ring-white'
                : 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-8">
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-3">
            <Activity className="h-6 w-6 text-[#ff5e1e]" />
          </div>
          <p className="text-sm font-semibold text-white">Nessuna routine impostata</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            Crea le tue abitudini giornaliere per sport, recupero, salute e benessere.
          </p>
          <button
            type="button"
            onClick={() => setIsAddingHabit(true)}
            className="mt-4 rounded-full bg-[#ff5e1e] hover:bg-[#ff7844] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#ff5e1e]/30 cursor-pointer"
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
            className={`flex cursor-pointer items-center justify-between rounded-3xl border p-5 transition-all shadow-2xl ${
              habit.completed
                ? 'border-white/5 bg-white/[0.01]'
                : 'border-white/10 bg-black/40 backdrop-blur-2xl hover:border-white/20 hover:bg-black/55'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <button
                type="button"
                aria-label={`Completa ${habit.title}`}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer ${
                  habit.completed
                    ? 'border-[#ff5e1e] bg-[#ff5e1e] text-white shadow-lg shadow-[#ff5e1e]/40'
                    : 'border-zinc-500 bg-transparent hover:border-white'
                }`}
              >
                {habit.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </button>

              <div className="min-w-0">
                <div
                  className={`text-sm font-bold truncate ${
                    habit.completed ? 'line-through text-zinc-500' : 'text-white'
                  }`}
                >
                  {habit.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                  {getCategoryIcon(habit.category)}
                  <span className="capitalize">{habit.category}</span>
                  <span>·</span>
                  <span>{habit.target}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-[#ff5e1e]/15 border border-[#ff5e1e]/30 px-3 py-1 text-xs font-mono font-bold text-[#ff7844] tabular-nums shrink-0">
              <Flame className="h-3.5 w-3.5 fill-[#ff5e1e] text-[#ff5e1e]" />
              <span>{habit.streak} gg</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
