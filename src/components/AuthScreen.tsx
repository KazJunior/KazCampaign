import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Loader2,
  Trophy,
  Gamepad2,
  Key,
  Copy,
  Check,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { login, register, recoverPassword } from '../utils/api';
import type { AuthUser } from '../utils/api';

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
  onOpenLeaderboard: () => void;
  onOpenChangelog?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, onOpenLeaderboard, onOpenChangelog }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal para exibir a Recovery Key após cadastro ou redefinição
  const [pendingRecoveryModal, setPendingRecoveryModal] = useState<{
    user: AuthUser;
    key: string;
    isNewAfterRecovery?: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [keySavedConfirmed, setKeySavedConfirmed] = useState(false);

  const isRegister = mode === 'register';
  const isRecover = mode === 'recover';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if ((isRegister || isRecover) && password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      if (isRecover) {
        const res = await recoverPassword(username.trim(), recoveryKey.trim(), password);
        setPendingRecoveryModal({
          user: res.user,
          key: res.newRecoveryKey,
          isNewAfterRecovery: true,
        });
      } else if (isRegister) {
        const res = await register(username.trim(), password);
        if (res.recoveryKey) {
          setPendingRecoveryModal({
            user: res.user,
            key: res.recoveryKey,
            isNewAfterRecovery: false,
          });
        } else {
          onAuthenticated(res.user);
        }
      } else {
        const user = await login(username.trim(), password);
        onAuthenticated(user);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'register' | 'recover') => {
    setMode(next);
    setError(null);
    setConfirm('');
    setRecoveryKey('');
  };

  const handleCopyKey = () => {
    if (!pendingRecoveryModal?.key) return;
    navigator.clipboard.writeText(pendingRecoveryModal.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePlayOffline = () => {
    localStorage.setItem('kazcampaign_offline_mode', 'true');
    onAuthenticated({ id: 0, username: 'Convidado' });
  };

  const inputClass =
    'w-full bg-[#10131C] border border-[#343B50] rounded-xl px-4 py-3 text-sm text-[#F3F4F8] placeholder-[#5C6580] outline-none transition-all focus:border-[#D4AD65] focus:ring-2 focus:ring-[#D4AD65]/20';

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#2a1f4a_0%,#10131C_60%)] text-[#F3F4F8] flex items-center justify-center p-4 font-sans select-none relative">
      <div className="w-full max-w-md space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <div className="text-center space-y-3">
          <img
            src="/logo.svg"
            alt="Logo KazCampaign"
            className="w-20 h-20 mx-auto drop-shadow-[0_0_24px_rgba(212,173,101,0.45)]"
          />
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#fde68a] to-[#D4AD65] bg-clip-text text-transparent">
            KazCampaign
          </h1>
          <p className="text-sm text-[#A7B0C4]">Entre para salvar seu progresso no ranking global.</p>
        </div>

        <div className="bg-[#1B2030]/90 backdrop-blur border border-[#343B50] rounded-2xl p-6 shadow-2xl space-y-5">
          {!isRecover ? (
            <div className="grid grid-cols-2 gap-1 bg-[#10131C] p-1 rounded-xl">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  id={`auth-tab-${m}`}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    mode === m
                      ? 'bg-[#D4AD65] text-[#10131C] shadow'
                      : 'text-[#A7B0C4] hover:text-[#F3F4F8]'
                  }`}
                >
                  {m === 'login' ? 'Entrar' : 'Cadastrar'}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between pb-1 border-b border-[#343B50]/60">
              <button
                type="button"
                id="auth-recover-back"
                onClick={() => switchMode('login')}
                className="flex items-center gap-1.5 text-xs text-[#A7B0C4] hover:text-[#D4AD65] transition-colors py-1 px-2 rounded-lg hover:bg-[#10131C]"
              >
                <ArrowLeft size={16} /> Voltar ao Login
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AD65]">Recuperar Conta</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRecover && (
              <p className="text-xs text-[#A7B0C4] leading-relaxed bg-[#10131C]/60 p-3 rounded-xl border border-[#343B50]/50">
                Insira sua <strong>Chave de Recuperação</strong> (gerada no cadastro ou pelo ADM) para redefinir sua senha com segurança.
              </p>
            )}

            <div>
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
            </div>

            {isRecover && (
              <div>
                <input
                  id="auth-recovery-key"
                  className={`${inputClass} font-mono uppercase tracking-wider`}
                  placeholder="Chave de Recuperação (KAZ-XXXX-XXXX-XXXX)"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())}
                  required
                />
              </div>
            )}

            <div>
              <input
                id="auth-password"
                type="password"
                className={inputClass}
                placeholder={isRecover ? 'Nova senha' : 'Senha'}
                autoComplete={isRegister || isRecover ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={72}
                required
              />
            </div>

            {!isRegister && !isRecover && (
              <div className="flex justify-end">
                <button
                  id="auth-forgot-password"
                  type="button"
                  onClick={() => switchMode('recover')}
                  className="text-xs text-[#D4AD65] hover:text-[#fde68a] hover:underline transition-colors py-0.5"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {(isRegister || isRecover) && (
              <input
                id="auth-confirm"
                type="password"
                className={inputClass}
                placeholder={isRecover ? 'Confirmar nova senha' : 'Confirmar senha'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                maxLength={72}
                required
              />
            )}

            {isRegister && (
              <p className="text-[11px] text-[#7C86A0]">
                3 a 20 caracteres (letras, números ou _) · senha com no mínimo 6. Uma <strong>Chave de Recuperação</strong> será gerada para você guardar.
              </p>
            )}

            {error && (
              <div className="text-xs text-[#FF7A7A] bg-[#FF5252]/10 border border-[#FF5252]/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AD65] to-[#b8893a] text-[#10131C] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#D4AD65]/20"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isRecover ? (
                <Key size={18} />
              ) : isRegister ? (
                <UserPlus size={18} />
              ) : (
                <LogIn size={18} />
              )}
              {isRecover ? 'Redefinir Senha' : isRegister ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          {!isRecover && (
            <>
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#343B50]"></div>
                <span className="flex-shrink mx-3 text-xs font-semibold text-[#7C86A0] uppercase tracking-wider">
                  ou
                </span>
                <div className="flex-grow border-t border-[#343B50]"></div>
              </div>

              <button
                id="auth-play-offline"
                type="button"
                onClick={handlePlayOffline}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#22283A] hover:bg-[#2D354D] text-[#F3F4F8] border border-[#3E4765] hover:border-[#38BDF8]/60 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md group"
              >
                <Gamepad2
                  size={18}
                  className="text-[#38BDF8] group-hover:scale-110 transition-transform"
                />
                Jogar Offline (Convidado)
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="auth-open-leaderboard"
            type="button"
            onClick={onOpenLeaderboard}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#D4AD65] border border-[#D4AD65]/30 bg-[#D4AD65]/5 hover:bg-[#D4AD65]/15 transition-colors flex items-center justify-center gap-2"
          >
            <Trophy size={16} /> Ver ranking global
          </button>
          {onOpenChangelog && (
            <button
              id="auth-open-changelog"
              type="button"
              onClick={onOpenChangelog}
              className="py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#10B981] border border-[#10B981]/30 bg-[#10B981]/5 hover:bg-[#10B981]/15 transition-colors flex items-center justify-center gap-1.5"
              title="Notas de Atualização"
            >
              <Sparkles size={16} /> v1.4
            </button>
          )}
        </div>
      </div>

      {/* Modal de Exibição da Recovery Key */}
      {pendingRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md bg-[#1B2030] border-2 border-[#D4AD65]/60 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#D4AD65]/20 border border-[#D4AD65]/40 text-[#D4AD65]">
                <Key size={26} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F3F4F8]">
                  {pendingRecoveryModal.isNewAfterRecovery
                    ? 'Nova Chave de Recuperação'
                    : 'Sua Chave de Recuperação'}
                </h3>
                <p className="text-xs text-[#A7B0C4]">
                  {pendingRecoveryModal.isNewAfterRecovery
                    ? 'Sua senha foi alterada com sucesso!'
                    : 'Conta criada com sucesso!'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#FFB020]/10 border border-[#FFB020]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#FFD68A]">
              <ShieldAlert size={18} className="shrink-0 text-[#FFB020] mt-0.5" />
              <p className="leading-relaxed">
                <strong>Atenção:</strong> Como o KazCampaign não utiliza e-mails, esta chave é a <strong>única forma</strong> de redefinir sua senha caso a perca. Guarde-a em um local seguro!
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#A7B0C4] uppercase tracking-wider">
                Chave de Segurança:
              </span>
              <div className="flex items-center gap-2">
                <div
                  id="auth-recovery-key-display"
                  className="flex-1 bg-[#10131C] border border-[#343B50] rounded-xl px-4 py-3 font-mono font-bold text-center text-base sm:text-lg text-[#D4AD65] tracking-widest select-all break-all shadow-inner"
                >
                  {pendingRecoveryModal.key}
                </div>
                <button
                  id="auth-copy-recovery-key"
                  type="button"
                  onClick={handleCopyKey}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                    copied
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#22283A] border-[#3E4765] hover:border-[#D4AD65] text-[#F3F4F8] hover:text-[#D4AD65]'
                  }`}
                  title="Copiar Chave"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-emerald-400 font-semibold text-center animate-pulse">
                  Chave copiada para a área de transferência!
                </p>
              )}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#A7B0C4] hover:text-[#F3F4F8] transition-colors bg-[#10131C]/40 p-3 rounded-xl border border-[#343B50]/40">
              <input
                id="auth-confirm-key-saved"
                type="checkbox"
                checked={keySavedConfirmed}
                onChange={(e) => setKeySavedConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-[#343B50] bg-[#10131C] text-[#D4AD65] focus:ring-[#D4AD65]/30 focus:ring-offset-0"
              />
              <span>
                Confirmo que copiei ou anotei minha <strong>Chave de Recuperação</strong> em um local seguro.
              </span>
            </label>

            <button
              id="auth-proceed-button"
              type="button"
              disabled={!keySavedConfirmed}
              onClick={() => {
                onAuthenticated(pendingRecoveryModal.user);
              }}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AD65] to-[#b8893a] text-[#10131C] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#D4AD65]/20"
            >
              Continuar para o Jogo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
