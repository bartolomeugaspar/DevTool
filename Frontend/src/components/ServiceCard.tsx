import { Link } from 'react-router-dom';
import type { Service } from '../types';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

interface ServiceCardProps {
  service: Service;
  onDelete?: (id: string) => void;
}

export default function ServiceCard({ service, onDelete }: ServiceCardProps) {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const light = theme === 'light';

  const isOwner   = user?.id === service.prestador_id;
  const isCliente = user?.tipo_usuario === 'cliente';

  // theme tokens
  const card     = light ? '#ffffff'               : '#0e1e35';
  const border   = light ? '#e5e7eb'               : '#1a3557';
  const text1    = light ? '#0c2340'               : '#ffffff';
  const text2    = light ? '#586779'               : '#8e9bab';
  const text3    = light ? '#94a3b8'               : '#304259';
  const accent   = light ? '#007aff'               : '#31ECC6';
  const accentBg = light ? 'rgba(0,122,255,0.08)'  : 'rgba(49,236,198,0.08)';
  const hoverBorder = light ? '#007aff66'          : '#31ECC666';

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all"
      style={{ background: card, border: `1px solid ${border}` }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = hoverBorder)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = border)}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug" style={{ color: text1 }}>{service.nome}</h3>
        <span className="font-bold text-base flex-shrink-0" style={{ color: accent }}>
          Kz {service.preco.toFixed(2)}
        </span>
      </div>

      <p className="text-sm flex-1 leading-relaxed" style={{ color: text2 }}>{service.descricao}</p>

      <div className="text-xs" style={{ color: text3 }}>
        Criado em {new Date(service.created_at).toLocaleDateString('pt-PT')}
      </div>

      <div className="flex gap-2 mt-auto pt-1">
        {isCliente && (
          <Link
            to={`/services/${service.id}/hire`}
            className="flex-1 text-center text-sm font-semibold py-2 rounded-xl transition-all"
            style={{ background: accent, color: '#ffffff' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Contratar
          </Link>
        )}
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(service.id)}
            className="flex-1 text-sm font-semibold py-2 rounded-xl transition-all"
            style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.12)')}
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
