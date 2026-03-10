import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { serviceService } from '../services/serviceService';
import ServiceCard from '../components/ServiceCard';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/Toast';
import { QUERY_KEYS, ROUTES } from '../lib/constants';

function ServiceSkeleton({ card, border, skelBg }: { card: string; border: string; skelBg: string }) {
  const P = ({ w, h = '0.85rem' }: { w: string; h?: string }) => (
    <div className="rounded-lg animate-pulse" style={{ width: w, height: h, background: skelBg }} />
  );
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: card, border: `1px solid ${border}` }}>
      <div className="flex justify-between items-start gap-3">
        <P w="60%" h="1.1rem" />
        <P w="4.5rem" h="1.1rem" />
      </div>
      <P w="100%" />
      <P w="80%" />
      <P w="40%" h="0.7rem" />
      <div className="flex gap-2 mt-auto pt-1">
        <P w="100%" h="2.25rem" />
      </div>
    </div>
  );
}

export default function Services() {
  const queryClient = useQueryClient();
  const { text1, text2, accent, accentBg, card, border, skelBg, inputBg, inputBorder } = useTheme();
  const { user } = useAuthStore();
  const isPrestador = user?.tipo_usuario === 'prestador';
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: services = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.SERVICES,
    queryFn: serviceService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: serviceService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
      toast.success('Serviço removido com sucesso');
      setDeletingId(null);
    },
    onError: () => {
      toast.error('Erro ao remover serviço');
      setDeletingId(null);
    },
  });

  const baseServices = isPrestador ? services.filter(s => s.prestador_id === user?.id) : services;

  const displayServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return baseServices;
    return baseServices.filter(s =>
      s.nome.toLowerCase().includes(q) ||
      s.descricao.toLowerCase().includes(q) ||
      (s.users?.nome_completo ?? '').toLowerCase().includes(q)
    );
  }, [baseServices, search]);

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-red-400">Erro ao carregar serviços.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: text1 }}>
            {isPrestador ? 'Os meus serviços' : 'Serviços disponíveis'}
          </h1>
          {isPrestador && (
            <p className="text-sm mt-0.5" style={{ color: text2 }}>Gere os teus serviços publicados</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isPrestador && (
            <Link
              to={ROUTES.SERVICE_CREATE}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all text-white flex-shrink-0"
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

      {/* Search bar */}
      {!isLoading && baseServices.length > 0 && (
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: text2 }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isPrestador ? 'Pesquisar nos teus serviços...' : 'Pesquisar serviços ou prestadores...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: text1 }}
            onFocus={e => (e.currentTarget.style.borderColor = accent)}
            onBlur={e => (e.currentTarget.style.borderColor = inputBorder)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: text2 }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Results count when filtering */}
      {search && !isLoading && (
        <p className="text-xs mb-4" style={{ color: text2 }}>
          {displayServices.length} resultado(s) para "{search}"
        </p>
      )}

      {/* Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceSkeleton key={i} card={card} border={border} skelBg={skelBg} />
          ))}
        </div>
      ) : displayServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: accentBg }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={search ? "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" : "M4 6h16M4 10h16M4 14h16M4 18h16"} />
            </svg>
          </div>
          <p className="text-sm" style={{ color: text2 }}>
            {search
              ? 'Nenhum serviço encontrado para essa pesquisa.'
              : isPrestador
                ? 'Ainda não tens serviços publicados.'
                : 'Nenhum serviço disponível de momento.'}
          </p>
          {search ? (
            <button onClick={() => setSearch('')} className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: accent }}>
              Limpar pesquisa
            </button>
          ) : isPrestador ? (
            <Link
              to={ROUTES.SERVICE_CREATE}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all text-white"
              style={{ background: accent }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Criar primeiro serviço
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isDeleting={deletingId === service.id && deleteMutation.isPending}
              onDelete={(id) => {
                setDeletingId(id);
                deleteMutation.mutate(id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
