import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import type { RegisterPayload } from '../types';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = z.object({
  nome_completo: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  nif: z.string().min(9, 'NIF inválido').max(9, 'NIF inválido'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  tipo_usuario: z.enum(['cliente', 'prestador']),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const FEATURES = [
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    label: 'Gestão de serviços em tempo real',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    label: 'Transações seguras e confiáveis',
  },
  {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    label: 'Histórico completo de transações',
  },
];

function FeaturePills() {
  // visibleSet: set of pill indices currently in "visible" state
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const cycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function runCycle() {
      if (cancelled) return;

      // Step 1: slide all out (reset)
      setVisibleSet(new Set());

      // Step 2: slide each pill in with stagger
      FEATURES.forEach((_, i) => {
        cycleRef.current = setTimeout(() => {
          if (cancelled) return;
          setVisibleSet(prev => new Set([...prev, i]));
        }, 400 + i * 200); // first pill at 400ms, each +200ms
      });

      // Step 3: hold visible for 2 s after last pill appeared, then repeat
      const holdDelay = 400 + (FEATURES.length - 1) * 200 + 2000;
      cycleRef.current = setTimeout(() => {
        if (!cancelled) runCycle();
      }, holdDelay);
    }

    runCycle();

    return () => {
      cancelled = true;
      if (cycleRef.current) clearTimeout(cycleRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full">
      {FEATURES.map(({ icon, label }, i) => {
        const visible = visibleSet.has(i);
        return (
          <div
            key={label}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-48px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
            className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-left"
          >
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login, register } = useAuth();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data: LoginForm) => {
    setServerError('');
    try {
      await login(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setServerError(error.response?.data?.error || 'Erro ao fazer login');
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setServerError('');
    try {
      await register(data as RegisterPayload);
      setIsRegister(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'Erro ao registar');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 45%, #6366f1 100%)' }}>

        {/* Background blobs */}
        <div className="animate-drift absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="animate-drift absolute -bottom-32 -right-20 w-[500px] h-[500px] bg-indigo-900/40 rounded-full blur-3xl" style={{ animationDelay: '-3s' }} />

        {/* Top-right dot grid */}
        <div className="animate-float absolute top-10 right-10 grid grid-cols-5 gap-2 opacity-30">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-white rounded-full" />
          ))}
        </div>

        {/* Bottom-left dot grid */}
        <div className="animate-float-inv absolute bottom-10 left-10 grid grid-cols-4 gap-2 opacity-20" style={{ animationDelay: '-1.5s' }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-white rounded-full" />
          ))}
        </div>

        {/* Large circle ring top-left */}
        <div className="animate-spin-slow absolute -top-16 -left-16 w-72 h-72 border border-white/10 rounded-full" />
        <div className="animate-spin-reverse absolute -top-8 -left-8 w-56 h-56 border border-white/10 rounded-full" />

        {/* Large circle ring bottom-right */}
        <div className="animate-spin-slow absolute -bottom-20 -right-20 w-80 h-80 border border-white/10 rounded-full" style={{ animationDelay: '-6s' }} />

        {/* Floating card accent */}
        <div className="animate-float-slow absolute top-1/4 right-8 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl rotate-12 border border-white/20" />
        <div className="animate-float-inv absolute bottom-1/4 left-8 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl -rotate-12 border border-white/20" style={{ animationDelay: '-2s' }} />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          {/* Logo */}
          <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 border border-white/25 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>

          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-3">DevTool</h1>
          <div className="w-12 h-1 bg-white/40 rounded-full mb-5" />
          <p className="text-indigo-100 text-base leading-relaxed mb-10">
            Plataforma profissional de serviços e transações entre clientes e prestadores
          </p>

          {/* Feature pills — staggered animation */}
          <FeaturePills />
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-8 text-indigo-300/60 text-xs tracking-widest uppercase font-medium">
          Powered by DevTool Platform
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-600">DevTool</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-2">
              {isRegister ? 'Novo utilizador' : 'Bem-vindo de volta'}
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {isRegister ? 'Criar conta' : 'Faça seu Login'}
            </h2>
            <p className="text-gray-400 mt-2 text-sm font-normal">
              {isRegister
                ? 'Preencha os dados abaixo para se registar'
                : 'Insira as suas credenciais para aceder à plataforma'}
            </p>
          </div>

          {serverError && (
            <div className="mb-5 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {serverError}
            </div>
          )}

          {!isRegister ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    {...loginForm.register('email')}
                    type="email"
                    placeholder="exemplo@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm font-medium"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Senha</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    {...loginForm.register('senha')}
                    type="password"
                    placeholder="••••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm font-medium"
                  />
                </div>
                {loginForm.formState.errors.senha && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{loginForm.formState.errors.senha.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-indigo-500/25 mt-1"
              >
                {loginForm.formState.isSubmitting
                  ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>A entrar...</span>
                  : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nome Completo</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    {...registerForm.register('nome_completo')}
                    placeholder="João Silva"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm font-medium"
                  />
                </div>
                {registerForm.formState.errors.nome_completo && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{registerForm.formState.errors.nome_completo.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">NIF</label>
                  <input
                    {...registerForm.register('nif')}
                    placeholder="123456789"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm font-medium"
                  />
                  {registerForm.formState.errors.nif && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">{registerForm.formState.errors.nif.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tipo</label>
                  <select
                    {...registerForm.register('tipo_usuario')}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm font-medium appearance-none"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="prestador">Prestador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    {...registerForm.register('email')}
                    type="email"
                    placeholder="exemplo@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm font-medium"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Senha</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    {...registerForm.register('senha')}
                    type="password"
                    placeholder="••••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm font-medium"
                  />
                </div>
                {registerForm.formState.errors.senha && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{registerForm.formState.errors.senha.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-indigo-500/25 mt-1"
              >
                {registerForm.formState.isSubmitting
                  ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>A registar...</span>
                  : 'Criar conta'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <span className="text-gray-400 text-sm">
              {isRegister ? 'Já tem conta? ' : 'Não tem conta? '}
            </span>
            <button
              onClick={() => { setIsRegister(!isRegister); setServerError(''); }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors"
            >
              {isRegister ? 'Entrar' : 'Registar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
