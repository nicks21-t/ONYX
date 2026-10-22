import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Calendar,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SectionId } from '../../types';

export const CinematicHeader: React.FC = () => {
  const { openQuickModal, activeSection, setActiveSection, showToast, toggleClockIn, shifts } = useApp();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: SectionId; label: string }> = [
    { id: 'panoramica', label: 'Panoramica' },
    { id: 'lavoro', label: 'Lavoro & Turni' },
    { id: 'routine', label: 'Routine & Sport' },
    { id: 'finanze', label: 'Finanze' },
    { id: 'promemoria', label: 'Promemoria' },
  ];

  return (
    <header className="w-full pt-4 pb-2 px-4 sm:px-8 relative z-30 select-none">
      {/* 1. Main Top Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand Monogram & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo Monogram */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b35] to-[#ff5e1e] text-white shadow-lg shadow-[#ff5e1e]/40 ring-1 ring-white/20">
              <span className="font-black text-lg tracking-tighter">O</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-white leading-tight">
                ONYX
              </span>
              <span className="text-[11px] font-medium text-zinc-400">
                Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Right: "+" Circular Button & User Avatar Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => openQuickModal('spesa')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/15 text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
            title="Nuova registrazione"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#ff6b35] to-[#ff5e1e] flex items-center justify-center font-black text-white text-xs border border-white/20 shadow-md">
              {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                {user?.fullName || user?.email?.split('@')[0] || 'Utente'}
              </span>
              <span className="text-[10px] text-zinc-400 truncate max-w-[130px]">
                {user?.email || 'Membro ONYX'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Floating Action Controls Sub-header Bar (Aligned Right) */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 mt-5 pt-1">
        {/* Search circle button */}
        <button
          type="button"
          onClick={() => showToast('Cerca tra attività e spese')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
          title="Search"
        >
          <Search className="h-3.5 w-3.5" />
        </button>

        {/* Edit / Note circle button */}
        <button
          type="button"
          onClick={() => openQuickModal('promemoria')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
          title="Note e Promemoria"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-300 cursor-pointer hover:bg-white/10 transition-all shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span>15 - 28 July, 2026</span>
          <ChevronDown className="h-3 w-3 text-zinc-400 ml-0.5" />
        </div>

        {/* "+ Add Wallet" Pill Button */}
        <button
          type="button"
          onClick={() => openQuickModal('spesa')}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 px-4 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <Plus className="h-3.5 w-3.5 text-zinc-400" />
          <span>Add Wallet</span>
        </button>

        {/* "Create a Report" Pill Button */}
        <button
          type="button"
          onClick={() => {
            const todayShift = shifts.find(s => s.date === '2026-10-21') || shifts[0];
            if (todayShift) toggleClockIn(todayShift.id);
            else showToast('Report generato');
          }}
          className="rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 px-4 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <span>Create a Report</span>
        </button>
      </div>

      {/* Mobile Drawer Menu if active */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-3 rounded-2xl border border-white/15 bg-black/90 backdrop-blur-2xl shadow-2xl flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveSection(item.id);
                setMobileMenuOpen(false);
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeSection === item.id
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-white/[0.06] text-zinc-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
