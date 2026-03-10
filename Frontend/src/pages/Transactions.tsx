import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { useAuthStore } from '../store/authStore';

const statusColors: Record<string, string> = {
  pendente: 'bg-yellow-900 text-yellow-300',
  concluido: 'bg-green-900 text-green-300',
  cancelado: 'bg-red-900 text-red-300',
};

export default function Transactions() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Histórico de Transações</h1>

      {reservations.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          Nenhuma transação encontrada.
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="text-left px-6 py-3">Serviço</th>
                <th className="text-left px-6 py-3">Preço</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Data</th>
                {user?.tipo_usuario === 'cliente' && (
                  <th className="text-left px-6 py-3">Ação</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-white">
                    {res.services?.nome ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-indigo-400">
                    {res.services?.preco != null
                      ? `€${res.services.preco.toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${statusColors[res.status] ?? 'bg-gray-700 text-gray-300'}`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(res.created_at).toLocaleDateString('pt-PT')}
                  </td>
                  {user?.tipo_usuario === 'cliente' && (
                    <td className="px-6 py-4">
                      {res.status === 'pendente' && (
                        <button
                          onClick={() => cancelMutation.mutate(res.id)}
                          disabled={cancelMutation.isPending}
                          className="text-xs bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1 rounded transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
