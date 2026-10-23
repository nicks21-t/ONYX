import React, { useState } from 'react';
import { CheckSquare, Plus, Check, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReminderPriority } from '../../types';

export const RemindersPriorityCard: React.FC = () => {
  const { reminders, toggleReminder, openQuickModal } = useApp();
  const [filterPriority, setFilterPriority] = useState<ReminderPriority | 'tutti'>('tutti');

  const total = reminders.length;
  const completed = reminders.filter((r) => r.completed).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const urgentCount = reminders.filter((r) => r.priority === 'urgente' && !r.completed).length;
  const mediaCount = reminders.filter((r) => r.priority === 'media' && !r.completed).length;
  const bassaCount = reminders.filter((r) => r.priority === 'bassa' && !r.completed).length;

  // Filtered list of reminders to display
  const displayReminders = reminders
    .filter((r) => {
      if (filterPriority === 'tutti') return true;
      return r.priority === filterPriority;
    })
    .slice(0, 3); // show top 3 for clean card fit

  return (
    <div className="card-onyx rounded-[26px] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">Promemoria & Task</h3>
              <p className="text-xs text-[#94A3B8]">Tasso completamento e priorità</p>
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => openQuickModal('promemoria')}
            title="Nuovo promemoria"
            className="h-8 w-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Global Progress */}
        <div className="space-y-2 pb-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#94A3B8] font-medium">Avanzamento Globale</span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">{completionRate}% completato</span>
          </div>
          <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
            <div
              style={{ width: `${completionRate}%` }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            />
          </div>
        </div>

        {/* Priority Filter Controls (Zero Orange: Rose, Indigo, Slate) */}
        <div className="flex items-center gap-1.5 pt-2">
          <button
            type="button"
            onClick={() => setFilterPriority('tutti')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterPriority === 'tutti'
                ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-sm'
                : 'bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] border border-white/[0.06]'
            }`}
          >
            Tutti ({total})
          </button>
          <button
            type="button"
            onClick={() => setFilterPriority('urgente')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterPriority === 'urgente'
                ? 'bg-rose-500 text-white shadow-sm font-bold'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20'
            }`}
          >
            <span>Urgenti</span>
            <span className="text-[10px] font-mono">({urgentCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterPriority('media')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterPriority === 'media'
                ? 'bg-[#6366F1] text-white shadow-sm font-bold'
                : 'bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#A5B4FC] border border-[#6366F1]/20'
            }`}
          >
            <span>Medie</span>
            <span className="text-[10px] font-mono">({mediaCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterPriority('bassa')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterPriority === 'bassa'
                ? 'bg-emerald-500/90 text-white shadow-sm font-bold'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
            }`}
          >
            <span>Basse</span>
            <span className="text-[10px] font-mono">({bassaCount})</span>
          </button>
        </div>
      </div>

      {/* In-place Task List with clean frosted rows */}
      <div className="my-3 space-y-2">
        {displayReminders.length === 0 ? (
          <div className="py-4 text-center text-xs text-[#94A3B8] border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            Nessun promemoria in questa priorità
          </div>
        ) : (
          displayReminders.map((r) => (
            <div
              key={r.id}
              onClick={() => toggleReminder(r.id)}
              className="glass-popover flex items-center justify-between p-2.5 rounded-xl hover:border-[#6366F1]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                <div
                  className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    r.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-white/30 group-hover:border-[#E2E8F0] bg-transparent'
                  }`}
                >
                  {r.completed && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <span
                  className={`text-xs truncate ${
                    r.completed ? 'line-through text-[#64748B]' : 'text-[#F1F5F9] font-medium'
                  }`}
                >
                  {r.title}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-[11px] text-[#94A3B8]">
                <Clock className="h-3 w-3 text-[#94A3B8]" />
                <span>{r.dueDate}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-[#94A3B8]">
          In sospeso: <strong className="text-[#F1F5F9] font-mono font-semibold tabular-nums">{total - completed}</strong>
        </span>
        <button
          type="button"
          onClick={() => openQuickModal('promemoria')}
          className="text-xs font-semibold text-[#818CF8] hover:text-[#A5B4FC] transition-colors cursor-pointer"
        >
          + Aggiungi promemoria
        </button>
      </div>
    </div>
  );
};
