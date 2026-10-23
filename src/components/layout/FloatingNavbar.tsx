import React from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  Activity,
  Wallet,
  CheckSquare,
  Sparkles,
  Plus,
  LogOut,
  UserCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SectionId } from '../../types';

interface NavTab {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

const navTabs: NavTab[] = [
  { id: 'panoramica', label: 'Panoramica', icon: LayoutDashboard },
  { id: 'lavoro', label: 'Lavoro & Turni', icon: CalendarClock, badge: '14:00' },
  { id: 'routine', label: 'Routine & Sport', icon: Activity },
  { id: 'finanze', label: 'Finance', icon: Wallet },
  { id: 'promemoria', label: 'Promemoria', icon: CheckSquare, badge: 3 },
];

export const FloatingNavbar: React.FC = () => {
  const { activeSection, setActiveSection, openQuickModal, reminders, habits } = useApp();
  const { user, signOut } = useAuth();

  const pendingRemindersCount = reminders.filter(r => !r.completed).length;

  return (
    <header className="sticky top-4 sm:top-6 z-40 w-full px-4 flex items-center justify-center pointer-events-none">
      <nav
        aria-label="Navigazione principale"
        className="pointer-events-auto flex items-center gap-1 sm:gap-2 rounded-full border border-[#1f1f2e] bg-[#12121a]/90 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 transition-all max-w-full overflow-x-auto"
      >
        {/* Brand Logo Pill */}
        <div className="flex items-center gap-2 pl-3 pr-2 py-1 text-white shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/30">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="hidden md:inline text-xs font-bold tracking-tight text-white">
            CHRONOS
          </span>
        </div>

        <div className="h-4 w-px bg-[#1f1f2e] mx-1 hidden sm:block shrink-0" />

        {/* Floating Nav Tabs */}
        <div className="flex items-center gap-1 shrink-0">
          {navTabs.map(tab => {
            const isActive = activeSection === tab.id;
            const Icon = tab.icon;
            let dynamicBadge = tab.badge;
            if (tab.id === 'promemoria') dynamicBadge = pendingRemindersCount > 0 ? pendingRemindersCount : undefined;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`group flex items-center gap-2 rounded-full px-3.5 sm:px-4 py-2 text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-lg shadow-white/10 ring-1 ring-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                    isActive ? 'text-black' : 'text-zinc-400 group-hover:text-white'
                  }`}
                />
                <span className={isActive ? 'font-bold' : 'font-medium'}>
                  {tab.label}
                </span>

                {dynamicBadge !== undefined && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-mono tabular-nums leading-tight ${
                      isActive
                        ? 'bg-black/10 text-black font-bold'
                        : 'bg-[#1f1f2e] text-zinc-300'
                    }`}
                  >
                    {dynamicBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-[#1f1f2e] mx-1 hidden sm:block shrink-0" />

        {/* Quick Action Capsule Button */}
        <button
          type="button"
          onClick={() => openQuickModal('spesa')}
          className="flex items-center gap-1.5 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] px-3.5 sm:px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#7c3aed]/25 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline font-bold">Nuovo</span>
        </button>

        {/* User Pill & Logout */}
        <div className="flex items-center gap-1 pl-1 pr-1.5 py-1 text-zinc-400 shrink-0">
          <div
            title={`Connesso come ${user?.fullName || user?.email || 'Utente'}`}
            className="flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-[#1f1f2e] px-2.5 py-1 text-[11px] text-zinc-300"
          >
            <UserCircle className="h-3.5 w-3.5 text-[#7c3aed]" />
            <span className="hidden lg:inline max-w-[90px] truncate font-medium">
              {user?.fullName?.split(' ')[0] || 'Utente'}
            </span>
          </div>

          <button
            type="button"
            onClick={signOut}
            title="Disconnetti"
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>
    </header>
  );
};
