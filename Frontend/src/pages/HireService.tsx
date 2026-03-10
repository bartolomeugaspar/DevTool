import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../services/serviceService';
import { transactionService } from '../services/transactionService';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { QUERY_KEYS, ROUTES } from '../lib/constants';

export default function HireService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, setAuth, user } = useAuthStore();
  const { light, card, border, text1, text2, accent, accentBg, btnSecBg, btnSecText, theme } = useTheme();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: QUERY_KEYS.SERVICE(id!),
    queryFn: () => serviceService.getById(id!),
    enabled: !!id,
  });

  const hireMutation = useMutation({
    mutationFn: transactionService.hire,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESERVATIONS });
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2" style={{ borderColor: accent }} />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-red-400">Serviço não encontrado.</p>
      </div>
    );
  }

  const isOwnService = user?.id === service.prestador_id;

  if (isOwnService) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
          <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="#eab308" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-sm font-semibold mb-1" style={{ color: '#eab308' }}>Não podes contratar o teu próprio serviço</p>
          <p className="text-xs mb-4" style={{ color: text2 }}>Foste redirecionado porque este serviço pertence à tua conta.</p>
          <button
            onClick={() => navigate(ROUTES.SERVICES)}
            className="text-sm font-medium px-4 py-2 rounded-xl"
            style={{ background: accentBg, color: accent }}
          >
            Ver todos os serviços
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-20 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(49,236,198,0.12)' }}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#31ECC6" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2" style={{ color: text1 }}>Contratação confirmada</h2>
        <p className="text-sm mb-8 max-w-xs" style={{ color: text2 }}>
          O serviço <span className="font-medium" style={{ color: text1 }}>{service.nome}</span> foi contratado.
          O valor de <span className="font-medium" style={{ color: text1 }}>Kz {service.preco.toFixed(2)}</span> foi
          debitado do seu saldo.
        </p>

        {/* Summary card */}
        <div className="w-full rounded-2xl p-5 mb-8 text-left space-y-3"
          style={{ background: card, border: `1px solid ${border}` }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: text2 }}>Serviço</span>
            <span className="font-medium" style={{ color: text1 }}>{service.nome}</span>
          </div>
          <div style={{ borderTop: `1px solid ${border}` }} />
          <div className="flex justify-between text-sm">
            <span style={{ color: text2 }}>Valor pago</span>
            <span className="font-semibold" style={{ color: accent }}>Kz {service.preco.toFixed(2)}</span>
          </div>
          <div style={{ borderTop: `1px solid ${border}` }} />
          <div className="flex justify-between text-sm">
            <span style={{ color: text2 }}>Estado</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(49,236,198,0.12)', color: '#31ECC6' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
              Concluído
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => navigate(ROUTES.SERVICES)}
            className="flex-1 font-medium py-2.5 rounded-xl transition-all text-sm"
            style={{ background: btnSecBg, color: btnSecText }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Explorar serviços
          </button>
          <button
            onClick={() => navigate(ROUTES.TRANSACTIONS)}
            className="flex-1 text-white font-medium py-2.5 rounded-xl transition-all text-sm"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, ${light ? '#002f7a' : '#1ab89e'} 100%)` }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Ver transações
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 sm:mb-8" style={{ color: text1 }}>Contratar Serviço</h1>

      <div className="rounded-2xl p-5 sm:p-8" style={{ background: card, border: `1px solid ${border}` }}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2" style={{ color: text1 }}>{service.nome}</h2>
          <p className="text-sm mb-4" style={{ color: text2 }}>{service.descricao}</p>
          <div className="rounded-xl p-4 flex items-center justify-between"
            style={{ background: light ? '#f3f4f6' : '#0c2340', border: `1px solid ${border}` }}>
            <span className="text-sm" style={{ color: text2 }}>Valor a debitar</span>
            <span className="text-2xl font-bold" style={{ color: accent }}>
              Kz {service.preco.toFixed(2)}
            </span>
          </div>
        </div>

        {serverError && (
          <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
            {serverError}
          </div>
        )}

        <p className="text-xs mb-6" style={{ color: text2 }}>
          Ao confirmar, o valor será debitado do seu saldo e transferido para o prestador.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SERVICES)}
            className="flex-1 font-medium py-2.5 rounded-xl transition-all"
            style={{ background: btnSecBg, color: btnSecText }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Voltar
          </button>
          <button
            onClick={() => hireMutation.mutate({ servico_id: service.id })}
            disabled={hireMutation.isPending}
            className="flex-1 font-medium py-2.5 rounded-xl transition-all disabled:opacity-50 text-white"
            style={{ background: accent }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {hireMutation.isPending ? 'A processar...' : 'Confirmar Contratação'}
          </button>
        </div>
      </div>
    </div>
  );
}
