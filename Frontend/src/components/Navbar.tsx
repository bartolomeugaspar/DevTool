import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b px-6 py-3" style={{ background: '#0c2340', borderColor: '#1a3557' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 46 46">
            <path d="M9.63198 0H36.368C41.6948 0 46 4.3198 46 9.63198V36.368C46 41.6948 41.6802 46 36.368 46H9.63198C4.3052 46 0 41.6802 0 36.368V9.63198C0 4.3198 4.3198 0 9.63198 0Z" fill="#0C2340"/>
            <path d="M28.2685 25.394C27.7286 25.394 27.2907 24.9561 27.3053 24.4162C27.3053 22.8254 27.3053 18.0532 27.247 16.6668C27.1156 12.8724 23.9633 9.89522 19.9062 9.74928C15.9221 9.61794 12.4487 12.5951 12.3174 16.2728C12.2444 18.2429 12.2006 20.3153 12.1861 22.8838C12.6093 22.8838 13.0325 22.8838 13.4411 22.8838C13.8498 22.8838 14.2584 22.8838 14.6378 22.8838H19.5122C20.0522 22.9276 20.4608 23.3946 20.417 23.9346C20.3878 24.4162 19.9938 24.8102 19.5122 24.8394H14.667C14.2876 24.8394 13.8498 24.8394 13.4119 24.8394C12.9741 24.8394 12.4487 24.8394 11.9817 24.8394H11.3104H11.2374C10.9748 24.854 10.7121 24.7518 10.5223 24.5621C10.3326 24.3724 10.2305 24.1243 10.2305 23.8616C10.2305 20.7969 10.2888 18.4181 10.3764 16.1706C10.5515 11.4422 14.9443 7.57479 19.9938 7.76451C25.0433 7.95423 29.0566 11.7341 29.2171 16.5646C29.2755 18.097 29.2901 23.0151 29.2755 24.4016C29.2901 24.9415 28.8523 25.394 28.3123 25.4085C28.2977 25.394 28.2831 25.394 28.2685 25.394Z" fill="#31ECC6"/>
            <path d="M26.0218 38.2201H10.9901C10.4501 38.1763 10.0415 37.7093 10.0852 37.1693C10.1144 36.6877 10.5085 36.2937 10.9901 36.2645H29.4951C33.0706 36.2353 35.5662 34.6738 36.8797 31.7112C38.1931 28.7486 37.7261 25.9904 35.5224 23.5532C34.4717 22.3419 33.0123 21.5393 31.4215 21.2912C30.8962 21.2036 30.5313 20.7074 30.6043 20.182C30.6772 19.6566 31.188 19.2918 31.7134 19.3648C33.742 19.6858 35.5954 20.6928 36.9526 22.2398C39.6817 25.2607 40.28 28.807 38.6601 32.4993C37.0402 36.1915 33.8587 38.1763 29.4951 38.2201H26.0218Z" fill="#31ECC6"/>
            <path d="M19.7305 29.4354H10.7844C10.2445 29.4791 9.77747 29.0705 9.73368 28.5305C9.6899 27.9906 10.0985 27.5236 10.6385 27.4798C10.6823 27.4798 10.7407 27.4798 10.7844 27.4798H19.7305C20.2705 27.436 20.7375 27.8446 20.7813 28.3846C20.8251 28.9246 20.4164 29.3916 19.8764 29.4354C19.8181 29.45 19.7743 29.45 19.7305 29.4354Z" fill="#31ECC6"/>
            <path d="M19.9507 33.4478H10.9901C10.4501 33.404 10.0415 32.937 10.0852 32.397C10.1144 31.9154 10.5085 31.5214 10.9901 31.4922H19.9507C20.4907 31.536 20.8993 32.003 20.8555 32.543C20.8118 33.0246 20.4323 33.4186 19.9507 33.4478Z" fill="#31ECC6"/>
          </svg>
          <span className="text-lg font-bold text-white group-hover:opacity-80 transition-opacity">Bulir</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/services"
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: '#8e9bab' }}
          >
            Serviços
          </Link>
          <Link
            to="/transactions"
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: '#8e9bab' }}
          >
            Transações
          </Link>
          {user?.tipo_usuario === 'prestador' && (
            <Link
              to="/services/create"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#31ECC6' }}
            >
              Criar Serviço
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: '#8e9bab' }}>
            {user?.email}
            {user?.tipo_usuario && (
              <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold" style={{ background: 'rgba(49,236,198,0.12)', color: '#31ECC6' }}>
                {user.tipo_usuario}
              </span>
            )}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
