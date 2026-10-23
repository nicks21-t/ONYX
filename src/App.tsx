/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CinematicSidebar } from './components/layout/CinematicSidebar';
import { CinematicHeader } from './components/layout/CinematicHeader';
import { OverviewSection } from './components/sections/OverviewSection';
import { ShiftsSection } from './components/sections/ShiftsSection';
import { RoutineSportSection } from './components/sections/RoutineSportSection';
import { FinancesSection } from './components/sections/FinancesSection';
import { RemindersSection } from './components/sections/RemindersSection';
import { QuickActionModal } from './components/modals/QuickActionModal';
import { AuthPage } from './components/auth/AuthPage';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { activeSection, toastMessage } = useApp();

  return (
    <div className="relative min-h-screen text-[#F8FAFC] selection:bg-[#6366F1]/30 selection:text-white flex overflow-hidden bg-[#0D0F12]">
      {/* 1. Sleek Modern Dark Slate Canvas with Subtle Night Indigo & Cool Cyan Ambient Lighting */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base Slate Foundation */}
        <div className="absolute inset-0 bg-[#0D0F12]" />

        {/* Ambient Subtle Night Indigo / Deep Violet Glow (Upper Center) */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[750px] rounded-full bg-[#6366f1]/10 blur-[140px]" />

        {/* Ambient Slate / Steel Glow (Bottom Left) */}
        <div className="absolute -bottom-40 -left-20 h-[480px] w-[580px] rounded-full bg-[#334155]/20 blur-[150px]" />

        {/* Ambient Night Indigo Accent (Right Center) */}
        <div className="absolute top-1/3 -right-32 h-[500px] w-[600px] rounded-full bg-[#4f46e5]/8 blur-[160px]" />

        {/* Minimalist Micro Dot Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Atmospheric Scrim */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#0D0F12]/50 to-[#0D0F12]" />
      </div>

      {/* 2. Left Column: Narrow Cinematic Sidebar */}
      <CinematicSidebar />

      {/* 3. Right Column: Main Content Area with Cinematic Header */}
      <div className="relative z-10 flex flex-1 flex-col min-w-0 h-screen overflow-y-auto md:ml-20">
        {/* Top Header with AI Bar & Quick Controls */}
        <CinematicHeader />

        {/* Dashboard Main Grid Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {activeSection === 'panoramica' && <OverviewSection />}
          {activeSection === 'lavoro' && <ShiftsSection />}
          {activeSection === 'routine' && <RoutineSportSection />}
          {activeSection === 'finanze' && <FinancesSection />}
          {activeSection === 'promemoria' && <RemindersSection />}
        </main>
      </div>

      {/* Quick Action Modal */}
      <QuickActionModal />

      {/* Toast Notification Glassmorphism Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full border border-white/15 bg-[#161920]/90 px-5 py-3 text-xs font-semibold text-[#F8FAFC] shadow-2xl backdrop-blur-2xl ring-1 ring-[#6366F1]/30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-[#6366F1] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D0F12] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white shadow-xl shadow-[#6366F1]/30 ring-1 ring-white/20 animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6366F1]" />
            <span>Caricamento sessione...</span>
          </div>
        </div>
      </div>
    );
  }

  // Quando l'utente non è loggato mostra il form di Login/Registrazione
  if (!user) {
    return <AuthPage />;
  }

  // Quando è loggato mostra la dashboard cinematica
  return <DashboardLayout />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
