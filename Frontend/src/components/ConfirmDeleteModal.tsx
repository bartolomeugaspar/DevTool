import { useTheme } from '../hooks/useTheme';

interface ConfirmDeleteModalProps {
  serviceName: string;
  onConfirm: () => void;
  onClose: () => void;
  isPending?: boolean;
}

export default function ConfirmDeleteModal({
  serviceName,
  onConfirm,
  onClose,
  isPending = false,
}: ConfirmDeleteModalProps) {
  const { light, card, border, text1, text2 } = useTheme();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget && !isPending) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeUp"
        style={{ background: card, border: `1px solid ${border}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: `1px solid ${border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(248,113,113,0.12)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h2 className="text-base font-semibold" style={{ color: text1 }}>Remover serviço</h2>
          </div>
          <button
            onClick={() => !isPending && onClose()}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-60"
            style={{ color: text2 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: text2 }}>
            Tens a certeza que queres remover o serviço{' '}
            <span className="font-semibold" style={{ color: text1 }}>"{serviceName}"</span>?
            Esta ação é <span className="font-medium" style={{ color: '#f87171' }}>irreversível</span> e todas as reservas associadas serão desvinculadas.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            style={{
              background: light ? '#f3f4f6' : '#1a3557',
              color: light ? '#0c2340' : '#8e9bab',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: isPending ? '#f87171aa' : '#ef4444' }}
            onMouseEnter={e => { if (!isPending) e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                A remover...
              </span>
            ) : 'Confirmar remoção'}
          </button>
        </div>
      </div>
    </div>
  );
}
