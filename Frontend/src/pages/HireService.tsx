import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../services/serviceService';
import { transactionService } from '../services/transactionService';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export default function HireService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, setAuth } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceService.getById(id!),
    enabled: !!id,
  });

  const hireMutation = useMutation({
    mutationFn: transactionService.hire,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      // Refresh user profile to update saldo
      if (token) {
        const updatedUser = await authService.getMe();
        setAuth(token, updatedUser);
      }
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
      <div className="max-w-lg mx-auto px-6 py-20 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(49,236,198,0.12)' }}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#31ECC6" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">Contratação confirmada</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-xs">
          O serviço <span className="text-white font-medium">{service.nome}</span> foi contratado.
          O valor de <span className="text-white font-medium">€{service.preco.toFixed(2)}</span> foi
          debitado do seu saldo.
        </p>

        {/* Summary card */}
        <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Serviço</span>
            <span className="text-white font-medium">{service.nome}</span>
          </div>
          <div className="border-t border-gray-800" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Valor pago</span>
            <span className="font-semibold" style={{ color: '#31ECC6' }}>€{service.preco.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-800" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estado</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(49,236,198,0.12)', color: '#31ECC6' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
              Concluído
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => navigate('/services')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            Explorar serviços
          </button>
          <button
            onClick={() => navigate('/transactions')}
            className="flex-1 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            style={{ background: 'linear-gradient(135deg, #31ECC6 0%, #1ab89e 100%)' }}
          >
            Ver transações
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
