import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { serviceService } from '../services/serviceService';
import { transactionService } from '../services/transactionService';
import { QUERY_KEYS, ROUTES } from '../lib/constants';
import TopUpModal from '../components/TopUpModal';

// ── Components ───────────────────────────────────────────────────────────────

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}

function CircularProgress({ value, max, size = 80, strokeWidth = 8, color }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color + '20'}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

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

  const totalSpent = reservations
    .filter(r => r.status === 'concluido')
    .reduce((sum, r) => sum + (r.services?.preco ?? 0), 0);

  const concluded = reservations.filter(r => r.status === 'concluido').length;
  const pending = reservations.filter(r => r.status === 'pendente').length;
  const myServices = isPrestador ? services.filter(s => s.prestador_id === user?.id).length : services.length;

  // Colors for charts
  const chartColors = [accent, '#FF6B9D', '#FFA500', '#C77DFF', '#06D6A0'];

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: pageBg }}>
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
      
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: text1 }}>
            Olá {firstName}!
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: text2 }}>
            {isPrestador ? 'Gerencie seus serviços e visualize suas estatísticas' : 'Acompanhe suas transações e explore novos serviços'}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {/* Card 1 - Serviços */}
          <div className="rounded-2xl p-4 sm:p-5 transition-transform hover:scale-105" 
            style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <CircularProgress value={myServices} max={100} size={70} strokeWidth={6} color={accent} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: text1 }}>
                {myServices}
              </div>
              <div className="text-xs font-medium" style={{ color: text2 }}>
                Serviços
              </div>
            </div>
          </div>

          {/* Card 2 - Reservas */}
          <div className="rounded-2xl p-4 sm:p-5 transition-transform hover:scale-105" 
            style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <CircularProgress value={reservations.length} max={50} size={70} strokeWidth={6} color="#FF6B9D" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#FF6B9D" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: text1 }}>
                {reservations.length}
              </div>
              <div className="text-xs font-medium" style={{ color: text2 }}>
                Reservas
              </div>
            </div>
          </div>

          {/* Card 3 - Completos */}
          <div className="rounded-2xl p-4 sm:p-5 transition-transform hover:scale-105" 
            style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <CircularProgress value={concluded} max={reservations.length || 1} size={70} strokeWidth={6} color="#06D6A0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#06D6A0" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: text1 }}>
                {concluded}
              </div>
              <div className="text-xs font-medium" style={{ color: text2 }}>
                Completos
              </div>
            </div>
          </div>

          {/* Card 4 - Saldo */}
          <div className="rounded-2xl p-4 sm:p-5 transition-transform hover:scale-105" 
            style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <CircularProgress value={user?.saldo ?? 0} max={10000} size={70} strokeWidth={6} color="#FFA500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#FFA500" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold mb-1" style={{ color: text1 }}>
                {(user?.saldo ?? 0).toFixed(0)} Kz
              </div>
              <div className="text-xs font-medium" style={{ color: text2 }}>
                Saldo
              </div>
            </div>
          </div>

          {/* Card 5 - Pendentes */}
          <div className="rounded-2xl p-4 sm:p-5 transition-transform hover:scale-105" 
            style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <CircularProgress value={pending} max={30} size={70} strokeWidth={6} color="#C77DFF" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#C77DFF" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: text1 }}>
                {pending}
              </div>
              <div className="text-xs font-medium" style={{ color: text2 }}>
                Pendentes
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6"                      Criar Serviço
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

