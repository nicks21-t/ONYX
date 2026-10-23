import {
  LayoutDashboard,
  CalendarClock,
  Activity,
  Wallet,
  CheckSquare,
  Sun,
  Moon,
  X,
  Sparkles,
  PlusCircle,
  UserCircle,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SectionId } from '../../types';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const navItems: NavItem[] = [
  { id: 'panoramica', label: 'Panoramica', icon: LayoutDashboard },
  { id: 'lavoro', label: 'Lavoro & Turni', icon: CalendarClock, badge: 'Oggi 14:00' },
  { id: 'routine', label: 'Routine & Sport', icon: Activity, badge: '4/6' },
  { id: 'finanze', label: 'Finance', icon: Wallet },
  { id: 'promemoria', label: 'Promemoria', icon: CheckSquare, badge: 3 },
];

export const Sidebar: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    isDark,
    toggleDarkMode,
    sidebarOpen,
    setSidebarOpen,
    openQuickModal,
    reminders,
    habits
  } = useApp();

  const pendingRemindersCount = reminders.filter(r => !r.completed).length;
  const completedHabitsCount = habits.filter(h => h.completed).length;

  const handleNavClick = (id: SectionId) => {
    setActiveSection(id);
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const { user, signOut } = useAuth();

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Chiudi menu laterale"
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter') setSidebarOpen(false);
          }}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 ease-in-out dark:border-slate-800/80 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-6 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs dark:bg-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                Chronos
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Life & Work Operating System
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
            aria-label="Chiudi menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Action Button in Sidebar */}
        <div className="px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={() => openQuickModal('spesa')}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.99] dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <PlusCircle className="h-4 w-4 text-slate-300 transition-transform group-hover:rotate-90 dark:text-indigo-200" />
            <span className="whitespace-nowrap">Nuova Registrazione</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
          <div className="px-3 pb-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            SEZIONI PRINCIPALI
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            let dynamicBadge = item.badge;
            if (item.id === 'promemoria') dynamicBadge = pendingRemindersCount;
            if (item.id === 'routine') dynamicBadge = `${completedHabitsCount}/${habits.length}`;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>

                {dynamicBadge !== undefined && (
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      isActive
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {dynamicBadge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Shift Status snippet */}
        <div className="mx-3 my-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Turno di oggi</span>
            <span className="font-mono tabular-nums">21 Ott</span>
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Pomeriggio · 14:00 - 22:00
          </div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
            Pronto Soccorso Nord
          </div>
        </div>

        {/* Footer controls: Dark mode & User profile */}
        <div className="border-t border-slate-200/80 p-3 dark:border-slate-800/80 space-y-2">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {isDark ? (
                <Moon className="h-4 w-4 text-indigo-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
              <span>{isDark ? 'Tema Scuro Attivo' : 'Tema Chiaro Attivo'}</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {isDark ? 'Passa a Chiaro' : 'Passa a Scuro'}
            </span>
          </button>

          {/* User profile & Logout */}
          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-2 dark:border-slate-800/60 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserCircle className="h-7 w-7 text-indigo-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                  {user?.fullName || 'Utente'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {user?.email || 'Autenticato'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={signOut}
              title="Disconnetti account"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors shrink-0"
              aria-label="Disconnetti"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
