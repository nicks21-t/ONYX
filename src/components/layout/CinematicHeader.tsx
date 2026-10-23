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
import { useItalianLiveClock } from '../../lib/italianTime';
import { SectionId } from '../../types';

export const CinematicHeader: React.FC = () => {
  const { openQuickModal, activeSection, setActiveSection, showToast, toggleClockIn, shifts } = useApp();
  const { user } = useAuth();
  const italianTime = useItalianLiveClock();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: SectionId; label: string }> = [
    { id: 'panoramica', label: 'Panoramica' },
    { id: 'lavoro', label: 'Shift & Work' },
    { id: 'routine', label: 'Routine & Sport' },
    { id: 'finanze', label: 'Finance' },
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
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#161920]/80 text-[#F8FAFC] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo Monogram */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E222D] to-[#252A37] text-[#F8FAFC] shadow-lg border border-white/15 ring-1 ring-white/5">
              <span className="font-extrabold text-base tracking-tight">O</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#F1F5F9] leading-tight">
                ONYX
              </span>
              <span className="text-[11px] font-medium text-[#94A3B8]">
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/15 text-[#E2E8F0] hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
            title="Nuova registrazione"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#334155] to-[#1E222D] flex items-center justify-center font-bold text-[#F8FAFC] text-xs border border-white/15 shadow-md">
              {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#F1F5F9] leading-tight truncate max-w-[130px]">
                {user?.fullName || user?.email?.split('@')[0] || 'Utente'}
              </span>
              <span className="text-[10px] text-[#94A3B8] truncate max-w-[130px]">
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
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-[#94A3B8] hover:text-white transition-all cursor-pointer"
          title="Search"
        >
          <Search className="h-3.5 w-3.5" />
        </button>

        {/* Edit / Note circle button */}
        <button
          type="button"
          onClick={() => openQuickModal('promemoria')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-[#818CF8] hover:text-[#A5B4FC] transition-all cursor-pointer"
          title="Note e Promemoria"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-[#CBD5E1] cursor-pointer hover:bg-white/10 hover:text-white transition-all shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-[#818CF8]" />
          <span>{italianTime.formattedFullDate}</span>
          <ChevronDown className="h-3 w-3 text-[#94A3B8] ml-0.5" />
        </div>

        {/* "+ Add Wallet" Pill Button */}
        <button
          type="button"
          onClick={() => openQuickModal('spesa')}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#F1F5F9] transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <Plus className="h-3.5 w-3.5 text-[#94A3B8]" />
          <span>Add Wallet</span>
        </button>

        {/* "Create a Report" Pill Button */}
        <button
          type="button"
          onClick={() => {
            const todayShift = shifts.find(s => s.date === italianTime.dateStr) || shifts[0];
            if (todayShift) toggleClockIn(todayShift.id);
            else showToast('Report generato');
          }}
          className="rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#F1F5F9] transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <span>Create a Report</span>
        </button>
      </div>

      {/* Mobile Drawer Menu if active */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-3 rounded-2xl border border-white/15 bg-[#161920]/95 backdrop-blur-2xl shadow-2xl flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveSection(item.id);
                setMobileMenuOpen(false);
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeSection === item.id
                  ? 'bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] text-[#0D0F12] shadow-lg'
                  : 'bg-white/[0.06] text-[#94A3B8] hover:text-white'
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
