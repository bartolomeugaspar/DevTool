import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { serviceService } from '../services/serviceService';
import ServiceCard from '../components/ServiceCard';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { QUERY_KEYS, ROUTES } from '../lib/constants';

export default function Services() {
  const queryClient = useQueryClient();
  const { text1, text2, accent, accentBg, card, border } = useTheme();
  const { user } = useAuthStore();
  const isPrestador = user?.tipo_usuario === 'prestador';

  const { data: services = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.SERVICES,
    queryFn: serviceService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: serviceService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2" style={{ borderColor: accent }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-red-400">Erro ao carregar serviços.</p>
      </div>
    );
  }

  const myServices = isPrestador ? services.filter(s => s.prestador_id === user?.id) : [];
  const displayServices = isPrestador ? myServices : services;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: text1 }}>
            {isPrestador ? 'Os meus serviços' : 'Serviços disponíveis'}
          </h1>
          {isPrestador && (
            <p className="text-sm mt-0.5" style={{ color: text2 }}>Gere os teus serviços publicados</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: text2 }}>{displayServices.length} serviço(s)</span>
          {isPrestador && (
            <Link
              to={ROUTES.SERVICE_CREATE}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all text-white"
              style={{ background: accent }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Criar serviço
            </Link>
          )}
        </div>
      </div>

      {displayServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: accentBg }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: text2 }}>
            {isPrestador ? 'Ainda não tens serviços publicados.' : 'Nenhum serviço disponível de momento.'}
          </p>
          {isPrestador && (
            <Link
              to={ROUTES.SERVICE_CREATE}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all text-white"
              style={{ background: accent }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Criar primeiro serviço
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
