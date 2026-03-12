import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { serviceService } from '../services/serviceService';
import { transactionService } from '../services/transactionService';
import { QUERY_KEYS, ROUTES } from '../lib/constants';
import TopUpModal from '../components/TopUpModal';

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuthStore();
  const { light, card, border, text1, text2, skelBg, hover, accent, accentBg, pageBg } = useTheme();
  const [showTopUp, setShowTopUp] = useState(false);

  const isPrestador = user?.tipo_usuario === 'prestador';
  const firstName = user?.nome_completo?.split(' ')[0] ?? 'utilizador';

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: QUERY_KEYS.SERVICES,
    queryFn: serviceService.getAll,
  });

  const { data: reservations = [], isLoading: loadingReservations } = useQuery({
    queryKey: QUERY_KEYS.RESERVATIONS,
    queryFn: transactionService.getHistory,
  });

  const concluded = reservations.filter(r => r.status === 'concluido').length;
  const pending = reservations.filter(r => r.status === 'pendente').length;
  const myServices = isPrestador ? services.filter(s => s.prestador_id === user?.id).length : services.length;

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: pageBg }}>
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
      
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: text1 }}>
            Bem-vindo, {firstName}
          </h1>
          <p className="text-sm sm:text-base" style={{ color: text2 }}>
            {isPrestador ? 'Gerencie seus serviços e acompanhe suas atividades' : 'Explore serviços e gerencie suas contratações'}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {/* Serviços */}
          <div className="rounded-2xl p-5 sm:p-6" style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: `${accent}15` }}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: text1 }}>
              {loadingServices ? '...' : myServices}
            </div>
            <div className="text-xs sm:text-sm font-medium" style={{ color: text2 }}>
              Serviços {isPrestador ? 'publicados' : 'disponíveis'}
            </div>
          </div>

          {/* Reservas */}
          <div className="rounded-2xl p-5 sm:p-6" style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: '#FF6B9D15' }}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="#FF6B9D" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: text1 }}>
              {loadingReservations ? '...' : reservations.length}
            </div>
            <div className="text-xs sm:text-sm font-medium" style={{ color: text2 }}>
              {isPrestador ? 'Contratações' : 'Reservas'}
            </div>
          </div>

          {/* Saldo */}
          <div className="rounded-2xl p-5 sm:p-6" style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: '#06D6A015' }}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="#06D6A0" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: text1 }}>
              Kz {(user?.saldo ?? 0).toFixed(2)}
            </div>
            <div className="text-xs sm:text-sm font-medium" style={{ color: text2 }}>
              Saldo disponível
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl p-5 sm:p-6" style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: '#FFA50015' }}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="#FFA500" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: text1 }}>
              {loadingReservations ? '...' : concluded}
            </div>
            <div className="text-xs sm:text-sm font-medium" style={{ color: text2 }}>
              Concluídos
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Link
            to={ROUTES.SERVICES}
            className="rounded-2xl p-6 transition-all hover:scale-[1.02] group"
            style={{ background: `${accent}10`, border: `1px solid ${accent}30` }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: accent }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base sm:text-lg font-bold mb-0.5" style={{ color: text1 }}>Explorar</p>
                <p className="text-xs sm:text-sm" style={{ color: text2 }}>Ver todos os serviços</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: accent }}>
              <span>Ver serviços</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to={ROUTES.TRANSACTIONS}
            className="rounded-2xl p-6 transition-all hover:scale-[1.02] group"
            style={{ background: '#FF6B9D10', border: '1px solid #FF6B9D30' }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: '#FF6B9D' }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base sm:text-lg font-bold mb-0.5" style={{ color: text1 }}>Transações</p>
                <p className="text-xs sm:text-sm" style={{ color: text2 }}>Histórico completo</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#FF6B9D' }}>
              <span>Ver histórico</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {!isPrestador && (
            <button
              onClick={() => setShowTopUp(true)}
              className="rounded-2xl p-6 transition-all hover:scale-[1.02] text-left group"
              style={{ background: '#FFA50010', border: '1px solid #FFA50030' }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: '#FFA500' }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-base sm:text-lg font-bold mb-0.5" style={{ color: text1 }}>Adicionar Saldo</p>
                  <p className="text-xs sm:text-sm" style={{ color: text2 }}>Recarregue sua conta</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#FFA500' }}>
                <span>Adicionar agora</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          )}

          {isPrestador && (
            <Link
              to={ROUTES.SERVICE_CREATE}
              className="rounded-2xl p-6 transition-all hover:scale-[1.02] group"
              style={{ background: '#06D6A010', border: '1px solid #06D6A030' }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: '#06D6A0' }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-base sm:text-lg font-bold mb-0.5" style={{ color: text1 }}>Criar Serviço</p>
                  <p className="text-xs sm:text-sm" style={{ color: text2 }}>Publique um novo serviço</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#06D6A0' }}>
                <span>Criar agora</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )}
        </div>

        {/* Recent Activity */}
        {!loadingReservations && reservations.length > 0 && (
          <div className="rounded-2xl p-5 sm:p-6" style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold mb-1" style={{ color: text1 }}>
                  Atividade Recente
                </h2>
                <p className="text-xs sm:text-sm" style={{ color: text2 }}>
                  {isPrestador ? 'Últimas contratações dos seus serviços' : 'Seus últimos serviços contratados'}
                </p>
              </div>
              <Link
                to={ROUTES.TRANSACTIONS}
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-80"
                style={{ background: accentBg, color: accent }}
              >
                Ver tudo
              </Link>
            </div>
            
            <div className="space-y-3">
              {reservations.slice(0, 5).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: light ? '#f9fafb' : 'rgba(255,255,255,0.02)', border: `1px solid ${border}` }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: reservation.status === 'concluido' ? '#06D6A015' : 
                                 reservation.status === 'pendente' ? '#FFA50015' : '#f8717115',
                    }}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" 
                      stroke={reservation.status === 'concluido' ? '#06D6A0' : 
                             reservation.status === 'pendente' ? '#FFA500' : '#f87171'} 
                      strokeWidth={2}>
                      {reservation.status === 'concluido' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : reservation.status === 'pendente' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold mb-0.5 truncate" style={{ color: text1 }}>
                      {reservation.services?.nome ?? 'Serviço'}
                    </p>
                    <p className="text-xs truncate" style={{ color: text2 }}>
                      {new Date(reservation.created_at).toLocaleDateString('pt-PT', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm sm:text-base font-bold mb-0.5" style={{ color: text1 }}>
                      Kz {(reservation.services?.preco ?? 0).toFixed(2)}
                    </p>
                    <span 
                      className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full"
                      style={{ 
                        background: reservation.status === 'concluido' ? '#06D6A015' : 
                                   reservation.status === 'pendente' ? '#FFA50015' : '#f8717115',
                        color: reservation.status === 'concluido' ? '#06D6A0' : 
                               reservation.status === 'pendente' ? '#FFA500' : '#f87171'
                      }}>
                      {reservation.status === 'concluido' ? 'Concluído' : 
                       reservation.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loadingReservations && reservations.length === 0 && (
          <div className="rounded-2xl p-8 sm:p-12 text-center" style={{ background: card, border: `1px solid ${border}` }}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${accent}10` }}>
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: text1 }}>
              Nenhuma atividade ainda
            </h3>
            <p className="text-sm mb-6" style={{ color: text2 }}>
              {isPrestador ? 'Comece criando seu primeiro serviço' : 'Explore os serviços disponíveis e faça sua primeira contratação'}
            </p>
            <Link
              to={isPrestador ? ROUTES.SERVICE_CREATE : ROUTES.SERVICES}
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl transition-all text-white"
              style={{ background: accent }}
            >
              {isPrestador ? 'Criar Serviço' : 'Explorar Serviços'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
