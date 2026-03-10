import { Link } from 'react-router-dom';
import type { Service } from '../types';
import { useAuthStore } from '../store/authStore';

interface ServiceCardProps {
  service: Service;
  onDelete?: (id: string) => void;
}

export default function ServiceCard({ service, onDelete }: ServiceCardProps) {
  const { user } = useAuthStore();
  const isOwner = user?.id === service.prestador_id;
  const isCliente = user?.tipo_usuario === 'cliente';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:border-indigo-700 transition-colors">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-white">{service.nome}</h3>
        <span className="text-indigo-400 font-bold text-lg">
          Kz {service.preco.toFixed(2)}
        </span>
      </div>

      <p className="text-gray-400 text-sm flex-1">{service.descricao}</p>

      <div className="text-xs text-gray-600">
        Criado em {new Date(service.created_at).toLocaleDateString('pt-PT')}
      </div>

      <div className="flex gap-2 mt-auto pt-2">
        {isCliente && (
          <Link
            to={`/services/${service.id}/hire`}
            className="flex-1 text-center bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-2 rounded-lg transition-colors"
          >
            Contratar
          </Link>
        )}
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(service.id)}
            className="flex-1 bg-red-700 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition-colors"
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
