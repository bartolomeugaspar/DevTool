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
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold text-indigo-400 hover:text-indigo-300">
          DevTool
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/services"
            className="text-gray-300 hover:text-white transition-colors text-sm"
          >
            Serviços
          </Link>
          <Link
            to="/transactions"
            className="text-gray-300 hover:text-white transition-colors text-sm"
          >
            Transações
          </Link>
          {user?.tipo_usuario === 'prestador' && (
            <Link
              to="/services/create"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              Criar Serviço
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {user?.email}
            {user?.tipo_usuario && (
              <span className="ml-2 px-2 py-0.5 rounded text-xs bg-indigo-900 text-indigo-300">
                {user.tipo_usuario}
              </span>
            )}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
