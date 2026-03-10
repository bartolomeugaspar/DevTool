import { useState } from 'react';
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
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-10 left-10 w-16 h-16 border-2 border-indigo-400/40 rounded-full" />
        <div className="absolute top-24 right-16 w-4 h-4 bg-indigo-400/30 rounded-full" />
        <div className="absolute bottom-20 left-16 w-8 h-8 border-2 border-indigo-400/40 rounded-full" />
        <div className="absolute top-1/3 right-8 text-indigo-400/30 text-3xl font-light">+</div>
        <div className="absolute bottom-1/3 left-8 text-indigo-400/30 text-3xl font-light">+</div>
        <div className="absolute top-16 right-24 grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-indigo-400/40 rounded-full" />
          ))}
        </div>
        {/* Decorative arc */}
        <div className="absolute bottom-0 right-0 w-48 h-48 border-4 border-indigo-400/20 rounded-full translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">DT</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">DevTool</h1>
          <p className="text-indigo-200 text-lg max-w-xs">
            Plataforma de serviços e transações entre clientes e prestadores
          </p>
          <div className="mt-8 flex flex-col gap-3 text-left">
            {['Registe e gira os seus serviços', 'Contrate com segurança', 'Histórico de transações completo'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-indigo-100 text-sm">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-600">DevTool</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {isRegister ? 'Criar conta' : 'Faça seu Login'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
            {isRegister
              ? 'Preencha os dados abaixo para se registar'
              : 'Insira as suas credenciais para aceder à plataforma'}
          </p>

          {serverError && (
            <div className="mb-5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
              {serverError}
            </div>
          )}

          {!isRegister ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    {...loginForm.register('email')}
                    type="email"
                    placeholder="Nome de usuário ou e-mail"
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    {...loginForm.register('senha')}
                    type="password"
                    placeholder="Senha"
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                  />
                </div>
                {loginForm.formState.errors.senha && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{loginForm.formState.errors.senha.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-indigo-500/30 mt-2"
              >
                {loginForm.formState.isSubmitting ? 'A entrar...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  {...registerForm.register('nome_completo')}
                  placeholder="Nome completo"
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                />
                {registerForm.formState.errors.nome_completo && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{registerForm.formState.errors.nome_completo.message}</p>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                  </svg>
                </span>
                <input
                  {...registerForm.register('nif')}
                  placeholder="NIF (9 dígitos)"
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                />
                {registerForm.formState.errors.nif && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{registerForm.formState.errors.nif.message}</p>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  placeholder="Email"
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  {...registerForm.register('senha')}
                  type="password"
                  placeholder="Senha"
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                />
                {registerForm.formState.errors.senha && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{registerForm.formState.errors.senha.message}</p>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <select
                  {...registerForm.register('tipo_usuario')}
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm appearance-none"
                >
                  <option value="cliente">Cliente</option>
                  <option value="prestador">Prestador</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-indigo-500/30 mt-2"
              >
                {registerForm.formState.isSubmitting ? 'A registar...' : 'Criar conta'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
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
