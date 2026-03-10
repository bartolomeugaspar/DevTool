import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const BulirLogo = () => (
  <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 46 46">
    <path d="M9.63198 0H36.368C41.6948 0 46 4.3198 46 9.63198V36.368C46 41.6948 41.6802 46 36.368 46H9.63198C4.3052 46 0 41.6802 0 36.368V9.63198C0 4.3198 4.3198 0 9.63198 0Z" fill="#0C2340"/>
    <path d="M28.2685 25.394C27.7286 25.394 27.2907 24.9561 27.3053 24.4162C27.3053 22.8254 27.3053 18.0532 27.247 16.6668C27.1156 12.8724 23.9633 9.89522 19.9062 9.74928C15.9221 9.61794 12.4487 12.5951 12.3174 16.2728C12.2444 18.2429 12.2006 20.3153 12.1861 22.8838C12.6093 22.8838 13.0325 22.8838 13.4411 22.8838C13.8498 22.8838 14.2584 22.8838 14.6378 22.8838H19.5122C20.0522 22.9276 20.4608 23.3946 20.417 23.9346C20.3878 24.4162 19.9938 24.8102 19.5122 24.8394H14.667C14.2876 24.8394 13.8498 24.8394 13.4119 24.8394C12.9741 24.8394 12.4487 24.8394 11.9817 24.8394H11.3104H11.2374C10.9748 24.854 10.7121 24.7518 10.5223 24.5621C10.3326 24.3724 10.2305 24.1243 10.2305 23.8616C10.2305 20.7969 10.2888 18.4181 10.3764 16.1706C10.5515 11.4422 14.9443 7.57479 19.9938 7.76451C25.0433 7.95423 29.0566 11.7341 29.2171 16.5646C29.2755 18.097 29.2901 23.0151 29.2755 24.4016C29.2901 24.9415 28.8523 25.394 28.3123 25.4085C28.2977 25.394 28.2831 25.394 28.2685 25.394Z" fill="#31ECC6"/>
    <path d="M26.0218 38.2201H10.9901C10.4501 38.1763 10.0415 37.7093 10.0852 37.1693C10.1144 36.6877 10.5085 36.2937 10.9901 36.2645H29.4951C33.0706 36.2353 35.5662 34.6738 36.8797 31.7112C38.1931 28.7486 37.7261 25.9904 35.5224 23.5532C34.4717 22.3419 33.0123 21.5393 31.4215 21.2912C30.8962 21.2036 30.5313 20.7074 30.6043 20.182C30.6772 19.6566 31.188 19.2918 31.7134 19.3648C33.742 19.6858 35.5954 20.6928 36.9526 22.2398C39.6817 25.2607 40.28 28.807 38.6601 32.4993C37.0402 36.1915 33.8587 38.1763 29.4951 38.2201H26.0218Z" fill="#31ECC6"/>
    <path d="M19.7305 29.4354H10.7844C10.2445 29.4791 9.77747 29.0705 9.73368 28.5305C9.6899 27.9906 10.0985 27.5236 10.6385 27.4798C10.6823 27.4798 10.7407 27.4798 10.7844 27.4798H19.7305C20.2705 27.436 20.7375 27.8446 20.7813 28.3846C20.8251 28.9246 20.4164 29.3916 19.8764 29.4354C19.8181 29.45 19.7743 29.45 19.7305 29.4354Z" fill="#31ECC6"/>
    <path d="M19.9507 33.4478H10.9901C10.4501 33.404 10.0415 32.937 10.0852 32.397C10.1144 31.9154 10.5085 31.5214 10.9901 31.4922H19.9507C20.4907 31.536 20.8993 32.003 20.8555 32.543C20.8118 33.0246 20.4323 33.4186 19.9507 33.4478Z" fill="#31ECC6"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.nome_completo
    ? user.nome_completo.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/services', label: 'Serviços' },
    { to: '/transactions', label: 'Transações' },
    ...(user?.tipo_usuario === 'prestador' ? [{ to: '/services/create', label: 'Criar Serviço' }] : []),
  ];

  return (
    <nav className="border-b sticky top-0 z-50" style={{ background: '#0c2340', borderColor: '#1a3557' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
            <BulirLogo />
            <span className="text-base font-bold text-white group-hover:opacity-80 transition-opacity hidden sm:block">Bulir</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="relative px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: isActive(to) ? '#31ECC6' : '#8e9bab',
                  background: isActive(to) ? 'rgba(49,236,198,0.08)' : 'transparent',
                }}
              >
                {label}
                {isActive(to) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: '#31ECC6' }} />
                )}
              </Link>
            ))}
          </div>

          {/* Right side: profile dropdown */}
          <div className="hidden md:flex items-center" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-white/5"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(49,236,198,0.18)', color: '#31ECC6' }}>
                {initials}
              </div>
              {/* Chevron */}
              <svg
                className="w-3.5 h-3.5 transition-transform"
                style={{ color: '#586779', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div
                className="absolute right-4 top-14 w-60 rounded-2xl shadow-2xl overflow-hidden z-50"
                style={{ background: '#0e1e35', border: '1px solid #1a3557' }}
              >
                {/* Profile header */}
                <div className="px-4 py-4" style={{ borderBottom: '1px solid #1a3557' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(49,236,198,0.18)', color: '#31ECC6' }}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user?.nome_completo ?? 'Utilizador'}</p>
                      <p className="text-xs truncate" style={{ color: '#586779' }}>{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide" style={{ background: 'rgba(49,236,198,0.10)', color: '#31ECC6' }}>
                      {user?.tipo_usuario}
                    </span>
                  </div>
                </div>

                {/* Logout */}
                <div className="px-2 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-500/10"
                    style={{ color: '#f87171' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Terminar sessão
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: avatar + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(49,236,198,0.18)', color: '#31ECC6' }}>
              {initials}
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#8e9bab' }}
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t pb-4 pt-2" style={{ borderColor: '#1a3557' }}>
            {/* User info */}
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(49,236,198,0.18)', color: '#31ECC6' }}>
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.nome_completo ?? 'Utilizador'}</p>
                <p className="text-xs" style={{ color: '#586779' }}>{user?.email}</p>
              </div>
              {user?.tipo_usuario && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold uppercase" style={{ background: 'rgba(49,236,198,0.10)', color: '#31ECC6' }}>
                  {user.tipo_usuario}
                </span>
              )}
            </div>

            <div className="h-px mb-2" style={{ background: '#1a3557' }} />

            {/* Links */}
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg mx-1 text-sm font-medium transition-all"
                style={{
                  color: isActive(to) ? '#31ECC6' : '#8e9bab',
                  background: isActive(to) ? 'rgba(49,236,198,0.08)' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}

            <div className="h-px my-2" style={{ background: '#1a3557' }} />

            {/* Logout mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg mx-1 text-sm font-medium transition-all hover:opacity-80"
              style={{ color: '#f87171' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Terminar sessão
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
