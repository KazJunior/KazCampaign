import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2, Trophy } from 'lucide-react';
import { login, register } from '../utils/api';
import type { AuthUser } from '../utils/api';

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
  onOpenLeaderboard: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, onOpenLeaderboard }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isRegister && password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const user = isRegister ? await register(username.trim(), password) : await login(username.trim(), password);
      onAuthenticated(user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError(null);
    setConfirm('');
  };

  const inputClass =
    'w-full bg-[#10131C] border border-[#343B50] rounded-xl px-4 py-3 text-sm text-[#F3F4F8] placeholder-[#5C6580] outline-none transition-all focus:border-[#D4AD65] focus:ring-2 focus:ring-[#D4AD65]/20';

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#2a1f4a_0%,#10131C_60%)] text-[#F3F4F8] flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <div className="text-center space-y-3">
          <img src="/logo.svg" alt="Logo KazCampaign" className="w-20 h-20 mx-auto drop-shadow-[0_0_24px_rgba(212,173,101,0.45)]" />
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#fde68a] to-[#D4AD65] bg-clip-text text-transparent">
            KazCampaign
          </h1>
          <p className="text-sm text-[#A7B0C4]">Entre para salvar seu progresso no ranking global.</p>
        </div>

        <div className="bg-[#1B2030]/90 backdrop-blur border border-[#343B50] rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="grid grid-cols-2 gap-1 bg-[#10131C] p-1 rounded-xl">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                id={`auth-tab-${m}`}
                type="button"
                onClick={() => switchMode(m)}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  mode === m ? 'bg-[#D4AD65] text-[#10131C] shadow' : 'text-[#A7B0C4] hover:text-[#F3F4F8]'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              id="auth-username"
              className={inputClass}
              placeholder="Usuário"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              required
            />
            <input
              id="auth-password"
              type="password"
              className={inputClass}
              placeholder="Senha"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={72}
              required
            />
            {isRegister && (
              <input
                id="auth-confirm"
                type="password"
                className={inputClass}
                placeholder="Confirmar senha"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                maxLength={72}
                required
              />
            )}
            {isRegister && (
              <p className="text-[11px] text-[#7C86A0]">3 a 20 caracteres (letras, números ou _) · senha com no mínimo 6.</p>
            )}

            {error && (
              <div className="text-xs text-[#FF7A7A] bg-[#FF5252]/10 border border-[#FF5252]/30 rounded-lg px-3 py-2">{error}</div>
            )}

            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AD65] to-[#b8893a] text-[#10131C] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#D4AD65]/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
              {isRegister ? 'Criar conta' : 'Entrar'}
            </button>
          </form>
        </div>

        <button
          id="auth-open-leaderboard"
          type="button"
          onClick={onOpenLeaderboard}
          className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#D4AD65] border border-[#D4AD65]/30 bg-[#D4AD65]/5 hover:bg-[#D4AD65]/15 transition-colors flex items-center justify-center gap-2"
        >
          <Trophy size={16} /> Ver ranking global
        </button>
      </div>
    </div>
  );
};
