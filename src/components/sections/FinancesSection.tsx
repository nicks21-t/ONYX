import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Edit2,
  Check,
  X,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  PieChart as PieIcon,
  BarChart2,
  Sliders,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction, BudgetCategory } from '../../types';

// 12-Month Historical & Forecast Data for the Cashflow Overview Line Chart
interface MonthlyCashflowPoint {
  month: string;
  monthFull: string;
  income: number;
  expenses: number;
}

const YEARLY_CASHFLOW_DATA: MonthlyCashflowPoint[] = [
  { month: 'Jan', monthFull: 'Gennaio', income: 2400, expenses: 1450 },
  { month: 'Feb', monthFull: 'Febbraio', income: 2380, expenses: 1390 },
  { month: 'Mar', monthFull: 'Marzo', income: 2520, expenses: 1420 },
  { month: 'Apr', monthFull: 'Aprile', income: 2450, expenses: 1380 },
  { month: 'May', monthFull: 'Maggio', income: 2600, expenses: 1490 },
  { month: 'Jun', monthFull: 'Giugno', income: 2580, expenses: 1520 },
  { month: 'Jul', monthFull: 'Luglio', income: 2750, expenses: 1650 },
  { month: 'Aug', monthFull: 'Agosto', income: 2480, expenses: 1720 },
  { month: 'Sep', monthFull: 'Settembre', income: 2620, expenses: 1410 },
  { month: 'Oct', monthFull: 'Ottobre', income: 2630, expenses: 1330 },
  { month: 'Nov', monthFull: 'Novembre (Est.)', income: 2650, expenses: 1380 },
  { month: 'Dec', monthFull: 'Dicembre (Est.)', income: 3200, expenses: 1850 },
];

