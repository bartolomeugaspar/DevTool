import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#060f1c' }}>

      {/* Glowing number */}
      <div className="relative select-none mb-8">
        <span
          className="text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter"
          style={{
            color: 'transparent',
            WebkitTextStroke: '2px rgba(49,236,198,0.25)',
          }}
        >
          404
        </span>
        <span
          className="absolute inset-0 flex items-center justify-center text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter blur-2xl opacity-20"
          style={{ color: '#31ECC6' }}
        >
          404
        </span>
      </div>

      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(49,236,198,0.10)', border: '1px solid rgba(49,236,198,0.20)' }}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#31ECC6" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
        Página não encontrada
      </h1>
      <p className="text-sm sm:text-base max-w-sm mb-10" style={{ color: '#586779' }}>
        O endereço que procuras não existe ou foi movido. Verifica o URL ou volta ao início.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ background: '#0e1e35', border: '1px solid #1a3557', color: '#8e9bab' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#8e9bab')}
        >
          ← Voltar
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#31ECC6', color: '#0C2340' }}
        >
          Ir para o Dashboard
        </button>
      </div>

    </div>
  );
}
