import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { serviceService } from '../services/serviceService';
import { transactionService } from '../services/transactionService';
import { STATUS_STYLES, QUERY_KEYS, ROUTES } from '../lib/constants';
import type { Reservation } from '../types';

// ── helpers ──────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function statusBadge(status: Reservation['status']) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pendente;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `há ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuthStore();
  const { light, card, border, text1, text2, skelBg, hover, accent, accentBg } = useTheme();

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

  const recent = [...reservations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const totalSpent = reservations
    .filter(r => r.status === 'concluido')
    .reduce((sum, r) => sum + (r.services?.preco ?? 0), 0);

  const concluded = reservations.filter(r => r.status === 'concluido').length;
  const pending   = reservations.filter(r => r.status === 'pendente').length;

  const Skel = ({ w = '6rem', h = '1.75rem' }: { w?: string; h?: string }) => (
    <div className="rounded-lg animate-pulse" style={{ width: w, height: h, background: skelBg }} />
  );

  // ── stat items ────────────────────────────────────────────────────────────
  const stats = [
    {
      label: 'Serviços',
      value: loadingServices ? null : services.length,
      sub: 'na plataforma',
      accent: '#818cf8',
      path: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
    },
    {
      label: isPrestador ? 'Contratações' : 'Total gasto',
      value: loadingReservations ? null : isPrestador ? reservations.length : `Kz ${totalSpent.toFixed(2)}`,
      sub: isPrestador ? 'nas tuas ofertas' : 'em serviços',
      accent: '#f472b6',
      path: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    },
    {
      label: 'Concluídos',
      value: loadingReservations ? null : concluded,
      sub: 'serviços',
      accent: accent,
      path: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    },
    {
      label: 'Pendentes',
      value: loadingReservations ? null : pending,
      sub: 'a aguardar',
      accent: '#eab308',
      path: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    },
  ];

  // ── quick actions ─────────────────────────────────────────────────────────
  const actions = [
    { to: ROUTES.SERVICES,        label: 'Explorar serviços', desc: 'Ver todos os serviços',  accent: accent,     path: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /> },
    { to: ROUTES.TRANSACTIONS,    label: 'Transações',        desc: 'Histórico de movimentos', accent: '#818cf8',  path: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
    ...(isPrestador ? [{ to: ROUTES.SERVICE_CREATE, label: 'Criar serviço', desc: 'Publicar nova oferta', accent: '#f472b6', path: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /> }] : []),
  ];

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 py-8 space-y-8">

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl px-4 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-5"
          style={{ background: card, border: `1px solid ${border}` }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: `${accentBg}`, color: accent }}>
              {user?.nome_completo?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
                {greeting()}
              </p>
              <h1 className="text-xl font-bold mt-0.5" style={{ color: text1 }}>
                {firstName}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: text2 }}>{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: text2 }}>Saldo disponível</p>
            <p className="text-3xl font-extrabold tracking-tight" style={{ color: accent }}>
              Kz {(user?.saldo ?? 0).toFixed(2)}
            </p>
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{ background: accentBg, color: accent, border: `1px solid ${accent}33` }}>
              {user?.tipo_usuario}
            </span>
          </div>
        </div>

        {/* ── Stat row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(({ label, value, sub, accent, path }) => (
            <div key={label} className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: card, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: text2 }}>{label}</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={1.8}>{path}</svg>
                </div>
              </div>
              {value === null
                ? <Skel w="4rem" h="2rem" />
                : <p className="text-xl sm:text-2xl font-extrabold tracking-tight break-all" style={{ color: text1 }}>{value}</p>}
              <p className="text-xs" style={{ color: text2 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity feed */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${border}` }}>
              <h2 className="text-sm font-semibold" style={{ color: text1 }}>Actividade recente</h2>
              <Link to={ROUTES.TRANSACTIONS} className="text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: accent }}>
                Ver tudo →
              </Link>
            </div>

            {loadingReservations ? (
              <div className="p-5 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 animate-pulse" style={{ background: skelBg }} />
                    <div className="flex-1 space-y-2">
                      <Skel w="9rem" h="1rem" />
                      <Skel w="5rem" h="0.75rem" />
                    </div>
                    <Skel w="5rem" h="1.5rem" />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: accentBg }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: text2 }}>Sem actividade ainda</p>
                <Link to={ROUTES.SERVICES} className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: accent }}>
                  Explorar serviços →
                </Link>
              </div>
            ) : (
              <div>
                {recent.map((r, idx) => (
                  <div key={r.id}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors cursor-default"
                    style={{ borderBottom: idx < recent.length - 1 ? `1px solid ${border}` : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = hover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: accentBg }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: text1 }}>
                        {r.services?.nome ?? 'Serviço removido'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: text2 }}>
                        {r.services ? `Kz ${r.services.preco.toFixed(2)}` : '—'} · {timeAgo(r.created_at)}
                      </p>
                    </div>
                    {statusBadge(r.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: text2 }}>
              Acções rápidas
            </h2>

            {actions.map(({ to, label, desc, accent, path }) => (
              <Link key={to} to={to}
                className="group flex items-center gap-3 rounded-2xl p-4 transition-all"
                style={{ background: card, border: `1px solid ${border}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accent + '66'; e.currentTarget.style.background = hover; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = card; }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}18` }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={1.8}>{path}</svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: text1 }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: text2 }}>{desc}</p>
                </div>
                <svg className="w-4 h-4 flex-shrink-0 opacity-30 group-hover:opacity-60 transition-opacity"
                  fill="none" viewBox="0 0 24 24" stroke={text2} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}

            {/* Account info */}
            <div className="rounded-2xl p-4" style={{ background: card, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: text2 }}>Conta</p>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: text2 }}>Nome</span>
                  <span className="font-medium truncate max-w-[130px]" style={{ color: text1 }}>{user?.nome_completo}</span>
                </div>
                <div className="h-px" style={{ background: border }} />
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: text2 }}>NIF</span>
                  <span className="font-medium font-mono" style={{ color: text1 }}>{user?.nif ?? '—'}</span>
                </div>
                <div className="h-px" style={{ background: border }} />
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: text2 }}>Perfil</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase"
                    style={{ background: accentBg, color: accent }}>
                    {user?.tipo_usuario}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
