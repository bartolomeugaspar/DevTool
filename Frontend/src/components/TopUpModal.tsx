import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { walletService, TOPUP_AMOUNTS, type TopUpAmount } from '../services/walletService';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { toast } from './Toast';

interface TopUpModalProps {
  onClose: () => void;
}

export default function TopUpModal({ onClose }: TopUpModalProps) {
  const { token, user, setAuth } = useAuthStore();
  const { card, border, text1, text2, accent, accentBg, theme } = useTheme();
  const light = theme === 'light';

  const [selected, setSelected] = useState<TopUpAmount>(1000);

  const overlayBg  = 'rgba(0,0,0,0.55)';
  const optionBg   = light ? '#f3f4f6' : 'rgba(255,255,255,0.05)';
  const optionSelBg = light ? `rgba(0,47,122,0.08)` : 'rgba(49,236,198,0.08)';
  const optionSelBorder = light ? '#002f7a66' : '#31ECC666';
  const btnSecBg   = light ? '#f3f4f6' : 'rgba(255,255,255,0.06)';
  const btnSecText = light ? '#374151' : '#94a3b8';

  const mutation = useMutation({
    mutationFn: () => walletService.topup(selected),
    onSuccess: (updatedUser) => {
      if (token) setAuth(token, updatedUser);
      toast.success(`Kz ${selected.toFixed(2)} adicionados com sucesso!`);
      onClose();
    },
    onError: () => {
      toast.error('Erro ao carregar saldo. Tenta novamente.');
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: overlayBg }}
      onClick={(e) => { if (e.target === e.currentTarget && !mutation.isPending) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5 shadow-2xl"
        style={{ background: card, border: `1px solid ${border}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: accentBg }}>
              <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: text1 }}>Carregar Saldo</p>
              <p className="text-xs" style={{ color: text2 }}>Saldo actual: <span className="font-semibold" style={{ color: accent }}>Kz {(user?.saldo ?? 0).toFixed(2)}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-60"
            style={{ color: text2 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Amount picker */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: text2 }}>Escolhe o valor</p>
          <div className="grid grid-cols-2 gap-2">
            {TOPUP_AMOUNTS.map((amount) => {
              const isSel = selected === amount;
              return (
                <button
                  key={amount}
                  onClick={() => setSelected(amount)}
                  className="rounded-xl py-3 px-4 text-sm font-bold transition-all"
                  style={{
                    background: isSel ? optionSelBg : optionBg,
                    border: `1.5px solid ${isSel ? optionSelBorder : 'transparent'}`,
                    color: isSel ? accent : text1,
                  }}
                >
                  Kz {amount.toLocaleString('pt-PT')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-xl px-4 py-3 flex items-center justify-between"
          style={{ background: accentBg }}>
          <span className="text-xs font-medium" style={{ color: accent }}>Novo saldo após carregamento</span>
          <span className="text-sm font-extrabold" style={{ color: accent }}>
            Kz {((user?.saldo ?? 0) + selected).toFixed(2)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 font-medium py-2.5 rounded-xl transition-all"
            style={{ background: btnSecBg, color: btnSecText }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 text-white"
            style={{ background: accent }}
            onMouseEnter={e => !mutation.isPending && (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {mutation.isPending ? 'A carregar…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
