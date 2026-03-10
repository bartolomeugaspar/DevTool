import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import type { Reservation } from '../types';

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pendente:  { bg: 'rgba(234,179,8,0.10)',   color: '#eab308', label: 'Pendente'  },
  concluido: { bg: 'rgba(49,236,198,0.10)',  color: '#31ECC6', label: 'Concluído' },
  cancelado: { bg: 'rgba(248,113,113,0.10)', color: '#f87171', label: 'Cancelado' },
};

// ── Cancel Modal ─────────────────────────────────────────────────────────────
interface CancelModalProps {
  reservation: Reservation;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
  light: boolean;
}

function CancelModal({ reservation, onConfirm, onClose, isPending, light }: CancelModalProps) {
  const overlay = 'rgba(0,0,0,0.55)';
  const card    = light ? '#ffffff'  : '#0e1e35';
  const border  = light ? '#e5e7eb'  : '#1a3557';
  const text1   = light ? '#0c2340'  : '#ffffff';
  const text2   = light ? '#586779'  : '#8e9bab';
  const infoRow = light ? '#f9fafb'  : '#0c2340';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: overlay }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeUp"
        style={{ background: card, border: `1px solid ${border}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: `1px solid ${border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(248,113,113,0.12)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold" style={{ color: text1 }}>Cancelar transação</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-60"
            style={{ color: text2 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: text2 }}>
            Tens a certeza que queres cancelar esta transação? Esta ação é <span className="font-medium" style={{ color: text1 }}>irreversível</span>.
          </p>

          {/* Summary */}
          <div className="rounded-xl p-4 space-y-2.5" style={{ background: infoRow, border: `1px solid ${border}` }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: text2 }}>Serviço</span>
              <span className="font-medium" style={{ color: text1 }}>{reservation.services?.nome ?? '—'}</span>
            </div>
            <div style={{ height: 1, background: border }} />
            <div className="flex justify-between text-sm">
              <span style={{ color: text2 }}>Valor</span>
              <span className="font-semibold" style={{ color: '#f87171' }}>
                {reservation.services?.preco != null ? `Kz ${reservation.services.preco.toFixed(2)}` : '—'}
              </span>
            </div>
            <div style={{ height: 1, background: border }} />
            <div className="flex justify-between text-sm">
              <span style={{ color: text2 }}>Data</span>
              <span style={{ color: text1 }}>{new Date(reservation.created_at).toLocaleDateString('pt-PT')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            style={{ background: light ? '#f3f4f6' : '#1a3557', color: light ? '#0c2340' : '#8e9bab' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Voltar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: isPending ? '#f87171aa' : '#ef4444' }}
            onMouseEnter={e => { if (!isPending) e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                A cancelar...
              </span>
            ) : 'Confirmar cancelamento'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Transactions() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();
  const light = theme === 'light';

  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);

  const card   = light ? '#ffffff' : '#0e1e35';
  const border = light ? '#e5e7eb' : '#1a3557';
  const thead  = light ? '#f3f4f6' : '#0c2340';
  const text1  = light ? '#0c2340' : '#ffffff';
  const text2  = light ? '#586779' : '#8e9bab';
  const accent = light ? '#002f7a' : '#31ECC6';
  const rowHover = light ? '#f9fafb' : 'rgba(255,255,255,0.03)';

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: transactionService.getHistory,
  });

  const cancelMutation = useMutation({
    mutationFn: transactionService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setCancelTarget(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2" style={{ borderColor: accent }} />
      </div>
    );
  }

  return (
    <>
    {cancelTarget && (
      <CancelModal
        reservation={cancelTarget}
        onConfirm={() => cancelMutation.mutate(cancelTarget.id)}
        onClose={() => !cancelMutation.isPending && setCancelTarget(null)}
        isPending={cancelMutation.isPending}
        light={light}
      />
    )}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 sm:mb-8" style={{ color: text1 }}>Histórico de Transações</h1>

      {reservations.length === 0 ? (
        <div className="text-center py-20" style={{ color: text2 }}>
          Nenhuma transação encontrada.
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: card, border: `1px solid ${border}` }}>
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead style={{ background: thead }}>
              <tr>
                {['Serviço', 'Preço', 'Status', 'Data', ...(user?.tipo_usuario === 'cliente' ? ['Ação'] : [])].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: text2 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map((res, idx) => {
                const st = STATUS_STYLES[res.status];
                return (
                  <tr key={res.id}
                    style={{ borderTop: idx > 0 ? `1px solid ${border}` : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-6 py-4 font-medium" style={{ color: text1 }}>
                      {res.services?.nome ?? '—'}
                    </td>
                    <td className="px-6 py-4 font-semibold" style={{ color: accent }}>
                      {res.services?.preco != null
                        ? `Kz ${res.services.preco.toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: st?.bg ?? 'rgba(100,100,100,0.1)', color: st?.color ?? text2 }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {st?.label ?? res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4" style={{ color: text2 }}>
                      {new Date(res.created_at).toLocaleDateString('pt-PT')}
                    </td>
                    {user?.tipo_usuario === 'cliente' && (
                      <td className="px-6 py-4">
                        {res.status === 'pendente' && (
                          <button
                            onClick={() => setCancelTarget(res)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                            style={{ background: 'rgba(248,113,113,0.10)', color: '#f87171' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.20)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.10)')}
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
