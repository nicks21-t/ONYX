import React from 'react';
import {
  Home,
  User,
  BarChart3,
  ClipboardList,
  HeartHandshake,
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
  { id: 'lavoro', label: 'Lavoro & Turni', icon: User },
  { id: 'routine', label: 'Routine & Sport', icon: BarChart3 },
  { id: 'promemoria', label: 'Promemoria & Task', icon: ClipboardList },
  { id: 'finanze', label: 'Finanze & Wellness', icon: HeartHandshake },
];

export const CinematicSidebar: React.FC = () => {
  const { activeSection, setActiveSection } = useApp();
  const { signOut } = useAuth();

  return (
    <aside
      aria-label="Navigazione laterale"
      className="fixed top-0 left-0 hidden md:flex flex-col justify-between items-center w-20 h-screen max-h-screen overflow-y-auto py-6 z-30 select-none bg-black/30 backdrop-blur-xl border-r border-white/5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* Top Orange Monogram Squircle Logo */}
      <div className="flex flex-col items-center shrink-0">
        <button
          type="button"
          onClick={() => setActiveSection('panoramica')}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b35] to-[#ff5e1e] text-white shadow-xl shadow-[#ff5e1e]/40 hover:scale-105 transition-all cursor-pointer ring-1 ring-white/20"
          title="ONYX Dashboard"
        >
          <span className="font-black text-xl tracking-tighter text-white">O</span>
        </button>
      </div>

      {/* Central Clean Circular Icons Stack with gap-5 */}
      <nav className="flex flex-col items-center gap-5 my-auto py-4 shrink-0">
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
                  ? 'bg-white text-black shadow-xl ring-2 ring-white/80 scale-105'
                  : 'bg-white/[0.04] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white hover:scale-105'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.65]'}`} />
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile / Logout */}
      <div className="flex flex-col items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={signOut}
          title="Disconnetti"
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
