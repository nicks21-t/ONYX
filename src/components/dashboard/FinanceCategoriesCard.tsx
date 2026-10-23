import React, { useState } from 'react';
import { PieChart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FinanceCategoriesCard: React.FC = () => {
  const { budgetCategories, remainingBudget, totalExpenses, openQuickModal } = useApp();
  const [selectedCatId, setSelectedCatId] = useState<string | null>(budgetCategories[0]?.id || null);

  const selectedCategory = budgetCategories.find((c) => c.id === selectedCatId) || budgetCategories[0];

  const totalBudget = budgetCategories.reduce((acc, c) => acc + c.budget, 0);
  const totalSpentInCategories = budgetCategories.reduce((acc, c) => acc + c.spent, 0);
  const percentUsed = totalBudget > 0 ? Math.min(100, Math.round((totalSpentInCategories / totalBudget) * 100)) : 0;

  // Harmonize category colors into Dark Monochrome / Slate / Indigo palette (Zero Orange)
  const getSleekCategoryColor = (color: string) => {
    // If the category color is an orange/amber hex, convert it to an elegant night indigo or slate
    if (color === '#ff5e1e' || color === '#ff6b35' || color === '#f59e0b' || color === '#ea580c') {
      return '#6366F1';
    }
    return color;
  };

  return (
    <div className="card-onyx rounded-[26px] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#818CF8]">
              <PieChart className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">Budget & Categorie</h3>
              <p className="text-xs text-[#94A3B8]">Ripartizione e consumi di spesa</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-[#F8FAFC] font-mono tracking-tight leading-none tabular-nums">
              {percentUsed}%
            </div>
            <div className="text-xs font-semibold text-[#E2E8F0] mt-1">Budget Consumato</div>
            <div className="text-[11px] text-[#94A3B8]">€{remainingBudget.toFixed(0)} disponibili</div>
          </div>
        </div>

        {/* Multi-segment Sleek Stacked Bar */}
        <div className="space-y-3">
          <div className="h-2.5 w-full bg-white/[0.04] rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-white/[0.06]">
            {budgetCategories.map((cat) => {
              const widthPct = totalSpentInCategories > 0 ? (cat.spent / totalSpentInCategories) * 100 : 20;
              const isSelected = selectedCategory?.id === cat.id;
              const barColor = getSleekCategoryColor(cat.color);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatId(cat.id)}
                  title={`${cat.name}: €${cat.spent}`}
                  style={{ width: `${Math.max(5, widthPct)}%`, backgroundColor: barColor }}
                  className={`h-full rounded-xs transition-all duration-300 cursor-pointer ${
                    isSelected ? 'brightness-125 ring-1 ring-[#F8FAFC]' : 'opacity-75 hover:opacity-100'
                  }`}
                />
              );
            })}
          </div>

          {/* Category Selector Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {budgetCategories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const pillColor = getSleekCategoryColor(cat.color);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] font-semibold shadow-sm scale-102'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F1F5F9] border border-white/[0.06]'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pillColor }} />
                  <span>{cat.name}</span>
                  <span className="font-mono text-[11px] opacity-75">€{cat.spent}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* In-place Category Detail Inspector */}
      {selectedCategory && (
        <div className="glass-popover my-3 p-3.5 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#F1F5F9] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getSleekCategoryColor(selectedCategory.color) }} />
              {selectedCategory.name}
            </span>
            <span className="font-mono text-[#F8FAFC] tabular-nums font-semibold">
              €{selectedCategory.spent.toFixed(0)} <span className="text-[#94A3B8] font-normal">/ €{selectedCategory.budget.toFixed(0)}</span>
            </span>
          </div>

          {/* Individual Category progress bar */}
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              style={{
                width: `${Math.min(100, (selectedCategory.spent / selectedCategory.budget) * 100)}%`,
                backgroundColor: getSleekCategoryColor(selectedCategory.color),
              }}
              className="h-full rounded-full transition-all duration-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-0.5">
            <span>
              Residuo: <strong className="text-emerald-400 font-mono font-medium">€{(selectedCategory.budget - selectedCategory.spent).toFixed(0)}</strong>
            </span>
            <button
              type="button"
              onClick={() => openQuickModal('spesa')}
              className="text-xs font-semibold text-[#818CF8] hover:text-[#A5B4FC] transition-colors cursor-pointer"
            >
              + Aggiungi spesa
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-[#94A3B8]">
          Uscite totali: <strong className="text-[#F1F5F9] font-mono font-semibold tabular-nums">€{totalExpenses.toFixed(2)}</strong>
        </span>
        <button
          type="button"
          onClick={() => openQuickModal('spesa')}
          className="text-xs font-semibold text-[#818CF8] hover:text-[#A5B4FC] transition-colors cursor-pointer"
        >
          Registra spesa →
        </button>
      </div>
    </div>
  );
};
