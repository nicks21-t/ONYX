import React, { useState } from 'react';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, resendConfirmation, signInDemo, signInDirectly, isConfigured } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [unconfirmedName, setUnconfirmedName] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Inserisci sia l\'indirizzo email che la password.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setErrorMsg('La password deve contenere almeno 6 caratteri.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setErrorMsg('Inserisci il tuo nome completo.');
      return;
    }

    setSubmitting(true);

    if (mode === 'login') {
      const res = await signIn(email.trim(), password);
      if (res.error) {
        setErrorMsg(res.error);
        if (res.isUnconfirmed) {
          setUnconfirmedEmail(email.trim());
        }
      }
    } else {
      const res = await signUp(email.trim(), password, fullName.trim());
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.message) {
        setInfoMsg(res.message);
        if (res.isEmailConfirmationRequired) {
          setUnconfirmedEmail(email.trim());
          setUnconfirmedName(fullName.trim());
        }
      }
    }

    setSubmitting(false);
  };

  const handleResend = async () => {
    const targetEmail = unconfirmedEmail || email.trim();
    if (!targetEmail) return;
    setResending(true);
    const res = await resendConfirmation(targetEmail);
    setResending(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.message) {
      setInfoMsg(res.message);
    }
  };

  const handleDirectAccess = () => {
    const targetEmail = unconfirmedEmail || email.trim() || 'utente@onyx.app';
    const targetName = unconfirmedName || fullName.trim() || targetEmail.split('@')[0];
    signInDirectly(targetEmail, targetName);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-white selection:bg-[#ff5e1e]/30 selection:text-white overflow-hidden bg-[#07070a]">
      {/* Sleek Modern Dark Glassmorphic Ambient Canvas (No photo) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[#07070a]" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[700px] rounded-full bg-[#ff5e1e]/10 blur-[130px]" />
        <div className="absolute -bottom-40 -left-20 h-[480px] w-[580px] rounded-full bg-[#10b981]/5 blur-[140px]" />
        <div className="absolute top-1/3 -right-32 h-[500px] w-[600px] rounded-full bg-[#6366f1]/5 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute inset-0 bg-radial from-transparent via-[#07070a]/40 to-[#07070a]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#ff6b35] to-[#ff5e1e] text-white shadow-2xl shadow-[#ff5e1e]/40 mb-4 ring-1 ring-white/30">
            <span className="font-black text-2xl tracking-tighter">O</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            ONYX
          </h1>
          <p className="mt-1 text-xs text-zinc-300">
            Modern Dark Glass OS · Turni, Routine, Sport & Finanze
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/15 bg-black/60 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl ring-1 ring-white/5">
          {/* Mode Switcher Pill */}
          <div className="grid grid-cols-2 gap-1 rounded-full border border-white/15 bg-black/50 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`rounded-full py-2 text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-black shadow-lg ring-1 ring-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`rounded-full py-2 text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-black shadow-lg ring-1 ring-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Registrati
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/15 p-3.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info / Success Message */}
          {infoMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-[#a3e635]/30 bg-[#a3e635]/15 p-3.5 text-xs text-[#a3e635]">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Unconfirmed Email Action Box */}
          {unconfirmedEmail && (
            <div className="mb-5 rounded-2xl border border-[#ff5e1e]/30 bg-[#ff5e1e]/10 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-[#ff5e1e] shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-200">
                  <p className="font-semibold text-white">Email in attesa di conferma: <span className="text-[#ff6b35] font-mono">{unconfirmedEmail}</span></p>
                  <p className="mt-1 text-[11px] text-zinc-300 leading-relaxed">
                    Supabase richiede di confermare l'email prima di consentire il login classico. Controlla la tua posta (anche spam).
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="flex-1 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 py-2 text-[11px] font-bold text-white transition-all cursor-pointer text-center"
                >
                  {resending ? 'Reinvio in corso...' : 'Rinvia email di conferma'}
                </button>
                <button
                  type="button"
                  onClick={handleDirectAccess}
                  className="flex-1 rounded-full bg-[#ff5e1e] hover:bg-[#ff7844] py-2 text-[11px] font-bold text-white transition-all cursor-pointer text-center shadow-md shadow-[#ff5e1e]/30"
                >
                  Accedi subito con questo account
                </button>
              </div>

              <div className="pt-1 border-t border-white/10 text-[10px] text-zinc-400">
                💡 <span className="text-zinc-300 font-semibold">Vuoi evitare le email di verifica?</span> Nella tua Dashboard Supabase: <span className="text-zinc-200">Authentication → Providers → Email</span>, togli la spunta da <span className="text-zinc-200">"Confirm email"</span> e salva.
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nome e Cognome
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Marco Rossi"
                    className="w-full rounded-2xl border border-white/15 bg-black/40 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-[#ff5e1e]"
                    required={mode === 'register'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Indirizzo Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nome@esempio.com"
                  className="w-full rounded-2xl border border-white/15 bg-black/40 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-[#ff5e1e]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Password
                </label>
                {mode === 'login' && (
                  <span
                    onClick={() => {
                      if (!email) {
                        setErrorMsg('Inserisci prima il tuo indirizzo email.');
                      } else {
                        handleResend();
                      }
                    }}
                    className="text-[11px] text-[#ff5e1e] cursor-pointer hover:underline"
                  >
                    Rinvia link email
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/15 bg-black/40 pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-[#ff5e1e]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-3 text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Primary Capsule Button */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#ff5e1e] hover:bg-[#ff7844] py-3 text-xs font-bold text-white shadow-xl shadow-[#ff5e1e]/30 disabled:opacity-50 transition-all cursor-pointer ring-1 ring-white/20 active:scale-98"
            >
              {submitting ? (
                <span>Autenticazione in corso...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Accedi a ONYX' : 'Crea Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-black/50 px-3 text-[11px] font-medium text-zinc-400">
              oppure
            </span>
          </div>

          {/* Demo Login Button */}
          <button
            type="button"
            onClick={signInDemo}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-white/20 bg-white/[0.04] hover:bg-white/[0.08] py-2.5 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-98"
          >
            <ShieldCheck className="h-4 w-4 text-[#a3e635]" />
            <span>Accedi subito come Demo (Marco V.)</span>
          </button>

          {/* Status Indicator */}
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-black/40 p-3 text-[11px] text-zinc-400 border border-white/10">
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-[#ff5e1e]" />
              <span>Stato Supabase:</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              {isConfigured ? (
                <span className="flex items-center gap-1 text-[#a3e635]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a3e635]" />
                  Supabase Live Attivo
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Modalità Demo Integrata
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
