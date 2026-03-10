import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { serviceService } from '../services/serviceService';
import { transactionService } from '../services/transactionService';

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: serviceService.getAll,
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: transactionService.getHistory,
  });

  const isPrestador = user?.tipo_usuario === 'prestador';

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">
          Bem-vindo{user?.nome_completo ? `, ${user.nome_completo}` : ''}!
        </h1>
        <p className="text-gray-400 mt-1">
          Perfil:{' '}
          <span className="capitalize text-indigo-400">{user?.tipo_usuario}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Serviços disponíveis</p>
          <p className="text-4xl font-bold text-indigo-400">{services.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">
            {isPrestador ? 'Serviços contratados' : 'As minhas reservas'}
          </p>
          <p className="text-4xl font-bold text-indigo-400">{reservations.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Saldo</p>
          <p className="text-4xl font-bold text-green-400">
            €{(user?.saldo ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/services"
          className="bg-gray-900 border border-gray-800 hover:border-indigo-700 rounded-xl p-6 transition-colors group"
        >
          <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300">
            Ver Serviços
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Explore todos os serviços disponíveis
          </p>
        </Link>

        <Link
          to="/transactions"
          className="bg-gray-900 border border-gray-800 hover:border-indigo-700 rounded-xl p-6 transition-colors group"
        >
          <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300">
            Histórico de Transações
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Veja todas as suas transações
          </p>
        </Link>

        {isPrestador && (
          <Link
            to="/services/create"
            className="bg-gray-900 border border-indigo-900 hover:border-indigo-600 rounded-xl p-6 transition-colors group"
          >
            <h3 className="text-lg font-semibold text-indigo-300 group-hover:text-indigo-200">
              + Criar Serviço
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Publique um novo serviço
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
