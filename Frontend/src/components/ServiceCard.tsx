import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Service } from '../types';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { ROUTES } from '../lib/constants';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ServiceCardProps {
  service: Service;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export default function ServiceCard({ service, onDelete, isDeleting }: ServiceCardProps) {
  const { user } = useAuthStore();
  const { theme, card, border, text1, text2, text3, accent } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner      = user?.id === service.prestador_id;
  const isCliente    = user?.tipo_usuario === 'cliente';
  const canAfford    = isCliente && (user?.saldo ?? 0) >= service.preco;
  const cantAfford   = isCliente && (user?.saldo ?? 0) < service.preco;

  const accentBg    = theme === 'light' ? 'rgba(0,47,122,0.08)'  : 'rgba(49,236,198,0.08)';
  const hoverBorder = theme === 'light' ? '#002f7a66'            : '#31ECC666';

  return (
    <>
      {showDeleteModal && (
        <ConfirmDeleteModal
          serviceName={service.nome}
          isPending={isDeleting}
          onConfirm={() => { onDelete?.(service.id); setShowDeleteModal(false); }}
          onClose={() => !isDeleting && setShowDeleteModal(false)}
        />
      )}

      <div
        className="rounded-2xl p-5 flex flex-col gap-3 transition-all h-full w-full"
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

        {isCliente && service.users && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: text2 }}>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">{service.users.nome_completo}</span>
          </div>
        )}

        {/* Saldo insuficiente */}
        {cantAfford && (
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
            style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171' }}>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            Saldo insuficiente (tens Kz {(user?.saldo ?? 0).toFixed(2)})
          </div>
        )}

        <div className="text-xs" style={{ color: text3 }}>
          Criado em {new Date(service.created_at).toLocaleDateString('pt-PT')}
        </div>

        <div className="flex gap-2 mt-auto pt-1">
          {isCliente && (
            canAfford ? (
              <Link
                to={ROUTES.SERVICE_HIRE(service.id)}
                className="flex-1 text-center text-sm font-semibold py-2 rounded-xl transition-all"
                style={{ background: accent, color: '#ffffff' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Contratar
              </Link>
            ) : (
              <span
                className="flex-1 text-center text-sm font-semibold py-2 rounded-xl cursor-not-allowed"
                style={{ background: 'rgba(248,113,113,0.10)', color: '#f87171' }}
                title="Saldo insuficiente para contratar este serviço"
              >
                Sem saldo
              </span>
            )
          )}
          {isOwner && (
            <Link
              to={ROUTES.SERVICE_EDIT(service.id)}
              className="flex-1 text-center text-sm font-semibold py-2 rounded-xl transition-all"
              style={{ background: accentBg, color: accent }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Editar
            </Link>
          )}
          {isOwner && onDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
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
    </>
  );
}
