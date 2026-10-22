import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  PiggyBank
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';

export const FinancesSection: React.FC = () => {
  const {
    transactions,
    budgetCategories,
    addTransaction,
    totalIncome,
    totalExpenses,
    remainingBudget
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [isAddingTx, setIsAddingTx] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'expense' | 'income'>('expense');
  const [newCategory, setNewCategory] = useState<Transaction['category']>('alimentari');

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(val) || val <= 0) return;

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
      title: newTitle.trim(),
      amount: val,
      category: newCategory,
      categoryLabel: categoryLabels[newCategory],
      date: 'Oggi, 21 Ott',
      type: newType,
    });

    setNewTitle('');
    setNewAmount('');
    setIsAddingTx(false);
  };

  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Finanze & Cashflow
          </h1>
          <p className="text-xs text-zinc-400">
            Monitoraggio budget mensile, entrate straordinari e allocazioni
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingTx(true)}
          className="flex items-center gap-1.5 rounded-full bg-[#ff5e1e] hover:bg-[#ff7844] px-5 py-2 text-xs font-bold text-white shadow-xl shadow-[#ff5e1e]/30 transition-all self-start sm:self-auto cursor-pointer ring-1 ring-white/20"
        >
          <Plus className="h-4 w-4" />
          <span>Registra Movimento</span>
        </button>
      </div>

      {/* KPI Cards - Glassmorphism */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-300">
              Entrate Mensili
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#a3e635]/20 text-[#a3e635]">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold font-mono text-[#a3e635] tabular-nums">
            +€{totalIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Stipendio base + Indennità turni
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-300">
              Uscite Totali
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold font-mono text-white tabular-nums">
            -€{totalExpenses.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Spese fisse e variabili
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-300">
              Saldo Risparmiabile
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5e1e]/20 text-[#ff5e1e]">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold font-mono text-[#ff5e1e] tabular-nums">
            +€{netBalance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Residuo spendibile:{' '}
            <span className="font-mono font-semibold text-white whitespace-nowrap">
              € {remainingBudget.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      {isAddingTx && (
        <form
          onSubmit={handleCreateTx}
          className="rounded-3xl border border-white/15 bg-black/60 backdrop-blur-2xl p-6 sm:p-8 space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white">
              Nuovo Movimento Finanziario
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingTx(false)}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Annulla
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Descrizione Movimento
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Es. Spesa Carrefour"
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Importo (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Tipo
              </label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as 'expense' | 'income')}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
              >
                <option value="expense">Uscita / Spesa (-)</option>
                <option value="income">Entrata / Guadagno (+)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Categoria
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as Transaction['category'])}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#ff5e1e]"
              >
                <option value="alimentari">Spesa Alimentari</option>
                <option value="casa">Casa & Utenze</option>
                <option value="trasporti">Trasporti & Auto</option>
                <option value="svago">Svago & Ristoranti</option>
                <option value="salute">Salute & Sport</option>
                <option value="stipendio">Stipendio o Bonus</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTx(false)}
              className="rounded-full px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#ff5e1e] px-5 py-2 text-xs font-bold text-white hover:bg-[#ff7844] cursor-pointer"
            >
              Salva Movimento
            </button>
          </div>
        </form>
      )}

      {/* Categories Budget Cards */}
      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-lg font-bold tracking-tight text-white mb-6">
          Allocazione Tetti di Spesa Mensili
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgetCategories.map(cat => {
            const pct = Math.min(100, Math.round((cat.spent / cat.budget) * 100));
            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur-md"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    {cat.name}
                  </span>
                  <span className="font-mono text-zinc-400 tabular-nums">
                    {pct}%
                  </span>
                </div>
                <div className="mt-3 text-lg font-bold font-mono text-white tabular-nums">
                  €{cat.spent} <span className="text-xs font-normal text-zinc-500">/ €{cat.budget}</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/70 border border-white/5">
                  <div
                    style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction List with Minimal Rounded Badges */}
      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight text-white">
            Storico Movimenti
          </h2>

          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/50 p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tutti
            </button>
            <button
              type="button"
              onClick={() => setFilterType('expense')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Spese
            </button>
            <button
              type="button"
              onClick={() => setFilterType('income')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'income'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Entrate
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-3">
                <Wallet className="h-6 w-6 text-[#ff5e1e]" />
              </div>
              <p className="text-sm font-semibold text-white">Nessuna transazione registrata</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Il tuo conto è vuoto e pronto da riempire. Clicca su "+ Registra Movimento" per inserire una spesa o un'entrata.
              </p>
              <button
                type="button"
                onClick={() => setIsAddingTx(true)}
                className="mt-4 rounded-full bg-[#ff5e1e] hover:bg-[#ff7844] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#ff5e1e]/30 cursor-pointer"
              >
                + Registra primo movimento
              </button>
            </div>
          ) : (
            filteredTransactions.map(tx => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3.5 text-xs transition-colors hover:bg-white/[0.03] px-2 rounded-2xl"
              >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    tx.type === 'income'
                      ? 'bg-[#a3e635]/20 text-[#a3e635]'
                      : 'bg-white/[0.06] text-zinc-300'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {tx.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    <span className="rounded-full bg-white/[0.06] border border-white/10 px-2 py-0.5 text-zinc-300">
                      {tx.categoryLabel}
                    </span>
                    <span className="ml-2">{tx.date}</span>
                  </div>
                </div>
              </div>

              <span
                className={`font-mono text-base font-bold tabular-nums ${
                  tx.type === 'income' ? 'text-[#a3e635]' : 'text-white'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}€{tx.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
