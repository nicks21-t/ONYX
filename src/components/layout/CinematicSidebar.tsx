import React from 'react';
import {
  Home,
  User,
  BarChart3,
  ClipboardList,
  Wallet,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SectionId } from '../../types';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'panoramica', label: 'Dashboard', icon: Home },
  { id: 'lavoro', label: 'Shift & Work', icon: User },
  { id: 'routine', label: 'Routine & Sport', icon: BarChart3 },
  { id: 'promemoria', label: 'Promemoria & Task', icon: ClipboardList },
  { id: 'finanze', label: 'Finance', icon: Wallet },
];

export const CinematicSidebar: React.FC = () => {
  const { activeSection, setActiveSection } = useApp();
  const { signOut } = useAuth();

  return (
    <aside
      aria-label="Navigazione laterale"
      className="fixed top-0 left-0 hidden md:flex flex-col justify-between items-center w-20 h-screen max-h-screen overflow-y-auto py-6 z-30 select-none bg-[#0D0F12]/80 backdrop-blur-xl border-r border-white/[0.08] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* Top Monogram Squircle Logo - Slate & Frosted Silver */}
      <div className="flex flex-col items-center shrink-0">
        <button
          type="button"
          onClick={() => setActiveSection('panoramica')}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E222D] to-[#252A37] text-[#F8FAFC] shadow-lg border border-white/15 hover:border-[#6366F1]/60 hover:scale-105 transition-all cursor-pointer ring-1 ring-white/5"
          title="ONYX Dashboard"
        >
          <span className="font-extrabold text-lg tracking-tight text-[#F8FAFC]">O</span>
        </button>
      </div>

      {/* Central Clean Circular Icons Stack */}
      <nav className="flex flex-col items-center gap-4 my-auto py-4 shrink-0">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              aria-label={item.label}
              title={item.label}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-xl ring-2 ring-[#6366F1]/30 scale-105'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#94A3B8] hover:text-[#F1F5F9] hover:scale-105'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.65]'}`} />
            </button>
          );
        })}
      </nav>

      {/* Bottom Logout */}
      <div className="flex flex-col items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={signOut}
          title="Disconnetti"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
