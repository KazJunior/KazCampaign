import React, { useState } from 'react';
import { Gift, Coins, Egg, CheckCircle2, AlertCircle, Loader2, X, Sparkles, ArrowRight, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { redeemCoupon, type RedeemCouponResponse } from '../utils/api';
import type { AuthUser } from '../utils/api';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: AuthUser | null;
  onRedeemed: (reward: any, newGold?: number, newEggs?: any[], newUnlockedClasses?: string[]) => void;
}

export function CouponModal({ isOpen, onClose, authUser, onRedeemed }: CouponModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<RedeemCouponResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Digite o código do cupom.');
      return;
    }

    if (!authUser || authUser.id === 0) {
      setError('Você precisa estar conectado à sua conta para resgatar cupons.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await redeemCoupon(cleanCode);
      if (res.ok) {
        setSuccessResult(res);
        onRedeemed(res.reward, res.newGold, res.newEggs, res.newUnlockedClasses);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AD65', '#10B981', '#F59E0B', '#3B82F6'],
        });
      } else {
        setError(res.error || 'Erro ao resgatar cupom.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado ao resgatar cupom.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForAnother = () => {
    setCode('');
    setError(null);
    setSuccessResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#1B2030] border-2 border-[#D4AD65]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Decorativo */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#10131C] via-[#1B2030] to-[#10131C] border-b border-[#343B50] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/25 border border-emerald-500/40 text-emerald-400">
              <Gift size={20} />
            </span>
            <div>
              <h2 className="text-base font-black text-white tracking-wide flex items-center gap-2">
                Resgatar Cupom
                <Sparkles size={14} className="text-[#D4AD65]" />
              </h2>
              <p className="text-xs text-slate-400">Insira seu código para receber recompensas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          {!authUser || authUser.id === 0 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertCircle size={16} />
                <span>Conta Desconectada</span>
              </div>
              <p>
                Os cupons promocionais são vinculados à sua conta na nuvem para garantir que cada jogador receba
                sua recompensa com segurança. Faça login para resgatar.
              </p>
            </div>
          ) : successResult ? (
            <div className="space-y-4 text-center py-2 animate-scale-up">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Recompensa Resgatada!</h3>
                <p className="text-xs text-emerald-400 font-bold mt-0.5">
                  Cupom: {successResult.coupon?.code || code}
                </p>
                {successResult.coupon?.description && (
                  <p className="text-xs text-slate-400 italic mt-1">{successResult.coupon.description}</p>
                )}
              </div>

              {/* Card de Recompensas */}
              <div className="p-4 rounded-xl bg-[#10131C] border border-[#343B50] space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Itens creditados na sua conta
                </span>

                {successResult.reward?.unlockedClass ? (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-purple-400/60 shadow-lg shadow-purple-500/10 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400/80 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
                        <Shield size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
                          Nova Classe Desbloqueada!
                        </span>
                        <h4 className="text-sm font-black text-white truncate">
                          {successResult.reward.unlockedClass.name}
                        </h4>
                        <p className="text-[11px] text-slate-300 line-clamp-1">
                          {successResult.reward.unlockedClass.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {successResult.reward?.compensationMessage ? (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] text-left">
                    {successResult.reward.compensationMessage}
                  </div>
                ) : null}

                {successResult.reward?.gold ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#D4AD65]/10 border border-[#D4AD65]/30">
                    <div className="flex items-center gap-2">
                      <Coins size={18} className="text-[#D4AD65]" />
                      <span className="text-xs font-bold text-slate-200">Ouro da Campanha</span>
                    </div>
                    <span className="text-sm font-black text-[#D4AD65]">
                      +{successResult.reward.gold.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ) : null}

                {Array.isArray(successResult.reward?.eggs) && successResult.reward.eggs.length > 0 ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-2">
                      <Egg size={18} className="text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">Ovos de Mascote</span>
                    </div>
                    <span className="text-sm font-black text-amber-400">
                      +{successResult.reward.eggs.length} Ovo(s)
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleResetForAnother}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#10131C] border border-[#343B50] hover:border-slate-400 text-slate-300 font-bold text-xs transition-colors"
                >
                  Resgatar Outro
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Código Promocional
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError(null);
                    }}
                    placeholder="EX: KAZ2026"
                    maxLength={32}
                    disabled={loading}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-[#10131C] border-2 border-[#343B50] focus:border-[#D4AD65] text-white font-black tracking-widest placeholder:text-slate-600 placeholder:font-normal text-sm outline-none transition-colors uppercase text-center"
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  Cada cupom pode ser resgatado uma única vez por jogador.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AD65] to-[#B3873B] hover:from-[#E5BF77] hover:to-[#C69A4C] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D4AD65]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-black" />
                    <span>Verificando Cupom...</span>
                  </>
                ) : (
                  <>
                    <span>Resgatar Recompensa</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
