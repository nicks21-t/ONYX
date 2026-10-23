import React from 'react';
import { Menu, Plus, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const sectionTitles: Record<string, string> = {
  panoramica: 'Panoramica Generale',
  lavoro: 'Lavoro & Turni',
  routine: 'Routine & Sport',
  finanze: 'Finance',
  promemoria: 'Promemoria & Scadenze',
};

export const Header: React.FC = () => {
  const {
    activeSection,
    setSidebarOpen,
    isDark,
    toggleDarkMode,
    openQuickModal
  } = useApp();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90">
      {/* Zone 1: Mobile toggle & Breadcrumb Trail */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Apri menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-900 dark:text-white">
            {sectionTitles[activeSection] || 'Dashboard'}
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
          <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
            Hub Personale
          </span>
        </div>
      </div>

      {/* Zone 2: Italian Date format */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <span className="font-medium">Mercoledì, 21 Ottobre 2026</span>
        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
        <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">Settimana 43</span>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={toggleDarkMode}
          title={isDark ? 'Passa alla modalità chiara' : 'Passa alla modalità scura'}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
          aria-label="Attiva/disattiva modalità scura"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
        </button>

        <button
          type="button"
          onClick={() => openQuickModal('spesa')}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-[0.99] dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Aggiungi</span>
          <span className="sm:hidden">Nuovo</span>
        </button>
      </div>
    </header>
  );
};
