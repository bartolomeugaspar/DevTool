import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { toast } from './Toast';
import type { ReactNode } from 'react';

const BulirLogo = () => (
  <svg className="w-7 h-7 flex-shrink-0" fill="none" viewBox="0 0 46 46">
    <path d="M9.63198 0H36.368C41.6948 0 46 4.3198 46 9.63198V36.368C46 41.6948 41.6802 46 36.368 46H9.63198C4.3052 46 0 41.6802 0 36.368V9.63198C0 4.3198 4.3198 0 9.63198 0Z" fill="#0C2340"/>
    <path d="M28.2685 25.394C27.7286 25.394 27.2907 24.9561 27.3053 24.4162C27.3053 22.8254 27.3053 18.0532 27.247 16.6668C27.1156 12.8724 23.9633 9.89522 19.9062 9.74928C15.9221 9.61794 12.4487 12.5951 12.3174 16.2728C12.2444 18.2429 12.2006 20.3153 12.1861 22.8838C12.6093 22.8838 13.0325 22.8838 13.4411 22.8838C13.8498 22.8838 14.2584 22.8838 14.6378 22.8838H19.5122C20.0522 22.9276 20.4608 23.3946 20.417 23.9346C20.3878 24.4162 19.9938 24.8102 19.5122 24.8394H14.667C14.2876 24.8394 13.8498 24.8394 13.4119 24.8394C12.9741 24.8394 12.4487 24.8394 11.9817 24.8394H11.3104H11.2374C10.9748 24.854 10.7121 24.7518 10.5223 24.5621C10.3326 24.3724 10.2305 24.1243 10.2305 23.8616C10.2305 20.7969 10.2888 18.4181 10.3764 16.1706C10.5515 11.4422 14.9443 7.57479 19.9938 7.76451C25.0433 7.95423 29.0566 11.7341 29.2171 16.5646C29.2755 18.097 29.2901 23.0151 29.2755 24.4016C29.2901 24.9415 28.8523 25.394 28.3123 25.4085C28.2977 25.394 28.2831 25.394 28.2685 25.394Z" fill="#31ECC6"/>
    <path d="M26.0218 38.2201H10.9901C10.4501 38.1763 10.0415 37.7093 10.0852 37.1693C10.1144 36.6877 10.5085 36.2937 10.9901 36.2645H29.4951C33.0706 36.2353 35.5662 34.6738 36.8797 31.7112C38.1931 28.7486 37.7261 25.9904 35.5224 23.5532C34.4717 22.3419 33.0123 21.5393 31.4215 21.2912C30.8962 21.2036 30.5313 20.7074 30.6043 20.182C30.6772 19.6566 31.188 19.2918 31.7134 19.3648C33.742 19.6858 35.5954 20.6928 36.9526 22.2398C39.6817 25.2607 40.28 28.807 38.6601 32.4993C37.0402 36.1915 33.8587 38.1763 29.4951 38.2201H26.0218Z" fill="#31ECC6"/>
    <path d="M19.7305 29.4354H10.7844C10.2445 29.4791 9.77747 29.0705 9.73368 28.5305C9.6899 27.9906 10.0985 27.5236 10.6385 27.4798C10.6823 27.4798 10.7407 27.4798 10.7844 27.4798H19.7305C20.2705 27.436 20.7375 27.8446 20.7813 28.3846C20.8251 28.9246 20.4164 29.3916 19.8764 29.4354C19.8181 29.45 19.7743 29.45 19.7305 29.4354Z" fill="#31ECC6"/>
    <path d="M19.9507 33.4478H10.9901C10.4501 33.404 10.0415 32.937 10.0852 32.397C10.1144 31.9154 10.5085 31.5214 10.9901 31.4922H19.9507C20.4907 31.536 20.8993 32.003 20.8555 32.543C20.8118 33.0246 20.4323 33.4186 19.9507 33.4478Z" fill="#31ECC6"/>
  </svg>
);

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

