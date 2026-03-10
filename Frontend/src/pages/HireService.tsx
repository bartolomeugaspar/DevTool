import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../services/serviceService';
import { transactionService } from '../services/transactionService';

export default function HireService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceService.getById(id!),
    enabled: !!id,
  });

  const hireMutation = useMutation({
    mutationFn: transactionService.hire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setSuccess(true);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setServerError(error.response?.data?.error || 'Erro ao contratar serviço');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-red-400">Serviço não encontrado.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 text-center">
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-10">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-300 mb-2">Serviço Contratado!</h2>
          <p className="text-gray-400 mb-6">
            O serviço <strong>{service.nome}</strong> foi contratado com sucesso por{' '}
            <strong>€{service.preco.toFixed(2)}</strong>.
          </p>
          <button
            onClick={() => navigate('/transactions')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg transition-colors"
          >
            Ver Transações
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Contratar Serviço</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">{service.nome}</h2>
          <p className="text-gray-400 text-sm mb-4">{service.descricao}</p>
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Valor a debitar</span>
            <span className="text-2xl font-bold text-indigo-400">
              €{service.preco.toFixed(2)}
            </span>
          </div>
        </div>

        {serverError && (
          <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
            {serverError}
          </div>
        )}

        <p className="text-gray-500 text-xs mb-6">
          Ao confirmar, o valor será debitado do seu saldo e transferido para o prestador.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={() => hireMutation.mutate({ servico_id: service.id })}
            disabled={hireMutation.isPending}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {hireMutation.isPending ? 'A processar...' : 'Confirmar Contratação'}
          </button>
        </div>
      </div>
    </div>
  );
}
