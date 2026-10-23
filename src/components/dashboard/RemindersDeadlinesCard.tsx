import React, { useState } from 'react';
import { CalendarCheck, Check, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RemindersDeadlinesCard: React.FC = () => {
  const { reminders, toggleReminder, openQuickModal } = useApp();
  const [activeTab, setActiveTab] = useState<'tutti' | 'urgenti' | 'completati'>('tutti');

  const pendingReminders = reminders.filter((r) => !r.completed);
  const completedReminders = reminders.filter((r) => r.completed);

  const filteredList = reminders.filter((r) => {
    if (activeTab === 'urgenti') return r.priority === 'urgente' && !r.completed;
    if (activeTab === 'completati') return r.completed;
    return !r.completed; // 'tutti' active tasks
  });

  const completionRate = reminders.length > 0 ? Math.round((completedReminders.length / reminders.length) * 100) : 100;

  // Task density visualization (3 time slots: Mattina, Pomeriggio, Sera)
  const slotCounts = {
    mattina: reminders.filter((r) => r.dueTime && parseInt(r.dueTime.split(':')[0], 10) < 13).length,
    pomeriggio: reminders.filter((r) => r.dueTime && parseInt(r.dueTime.split(':')[0], 10) >= 13 && parseInt(r.dueTime.split(':')[0], 10) < 18).length,
    sera: reminders.filter((r) => r.dueTime && parseInt(r.dueTime.split(':')[0], 10) >= 18).length,
  };

  return (
    <div className="card-onyx rounded-[26px] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#818CF8]">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">Timeline Scadenze</h3>
              <p className="text-xs text-[#94A3B8]">Distribuzione oraria e compiti</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-[#F8FAFC] font-mono tracking-tight leading-none tabular-nums">
              {completionRate}%
            </div>
            <div className="text-xs font-semibold text-[#E2E8F0] mt-1">Efficienza Task</div>
            <div className="text-[11px] text-[#94A3B8]">
              {pendingReminders.length} {pendingReminders.length === 1 ? 'task da completare' : 'task da completare'}
            </div>
          </div>
        </div>

        {/* Slot Density Minimalist Spectrogram */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#94A3B8]">Mattina</span>
            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, slotCounts.mattina * 35)}%` }}
                className="h-full bg-[#94A3B8] rounded-full"
              />
            </div>
            <span className="text-xs font-mono text-[#F1F5F9] tabular-nums">{slotCounts.mattina} task</span>
          </div>

          <div className="space-y-1.5 border-x border-white/[0.06] px-2.5">
            <span className="text-[11px] font-semibold text-[#94A3B8]">Pomeriggio</span>
            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, slotCounts.pomeriggio * 35)}%` }}
                className="h-full bg-[#6366F1] rounded-full"
              />
            </div>
            <span className="text-xs font-mono text-[#F1F5F9] tabular-nums">{slotCounts.pomeriggio} task</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#94A3B8]">Sera</span>
            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, slotCounts.sera * 35)}%` }}
                className="h-full bg-[#818CF8] rounded-full"
              />
            </div>
            <span className="text-xs font-mono text-[#F1F5F9] tabular-nums">{slotCounts.sera} task</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-1 rounded-full bg-white/[0.03] p-1 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab('tutti')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tutti'
                  ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Da Fare ({pendingReminders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('urgenti')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'urgenti'
                  ? 'bg-rose-500 text-white shadow-sm font-bold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Urgenti
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completati')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'completati'
                  ? 'bg-emerald-500/90 text-white shadow-sm font-bold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Fatti ({completedReminders.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => openQuickModal('promemoria')}
            className="text-xs font-semibold text-[#818CF8] hover:text-[#A5B4FC] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuovo</span>
          </button>
        </div>
      </div>

      {/* In-place Task Checklist */}
      <div className="my-3 space-y-2">
        {filteredList.length === 0 ? (
          <div className="py-4 text-center text-xs text-[#94A3B8] border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            {activeTab === 'urgenti' ? 'Nessun promemoria urgente pendente' : 'Nessun task presente'}
          </div>
        ) : (
          filteredList.slice(0, 3).map((r) => (
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

              {r.dueTime && (
                <span className="font-mono text-[11px] text-[#94A3B8] shrink-0 tabular-nums">
                  {r.dueTime}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-[#94A3B8]">
          Priorità alta completate: <strong className="text-[#F1F5F9] font-mono tabular-nums">{completedReminders.filter(r => r.priority === 'urgente').length}</strong>
        </span>
        <button
          type="button"
          onClick={() => openQuickModal('promemoria')}
          className="text-xs font-semibold text-[#818CF8] hover:text-[#A5B4FC] transition-colors cursor-pointer"
        >
          Gestisci task →
        </button>
      </div>
    </div>
  );
};
