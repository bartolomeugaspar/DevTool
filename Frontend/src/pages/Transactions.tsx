import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { toast } from '../components/Toast';
import { STATUS_STYLES, QUERY_KEYS } from '../lib/constants';
import type { Reservation } from '../types';
import CancelModal from '../components/CancelModal';

type StatusFilter = 'todos' | 'pendente' | 'concluido' | 'cancelado';

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'todos',     label: 'Todos' },
  { key: 'pendente',  label: 'Pendente' },
  { key: 'concluido', label: 'Concluído' },
  { key: 'cancelado', label: 'Cancelado' },
];

function RowSkeleton({ border, skelBg, cols }: { border: string; skelBg: string; cols: number }) {
  const P = ({ w }: { w: string }) => (
    <div className="rounded-lg animate-pulse h-4" style={{ width: w, background: skelBg }} />
  );
  const widths = ['55%', '4.5rem', '60%', '5rem', '5.5rem', '4rem'];
  return (
    <tr style={{ borderTop: `1px solid ${border}` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <P w={widths[i] ?? '50%'} />
        </td>
      ))}
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Transactions() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isPrestador = user?.tipo_usuario === 'prestador';

  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');

  const { card, border, thead, text1, text2, accent, accentBg, hover: rowHover, skelBg } = useTheme();

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.RESERVATIONS,
    queryFn: transactionService.getHistory,
  });

  const cancelMutation = useMutation({
    mutationFn: transactionService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESERVATIONS });
      toast.success('Reserva cancelada');
      setCancelTarget(null);
    },
    onError: () => toast.error('Erro ao cancelar reserva'),
  });

  const filtered = useMemo(() => {
    if (statusFilter === 'todos') return reservations;
    return reservations.filter(r => r.status === statusFilter);
  }, [reservations, statusFilter]);

  // Summary totals
  const totals = useMemo(() => {
    const total = reservations.reduce((s, r) => s + (r.services?.preco ?? 0), 0);
    const pending = reservations.filter(r => r.status === 'pendente').length;
    const done    = reservations.filter(r => r.status === 'concluido').length;
    const cancelled = reservations.filter(r => r.status === 'cancelado').length;
    return { total, pending, done, cancelled, count: reservations.length };
  }, [reservations]);

  const cols = isPrestador ? 5 : 6;

  return (
    <>
    {cancelTarget && (
      <CancelModal
        reservation={cancelTarget}
        onConfirm={() => cancelMutation.mutate(cancelTarget.id)}
        onClose={() => !cancelMutation.isPending && setCancelTarget(null)}
        isPending={cancelMutation.isPending}
      />
    )}
    <div className="w-full px-4 sm:px-6 py-8">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 sm:mb-8" style={{ color: text1 }}>Histórico de Transações</h1>

      {/* Summary cards */}
      {!isLoading && reservations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: isPrestador ? 'Total recebido' : 'Total gasto',
              value: `Kz ${totals.total.toFixed(2)}`,
              color: accent,
              bg: accentBg,
            },
            { label: 'Pendentes',  value: String(totals.pending),   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
            { label: 'Concluídos', value: String(totals.done),      color: '#31ECC6', bg: 'rgba(49,236,198,0.08)' },
            { label: 'Cancelados', value: String(totals.cancelled),  color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: card, border: `1px solid ${border}` }}>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: text2 }}>{label}</span>
              <span className="text-xl font-bold" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Status filter tabs */}
      {!isLoading && reservations.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          {FILTER_TABS.map(tab => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className="text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
                style={{
                  background: active ? accentBg : card,
                  color: active ? accent : text2,
                  border: `1px solid ${active ? accent : border}`,
                }}
              >
                {tab.label}
                {tab.key !== 'todos' && (
                  <span className="ml-1.5 opacity-60">
                    {tab.key === 'pendente'  ? totals.pending   :
                     tab.key === 'concluido' ? totals.done      :
                     totals.cancelled}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl overflow-hidden" style={{ background: card, border: `1px solid ${border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead style={{ background: thead }}>
                <tr>
                  {['Serviço','Preço', isPrestador ? 'Cliente' : 'Prestador','Status','Data', ...(!isPrestador ? ['Ação'] : [])].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: text2 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <RowSkeleton key={i} border={border} skelBg={skelBg} cols={cols} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: accentBg }}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: text2 }}>
            {statusFilter !== 'todos'
              ? `Sem transações ${FILTER_TABS.find(t => t.key === statusFilter)?.label.toLowerCase()}.`
              : 'Nenhuma transação encontrada.'}
          </p>
          {statusFilter !== 'todos' && (
            <button
              onClick={() => setStatusFilter('todos')}
              className="text-xs font-medium hover:opacity-70 transition-opacity"
              style={{ color: accent }}
            >
              Ver todas
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: card, border: `1px solid ${border}` }}>
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead style={{ background: thead }}>
              <tr>
                {[
                  'Serviço',
                  'Preço',
                  isPrestador ? 'Cliente' : 'Prestador',
                  'Status',
                  'Data',
                  ...(!isPrestador ? ['Ação'] : []),
                ].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: text2 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((res, idx) => {
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
                    <td className="px-6 py-4" style={{ color: text2 }}>
                      {isPrestador
                        ? (res.users?.nome_completo ?? res.users?.email ?? '—')
                        : (res.services?.users?.nome_completo ?? '—')}
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
                    {!isPrestador && (
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
