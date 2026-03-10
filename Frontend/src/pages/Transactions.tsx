import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pendente:  { bg: 'rgba(234,179,8,0.10)',   color: '#eab308', label: 'Pendente'  },
  concluido: { bg: 'rgba(49,236,198,0.10)',  color: '#31ECC6', label: 'Concluído' },
  cancelado: { bg: 'rgba(248,113,113,0.10)', color: '#f87171', label: 'Cancelado' },
};

export default function Transactions() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();
  const light = theme === 'light';

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
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8" style={{ color: text1 }}>Histórico de Transações</h1>

      {reservations.length === 0 ? (
        <div className="text-center py-20" style={{ color: text2 }}>
          Nenhuma transação encontrada.
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: card, border: `1px solid ${border}` }}>
          <table className="w-full text-sm">
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
                            onClick={() => cancelMutation.mutate(res.id)}
                            disabled={cancelMutation.isPending}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
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
      )}
    </div>
  );
}