function NavLink({ item, isActive, accent, text2, sideHover, light }: {
  item: NavItem;
  isActive: boolean;
  accent: string;
  text2: string;
  sideHover: string;
  light: boolean;
}) {
  return (
    <Link
      to={item.to}
      title={item.label}
      className="relative flex items-center justify-center p-3 rounded-xl transition-all group"
      style={{
        color: isActive ? '#ffffff' : text2,
        background: isActive ? accent : 'transparent',
      }}
      onMouseEnter={e => { 
        if (!isActive) {
          e.currentTarget.style.background = sideHover;
        }
      }}
      onMouseLeave={e => { 
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <span className="flex-shrink-0 w-6 h-6">{item.icon}</span>
    </Link>
  );
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { pageBg, card, border, text1, text2, accent, accentBg } = useTheme();
  const { theme, toggle: toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const light = theme === 'light';
  const [mobileOpen, setMobileOpen] = useState(false);

  const sideBg     = light ? '#ffffff'              : '#0c2340';
  const sideBorder = light ? '#e5e7eb'              : '#1a3557';
  const topBg      = light ? '#ffffff'              : '#0c2340';
  const sideHover  = light ? '#f3f4f6'              : 'rgba(255,255,255,0.05)';

  const isPrestador = user?.tipo_usuario === 'prestador';
  const initials = user?.nome_completo
    ? user.nome_completo.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const handleLogout = () => {
    logout();
    toast.info('Sessão terminada. Até breve!');
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems: NavItem[] = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: '/services',
      label: 'Serviços',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      to: '/transactions',
      label: 'Transações',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    ...(isPrestador ? [{
      to: '/services/create',
      label: 'Criar serviço',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    }] : []),
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full items-center">
      {/* Logo */}
      <div className="flex items-center justify-center py-6 flex-shrink-0">
        <BulirLogo />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto w-full">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            item={item}
            isActive={isActive(item.to)}
            accent={accent}
            text2={text2}
            sideHover={sideHover}
            light={light}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 flex-shrink-0 w-full space-y-2" style={{ borderTop: `1px solid ${sideBorder}` }}>
        {/* Theme toggle */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={toggleTheme}
            title={light ? 'Modo escuro' : 'Modo claro'}
            className="p-2.5 rounded-xl transition-all"
            style={{ color: text2, background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = sideHover)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            {light ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Logout */}
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-2.5 rounded-xl transition-all"
            style={{ color: '#f87171', background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300" style={{ background: pageBg }}>

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-20 flex-shrink-0 h-full overflow-hidden"
        style={{ background: sideBg, borderRight: `1px solid ${sideBorder}` }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ──────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute left-0 top-0 h-full w-20 flex flex-col z-50"
            style={{ background: sideBg, borderRight: `1px solid ${sideBorder}` }}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Right column: topbar + content ──────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

        {/* Topbar */}
        <header
          className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex-shrink-0"
          style={{ background: topBg, borderBottom: `1px solid ${sideBorder}` }}
        >
          {/* Mobile: hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: text2 }}
            onClick={() => setMobileOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile: logo (only shown on mobile) */}
          <Link to="/dashboard" className="flex items-center gap-2 md:hidden">
            <BulirLogo />
            <span className="text-sm font-bold" style={{ color: text1 }}>Bulir</span>
          </Link>

          {/* Page title (desktop) */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold" style={{ color: text1 }}>
              {navItems.find(n => isActive(n.to))?.label ?? 'Dashboard'}
            </h1>
          </div>

          {/* Right: saldo + avatar */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg" style={{ background: accentBg }}>
              <svg className="w-4 h-4" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs sm:text-sm font-semibold" style={{ color: accent }}>
                Kz {(user?.saldo ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: accentBg, color: accent }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto" style={{ background: pageBg }}>
          {children}
        </main>
      </div>
    </div>
  );
}
