import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FinanceFlowCard: React.FC = () => {
  const { transactions, remainingBudget, openQuickModal } = useApp();
  const [filterMode, setFilterMode] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [hoveredTxId, setHoveredTxId] = useState<string | null>(null);

  // Filter transactions for display
  const filteredTxs = transactions.filter((t) => {
    if (filterMode === 'all') return true;
    return t.type === filterMode;
  });

  const recentTxs = filteredTxs.slice(0, 6);
  const activeTx = transactions.find((t) => t.id === (hoveredTxId || selectedTxId)) || recentTxs[0];

  // Find max transaction amount for relative bar scaling
  const maxAmount = Math.max(...transactions.map((t) => t.amount), 100);

  return (
    <div className="card-onyx rounded-[26px] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#818CF8]">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">Flusso Finanze</h3>
              <p className="text-xs text-[#94A3B8]">Entrate, uscite e saldo mensile</p>
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => openQuickModal('spesa')}
            title="Nuova spesa o entrata"
            className="h-8 w-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Controls & Saldo */}
        <div className="flex items-center justify-between gap-2 pb-2">
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 rounded-full bg-white/[0.03] p-1 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Tutti
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('expense')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'expense'
                  ? 'bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Uscite
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('income')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'income'
                  ? 'bg-emerald-500/90 text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Entrate
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#94A3B8] block">Saldo</span>
            <span className={`text-base font-bold font-mono tabular-nums ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              €{remainingBudget.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Minimalist Bar Chart */}
      <div className="my-3 space-y-3">
        {recentTxs.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#94A3B8] border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            Nessun movimento recente registrato.
          </div>
        ) : (
          <div>
            <div className="flex items-end justify-between gap-2.5 h-24 px-1 pt-2">
              {recentTxs.map((tx) => {
                const isSelected = activeTx?.id === tx.id;
                const isIncome = tx.type === 'income';
                const heightPercent = Math.max(18, Math.min(100, Math.round((tx.amount / maxAmount) * 100)));

                return (
                  <div
                    key={tx.id}
                    onMouseEnter={() => setHoveredTxId(tx.id)}
                    onMouseLeave={() => setHoveredTxId(null)}
                    onClick={() => setSelectedTxId(tx.id)}
                    className="flex-1 flex flex-col items-center justify-end h-full group/bar cursor-pointer relative"
                  >
                    {/* Minimalist Bar with Delicate Gradient */}
                    <div className="relative w-full flex items-end justify-center">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[20px] rounded-t-sm transition-all duration-300 ${
                          isIncome
                            ? 'bg-gradient-to-t from-emerald-600/70 to-emerald-400'
                            : 'bg-gradient-to-t from-[#4F46E5] to-[#818CF8]'
                        } ${
                          isSelected
                            ? 'ring-2 ring-[#E2E8F0] scale-105 shadow-lg shadow-[#6366F1]/20 brightness-110'
                            : 'opacity-70 group-hover/bar:opacity-100'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-mono mt-1.5 text-[#94A3B8] truncate max-w-full">
                      €{tx.amount > 999 ? `${(tx.amount / 1000).toFixed(1)}k` : tx.amount.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* In-place interactive detail pill in frosted glass */}
            {activeTx && (
              <div className="glass-popover mt-3 p-3 rounded-2xl flex items-center justify-between text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <div
                    className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${
                      activeTx.type === 'income'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-[#6366F1]/15 text-[#818CF8]'
                    }`}
                  >
                    {activeTx.type === 'income' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="truncate">
                    <span className="text-[#F1F5F9] font-medium truncate block">{activeTx.title}</span>
                    <span className="text-[11px] text-[#94A3B8]">{activeTx.categoryLabel} · {activeTx.date}</span>
                  </div>
                </div>

                <span
                  className={`font-mono text-sm font-bold shrink-0 tabular-nums ${
                    activeTx.type === 'income' ? 'text-emerald-400' : 'text-[#F1F5F9]'
                  }`}
                >
                  {activeTx.type === 'income' ? '+' : '-'}€{activeTx.amount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-[#94A3B8]">
          Movimenti recenti: <strong className="text-[#F1F5F9] font-mono font-semibold">{recentTxs.length}</strong>
        </span>
        <button
          type="button"
          onClick={() => openQuickModal('spesa')}
          className="text-xs font-semibold text-[#818CF8] hover:text-[#A5B4FC] transition-colors cursor-pointer"
        >
          + Nuova transazione
        </button>
      </div>
    </div>
  );
};