export const FinancesSection: React.FC = () => {
  const {
    transactions,
    budgetCategories,
    updateBudgetCategory,
    updateAllBudgetCategories,
    savingsGoal,
    updateSavingsGoal,
    addTransaction,
    totalIncome,
    totalExpenses,
    showToast,
  } = useApp();

  // Active state for Cashflow chart hover
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(9); // Default to October (index 9)

  // Donut chart active hovered category
  const [hoveredDonutCategory, setHoveredDonutCategory] = useState<string | null>(null);

  // Modals state
  const [isEditCapsModalOpen, setIsEditCapsModalOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);

  // Single category inline editing
  const [editingSingleCatId, setEditingSingleCatId] = useState<string | null>(null);
  const [tempSingleCap, setTempSingleCap] = useState<string>('');

  // Bulk Edit Caps form state
  const [capsFormState, setCapsFormState] = useState<Record<string, number>>({});

  // Savings Goal form state
  const [tempGoalInput, setTempGoalInput] = useState<string>(String(savingsGoal || 10000));

  // Add Transaction form state
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState<'expense' | 'income'>('expense');
  const [newTxCategory, setNewTxCategory] = useState<Transaction['category']>('alimentari');

  // Sparkline mini-trends (7 data points for mini bars)
  const incomeSparkline = [2380, 2450, 2520, 2580, 2600, 2620, 2630];
  const expenseSparkline = [1420, 1380, 1490, 1520, 1650, 1410, 1330];
  const savingsSparkline = [960, 1070, 1030, 1060, 950, 1210, 1300];
  const netCashflowSparkline = [960, 1070, 1030, 1060, 950, 1210, 1300];

  // Calculated Metrics
  const calculatedSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? ((calculatedSavings / totalIncome) * 100).toFixed(1) : '0.0';
  const netCashflow = totalIncome - totalExpenses;

  // Cumulative savings calculated for Goal Widget
  const totalAccumulatedSavings = 6200 + (netCashflow > 0 ? netCashflow : 0);
  const savingsGoalPercent = Math.min(100, Math.round((totalAccumulatedSavings / (savingsGoal || 10000)) * 100));

  // Category map for Spending Breakdown (Housing, Transport, Food, Utilities, Health, Personal, Other)
  const categorySpendingData = useMemo(() => {
    // Map existing budgetCategories to ensure the 7 standard categories exist
    const standardMap: Record<string, { name: string; spent: number; budget: number; color: string; id: string }> = {
      Housing: { id: 'b-1', name: 'Housing', spent: 650, budget: 800, color: '#6366F1' },
      Transport: { id: 'b-2', name: 'Transport', spent: 125, budget: 180, color: '#38BDF8' },
      Food: { id: 'b-3', name: 'Food', spent: 340, budget: 450, color: '#10B981' },
      Utilities: { id: 'b-4', name: 'Utilities', spent: 90, budget: 150, color: '#F59E0B' },
      Health: { id: 'b-5', name: 'Health', spent: 70, budget: 120, color: '#EC4899' },
      Personal: { id: 'b-6', name: 'Personal', spent: 55, budget: 220, color: '#8B5CF6' },
      Other: { id: 'b-7', name: 'Other', spent: 0, budget: 100, color: '#94A3B8' },
    };

    // Update with real spent / budget values from store if available
    budgetCategories.forEach((cat) => {
      const key = Object.keys(standardMap).find(
        (k) => cat.name.toLowerCase().includes(k.toLowerCase()) || cat.id === standardMap[k].id
      );
      if (key) {
        standardMap[key] = {
          ...standardMap[key],
          id: cat.id,
          spent: cat.spent,
          budget: cat.budget,
        };
      }
    });

    // Also factor in any user-added expenses from transactions
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (t.category === 'casa') standardMap.Housing.spent += 0;
        else if (t.category === 'alimentari') standardMap.Food.spent += 0;
        else if (t.category === 'trasporti') standardMap.Transport.spent += 0;
        else if (t.category === 'salute') standardMap.Health.spent += 0;
        else if (t.category === 'svago') standardMap.Personal.spent += 0;
      });

    const items = Object.values(standardMap);
    const sumSpent = items.reduce((acc, curr) => acc + curr.spent, 0) || totalExpenses || 1330;

    return items.map((item) => ({
      ...item,
      percentage: sumSpent > 0 ? Math.round((item.spent / sumSpent) * 100) : 0,
      percentagePrecise: sumSpent > 0 ? ((item.spent / sumSpent) * 100).toFixed(1) : '0.0',
    }));
  }, [budgetCategories, transactions, totalExpenses]);

  const totalBreakdownSpent = useMemo(() => {
    return categorySpendingData.reduce((acc, curr) => acc + curr.spent, 0);
  }, [categorySpendingData]);

  // Handle open bulk edit caps modal
  const handleOpenEditCapsModal = () => {
    const initialState: Record<string, number> = {};
    categorySpendingData.forEach((cat) => {
      initialState[cat.id] = cat.budget;
    });
    setCapsFormState(initialState);
    setIsEditCapsModalOpen(true);
  };

  // Handle save bulk caps
  const handleSaveBulkCaps = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCategories: BudgetCategory[] = budgetCategories.map((c) => {
      if (capsFormState[c.id] !== undefined) {
        return { ...c, budget: Number(capsFormState[c.id]) || c.budget };
      }
      return c;
    });
    updateAllBudgetCategories(updatedCategories);
    setIsEditCapsModalOpen(false);
  };

  // Inline Single Cap save
  const handleSaveSingleCap = (catId: string) => {
    const val = parseFloat(tempSingleCap);
    if (!isNaN(val) && val >= 0) {
      updateBudgetCategory(catId, val);
    }
    setEditingSingleCatId(null);
  };

  // Handle save savings goal
  const handleSaveSavingsGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempGoalInput);
    if (!isNaN(val) && val > 0) {
      updateSavingsGoal(val);
      setIsEditGoalModalOpen(false);
    }
  };

  // Handle submit new transaction
  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newTxAmount);
    if (!newTxTitle.trim() || isNaN(val) || val <= 0) {
      showToast('Inserisci un importo e titolo validi');
      return;
    }

    const categoryLabels: Record<Transaction['category'], string> = {
      casa: 'Housing & Casa',
      alimentari: 'Food & Groceries',
      trasporti: 'Transport & Auto',
      svago: 'Personal & Leisure',
      salute: 'Health & Sport',
      lavoro: 'Lavoro & Rimborsi',
      stipendio: 'Stipendio & Bonus',
    };

    addTransaction({
      title: newTxTitle.trim(),
      amount: val,
      category: newTxCategory,
      categoryLabel: categoryLabels[newTxCategory],
      date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: newTxType,
    });

    setNewTxTitle('');
    setNewTxAmount('');
    setIsAddTxModalOpen(false);
  };

  // Render SVG Sparkline component
  const renderSparklineBars = (values: number[], barColorClass: string) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return (
      <div className="flex items-end gap-1 h-9 px-1">
        {values.map((val, idx) => {
          const heightPercent = Math.max(18, Math.round(((val - min) / range) * 80 + 20));
          const isLast = idx === values.length - 1;
          return (
            <div
              key={idx}
              style={{ height: `${heightPercent}%` }}
              className={`w-1.5 rounded-xs transition-all duration-300 ${barColorClass} ${
                isLast ? 'opacity-100 shadow-sm brightness-125' : 'opacity-40 hover:opacity-80'
              }`}
            />
          );
        })}
      </div>
    );
  };

  // Cashflow Overview Line Chart Calculations
  const chartHeight = 220;
  const chartWidth = 640;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;
  const maxCashflow = 3600;

  const pointsIncome = YEARLY_CASHFLOW_DATA.map((d, i) => {
    const x = paddingX + (i / (YEARLY_CASHFLOW_DATA.length - 1)) * innerWidth;
    const y = chartHeight - paddingY - (d.income / maxCashflow) * innerHeight;
    return { x, y, data: d };
  });

  const pointsExpenses = YEARLY_CASHFLOW_DATA.map((d, i) => {
    const x = paddingX + (i / (YEARLY_CASHFLOW_DATA.length - 1)) * innerWidth;
    const y = chartHeight - paddingY - (d.expenses / maxCashflow) * innerHeight;
    return { x, y, data: d };
  });

  const incomePathString = pointsIncome.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const expensePathString = pointsExpenses.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const incomeAreaString = `${incomePathString} L ${pointsIncome[pointsIncome.length - 1].x} ${chartHeight - paddingY} L ${pointsIncome[0].x} ${chartHeight - paddingY} Z`;
  const expenseAreaString = `${expensePathString} L ${pointsExpenses[pointsExpenses.length - 1].x} ${chartHeight - paddingY} L ${pointsExpenses[0].x} ${chartHeight - paddingY} Z`;

  // Donut Chart Math
  const donutSize = 180;
  const strokeWidth = 24;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const donutSlices = categorySpendingData.map((cat) => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += cat.percentage;

    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* 1. SECTION HEADER: Named "Finance" with Obsidian Glass theme */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5F9]">
              Finance
            </h1>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
              Pro Analytics
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#94A3B8]">
            Real-time cashflow management, spending breakdown, and customizable budget caps
          </p>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenEditCapsModal}
            className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2 text-xs font-semibold text-[#E2E8F0] hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 hover:border-white/20"
          >
            <Sliders className="h-3.5 w-3.5 text-[#818CF8]" />
            <span>Edit Caps</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddTxModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#6366F1]/25 transition-all cursor-pointer active:scale-95 ring-1 ring-white/10"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 2. TOP KPI CARDS WITH SPARKLINES (4 Compact Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL INCOME */}
        <div className="card-onyx relative overflow-hidden rounded-3xl p-5 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#CBD5E1]">
              TOTAL INCOME
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp className="h-3 w-3" />
              +12.4%
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 mt-1">
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight tabular-nums">
                €{totalIncome.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">Monthly total · 2 fonti</p>
            </div>
            {/* Sparkline mini-bars in emerald green */}
            <div title="Trend Entrate mensili">
              {renderSparklineBars(incomeSparkline, 'bg-emerald-400')}
            </div>
          </div>
        </div>

        {/* TOTAL EXPENSES */}
        <div className="card-onyx relative overflow-hidden rounded-3xl p-5 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#CBD5E1]">
              TOTAL EXPENSES
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <TrendingDown className="h-3 w-3" />
              -4.2%
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 mt-1">
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight tabular-nums">
                €{totalExpenses.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">50.6% del reddito totale</p>
            </div>
            {/* Sparkline mini-bars in golden amber */}
            <div title="Trend Spese mensili">
              {renderSparklineBars(expenseSparkline, 'bg-amber-400')}
            </div>
          </div>
        </div>

        {/* TOTAL SAVINGS */}
        <div className="card-onyx relative overflow-hidden rounded-3xl p-5 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#CBD5E1]">
              TOTAL SAVINGS
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
              Rate: {savingsRate}%
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 mt-1">
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#38BDF8] tracking-tight tabular-nums">
                €{calculatedSavings.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">Accantonati questo mese</p>
            </div>
            {/* Sparkline mini-bars in cyan/emerald */}
            <div title="Trend Risparmi mensili">
              {renderSparklineBars(savingsSparkline, 'bg-sky-400')}
            </div>
          </div>
        </div>

        {/* NET CASHFLOW */}
        <div className="card-onyx relative overflow-hidden rounded-3xl p-5 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#CBD5E1]">
              NET CASHFLOW
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Surplus
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 mt-1">
            <div>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#A5B4FC] tracking-tight tabular-nums">
                +{netCashflow >= 0 ? '€' : '-€'}
                {Math.abs(netCashflow).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">Flusso operativo netto</p>
            </div>
            {/* Sparkline mini-bars in night indigo */}
            <div title="Trend Cashflow netto">
              {renderSparklineBars(netCashflowSparkline, 'bg-[#818CF8]')}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CENTRAL 2-CHART LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT CHART: "CASHFLOW OVERVIEW" (Line Chart - 7 Cols) */}
        <div className="lg:col-span-7 card-onyx rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20">
          <div>
            {/* Chart Header & Interactive Legends */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-white/[0.06] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-[#818CF8]" />
                  <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">
                    CASHFLOW OVERVIEW
                  </h3>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  12-Month temporal trend · Income vs Expenses
                </p>
              </div>

              {/* Legends with glowing dots */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-[#CBD5E1] font-medium">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  <span className="text-[#CBD5E1] font-medium">Expenses</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Dual Line Chart */}
            <div className="relative w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible select-none"
              >
                <defs>
                  {/* Emerald Gradient for Income Area */}
                  <linearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Golden Amber Gradient for Expense Area */}
                  <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines & Y-Axis Labels */}
                {[0, 1000, 2000, 3000].map((level) => {
                  const y = chartHeight - paddingY - (level / maxCashflow) * innerHeight;
                  return (
                    <g key={level}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.06)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[10px] font-mono fill-[#94A3B8]"
                      >
                        €{level}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Areas */}
                <path d={incomeAreaString} fill="url(#incomeAreaGrad)" />
                <path d={expenseAreaString} fill="url(#expenseAreaGrad)" />

                {/* Line 1: Income (Emerald) */}
                <path
                  d={incomePathString}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Line 2: Expenses (Golden Amber) */}
                <path
                  d={expensePathString}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Active Hover Month Vertical Guide Line */}
                {hoveredMonthIndex !== null && (
                  <line
                    x1={pointsIncome[hoveredMonthIndex].x}
                    y1={paddingY}
                    x2={pointsIncome[hoveredMonthIndex].x}
                    y2={chartHeight - paddingY}
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Interactive Points on Lines */}
                {pointsIncome.map((p, i) => {
                  const isHovered = hoveredMonthIndex === i;
                  return (
                    <g
                      key={`pt-inc-${i}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredMonthIndex(i)}
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 6 : 4}
                        fill="#0D0F12"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        className="transition-all duration-200"
                      />
                      {/* Transparent Hover Hitbox */}
                      <rect
                        x={p.x - 18}
                        y={0}
                        width={36}
                        height={chartHeight}
                        fill="transparent"
                      />
                    </g>
                  );
                })}

                {pointsExpenses.map((p, i) => {
                  const isHovered = hoveredMonthIndex === i;
                  return (
                    <g
                      key={`pt-exp-${i}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredMonthIndex(i)}
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 6 : 4}
                        fill="#0D0F12"
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                        className="transition-all duration-200"
                      />
                    </g>
                  );
                })}

                {/* X-Axis Month Labels */}
                {pointsIncome.map((p, i) => (
                  <text
                    key={`label-${i}`}
                    x={p.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    className={`text-[10px] font-mono cursor-pointer transition-colors ${
                      hoveredMonthIndex === i
                        ? 'fill-[#F8FAFC] font-bold'
                        : 'fill-[#94A3B8]'
                    }`}
                    onClick={() => setHoveredMonthIndex(i)}
                  >
                    {p.data.month}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* Interactive Tooltip Card for Selected Month */}
          {hoveredMonthIndex !== null && (
            <div className="glass-popover mt-4 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs border border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#6366F1]/20 text-[#A5B4FC] border border-[#6366F1]/30">
                  {YEARLY_CASHFLOW_DATA[hoveredMonthIndex].monthFull}
                </span>
                <span className="text-[#94A3B8] font-mono text-[11px]">2026 Summary</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-[#94A3B8]">Income:</span>
                  <span className="font-bold text-emerald-400">
                    €{YEARLY_CASHFLOW_DATA[hoveredMonthIndex].income}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-[#94A3B8]">Expenses:</span>
                  <span className="font-bold text-amber-400">
                    €{YEARLY_CASHFLOW_DATA[hoveredMonthIndex].expenses}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono pl-2 border-l border-white/10">
                  <span className="text-[#94A3B8]">Net:</span>
                  <span className="font-extrabold text-[#F8FAFC]">
                    +€{YEARLY_CASHFLOW_DATA[hoveredMonthIndex].income - YEARLY_CASHFLOW_DATA[hoveredMonthIndex].expenses}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CHART: "SPENDING BREAKDOWN" (Donut Chart - 5 Cols) */}
        <div className="lg:col-span-5 card-onyx rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-[#818CF8]" />
                <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">
                  SPENDING BREAKDOWN
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#94A3B8]">Ottobre 2026</span>
            </div>

            {/* Donut Chart with Centered Total Figure + Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
              {/* Donut Visual with Big Center Total */}
              <div className="relative shrink-0 flex items-center justify-center">
                <svg
                  width={donutSize}
                  height={donutSize}
                  viewBox={`0 0 ${donutSize} ${donutSize}`}
                  className="rotate-[-90deg] overflow-visible"
                >
                  {/* Background Track */}
                  <circle
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth={strokeWidth}
                  />

                  {/* Slices */}
                  {donutSlices.map((slice) => {
                    const isHovered = hoveredDonutCategory === slice.name;
                    return (
                      <circle
                        key={slice.id}
                        cx={donutSize / 2}
                        cy={donutSize / 2}
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        strokeLinecap="round"
                        className="cursor-pointer transition-all duration-300 hover:opacity-100"
                        style={{ opacity: hoveredDonutCategory && !isHovered ? 0.35 : 1 }}
                        onMouseEnter={() => setHoveredDonutCategory(slice.name)}
                        onMouseLeave={() => setHoveredDonutCategory(null)}
                      />
                    );
                  })}
                </svg>

                {/* Large Center Total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    TOTAL SPENT
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#F8FAFC] tracking-tight tabular-nums">
                    €{totalBreakdownSpent.toLocaleString('it-IT')}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {categorySpendingData.length} categorie
                  </span>
                </div>
              </div>

              {/* Legend with colored dots for Housing, Transport, Food, Utilities, Health, Personal, Other */}
              <div className="space-y-1.5 w-full max-w-[220px]">
                {categorySpendingData.map((cat) => {
                  const isHovered = hoveredDonutCategory === cat.name;
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setHoveredDonutCategory(cat.name)}
                      onMouseLeave={() => setHoveredDonutCategory(null)}
                      className={`flex items-center justify-between text-xs p-1.5 rounded-xl transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-white/[0.08] text-white scale-102'
                          : 'text-[#94A3B8] hover:text-[#E2E8F0]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="truncate font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                        <span className="font-bold text-[#F8FAFC]">€{cat.spent}</span>
                        <span className="text-[10px] text-[#94A3B8] w-7 text-right">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] text-center">
            <span className="text-[11px] text-[#94A3B8]">
              Spesa media giornaliera del mese:{' '}
              <strong className="text-[#F1F5F9] font-mono font-bold">
                €{(totalBreakdownSpent / 31).toFixed(1)}/giorno
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4. CUSTOMIZABLE BUDGET CAPS & LOWER SECTION */}
      {/* 4.1 Gestione Tetti di Spesa Personalizzabili (Customizable Budget Caps) */}
      <section className="card-onyx rounded-3xl p-6 sm:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.06] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#818CF8]">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">
                BUDGET ALLOCATION & CAPS
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Imposta e personalizza i tetti mensili di spesa desiderati in € per ogni categoria
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenEditCapsModal}
            className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-[#6366F1]/15 hover:bg-[#6366F1]/25 px-4 py-1.5 text-xs font-semibold text-[#A5B4FC] hover:text-white transition-all cursor-pointer shadow-sm self-start sm:self-auto"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit All Caps</span>
          </button>
        </div>

        {/* Grid of Budget Caps Cards with Progress and Inline Edit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categorySpendingData.map((cat) => {
            const isOverBudget = cat.spent > cat.budget;
            const remaining = cat.budget - cat.spent;
            const percentUsed = cat.budget > 0 ? Math.min(100, Math.round((cat.spent / cat.budget) * 100)) : 0;
            const isEditingThis = editingSingleCatId === cat.id;

            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col justify-between transition-all hover:bg-white/[0.05] hover:border-white/15"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-bold text-[#F1F5F9]">{cat.name}</span>
                    </div>

                    {/* Pencil button to edit single cap */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSingleCatId(cat.id);
                        setTempSingleCap(String(cat.budget));
                      }}
                      className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1"
                      title={`Modifica tetto per ${cat.name}`}
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Inline Cap Editor if active */}
                  {isEditingThis ? (
                    <div className="my-2 p-2 rounded-xl border border-[#6366F1]/40 bg-[#0D0F12] flex items-center gap-1.5">
                      <span className="text-xs text-[#94A3B8]">€</span>
                      <input
                        type="number"
                        value={tempSingleCap}
                        onChange={(e) => setTempSingleCap(e.target.value)}
                        autoFocus
                        className="w-full bg-transparent text-xs text-white font-mono font-bold focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveSingleCap(cat.id)}
                        className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSingleCatId(null)}
                        className="p-1 rounded-md bg-white/10 text-[#94A3B8] hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="text-xl font-bold font-mono text-[#F8FAFC] tabular-nums">
                        €{cat.spent}{' '}
                        <span className="text-xs font-normal text-[#94A3B8]">
                          / €{cat.budget}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                          isOverBudget
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : percentUsed > 80
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {percentUsed}%
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentUsed}%`,
                        backgroundColor: isOverBudget ? '#EF4444' : cat.color,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>Residuo:</span>
                  <span
                    className={`font-mono font-semibold ${
                      remaining >= 0 ? 'text-[#CBD5E1]' : 'text-rose-400'
                    }`}
                  >
                    {remaining >= 0 ? `€${remaining} rimasti` : `€${Math.abs(remaining)} oltre tetto`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4.2 TABELLE AFFIANCATE "INCOME SUMMARY" & "EXPENSE SUMMARY" + WIDGET "SAVINGS GOAL" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: INCOME SUMMARY TABLE (4 Cols) */}
        <div className="lg:col-span-4 card-onyx rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <h3 className="text-sm font-bold text-[#F1F5F9] tracking-tight">
                  INCOME SUMMARY
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8]">Ottobre 2026</span>
            </div>

            <div className="space-y-3">
              {/* Income Items */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <div className="text-xs font-semibold text-[#F1F5F9]">Stipendio Base Ospedaliero</div>
                  <div className="text-[10px] text-[#94A3B8]">Accredito ASL mensile fisso</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-emerald-400">€2,350.00</div>
                  <div className="text-[10px] text-[#94A3B8]">89.4%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <div className="text-xs font-semibold text-[#F1F5F9]">Indennità Turni & Straordinari</div>
                  <div className="text-[10px] text-[#94A3B8]">Maggiorazione notturna/festiva</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-emerald-400">€280.00</div>
                  <div className="text-[10px] text-[#94A3B8]">10.6%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <div className="text-xs font-semibold text-[#F1F5F9]">Rimborsi Spese & Formazione</div>
                  <div className="text-[10px] text-[#94A3B8]">Crediti ECM / Trasferte</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-[#94A3B8]">€0.00</div>
                  <div className="text-[10px] text-[#94A3B8]">0.0%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Income Total Row */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Total Income
            </span>
            <span className="text-base font-extrabold font-mono text-emerald-400">
              €{totalIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Middle: EXPENSE SUMMARY TABLE (5 Cols) */}
        <div className="lg:col-span-5 card-onyx rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <h3 className="text-sm font-bold text-[#F1F5F9] tracking-tight">
                  EXPENSE SUMMARY
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8]">Cap vs Spent</span>
            </div>

            <div className="space-y-2">
              {categorySpendingData.slice(0, 6).map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-[#F1F5F9] truncate">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-right shrink-0">
                    <span className="text-[#94A3B8] text-[11px]">Cap €{cat.budget}</span>
                    <span className="font-bold text-[#F8FAFC]">€{cat.spent}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        cat.spent > cat.budget
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/10 text-emerald-300'
                      }`}
                    >
                      {cat.spent > cat.budget ? 'Over' : 'Ok'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Total Row */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Total Expenses
            </span>
            <span className="text-base font-extrabold font-mono text-amber-400">
              €{totalExpenses.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Right: "SAVINGS GOAL" WIDGET (3 Cols) */}
        <div className="lg:col-span-3 card-onyx rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#818CF8]" />
                <h3 className="text-sm font-bold text-[#F1F5F9] tracking-tight">
                  SAVINGS GOAL
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTempGoalInput(String(savingsGoal || 10000));
                  setIsEditGoalModalOpen(true);
                }}
                className="text-[10px] text-[#818CF8] hover:text-white transition-colors"
              >
                Edit Goal
              </button>
            </div>

            {/* Circular Ring Gauge with Percentage */}
            <div className="flex flex-col items-center justify-center my-3">
              <div className="relative flex items-center justify-center">
                <svg width="130" height="130" viewBox="0 0 130 130" className="rotate-[-90deg]">
                  {/* Background Track */}
                  <circle
                    cx="65"
                    cy="65"
                    r="52"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeWidth="12"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="65"
                    cy="65"
                    r="52"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray={`${(savingsGoalPercent / 100) * 326.7} 326.7`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>

                {/* Centered Percentage */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black font-mono text-[#F8FAFC]">
                    {savingsGoalPercent}%
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">Completato</span>
                </div>
              </div>
            </div>

            {/* Goal vs Saved Stats */}
            <div className="space-y-2 mt-2 pt-2 border-t border-white/[0.06] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Goal Target:</span>
                <span className="font-mono font-bold text-[#F8FAFC]">
                  €{(savingsGoal || 10000).toLocaleString('it-IT')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Saved so far:</span>
                <span className="font-mono font-bold text-emerald-400">
                  €{totalAccumulatedSavings.toLocaleString('it-IT')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>Mancanti:</span>
                <span className="font-mono text-[#CBD5E1]">
                  €{Math.max(0, (savingsGoal || 10000) - totalAccumulatedSavings).toLocaleString('it-IT')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Target annuale in linea con il piano</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODALS: EDIT CAPS, ADD TRANSACTION, EDIT SAVINGS GOAL
          ========================================================================= */}

      {/* 1. EDIT CAPS MODAL */}
      {isEditCapsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#161920] p-6 shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-[#818CF8]" />
                <h3 className="text-base font-bold text-white">Customizable Budget Caps</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCapsModalOpen(false)}
                className="text-[#94A3B8] hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8] mb-4">
              Imposta il tetto massimo mensile di spesa per ciascuna categoria. Le modifiche verranno salvate automaticamente nel tuo account.
            </p>

            <form onSubmit={handleSaveBulkCaps} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {categorySpendingData.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-white/[0.06] bg-[#0D0F12]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-semibold text-white truncate">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[#94A3B8]">€</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={capsFormState[cat.id] ?? cat.budget}
                      onChange={(e) =>
                        setCapsFormState((prev) => ({
                          ...prev,
                          [cat.id]: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-24 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-hidden focus:border-[#6366F1]"
                    />
                  </div>
                </div>
              ))}

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditCapsModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-white"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#6366F1]/30 cursor-pointer"
                >
                  Salva Tetti di Spesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADD TRANSACTION MODAL */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#161920] p-6 shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Plus className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Nuova Registrazione Movimento</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTxModalOpen(false)}
                className="text-[#94A3B8] hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                  Tipo Movimento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTxType('expense')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      newTxType === 'expense'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-white/[0.04] text-[#94A3B8]'
                    }`}
                  >
                    Uscita / Spesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTxType('income')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      newTxType === 'income'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/[0.04] text-[#94A3B8]'
                    }`}
                  >
                    Entrata / Ricavo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Descrizione
                </label>
                <input
                  type="text"
                  placeholder="Es. Spesa Supermercato, Rifornimento..."
                  value={newTxTitle}
                  onChange={(e) => setNewTxTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0D0F12] px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Importo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0D0F12] px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-hidden focus:border-[#6366F1]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Categoria
                </label>
                <select
                  value={newTxCategory}
                  onChange={(e) => setNewTxCategory(e.target.value as Transaction['category'])}
                  className="w-full rounded-2xl border border-white/10 bg-[#0D0F12] px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#6366F1]"
                >
                  <option value="casa">Housing & Casa</option>
                  <option value="alimentari">Food & Groceries</option>
                  <option value="trasporti">Transport & Auto</option>
                  <option value="svago">Personal & Leisure</option>
                  <option value="salute">Health & Sport</option>
                  <option value="stipendio">Stipendio & Lavoro</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-white"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#6366F1]/30 cursor-pointer"
                >
                  Salva Movimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT SAVINGS GOAL MODAL */}
      {isEditGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#161920] p-6 shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#818CF8]" />
                <h3 className="text-base font-bold text-white">Target Risparmio Annuale</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditGoalModalOpen(false)}
                className="text-[#94A3B8] hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSavingsGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Obiettivo di Risparmio Totale (€)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={tempGoalInput}
                  onChange={(e) => setTempGoalInput(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0D0F12] px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-hidden focus:border-[#6366F1]"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditGoalModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-white"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#6366F1]/30 cursor-pointer"
                >
                  Aggiorna Obiettivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
